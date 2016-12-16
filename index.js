'use strict';
const _ = require('lodash');
const traverse = require('traverse');
const parseStr = require('./lib/parse-string');
const template = _.template;
const merge = _.merge;
const cloneDeep = _.cloneDeep;
const get = _.get;
const set = _.set;
const unset = _.unset;

const varson = (obj, context) => {
  const reg = new RegExp(`${varson.settings.start}([\\s\\S]+?)${varson.settings.end}`, 'g');

  const isVariable = (val) => (typeof val === 'string' && val.match(reg));

  const originalUnmodifiedObject = cloneDeep(obj);
  merge(originalUnmodifiedObject, context);
  const max = 5;
  let count = 0;
  let runAgain = false;

  // helper function that tries to replace '{{}}'s:
  const evaluateItem = (text) => {
    const evaluate = template(text, { interpolate: reg });
    // if the value is a sub-object we don't want to parse it:
    const match = reg.exec(text);
    if (match) {
      const value = _.get(originalUnmodifiedObject, match[1]);
      if (typeof value === 'object') {
        return value;
      }
    }
    // everything else needs to be parsed:
    return parseStr(evaluate(originalUnmodifiedObject));
  };

  // reduceCurrentObject runs on each node of the expression tree,
  // evaluates the key and value expressions for that node,
  // and updates the memo object with the evaluated key-values:
  const reduceCurrentObject = function(memo, originalValueString) {
    let evaluatedKey;
    let evaluatedValue;
    // evaluate what the key is supposed to be:
    if (isVariable(this.key)) {
      evaluatedKey = evaluateItem(this.key);
      if (isVariable(evaluatedKey)) {
        runAgain = true;
      }
    } else {
      evaluatedKey = this.key;
    }
    this.evaluatedKey = evaluatedKey;

    // evaluate what the value at that key is supposed to be:
    evaluatedValue = originalValueString;
    if (isVariable(originalValueString)) {
      const originalValue = get(memo, originalValueString.replace(varson.settings.end, '').replace(varson.settings.start, ''));
      // if it's an object, we must update the current node to make sure we traverse the sub-object too:
      if (typeof originalValue === 'object') {
        evaluatedValue = originalValue;
        this.update(evaluatedValue);
      } else {
        evaluatedValue = evaluateItem(originalValueString);
      }
      if (isVariable(evaluatedValue)) {
        runAgain = true;
      }
    }

    // now to update the object with the new evaluated key/values data...

    // first verify the parent path segments are up-to-date with the current state of the memo object:
    let curParent = this;
    const pathToValue = this.path.slice();
    for (let i = pathToValue.length - 2; i > - 1; i--) {
      curParent = curParent.parent;
      if (curParent.evaluatedKey) {
        pathToValue[i] = curParent.evaluatedKey;
      }
    }
    // using the old path, unset the previous value:
    unset(memo, pathToValue);
    // get the new path to the newly-evaluated key:
    pathToValue[pathToValue.length - 1] = evaluatedKey;
    // update it:
    set(memo, pathToValue, evaluatedValue);
    return memo;
  };

  // the main loop repeatedly reduces the current object to a new object,
  // until all the bracketed expressions are evaluated and replaced:
  do {
    runAgain = false;
    obj = traverse(obj).reduce(reduceCurrentObject, {});
    count++;
    if (count > max) {
      throw new Error('circular references');
    }
  } while (runAgain);
  return obj;
};

varson.settings = {
  start: '{{',
  end: '}}'
};
module.exports = varson;
