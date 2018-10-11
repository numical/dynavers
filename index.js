'use strict';

var fs = require('fs');
var path = require('path');
var spawn = require('spawn-cmd').spawn;
var RSVP = require('rsvp');
var rimraf = require('rimraf');
var Module = require('module');

// main API
module.exports = function dynavers (specPath) {
  // initialisation
  var spec = getSpec(specPath);
  var defaultPurgeCache = spec.purgeCache || false;
  var modules = {};
  var specifiedModules;
  Object.keys(spec.versions).sort().forEach(function (moduleName) {
    modules[moduleName] = {};
    spec.versions[moduleName].forEach(function (version) {
      var modulePath = path.join(spec.path, moduleName + '-' + version);
      if (!fs.existsSync(modulePath)) {
        throw new Error(modulePath + ': No such file or directory. Run `load-module-versions` to install.');
      }
      var absPath = fs.realpathSync(path.join(modulePath, 'node_modules', moduleName));
      modules[moduleName][version] = absPath;
    });
  });

  // main mechanism: monkey-patches Module._load()
  function startInterceptingLoad () {
    var original = Module._load;
    Module._load = function (request, parent, isMain) {
      var index, first;
      if (specifiedModules[request]) {
        request = specifiedModules[request];
      } else {
        index = request.indexOf(path.posix.sep);
        if (index > -1) {
          first = request.slice(0, index);
          if (specifiedModules[first]) {
            request = path.join(specifiedModules[first], request.slice(index));
          }
        }
      }
      return original.call(this, request, parent, isMain);
    };
  }

  // main API method
  return function specifyModuleVersion (moduleName, version, purgeCache) {
    if (modules[moduleName] == null) {
      throw new Error("Module '" + moduleName + "' not found in " + specPath);
    }
    var versions = modules[moduleName];
    if (versions[version] == null) {
      throw new Error('Version ' + version + " of module '" + moduleName + "' not found in " + specPath);
    }
    if (!specifiedModules) {
      specifiedModules = {};
      startInterceptingLoad();
    }

    if (purgeCache === undefined) purgeCache = defaultPurgeCache;
    if (purgeCache) module.exports.purgeCache();
    specifiedModules[moduleName] = versions[version];
  };
};

// API utilities
module.exports.purgeCache = function () {
  Object.keys(require.cache).forEach((key) => {
    delete require.cache[key];
  });
};

module.exports.install = function (specPath) {
  var spec = getSpec(specPath);

  if (!fs.existsSync(spec.path)) {
    fs.mkdirSync(spec.path);
  }

  var promise = RSVP.resolve();
  Object.keys(spec.versions).sort().forEach(function (moduleName) {
    spec.versions[moduleName].forEach(function (version) {
      promise = promise.then(function () {
        var modulePath = path.join(spec.path, moduleName + '-' + version);
        return RSVP.resolve()
          .then(function () {
            if (!fs.existsSync(modulePath)) {
              console.log(moduleName + ' ' + version + ': Installing');
              fs.mkdirSync(modulePath);
              fs.mkdirSync(path.join(modulePath, 'node_modules'));
              var cp = spawn('npm', ['install', moduleName + '@' + version], {
                cwd: modulePath,
                stdio: 'inherit',
                timeout: 300
              });
              return new RSVP.Promise(function (resolve, reject) {
                cp.on('exit', function (code, signal) {
                  if (code !== 0 || signal != null) {
                    reject(new Error('npm exited with exit code ' + code + ', signal ' + signal));
                  } else {
                    resolve();
                  }
                });
              });
            } else {
              console.log(moduleName + ' ' + version + ': Installed');
            }
          })
          .catch(function (err) {
            // We created a nested promise with `RSVP.resolve()` above so this
            // .catch clause only applies to the previous .then and doesn't
            // catch earlier failures in the chain
            rimraf.sync(modulePath);
            throw err;
          });
      });
    });
  });
  return promise;
};

// utility function
function getSpec (specPath) {
  // specPath is relative to cwd, so we need to call realpathSync
  var spec = require(fs.realpathSync(specPath));
  if (!spec || !spec.hasOwnProperty('path') || Array.isArray(spec.versions)) {
    throw new Error('Invalid version spec; expected { path: "dynavers_modules", versions: { ... } }, got ' + require('util').inspect(spec));
  }
  return spec;
}
