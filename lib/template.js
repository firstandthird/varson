const get = require('lodash.get');

const lookup = function(key, data) {
  const val = get(data, key);

  if (typeof val !== 'undefined') {
    return val;
  }

  return new Function('obj', `
    with(obj) {
      return ${key};
    }
  `)(data);
};

const getKey = function(match, settings) {
  return match.slice(settings.start.length, -1 * settings.end.length).trim();
};

module.exports = function (template, data, settings) {
  const reg = new RegExp(`${settings.start}([\\s\\S]+?)${settings.end}`, 'g');
  const matches = template.match(reg);

  //if its just a lookup to another field, lets make sure that the type is kept
  if (matches.length === 1 && matches[0] === template) {
    const key = getKey(matches[0], settings);
    return lookup(key, data);
  }

  let out = template;
  matches.forEach(m => {
    const key = getKey(m, settings);
    const value = lookup(key, data);
    out = out.replace(m, value);
  });
  return out;
};
