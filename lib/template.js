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

module.exports = function (template, data) {
  const matches = template.match(/\{\{[^}]+\}\}/g);

  //if its just a lookup to another field, lets make sure that the type is kept
  if (matches.length === 1 && matches[0] === template) {
    const key = matches[0].slice(2, -2).trim();
    return lookup(key, data);
  }

  let out = template;
  matches.forEach(m => {
    const key = m.slice(2, -2).trim();
    const value = lookup(key, data);
    out = out.replace(m, value);
  });
  return out;
};
