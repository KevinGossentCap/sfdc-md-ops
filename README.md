sfdc-md-ops
===========

Package to make different operations on Salesforce metadata files

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/sfdc-md-ops.svg)](https://npmjs.org/package/sfdc-md-ops)
[![CircleCI](https://circleci.com/gh/KevinGossentCap/sfdc-md-ops/tree/master.svg?style=shield)](https://circleci.com/gh/KevinGossentCap/sfdc-md-ops/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/KevinGossentCap/sfdc-md-ops?branch=master&svg=true)](https://ci.appveyor.com/project/KevinGossentCap/sfdc-md-ops/branch/master)
[![Codecov](https://codecov.io/gh/KevinGossentCap/sfdc-md-ops/branch/master/graph/badge.svg)](https://codecov.io/gh/KevinGossentCap/sfdc-md-ops)
[![Downloads/week](https://img.shields.io/npm/dw/sfdc-md-ops.svg)](https://npmjs.org/package/sfdc-md-ops)
[![License](https://img.shields.io/npm/l/sfdc-md-ops.svg)](https://github.com/KevinGossentCap/sfdc-md-ops/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g sfdc-md-ops
$ sfmdop COMMAND
running command...
$ sfmdop (-v|--version|version)
sfdc-md-ops/0.0.0 win32-x64 node-v14.15.4
$ sfmdop --help [COMMAND]
USAGE
  $ sfmdop COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`sfmdop hello [FILE]`](#sfmdop-hello-file)
* [`sfmdop help [COMMAND]`](#sfmdop-help-command)

## `sfmdop hello [FILE]`

describe the command here

```
USAGE
  $ sfmdop hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ sfmdop hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/KevinGossentCap/sfdc-md-ops/blob/v0.0.0/src/commands/hello.ts)_

## `sfmdop help [COMMAND]`

display help for sfmdop

```
USAGE
  $ sfmdop help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.1/src/commands/help.ts)_
<!-- commandsstop -->
