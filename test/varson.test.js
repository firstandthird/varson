/* global describe, it */
const expect = require('chai').expect;
const varson = require('../');

describe('varson', () => {
  it('should populate from another var', () => {
    const result = varson({
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
  it('should keep the if boolean true', () => {
    const result = varson({
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

  it('should keep the if boolean false', () => {
    const result = varson({
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

  it('should keep the if number', () => {
    const result = varson({
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

  it('should work with nested', () => {
    const result = varson({
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

  it('should allow math', () => {
    const result = varson({
      math: '{{ 10*50 }}'
    });
    expect(result).to.deep.equal({
      math: 500
    });
  });

  it('should allow js', () => {
    const result = varson({
      js: '{{ [1,2].join(",") }}'
    });
    expect(result).to.deep.equal({
      js: '1,2'
    });
  });

  it('should allow js - part 2', () => {
    const result = varson({
      scale: '{{ env == "prod" ? 4 : 1}}'
    }, {
      env: 'dev'
    });
    expect(result).to.deep.equal({
      scale: 1
    });
  });

  it('should allow passing in custom functions', () => {
    const result = varson({
      first: 'bob',
      last: 'smith',
      full: '{{getFullName(first, last)}}'
    }, {
      getFullName: (first, last) => {
        return `${first} ${last}`;
      }
    });
    expect(result).to.deep.equal({
      first: 'bob',
      last: 'smith',
      full: 'bob smith'
    });
  });

  it('should work with arrays', () => {
    const result = varson({
      arr: [1, 2, 3]
    });
    expect(result).to.deep.equal({
      arr: [1, 2, 3]
    });
  });

  it('should populate variables from arrays', () => {
    const result = varson({
      first: 'bob',
      last: 'smith',
      arr: ['{{first}}', '{{last}}']
    });
    expect(result).to.deep.equal({
      first: 'bob',
      last: 'smith',
      arr: ['bob', 'smith']
    });
  });

  it('should handle recursion', () => {
    const result = varson({
      a: 'a',
      b: '{{c}}',
      c: '{{a}}'
    });
    expect(result).to.deep.equal({
      a: 'a',
      b: 'a',
      c: 'a'
    });
  });

  it('should handle nested recursion', () => {
    const result = varson({
      a: 'a',
      b: '{{c}}',
      c: '{{a}}',
      nest: {
        d: '{{b}}'
      }
    });
    expect(result).to.deep.equal({
      a: 'a',
      b: 'a',
      c: 'a',
      nest: {
        d: 'a'
      }
    });
  });

  it('context this is the object', () => {
    const result = varson({
      keys: 'obj',
      obj: {
        value: 'abc'
      },
      result: '{{lookup(keys, "value")}}'
    }, {
      // keep this as 'function' keyword notation
      // so 'this' will be available:
      lookup: function(key, value) {
        return this[key][value];
      }
    });
    expect(result).to.deep.equal({
      keys: 'obj',
      obj: {
        value: 'abc'
      },
      result: 'abc'
    });
  });

  it('should handle objects', () => {
    const result = varson({
      obja: {
        a: 'a'
      },
      objb: '{{obja}}'
    });
    expect(result).to.deep.equal({
      obja: {
        a: 'a'
      },
      objb: {
        a: 'a'
      }
    });
  });

  it('should handle circular', () => {
    expect(() => {
      varson({
        a: '{{a}}'
      });
    }).to.throw();
  });
});
