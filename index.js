'use strict';
const parseStr = require('./lib/parse-string');
const template = require('lodash.template');
const aug = require('aug');
const get = require('lodash.get');

const varson = (obj, context, settings) => {
  settings = settings || {
    start: '{{',
    end: '}}'
  };
  const reg = new RegExp(`${settings.start}([\\s\\S]+?)${settings.end}`, 'g');

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

  const tmpl = function(str) {
    if (isVar(str)) {
      const rendered = template(str, { interpolate: reg, imports: context })(out);
      if (!rendered) {
        return str;
      }
      if (rendered === '[object Object]') {
        const key = str.replace(settings.start, '').replace(settings.end, '');
        return get(out, key) || get(context, key);
      }
      return tmpl(rendered);
    }
    return str;
  };

  const processValue = function(value) {
    value = tmpl(value);
    return parseStr(value);
  };

  const processKey = function(key, value, parent) {
    if (isVar(key)) {
      const oldKey = key;
      key = tmpl(key);
      parent[key] = parent[oldKey];
      delete parent[oldKey];
    }
    if (typeof value === 'object') {
      return processPart(value, parent[key]);
    }
    parent[key] = processValue(value);
  };

  processPart(obj, out);

  return out;
};

module.exports = varson;
