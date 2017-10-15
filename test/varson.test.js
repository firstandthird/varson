const test = require('tap').test;
const varson = require('../');

test('should populate from another var', (t) => {
  t.plan(1);
  const result = varson({
    first: 'Bob',
    last: 'Smith',
    full: '{{first}} {{last}}'
  });
  t.deepEqual(result, {
    first: 'Bob',
    last: 'Smith',
    full: 'Bob Smith'
  });
});

test('should keep the if boolean true', (t) => {
  t.plan(1);
  const result = varson({
    first: 'Bob',
    last: 'Smith',
    manager: true,
    isManager: '{{manager}}'
  });
  t.deepEqual(result, {
    first: 'Bob',
    last: 'Smith',
    manager: true,
    isManager: true
  });
});

test('should keep the if boolean false', (t) => {
  t.plan(1);
  const result = varson({
    first: 'Bob',
    last: 'Smith',
    manager: false,
    isManager: '{{manager}}'
  });
  t.deepEqual(result, {
    first: 'Bob',
    last: 'Smith',
    manager: false,
    isManager: false
  });
});

test('should keep the if number', (t) => {
  t.plan(1);
  const result = varson({
    first: 'Bob',
    last: 'Smith',
    manager: 1,
    isManager: '{{manager}}'
  });
  t.deepEqual(result, {
    first: 'Bob',
    last: 'Smith',
    manager: 1,
    isManager: 1
  });
});

test('should not convert string to number', (t) => {
  t.plan(1);
  const result = varson({
    first: 'Bob',
    last: 'Smith',
    manager: '1'
  });
  t.deepEqual(result, {
    first: 'Bob',
    last: 'Smith',
    manager: 1
  });
});

test('be able to convert number to string', (t) => {
  t.plan(1);
  const result = varson({
    first: 'Bob',
    last: 'Smith',
    manager: 1,
    managerString: '{{manager.toString()}}'
  });
  t.deepEqual(result, {
    first: 'Bob',
    last: 'Smith',
    manager: 1,
    managerString: '1'
  });
});

test('be able to convert string to number', (t) => {
  t.plan(1);
  const result = varson({
    first: 'Bob',
    last: 'Smith',
    manager: '123',
    managerNum: '{{parseInt(manager, 10)}}'
  });
  t.deepEqual(result, {
    first: 'Bob',
    last: 'Smith',
    manager: '123',
    managerNum: 123
  });
});

test('should work with nested', (t) => {
  t.plan(1);
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
  t.deepEqual(result, {
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

test('should allow math', (t) => {
  t.plan(1);
  const result = varson({
    math: '{{ 10*50 }}'
  });
  t.deepEqual(result, {
    math: 500
  });
});

test('should allow js', (t) => {
  t.plan(1);
  const result = varson({
    js: '{{ [1,2].join(",") }}'
  });
  t.deepEqual(result, {
    js: '1,2'
  });
});

test('should allow js - part 2', (t) => {
  t.plan(1);
  const result = varson({
    scale: '{{ env == "prod" ? 4 : 1}}'
  }, {
    env: 'dev'
  });
  t.deepEqual(result, {
    scale: 1
  });
});

test('should allow passing in custom functions', (t) => {
  t.plan(1);
  const result = varson({
    first: 'bob',
    last: 'smith',
    full: '{{getFullName(first, last)}}'
  }, {
    getFullName: (first, last) => {
      return `${first} ${last}`;
    }
  });
  t.deepEqual(result, {
    first: 'bob',
    last: 'smith',
    full: 'bob smith'
  });
});

test('should work with arrays', (t) => {
  t.plan(1);
  const result = varson({
    arr: [1, 2, 3]
  });
  t.deepEqual(result, {
    arr: [1, 2, 3]
  });
});

test('should populate variables from arrays', (t) => {
  t.plan(1);
  const result = varson({
    first: 'bob',
    last: 'smith',
    arr: ['{{first}}', '{{last}}']
  });
  t.deepEqual(result, {
    first: 'bob',
    last: 'smith',
    arr: ['bob', 'smith']
  });
});

test('should handle recursion', (t) => {
  t.plan(1);
  const result = varson({
    a: 'a',
    b: '{{c}}',
    c: '{{a}}'
  });
  t.deepEqual(result, {
    a: 'a',
    b: 'a',
    c: 'a'
  });
});

test('should handle nested recursion', (t) => {
  t.plan(1);
  const result = varson({
    a: 'a',
    b: '{{c}}',
    c: '{{a}}',
    nest: {
      d: '{{b}}'
    }
  });
  t.deepEqual(result, {
    a: 'a',
    b: 'a',
    c: 'a',
    nest: {
      d: 'a'
    }
  });
});

test('context passing in keys', (t) => {
  t.plan(1);
  const result = varson({
    keys: 'obj',
    obj: {
      value: 'abc'
    },
    result: '{{lookup(keys, obj.value)}}'
  }, {
    // keep this as 'function' keyword notation
    // so 'this' will be available:
    lookup(key, value) {
      return `${key}${value}`;
    }
  });
  t.deepEqual(result, {
    keys: 'obj',
    obj: {
      value: 'abc'
    },
    result: 'objabc'
  });
});

test('context obj', (t) => {
  t.plan(1);
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
  t.deepEqual(result, {
    people: {
      firstName: 'Bob',
      lastName: 'Smith'
    },
    firstName: 'Bob',
    lastName: 'Smith'
  });
});

test('should handle objects', (t) => {
  t.plan(1);
  const result = varson({
    obja: {
      a: 'a'
    },
    objb: '{{obja}}'
  });
  t.deepEqual(result, {
    obja: {
      a: 'a'
    },
    objb: {
      a: 'a'
    }
  });
});

test('should handle complex objects', (t) => {
  t.plan(1);
  const result = varson({
    name: 'bob',
    obja: {
      name: '{{name}}'
    },
    objb: '{{obja}}'
  });
  t.deepEqual(result, {
    name: 'bob',
    obja: {
      name: 'bob'
    },
    objb: {
      name: 'bob'
    }
  });
});

test('should handle nested complex objects', (t) => {
  t.plan(1);
  const result = varson({
    people: {
      obja: {
        name: '{{people.name}}'
      },
      objb: '{{people.obja}}',
      name: 'bob'
    }
  });
  t.deepEqual(result, {
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

test('should handle circular', (t) => {
  t.plan(1);
  t.throws(() => {
    varson({
      a: '{{a}}'
    });
  });
});

test('should allow for dynamic keys', (t) => {
  t.plan(1);
  const result = varson({
    '{{b}}': '{{ [1,2].join(",") }}',
    b: 'js'
  });
  t.deepEqual(result, {
    js: '1,2',
    b: 'js'
  });
});

test('should allow for dynamic keys in nested statements', (t) => {
  t.plan(1);
  const result = varson({
    '{{b}}': '{{ [1,2].join(",") }}',
    b: 'js',
    c: {
      '{{d}}': 'this is nested'
    },
    d: 'hi'
  });
  t.deepEqual(result, {
    js: '1,2',
    b: 'js',
    c: {
      hi: 'this is nested'
    },
    d: 'hi'
  });
});

test('should allow complex dynamic key', (t) => {
  t.plan(1);
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
  t.deepEqual(result, {
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

test('should allow complex dynamic key pt 2', (t) => {
  t.plan(1);
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
  t.deepEqual(result, {
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

test('should allow for js in keys', (t) => {
  t.plan(1);
  const result = varson({
    '{{ b ? "bIsTrue" : "bIsFalse" }}': '123',
    '{{ c ? "cIsTrue" : "cIsFalse" }}': 'abc',
    b: true,
    c: false
  });
  t.deepEqual(result, {
    bIsTrue: 123,
    cIsFalse: 'abc',
    b: true,
    c: false
  });
});

test('should allow . in key or value (failed before)', (t) => {
  t.plan(1);
  const result = varson({
    blah: 'yep',
    './test': {
      './debug': './true',
      '{{blah}}': 123
    }
  });
  t.deepEqual(result, {
    blah: 'yep',
    './test': {
      './debug': './true',
      yep: 123
    }
  });
});

test('should allow to change {{ }} to { }', (t) => {
  t.plan(1);
  const settings = {
    start: '{',
    end: '}'
  };
  const result = varson({
    first: 'Bob',
    last: 'Smith',
    full: '{first} {last}'
  }, null, settings);
  t.deepEqual(result, {
    first: 'Bob',
    last: 'Smith',
    full: 'Bob Smith'
  });
});

test('should be able to split string', (t) => {
  t.plan(1);
  const result = varson({
    names: '{{ENV.NAMES.split(",")}}'
  }, {
    ENV: {
      NAMES: 'bob,james'
    }
  });
  t.deepEqual(result, {
    names: ['bob', 'james']
  });
});

test('should be able to return a function', (t) => {
  t.plan(2);
  const add = function(a, b) {
    return a + b;
  };
  const result = varson({
    add: '{{fn}}',
    onePlusTwo: '{{fn(1, 2)}}'
  }, {
    fn: add
  });
  t.deepEqual(result, {
    add,
    onePlusTwo: 3
  });
  t.equal(result.add(1, 4), 5);
});

test('ms helper', (t) => {
  t.plan(1);
  const result = varson({
    oneDay: '{{ms("1d")}}'
  }, {
    ms: require('ms')
  });
  t.deepEqual(result, {
    oneDay: 1000 * 60 * 60 * 24
  });
});
