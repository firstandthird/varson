var _ = require('lodash');
var traverse = require('traverse');
var parseStr = require('./lib/parse-string');

module.exports = function(obj, context) {

  var reg = /{{([\s\S]+?)}}/g;
  _.templateSettings.interpolate = reg;

  var objWithContext = _.cloneDeep(obj);
  _.merge(objWithContext, context);

  var check = function(val) {
    return (typeof val == 'string' && val.match(reg));
  };

  var max = 5;
  var count = 0;
  var runAgain = false;
  do {
    runAgain = false;
    traverse(obj).forEach(function(x) {
      if (check(x)) {
        var compiled = _.template(x);
        var out = compiled(objWithContext);
        out = parseStr(out);
        if (check(out)) {
          runAgain = true;
        }
        this.update(out);
      }
    });
    count++;
    if (count > max) {
      throw new Error('circular references');
    }
  } while(runAgain);
  return obj;
};
