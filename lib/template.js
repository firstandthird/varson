const get = require('lodash.get');
module.exports = function (template, data, context) {
  let val = null;
  const out = template.replace(/\{\{[^}]+\}\}/g, match => {
    const key = match.slice(2, -2).trim();
    val = get(data, key);

    if (typeof val !== 'undefined') {
      return val;
    }

    return new Function('obj', `
      with(obj) {
        return ${key};
      }
    `)(data);
  });
  //if trying to reference an object, replace turns to a string, so lets just return the raw value
  if (out === '[object Object]') {
    return val;
  }

  return out;
};
