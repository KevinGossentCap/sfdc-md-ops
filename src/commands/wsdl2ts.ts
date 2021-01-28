/* eslint-disable dot-notation */
import {Command, flags} from '@oclif/command'
import {promises as fsp} from 'fs'
import {parseStringPromise, processors} from 'xml2js'

const typeMap: Record<string, string> = {
  'xsd:string': 'string',
  'xsd:boolean': 'boolean',
  'xsd:int': 'number',
  'xsd:double': 'number',
}
const simpleMap: Record<string, number> = {}
const selectedSimpleTypes = new Set<string>()
const simpleTypeText: Record<string, string> = {}
const complexMap: Record<string, number> = {}
const selectedComplexTypes = new Set<string>()
const selectedImports = new Set<string>()
const complexTypeText: Record<string, string> = {}

let simpleType: any
let complexType: any
let boolDecorator = false

function getSimpleTypeText(name: string, opttype?: any) {
  let type: any = opttype
  if (!opttype) type = simpleType[simpleMap[name]]
  if (type?.restriction[0]?.enumeration) {
    const strings = type?.restriction[0]?.enumeration?.map((res: any) => {
      return '\'' + res.$.value + '\''
    })
    simpleTypeText[name] = 'type ' + name + ' = ' + strings.join(' | ') + '\n'
  } else if (type?.restriction[0]?.$?.base) {
    simpleTypeText[name] = 'type ' + name + ' = ' + typeMap[type.restriction[0].$.base] + '\n'
  }
}

function getComplexTypeText(name: string, type: any) {
  if (type?.sequence) {
    complexTypeText[name] = 'export class ' + name + ' {\n'
    type?.sequence[0]?.element.forEach((el: any) => {
      const t: string = el.$.type
      let mapping: string
      if (t.startsWith('tns:')) {
        const a = t.substr(4)
        mapping = a
        if (!simpleMap[a]) {
          boolDecorator = true
          complexTypeText[name] += '    @Type(() => ' + a + ')\n'
        }
      } else {
        mapping = typeMap[el.$.type] || 'any'
      }
      complexTypeText[name] += '    ' + el.$.name + (el?.$?.minOccurs === 0 ? '?' : '!') + ': ' + mapping + ' ' + (el.$.maxOccurs ? '[]' : '') + ';\n'
    })
    complexTypeText[name] += '}\n'
  } else if (type?.complexContent) {
    complexTypeText[name] = 'export class ' + name + ' extends ' + type?.complexContent[0]?.extension[0]?.$?.base.replace('tns:', '') + ' {\n'
    if (type?.complexContent[0]?.extension[0]?.sequence[0]?.element) {
      type?.complexContent[0]?.extension[0]?.sequence[0]?.element.forEach((el: any) => {
        const t: string = el.$.type
        let mapping
        if (t.startsWith('tns:')) {
          const a = t.substr(4)
          mapping = a
          if (!simpleMap[a]) {
            complexTypeText[name] += '  @Type(() => ' + a + ')\n'
          }
        } else {
          mapping = typeMap[el.$.type] || 'any'
        }
        complexTypeText[name] += '    ' + el.$.name + (el?.$?.minOccurs === 0 ? '?' : '!') + ': ' + mapping + ' ' + (el.$.maxOccurs ? '[]' : '') + ';\n'
      })
    }
    complexTypeText[name] += '}\n'
  }
}

// eslint-disable-next-line max-params
function recurComplexDependency(typeToAdd: string) {
  const type = complexType[complexMap[typeToAdd]]
  if (type?.sequence) {
    type?.sequence[0]?.element?.forEach((el: any) => {
      const t: string = el.$.type
      if (t.startsWith('tns:')) {
        const a = t.substr(4)
        if (simpleMap[a]) {
          selectedSimpleTypes.add(a)
          getSimpleTypeText(a, simpleType[simpleMap[a]])
        } else {
          selectedComplexTypes.add(a)
          getComplexTypeText(a, el)
          recurComplexDependency(a)
        }
      }
    })
  } else if (type?.complexContent) {
    const strImport = type?.complexContent[0]?.extension[0]?.$?.base.replace('tns:', '')
    if (!(selectedComplexTypes.has(strImport))) selectedImports.add(strImport)
    if (type?.complexContent[0]?.extension[0]?.sequence[0]?.element) {
      type?.complexContent[0]?.extension[0]?.sequence[0]?.element?.forEach((el: any) => {
        const t: string = el.$.type
        if (t.startsWith('tns:')) {
          const a = t.substr(4)
          if (simpleMap[a]) {
            selectedSimpleTypes.add(a)
            getSimpleTypeText(a, simpleType[simpleMap[a]])
          } else {
            selectedComplexTypes.add(a)
            getComplexTypeText(a, el)
            recurComplexDependency(a)
          }
        }
      })
    }
  }
}

export default class Wsdl2Ts extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with a value (-n, --name=VALUE)
    wsdl: flags.string({
      char: 'w',
      description: 'wsdl file name to process',
      required: true,
    }),
    output: flags.string({
      char: 'o',
      description: 'output type file',
      required: true,
    }),
    // flag with no value (-f, --force)
    types: flags.string({
      char: 't',
      description: 'type to process, can be set multiple times for listing',
      multiple: true,
      required: false,
    }),
  }

  async run() {
    const {flags} = this.parse(Wsdl2Ts)

    const parsed = await parseStringPromise(await fsp.readFile(flags.wsdl), {tagNameProcessors: [processors.stripPrefix]})

    simpleType = parsed?.definitions?.types[0]?.schema[0]?.simpleType
    simpleType.forEach((type: any, index: number) => {
      const name = type.$.name
      simpleMap[name] = index
      if (flags.types.includes(name)) {
        selectedSimpleTypes.add(name)
        getSimpleTypeText(name, type)
      }
    })

    complexType = parsed?.definitions?.types[0]?.schema[0]?.complexType
    complexType.forEach((type: any, index: number) => {
      const name = type.$.name
      complexMap[name] = index
      if (flags.types.includes(name)) {
        selectedComplexTypes.add(name)
      }
    })
    selectedComplexTypes.forEach((name: string) => {
      getComplexTypeText(name, complexType[complexMap[name]])
      recurComplexDependency(name)
    })

    let strOutput = '/* eslint-disable unicorn/filename-case, new-cap, @typescript-eslint/no-use-before-define, lines-between-class-members */\n'
    if (boolDecorator) strOutput += 'import {Type} from \'serializer.ts/Decorators\'\n'
    // eslint-disable-next-line unicorn/prefer-spread
    if (selectedImports) Array.from(selectedImports)?.sort()?.forEach((name: string) => {
      // console.log('import { ' + name + ' } from \'./' + name + '\'')
      strOutput += 'import {' + name + '} from \'./' + name + '\'\n'
    })
    // eslint-disable-next-line unicorn/prefer-spread
    if (selectedSimpleTypes) Array.from(selectedSimpleTypes)?.sort()?.forEach((name: string) => {
      // console.log(simpleTypeText[name])
      strOutput += simpleTypeText[name]
    })
    // eslint-disable-next-line unicorn/prefer-spread
    if (selectedComplexTypes) Array.from(selectedComplexTypes)?.sort()?.forEach((name: string) => {
      // console.log(complexTypeText[name])
      strOutput += complexTypeText[name]
    })
    fsp.writeFile(flags.output, strOutput)
  }
}
