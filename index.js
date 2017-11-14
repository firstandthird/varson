'use strict';
const template = require('./lib/template');
const aug = require('aug');

const varson = function(obj, context, settings) {
  return new Promise((resolve, reject) => {

    settings = settings || {
      start: '{{',
      end: '}}'
    };

    const out = aug(obj);

    const processPart = function(part, parent) {
      Object.keys(part).forEach((key) => {
        const value = part[key];
        processKey(key, value, parent);
      });
    };

    const isVar = function(str) {
      if (typeof str === 'string' && str.indexOf(settings.start) !== -1 && str.indexOf(settings.end) !== -1) {
        return true;
      }
      return false;
    };

    const tmpl = function(str, count = 0) {
      if (isVar(str)) {
        if (count === 10) {
          throw new Error('circular reference');
        }
        const rendered = template(str, aug(out, context), settings);
        return tmpl(rendered, ++count);
      }
      return str;
    };

    const processValue = function(value, callback) {
      value = tmpl(value);
      if (value instanceof Promise) {
        value.then(newValue => {
          return callback(null, newValue);
        });
      }
      return callback(null, value);
      // return value;
    };

    const processKey = function(key, value, parent) {
      if (isVar(key)) {
        //key is a variable, need to remove old {{var}} key from object and set as new key
        const oldKey = key;
        key = tmpl(key);
        parent[key] = parent[oldKey];
        delete parent[oldKey];
      }
      if (value && typeof value === 'object') {
        return processPart(value, parent[key]);
      }

      processValue(value, (err, result) => {
        parent[key] = result;
      });
    };

    processPart(obj, out);

    return resolve(out);
  });
};

module.exports = varson;
