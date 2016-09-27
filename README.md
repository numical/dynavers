# Dynamic Module Versions for Node

Install multiple versions of a module then dynamically switch between them.
```js
const setModuleVersion = require('dynavers')
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
setModuleVersion('webpack', '1.13.1')
var webpack = require('webpack')          // version 1.13.1
var Chunk = require('weback/lib/Chunk')   // will also be the 1.13.1 version
```

## Caveats
1. This works by monkey-patching `node`'s `Module` load mechanism.  You may not like this.
2. Note the version number! Currently very much *alpha* code - no tests yet either!
3. The `load` mechanism has not been tried with all exotic form of package name that `require` will
   accept.  Please [let me know](https://github.com/numical/dynavers/issues) if any this fails.

## Alternatives
[multidep](https://github.com/joliss/node-multidep) offers an alternative that specifies the version
for a single `require` call via its `multidepRequire`.

## Acknowledgements
This tool is based on [multidep](https://github.com/joliss/node-multidep) - thanks [Jo
Liss](https://github.com/joliss)!  
(I would have submitted a Pull Request but by the time I had changed the external API and the core mechanism, I don't think it would have been accepted).
