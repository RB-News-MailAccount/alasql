if (typeof exports === 'object') {
  var assert = require('assert');
	var alasql = require('../dist/alasql');
}

var test = 820

describe(title = 'Test ' + test + ' - ALTER TABLE - ADD COLUMN ', () => {
  var dbName = (title && title.replace(/[\s\W]/g, '_'))
    
  beforeEach(() => {
    // OBS: With beforeEach/afterEach the following tests are independend of each other
    alasql('create database ' + dbName);
		alasql('use ' + dbName);
		alasql('CREATE TABLE test (ind INT AUTO_INCREMENT, num INT)');
    
    // Allows testing of default settings for existing rows:
		alasql('INSERT INTO test (num) VALUES(10), (20), (30)');
  });

  afterEach(() => {
    alasql('drop database ' + dbName);
  });

	it('String no DEFAULT, no CONSTRAINT', done => {
		alasql('ALTER TABLE test ADD COLUMN new_col string');
		alasql('INSERT INTO test (num, new_col) VALUES(40, "Cycle"), (50, "Car"), (60, "Van")');
		var res = alasql('select * from test');
    assert.equal(res.length, 6);
    for (let index = 0; index < 3; index++) {
      assert.equal(res[index].new_col, undefined,'Error at row ' + index + ' : ' + JSON.stringify(res[index]))
    }
    assert.equal(res[3].new_col, "Cycle", createMes(res, 3))
    assert.equal(res[4].new_col, "Car", createMes(res, 4))
    assert.equal(res[5].new_col, "Van", createMes(res, 5))
		done();
	});

  it('String with DEFAULT, no CONSTRAINT', done => {
    var def = 'a string'
		alasql('ALTER TABLE test ADD COLUMN new_col string DEFAULT "' + def +'"');
		alasql('INSERT INTO test (num) VALUES(40), (50)');
		alasql('INSERT INTO test (num, `new_col`) VALUES(60, "Van")');
		var res = alasql('select * from test');
    assert.equal(res.length, 6);
    for (let index = 0; index < 5; index++) {
      assert.equal(res[index].new_col, def, createMes(res, index))
    }
    assert.equal(res[5].new_col, "Van", createMes(res, 5))
		done();
	});
  

  it('BOOLEAN no DEFAULT, no CONSTRAINT', done => {
		alasql('ALTER TABLE test ADD COLUMN `new_col` BOOLEAN');
		alasql('INSERT INTO test (num, `new_col`) VALUES(40, true), (50, false), (60, false)');
		var res = alasql('select * from test');

    assert.equal(res.length, 6);
    for (let index = 0; index < 3; index++) {
      assert.equal(res[index].new_col, undefined, createMes(res, index))
    }
    assert.equal(res[3].new_col, true, createMes(res, 3))
    assert.equal(res[4].new_col, false, createMes(res, 4))
    assert.equal(res[5].new_col, false, createMes(res, 5))

		done();
	});

  it('BOOLEAN with DEFAULT, no CONSTRAINT', done => {
    var def = true
		alasql('ALTER TABLE test ADD COLUMN `new_col` BOOLEAN DEFAULT ' + def);
		alasql('INSERT INTO test (num) VALUES(40), (50)');
		alasql('INSERT INTO test (num, `new_col`) VALUES(60, false)');
		var res = alasql('select * from test');

    assert.equal(res.length, 6);
    for (let index = 0; index < 5; index++) {
      assert.equal(res[index].new_col, def, createMes(res, index))
    }
    
    assert.equal(res[5].new_col, false, createMes(res, 5))

		done();
	});

  it('INT without default', done =>  {
    alasql(' ALTER TABLE test ADD COLUMN `new_col`  INT');
		alasql('INSERT INTO test (num, `new_col`) VALUES(40, ' + Number.MIN_SAFE_INTEGER + '), (50, 100), (60, ' + Number.MAX_SAFE_INTEGER + ')');
		var res = alasql('select * from test');

    assert.equal(res.length, 6);
    for (let index = 0; index < 3; index++) {
      assert.equal(res[index].new_col, undefined, createMes(res, index))
    }
    assert.equal(res[3].new_col, Number.MIN_SAFE_INTEGER, createMes(res, 3))
    assert.equal(res[4].new_col, 100, createMes(res, 4))
    assert.equal(res[5].new_col, Number.MAX_SAFE_INTEGER, createMes(res, 5))

		done();
	});

  it('INT with default', done => {
    var def = 11;
    alasql('ALTER TABLE test ADD COLUMN `new_col`  INT DEFAULT ' + def);
		alasql('INSERT INTO test (num) VALUES(40), (50)');
		alasql('INSERT INTO test (num, `new_col`) (60, 1000000)');
    var res = alasql('select * from test');
    
    assert.equal(res.length, 6);
    for (let index = 0; index < 5; index++) {
      assert.equal(res[index].new_col, def, createMes(res, index))
    }

    assert.equal(res[5].new_col, 1000000, createMes(res, 5))

		done();
	});

  it('INT without default but not null', done => {
		assert.throws(() => alasql('ALTER TABLE test ADD COLUMN `new_col`  INT NOT NULL'), 
    'Expecting error for prefilled table with new column requiring NOT NULL, but not giving a default for existing rows');
    done()
	});

  // TODO: more tests, some cases are still missing

  function createMes(res, index) {
    return 'Error at row ' + index + ': ' + JSON.stringify(res[index])
  }
});
