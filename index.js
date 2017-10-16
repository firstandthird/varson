'use strict';
const template = require('./lib/template');
const aug = require('aug');

const varson = (obj, context, settings) => {
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

  const processValue = function(value) {
    value = tmpl(value);
    return value;
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
    parent[key] = processValue(value);
  };

  processPart(obj, out);

  return out;
};

module.exports = varson;
