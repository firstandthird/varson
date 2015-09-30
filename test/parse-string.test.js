/* global describe, it */
var expect = require('chai').expect;

var parseStr = require('../lib/parse-string');

describe('parseStr', function() {

  it('should skip non strings', function() {
    var o = parseStr([1, 2, 3]);
    expect(o).to.deep.equal([1, 2, 3]);
  });
  it('should parse ints', function() {
    var o = parseStr('1');
    expect(o).to.equal(1);
  });
  it('should parse floats', function() {
    var o = parseStr('99.1');
    expect(o).to.equal(99.1);
  });
  it('should parse boolean', function() {
    var o = parseStr('true');
    expect(o).to.equal(true);
  });
  it('should parse boolean false', function() {
    var o = parseStr('false');
    expect(o).to.equal(false);
  });
});
