/* eslint-env jasmine */
'use strict';

const SpecReporter = require('jasmine-spec-reporter');
jasmine.getEnv().addReporter(new SpecReporter());

const setModuleVersion = require('../index.js')('./spec/dynavers.json');

describe('setModuleVersion', () => {
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
