import resolver from './helpers/resolver';
import {
  setResolver
} from 'ember-qunit';
import QUnit from 'qunit';
import DS from 'ember-data';
import {
  wait,
  asyncEqual,
  invokeAsync
} from 'dummy/tests/helpers/async';
import {
  warns,
  noWarns
} from 'dummy/tests/helpers/warns';
import addEmberAssertions from 'dummy/tests/helpers/ember-assertions';
import Ember from 'ember';

const StackTrace = window.stacktraceJs;

const log = QUnit.log.bind(QUnit);

setResolver(resolver);

const runLoggingCallbacks = (key, args) => {
  const callbacks = QUnit.config.callbacks[key];

  for(let i = 0, length = callbacks.length; i < length; i++) {
    callbacks[i](args);
  }
};

const ENV = Ember.ENV;
const QUNIT_PARAMS = QUnit.urlParams;
const { assert } = QUnit;

const { ok } = assert;

assert.ok = function okWithStack(result, message) {
  let done = this.async();
  this.test.push = function pushWithSourceMap(result, actual, expected, message) {
    let source;

    const details = {
      module: this.module.name,
      name: this.testName,
      result: result,
      message: message,
      actual: actual,
      testId: this.testId,
      runtime: Date.now() - this.started
    };

    if (!result) {
      return StackTrace.get({
      }).then((stackframes) => {
        const withoutQUnit = stackframes.filter(stackframe => !/qunit/.test(stackframe.getFileName()));
        details.source = withoutQUnit.map(frame => frame.toString()).join('\n');
        runLoggingCallbacks('log', details);
        this.assertions.push({
          result: !!result,
          message: message
        });
        done();
      }).catch((err) => {
        debugger;
        done();
      });;
    } else {
      this.assertions.push({
        result: !!result,
        message: message
      });
      done();
    }
  };
  return ok.apply(this, arguments);
};

ENV.EXTEND_PROTOTYPES = QUNIT_PARAMS.extendprototypes;
ENV.ENABLE_OPTIONAL_FEATURES = QUNIT_PARAMS.enableoptionalfeatures;
ENV.ENABLE_DS_FILTER = true;

QUnit.begin(function() {
  Ember.RSVP.configure('onerror', function(reason) {
    // only print error messages if they're exceptions;
    // otherwise, let a future turn of the event loop
    // handle the error.
    if (reason && reason instanceof Error) {
      Ember.Logger.log(reason, reason.stack);
      throw reason;
    }
  });

  var transforms = {
    'boolean': DS.BooleanTransform.create(),
    'date': DS.DateTransform.create(),
    'number': DS.NumberTransform.create(),
    'string': DS.StringTransform.create()
  };

  // Prevent all tests involving serialization to require a container
  DS.JSONSerializer.reopen({
    transformFor: function(attributeType) {
      return this._super(attributeType, true) || transforms[attributeType];
    }
  });

});

assert.wait = wait;
assert.asyncEqual = asyncEqual;
assert.invokeAsync = invokeAsync;
assert.assertClean = function(promise) {
  return promise.then(this.wait((record) => {
    this.equal(record.get('hasDirtyAttributes'), false, "The record is now clean");
    return record;
  }));
};
assert.warns = warns;
assert.noWarns = noWarns;

assert.contains = function(array, item) {
  this.ok(array.indexOf(item) !== -1, `array contains ${item}`);
};

assert.without = function(array, item)  {
  this.ok(array.indexOf(item) === -1, `array doesn't contain ${item}`);
};

addEmberAssertions(assert);

QUnit.config.testTimeout= 2000;
QUnit.config.urlConfig.push({ id: 'enableoptionalfeatures', label: "Enable Opt Features" });

