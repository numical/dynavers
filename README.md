[![npm version](https://badge.fury.io/js/dynavers.svg)](http://badge.fury.io/js/dynavers) [![Dependency Status](https://david-dm.org/numical/dynavers.svg)](https://david-dm.org/numical/dynavers) [![Build status](https://travis-ci.org/numical/dynavers.svg)](https://travis-ci.org/numical/dynavers) [![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

[![NPM](https://nodei.co/npm/dynavers.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/dynavers/)

Install multiple versions of a module then dynamically switch between them.
```js
const setModuleVersion = require('dynavers')('dynavers.json')
const versions = ['1.13.1', '2.1.0-beta.24']
for(const version of versions) {
  setModuleVersion('webpack', version);
  // ...do stuff
}
```
As the above example hints at, this is primarily designed for testing.

## Installation

```bash
npm install --save-dev dynavers
```

## Usage

### Specifying which versions to install

Create a JSON spec of modules to be installed, e.g. at `dynavers.json`:
```json
{
  "path": "dynavers_modules",
  "versions": {
    "webpack": ["1.13.1", "2.1.0-beta.24"]
  }
}
```
Do not use fuzzy versions (`"^0.16.0"`) - this will cause problems.

### Installing the modules from npm
Next, run
```bash
./node_modules/.bin/install-module-versions dynavers.json
```

In this example, it will create `dynavers_modules` and install webpack
1.13.1 and 2.1.0-beta.24 inside the `dynavers_modules` directory.

To run the install automatically before your test suite (when you run `npm
test`), add it as a "pretest" hook to your `package.json`:

```json
{
  "scripts": {
    "pretest": "install-module-versions dynavers.json",
    "test": "..."
  }
}
```

`install-module-versions` will not redownload existing modules. If something went wrong,
delete its directory first: `rm -r dynavers_modules`

### `setModuleVersion`: Specifying module version
The API is a single function `setModuleVersion(moduleName, moduleVersion)`.
This will ensure any subsequent `require` calls to that module *from anywhere* will use the specified version.
Note this will also ensure any exports within that module will also use the specified version:
```js
const setModuleVersion = require('dynavers')('dynavers.json')
setModuleVersion('webpack', '1.13.1')
var webpack = require('webpack')          // version 1.13.1
var Chunk = require('weback/lib/Chunk')   // will also be the 1.13.1 version
```

### Purging the module cache
**Please read the Caveats below before opting to purge the cache**

You may also want to purge the Module cache so that *all* modules are reloaded after you have set a
version.
This is easily done by adding an additional boolean argument:
```js
const setModuleVersion = require('dynavers')('dynavers.json')
const purgeCache = true
setModuleVersion('webpack', '1.13.1', purgeCache)
```

Alternatively you can make this the default behaviour by adding the `purgeCache` value in the
configuration:
```json
{
  "path": "dynavers_modules",
  "versions": {
    "webpack": ["1.13.1", "2.1.0-beta.24"]
  },
  purgeCache: true
}
```
In this case, you need not specify it in the `setModuleVersion` call.


## Caveats
1. This works by monkey-patching `node`'s `Module` load mechanism.  You may not like this.
2. The `load` mechanism has not been tried with all the exotic forms of package identifier that `require` will
   accept.  Please [let me know](https://github.com/numical/dynavers/issues) if any this fails.
3. Think carefully about using the `purgeCache` option.  In most cases it is a sledgehammer to crack
   a nut as it forces all future `require`'d modules to be reloaded.  Moreover, **and this is important**, it
   will **not** clear any in-memory modules, so you run the risk of simutaneously running multiple versions of a
   module.  Eek!

## Alternatives
[multidep](https://github.com/joliss/node-multidep) offers an alternative that specifies the version
for a single `require` call via its `multidepRequire`.

## Acknowledgements
This tool is based on [multidep](https://github.com/joliss/node-multidep) - thanks [Jo
Liss](https://github.com/joliss)!  
(I would have submitted a Pull Request but by the time I had changed the external API and the core mechanism, I don't think it would have been accepted).

## Change History

v0.3.x
* windows support (thanks to [@snadn](https://github.com/snadn))
* updated dependencies
* tests run node 4.x to 11.x

v0.2.x
* add purge cache options

v0.1.x
* initial release
