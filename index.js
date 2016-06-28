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
  // this should be declared with 'function' keyword so that
  // traverse.js can override 'this':
  const forEach = function(x) {
    if (check(x)) {
      let out;
      const name = x.replace('}}', '').replace('{{', '');
      // lodash template will turn objects into 'Object: object'
      // so just set it explicitly if so:
      if (typeof objWithContext[name] === 'object') {
        out = objWithContext[name];
      } else {
        const compiled = _.template(x);
        out = parseStr(compiled(objWithContext));
      }
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
