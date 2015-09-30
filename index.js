var _ = require('lodash');
var traverse = require('traverse');
var parseStr = require('./lib/parse-string');

module.exports = function(obj, context) {

  var reg = /{{([\s\S]+?)}}/g;
  _.templateSettings.interpolate = reg;

  var objWithContext = _.cloneDeep(obj);
  _.merge(objWithContext, context);

  traverse(obj).forEach(function(x) {
    if (typeof x == 'string' && x.match(reg)) {
      var compiled = _.template(x);
      var out = compiled(objWithContext);
      out = parseStr(out);
      this.update(out);
    }
  });
  return obj;
};
