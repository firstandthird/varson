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
  const objWithContext = cloneDeep(obj);
  merge(objWithContext, context);

  const check = (val) => {
    return (typeof val === 'string' && val.match(reg));
  };
  const max = 5;
  let count = 0;
  let runAgain = false;

  // reduceCurrentObject runs on each node of the expression tree,
  // evaluates the key and value expressions for that node,
  // and returns a memo object with the evaluated key-values:
  const reduceCurrentObject = function(memo, originalValueString) {
    let evaluatedKey;
    let evaluatedValue;
    const originalKey = this.key;

    // evaluate originalKey:
    if (check(originalKey)) {
      const compiled = template(originalKey, { interpolate: reg });
      evaluatedKey = parseStr(compiled(objWithContext));
      if (check(evaluatedKey)) {
        runAgain = true;
      }
    } else {
      evaluatedKey = originalKey;
    }

    // evaluate the originalValueString
    evaluatedValue = originalValueString;
    if (check(originalValueString)) {
      const name = originalValueString.replace(varson.settings.end, '').replace(varson.settings.start, '');
      const originalValue = get(objWithContext, name);
      // if it's an object, we must update the current node to make sure we traverse the sub-object too:
      if (typeof originalValue === 'object') {
        evaluatedValue = originalValue;
        this.update(evaluatedValue);
      } else {
        const compiled = template(originalValueString, { interpolate: reg });
        evaluatedValue = parseStr(compiled(objWithContext));
      }
      if (check(evaluatedValue)) {
        runAgain = true;
      }
    }
    // if we have an evaluated key, set it to the evaluated value:
    if (evaluatedKey !== undefined) {
      // if it's a top-level key, just set it and we're done:
      if (this.path.length === 1) {
        memo[evaluatedKey] = evaluatedValue;
        return memo;
      }
      // if it's a key inside a nested sub-object, we need to unset the previous unevaluated key:
      const oldPath = this.path.slice(0, this.path.length - 1);
      oldPath.push(originalKey);
      unset(memo, oldPath.join('.'));
      // and now we can set the evaluated key:
      const path = this.path.slice(0, this.path.length - 1);
      path.push(evaluatedKey);
      set(memo, path.join('.'), evaluatedValue);
    }
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
