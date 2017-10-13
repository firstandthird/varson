'use strict';
const _ = require('lodash');
const parseStr = require('./lib/parse-string');
const template = _.template;

const varson = (obj, context, settings) => {
  settings = settings || {
    start: '{{',
    end: '}}'
  };
  const reg = new RegExp(`${settings.start}([\\s\\S]+?)${settings.end}`, 'g');

  const out = {};

  const processPart = function(part, parent) {
    Object.keys(part).forEach((key) => {
      const value = part[key];
      processKey(key, value, parent);
    });
  };

  const processValue = function(value) {
    if (typeof value === 'string' && value.indexOf(settings.start) !== -1 && value.indexOf(settings.end) !== -1) {
      value = template(value, { interpolate: reg, imports: context })(obj);
    }
    return parseStr(value);
  };

  const processKey = function(key, value, parent) {
    if (typeof value === 'object') {
      parent[key] = {};
      return processPart(value, parent[key]);
    }
    parent[key] = processValue(value);
  };

  processPart(obj, out);

  return out;
};

module.exports = varson;
