/* eslint-env jasmine */
/* global since:false */
'use strict';

require('jasmine2-custom-message');
const SpecReporter = require('jasmine-spec-reporter').SpecReporter;
jasmine.getEnv().addReporter(new SpecReporter());

const dynavers = require('../');
let setModuleVersion;

describe('setModuleVersion', () => {
  beforeEach(() => {
    setModuleVersion = dynavers('./test/dynavers.json');
  });
  it('sets version to 0.0.1', () => {
    setModuleVersion('dynavers-test', '0.0.1');
    expect(require('dynavers-test')).toEqual('0.0.1');
  });
  it('sets version to 0.0.2', () => {
    setModuleVersion('dynavers-test', '0.0.2');
    expect(require('dynavers-test')).toEqual('0.0.2');
  });
  it('resets version to 0.0.1', () => {
    setModuleVersion('dynavers-test', '0.0.1');
    expect(require('dynavers-test')).toEqual('0.0.1');
  });
});

describe('module cache behaviour', () => {
  beforeEach(() => {
    setModuleVersion = dynavers('./test/dynavers.json');
    dynavers.purgeCache();
  });
  it('test starts with empty cache', () => {
    expectCacheToBeEmpty();
  });
  it('setModuleVersion() does not load cache ', () => {
    setModuleVersion('dynavers-test', '0.0.1');
    expectCacheToBeEmpty();
  });
  it('require() does load cache ', () => {
    setModuleVersion('dynavers-test', '0.0.1');
    require('dynavers-test');
    expectCacheNotToBeEmpty();
  });
});

describe('default setModuleVersion() behaviour', () => {
  beforeEach(() => {
    setModuleVersion = dynavers('./test/dynavers.json');
    dynavers.purgeCache();
  });
  it('does not clear cache ', () => {
    setModuleVersion('dynavers-test', '0.0.1');
    require('dynavers-test');
    setModuleVersion('dynavers-test', '0.0.1');
    expectCacheNotToBeEmpty();
  });
  it('can use "purge cache" argument to clear cache ', () => {
    setModuleVersion('dynavers-test', '0.0.1');
    require('dynavers-test');
    setModuleVersion('dynavers-test', '0.0.1', true);
    expectCacheToBeEmpty();
  });
});

describe('setModuleVersion() behaviour with configured defaultPurgeCache', () => {
  beforeEach(() => {
    setModuleVersion = dynavers('./test/dynavers-defaultpurgecache.json');
    dynavers.purgeCache();
  });
  it('does clear cache ', () => {
    setModuleVersion('dynavers-test', '0.0.1');
    require('dynavers-test');
    setModuleVersion('dynavers-test', '0.0.1');
    expectCacheToBeEmpty();
  });
  it('can use "purge cache" argument to not clear cache ', () => {
    setModuleVersion('dynavers-test', '0.0.1');
    require('dynavers-test');
    setModuleVersion('dynavers-test', '0.0.1', false);
    expectCacheNotToBeEmpty();
  });
});

function expectCacheToBeEmpty () {
  since('expect cache to be empty').expect(cacheSize()).toEqual(0);
}

function expectCacheNotToBeEmpty () {
  since('expect cache not to be empty').expect(cacheSize()).toBeGreaterThan(0);
}

function cacheSize () {
  return Object.keys(require.cache).length;
}
