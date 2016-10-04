'use strict';
const template = require('lodash.template');
const merge = require('lodash.merge');
const cloneDeep = require('lodash.clonedeep');
const traverse = require('traverse');
const parseStr = require('./lib/parse-string');
const get = require('lodash.get');

module.exports = (obj, context) => {
  const reg = /{{([\s\S]+?)}}/g;
  const objWithContext = cloneDeep(obj);
  merge(objWithContext, context);

  const check = (val) => {
    return (typeof val === 'string' && val.match(reg));
  };
  const max = 5;
  let count = 0;
  let runAgain = false;
  // this should be declared with 'function' keyword so that
  // traverse.js can override 'this':
  const forEach = function(x) {
    if (check(x)) {
      let out;
      const name = x.replace('}}', '').replace('{{', '');
      // lodash template will turn objects into 'Object: object'
      // so just set it explicitly and move on if it's an object:
      const val = get(objWithContext, name);
      if (typeof val === 'object') {
        out = val;
      } else {
        const compiled = template(x, { interpolate: reg });
        out = parseStr(compiled(objWithContext));
      }
      if (check(out)) {
        runAgain = true;
      }
      this.update(out);
    }
  };
  const reduce = function(memo, x) {
    let outKey;
    //todo: you probably need to keep the forEach and do the key as a separate .reduce step
    // evaluate key:
    const key = this.key;
    if (check(key)) {
      const compiled = template(key, { interpolate: reg });
      outKey = parseStr(compiled(objWithContext));
      if (check(outKey)) {
        runAgain = true;
      }
    } else {
      outKey = key;
    }
    if (outKey !== undefined && this.level === 1) {
      memo[outKey] = x;
    }
    return memo;
  };
  // evaluate values:
  do {
    runAgain = false;
    traverse(obj).forEach(forEach);
    count++;
    if (count > max) {
      throw new Error('circular references');
    }
  } while (runAgain);
  // evaluate keys:
  do {
    runAgain = false;
    obj = traverse(obj).reduce(reduce, {});
    count++;
    if (count > max) {
      throw new Error('circular references');
    }
  } while (runAgain);
  return obj;
};
