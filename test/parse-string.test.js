/* global describe, test */
const test = require('tape');

const parseStr = require('../lib/parse-string');

test('should skip non strings', (t) => {
  t.plan(1);
  const o = parseStr([1, 2, 3]);
  t.deepEqual(o, [1, 2, 3]);
});
test('should parse empty strings as empty strings', (t) => {
  t.plan(1);
  const o = parseStr('');
  t.deepEqual(o, '');
});
test('should parse ints', (t) => {
  t.plan(1);
  const o = parseStr('1');
  t.equal(o, 1);
});
test('should parse floats', (t) => {
  t.plan(1);
  const o = parseStr('99.1');
  t.equal(o, 99.1);
});
test('should parse boolean', (t) => {
  t.plan(1);
  const o = parseStr('true');
  t.equal(o, true);
});
test('should parse boolean false', (t) => {
  t.plan(1);
  const o = parseStr('false');
  t.equal(o, false);
});
