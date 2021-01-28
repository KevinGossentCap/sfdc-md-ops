import {expect, test} from '@oclif/test'

describe('wsdl2ts', () => {
  test
  .stdout()
  .command(['wsdl2ts'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['wsdl2ts', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
