/* global describe, it */
const expect = require('chai').expect;
const parseStr = require('../lib/parse-string');
describe('parseStr', () => {
  it('should skip non strings', () => {
    const o = parseStr([1, 2, 3]);
    expect(o).to.deep.equal([1, 2, 3]);
  });
  it('should parse empty strings as empty strings', () => {
    const o = parseStr('');
    expect(o).to.deep.equal('');
  });
  it('should parse ints', () => {
    const o = parseStr('1');
    expect(o).to.equal(1);
  });
  it('should parse floats', () => {
    const o = parseStr('99.1');
    expect(o).to.equal(99.1);
  });
  it('should parse boolean', () => {
    const o = parseStr('true');
    expect(o).to.equal(true);
  });
  it('should parse boolean false', () => {
    const o = parseStr('false');
    expect(o).to.equal(false);
  });
});
