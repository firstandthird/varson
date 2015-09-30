/* global describe, it */

var expect = require('chai').expect;
var jsontpl = require('../');

describe('varson', function() {


  it('should populate from another var', function() {

    var result = jsontpl({
      first: 'Bob',
      last: 'Smith',
      full: '{{first}} {{last}}'
    });

    expect(result).to.deep.equal({
      first: 'Bob',
      last: 'Smith',
      full: 'Bob Smith'
    });
  });

  it('should keep the if boolean true', function() {

    var result = jsontpl({
      first: 'Bob',
      last: 'Smith',
      manager: true,
      isManager: '{{manager}}'
    });

    expect(result).to.deep.equal({
      first: 'Bob',
      last: 'Smith',
      manager: true,
      isManager: true
    });
  });

  it('should keep the if boolean false', function() {

    var result = jsontpl({
      first: 'Bob',
      last: 'Smith',
      manager: false,
      isManager: '{{manager}}'
    });

    expect(result).to.deep.equal({
      first: 'Bob',
      last: 'Smith',
      manager: false,
      isManager: false
    });
  });

  it('should keep the if number', function() {

    var result = jsontpl({
      first: 'Bob',
      last: 'Smith',
      manager: 1,
      isManager: '{{manager}}'
    });

    expect(result).to.deep.equal({
      first: 'Bob',
      last: 'Smith',
      manager: 1,
      isManager: 1
    });
  });

  it('should work with nested', function() {

    var result = jsontpl({
      first: 'Bob',
      last: 'Smith',
      info: {
        full: '{{first}} {{last}}',
        title: 'manager',
        deep: {
          title: '{{info.title}}'
        }
      }
    });

    expect(result).to.deep.equal({
      first: 'Bob',
      last: 'Smith',
      info: {
        full: 'Bob Smith',
        title: 'manager',
        deep: {
          title: 'manager'
        }
      }
    });
  });

  it('should allow math', function() {

    var result = jsontpl({
      math: '{{ 10*50 }}'
    });

    expect(result).to.deep.equal({
      math: 500
    });
  });

  it('should allow js', function() {

    var result = jsontpl({
      js: '{{ [1,2].join(",") }}'
    });

    expect(result).to.deep.equal({
      js: '1,2'
    });
  });

  it('should allow passing in custom functions', function() {

    var result = jsontpl({
      first: 'bob',
      last: 'smith',
      full: '{{getFullName(first, last)}}'
    }, {
      getFullName: function(first, last) {
        return first + ' ' + last;
      }
    });

    expect(result).to.deep.equal({
      first: 'bob',
      last: 'smith',
      full: 'bob smith'
    });
  });

  it('should work with arrays', function() {
    var result = jsontpl({
      arr: [1,2,3]
    });

    expect(result).to.deep.equal({
      arr: [1,2,3]
    });
  });

  it('should populate variables from arrays', function() {
    var result = jsontpl({
      first: 'bob',
      last: 'smith',
      arr: ['{{first}}','{{last}}']
    });

    expect(result).to.deep.equal({
      first: 'bob',
      last: 'smith',
      arr: ['bob', 'smith']
    });
  });
});
