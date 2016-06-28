'use strict';
const template = require('lodash.template');
const merge = require('lodash.merge');
const cloneDeep = require('lodash.clonedeep');
const traverse = require('traverse');
const parseStr = require('./lib/parse-string');

module.exports = (obj, context) => {
  const reg = /{{([\s\S]+?)}}/g;
  // templateSettings.interpolate = reg;
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
      const compiled = template(x, { interpolate: reg });
      let out = compiled(objWithContext);
      out = parseStr(out);
      if (check(out)) {
        runAgain = true;
      }
      this.update(out);
    }
  };
  do {
    runAgain = false;
    traverse(obj).forEach(forEach);
    count++;
    if (count > max) {
      throw new Error('circular references');
    }
  } while (runAgain);
  return obj;
};
