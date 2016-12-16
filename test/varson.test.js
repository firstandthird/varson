/* global describe, it */
const tape = require('tape');
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

  it('context obj', () => {
    const result = varson({
      people: '{{data}}',
      firstName: '{{data.firstName}}',
      lastName: '{{data.lastName}}'
    }, {
      data: {
        firstName: 'Bob',
        lastName: 'Smith'
      }
    });
    expect(result).to.deep.equal({
      people: {
        firstName: 'Bob',
        lastName: 'Smith'
      },
      firstName: 'Bob',
      lastName: 'Smith'
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

  it('should handle complex objects', () => {
    const result = varson({
      name: 'bob',
      obja: {
        name: '{{name}}'
      },
      objb: '{{obja}}'
    });
    expect(result).to.deep.equal({
      name: 'bob',
      obja: {
        name: 'bob'
      },
      objb: {
        name: 'bob'
      }
    });
  });

  it('should handle nested complex objects', () => {
    const result = varson({
      people: {
        obja: {
          name: '{{people.name}}'
        },
        objb: '{{people.obja}}',
        name: 'bob'
      }
    });
    expect(result).to.deep.equal({
      people: {
        obja: {
          name: 'bob'
        },
        objb: {
          name: 'bob'
        },
        name: 'bob'
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

  it('should allow for dynamic keys', () => {
    const result = varson({
      '{{b}}': '{{ [1,2].join(",") }}',
      b: 'js'
    });
    expect(result).to.deep.equal({
      js: '1,2',
      b: 'js'
    });
  });

  it('should allow for dynamic keys in nested statements', () => {
    const result = varson({
      '{{b}}': '{{ [1,2].join(",") }}',
      b: 'js',
      c: {
        '{{d}}': 'this is nested'
      },
      d: 'hi'
    });
    expect(result).to.deep.equal({
      js: '1,2',
      b: 'js',
      c: {
        hi: 'this is nested'
      },
      d: 'hi'
    });
  });

  it('should allow complex dynamic key', () => {
    const result = varson({
      firstName: 'bob',
      lastName: 'smith',
      name: '{{firstName}} {{lastName}}',
      age: 35,
      card: {
        '{{name}}': {
          age: '{{age}}'
        }
      }
    });
    expect(result).to.deep.equal({
      firstName: 'bob',
      lastName: 'smith',
      name: 'bob smith',
      age: 35,
      card: {
        'bob smith': {
          age: 35
        }
      }
    });
  });

  it('should allow complex dynamic key pt 2', () => {
    const result = varson({
      firstName: 'bob',
      lastName: 'smith',
      age: 35,
      card: {
        '{{firstName}}': {
          age: '{{age}}'
        },
        '{{lastName}}': {
          age: '{{age}}'
        }
      }
    });
    expect(result).to.deep.equal({
      firstName: 'bob',
      lastName: 'smith',
      age: 35,
      card: {
        bob: {
          age: 35
        },
        smith: {
          age: 35
        }
      }
    });
  });


  it('should allow for js in keys', () => {
    const result = varson({
      '{{ b ? "bIsTrue" : "bIsFalse" }}': '123',
      '{{ c ? "cIsTrue" : "cIsFalse" }}': '123',
      b: true,
      c: false
    });
    expect(result).to.deep.equal({
      bIsTrue: '123',
      cIsFalse: '123',
      b: true,
      c: false
    });
  });

  it('should allow . in key or value (failed before)', () => {
    const result = varson({
      blah: 'yep',
      './test': {
        './debug': './true',
        '{{blah}}': 123
      }
    });
    expect(result).to.deep.equal({
      blah: 'yep',
      './test': {
        './debug': './true',
        yep: 123
      }
    });
  });

  it('should allow to change {{ }} to { }', () => {
    const origSettings = varson.settings;
    varson.settings.start = '{';
    varson.settings.end = '}';
    const result = varson({
      first: 'Bob',
      last: 'Smith',
      full: '{first} {last}'
    });
    expect(result).to.deep.equal({
      first: 'Bob',
      last: 'Smith',
      full: 'Bob Smith'
    });
    varson.settings = origSettings;
  });
});
