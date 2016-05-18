'use strict';
const _ = require('lodash');
const traverse = require('traverse');
const parseStr = require('./lib/parse-string');

module.exports = (obj, context) => {
  const reg = /{{([\s\S]+?)}}/g;
  _.templateSettings.interpolate = reg;
  const objWithContext = _.cloneDeep(obj);
  _.merge(objWithContext, context);

  const check = (val) => {
    return (typeof val === 'string' && val.match(reg));
  };
  const max = 5;
  let count = 0;
  let runAgain = false;
  const forEach = (x) => {
    if (check(x)) {
      const compiled = _.template(x);
      let out = compiled(objWithContext);
      out = parseStr(out);
      if (check(out)) {
        runAgain = true;
      }
      if (this && this.update) {
        this.update(out);
      }
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
