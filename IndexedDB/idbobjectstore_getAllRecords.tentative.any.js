// META: title=IndexedDB: Test IDBObjectStore.getAllRecords
// META: global=window,worker
// META: script=resources/nested-cloning-common.js
// META: script=resources/support.js
// META: script=resources/support-get-all.js
// META: script=resources/support-promises.js

'use strict';

// Generates all the expected records for the 'out-of-line' object store created
// by `object_store_get_all_test()`.
// Returns
// [
//   { primaryKey:'a', value: 'value-a', key: 'a' },
//   { primaryKey:'b', value: 'value-b', key: 'b' },
//   ...
// ]
function getExpectedRecordsForOutOfLineObjectStore() {
  const expectedRecords = [];
  for (let i = 0; i < alphabet.length; i++) {
    const letter = alphabet[i];
    expectedRecords.push(
        {primaryKey: letter, key: letter, value: `value-${letter}`});
  }
  return expectedRecords;
}

object_store_get_all_test((test, connection) => {
  const key = 'c';
  const request = createGetAllRecordsRequest(
      test, connection, /*storeName=*/ 'out-of-line',
      /*options=*/ {query: key});
  request.onsuccess = test.step_func((event) => {
    const actualResults = event.target.result;
    const expectedResults = [{primaryKey: key, key, value: `value-${key}`}];
    assert_records_equals(actualResults, expectedResults);
    test.done();
  });
}, 'Single item getAllRecords');

object_store_get_all_test((test, connection) => {
  const key = 3;
  const request = createGetAllRecordsRequest(
      test, connection, /*storeName=*/ 'generated', /*options=*/ {query: key});
  request.onsuccess = test.step_func((event) => {
    const actualResults = event.target.result;
    const expectedResults =
        [{primaryKey: key, key, value: {id: key, ch: alphabet[key - 1]}}];
    assert_records_equals(actualResults, expectedResults);
    test.done();
  });
}, 'Single item getAllRecords (generated key)');

object_store_get_all_test((test, connection) => {
  const request =
      createGetAllRecordsRequest(test, connection, /*storeName=*/ 'empty');
  request.onsuccess = test.step_func((event) => {
    const actualResults = event.target.result;
    assert_records_equals(actualResults, /*expectedResults=*/[]);
    test.done();
  });
}, 'getAllRecords on empty object store');

object_store_get_all_test((test, connection) => {
  const request = createGetAllRecordsRequest(
      test, connection, /*storeName=*/ 'out-of-line');
  request.onsuccess = test.step_func((event) => {
    const actualResults = event.target.result;
    const expectedResults = getExpectedRecordsForOutOfLineObjectStore();
    assert_records_equals(actualResults, expectedResults);
    test.done();
  });
}, 'Get all records');

object_store_get_all_test((test, connection) => {
  const request = createGetAllRecordsRequest(
      test, connection, /*storeName=*/ 'large-values');
  request.onsuccess = test.step_func((event) => {
    const actualResults = event.target.result;
    assert_true(Array.isArray(actualResults, 'The results must be an array'));
    assert_equals(
        actualResults.length, largeValueCount,
        'The results array must contain the expected number of records');

    // Verify each record with a large value.
    for (let i = 0; i < largeValueCount; i++) {
      assert_equals(
          actualResults[i].primaryKey, i,
          'The record must have the expected primaryKey');
      assert_equals(
          actualResults[i].key, i, 'The record must have the expected key');

      const expectedValue = largeValue(/*size=*/ wrapThreshold, /*seed=*/ i);
      assert_equals(
          actualResults[i].value.join(','), expectedValue.join(','),
          'The record must have the expected value');
    }
    test.done();
  });
}, 'Get all records with large value');

object_store_get_all_test((test, connection) => {
  const maxCount = 10;
  const request = createGetAllRecordsRequest(
      test, connection, /*storeName=*/ 'out-of-line',
      /*options=*/ {count: maxCount});
  request.onsuccess = test.step_func((event) => {
    const expectedResults =
        getExpectedRecordsForOutOfLineObjectStore().slice(0, maxCount);

    const actualResults = event.target.result;
    assert_records_equals(actualResults, expectedResults);
    test.done();
  });
}, 'Test maxCount');

object_store_get_all_test((test, connection) => {
  const lowerBound = 'g';
  const upperBound = 'm';
  const request = createGetAllRecordsRequest(
      test, connection, /*storeName=*/ 'out-of-line',
      /*options=*/ {query: IDBKeyRange.bound(lowerBound, upperBound)});
  request.onsuccess = test.step_func((event) => {
    const lowerBoundIndex = alphabet.indexOf(lowerBound);
    const upperBoundIndex = alphabet.indexOf(upperBound) + 1;
    const expectedResults = getExpectedRecordsForOutOfLineObjectStore().slice(
        lowerBoundIndex, upperBoundIndex);

    const actualResults = event.target.result;
    assert_records_equals(actualResults, expectedResults);
    test.done();
  });
}, 'Get bound range');

object_store_get_all_test((test, connection) => {
  const lowerBound = 'g';
  const upperBound = 'm';
  const maxCount = 3;
  const request = createGetAllRecordsRequest(
      test, connection, /*storeName=*/ 'out-of-line', /*options=*/ {
        query: IDBKeyRange.bound(lowerBound, upperBound),
        count: maxCount
      });
  request.onsuccess = test.step_func((event) => {
    const lowerBoundIndex = alphabet.indexOf(lowerBound);
    const upperBoundIndex = alphabet.indexOf(upperBound) + 1;
    const rangeResults = getExpectedRecordsForOutOfLineObjectStore().slice(
        lowerBoundIndex, upperBoundIndex);
    const expectedResults = rangeResults.slice(0, maxCount);

    const actualResults = event.target.result;
    assert_records_equals(actualResults, expectedResults);
    test.done();
  });
}, 'Get bound range with maxCount');

object_store_get_all_test((test, connection) => {
  const lowerBound = 'g';
  const upperBound = 'k';
  const request = createGetAllRecordsRequest(
      test, connection, /*storeName=*/ 'out-of-line', /*options=*/ {
        query: IDBKeyRange.bound(
            lowerBound, upperBound, /*lowerOpen=*/ false, /*upperOpen=*/ true)
      });
  request.onsuccess = test.step_func((event) => {
    const lowerBoundIndex = alphabet.indexOf(lowerBound);
    const upperBoundIndex = alphabet.indexOf(upperBound);
    const expectedResults = getExpectedRecordsForOutOfLineObjectStore().slice(
        lowerBoundIndex, upperBoundIndex);

    const actualResults = event.target.result;
    assert_records_equals(actualResults, expectedResults);
    test.done();
  });
}, 'Get upper excluded');

object_store_get_all_test((test, connection) => {
  const lowerBound = 'g';
  const upperBound = 'k';
  const request = createGetAllRecordsRequest(
      test, connection, /*storeName=*/ 'out-of-line', /*option=*/ {
        query: IDBKeyRange.bound(
            lowerBound, upperBound, /*lowerOpen=*/ true, /*upperOpen=*/ false)
      });
  request.onsuccess = test.step_func((event) => {
    const lowerBoundIndex = alphabet.indexOf(lowerBound) + 1;
    const upperBoundIndex = alphabet.indexOf(upperBound) + 1;
    const expectedResults = getExpectedRecordsForOutOfLineObjectStore().slice(
        lowerBoundIndex, upperBoundIndex);

    const actualResults = event.target.result;
    assert_records_equals(actualResults, expectedResults);
    test.done();
  });
}, 'Get lower excluded');

object_store_get_all_test((test, connection) => {
  const lowerBound = 4;
  const upperBound = 15;
  const maxCount = 3;
  const request = createGetAllRecordsRequest(
      test, connection, /*storeName=*/ 'generated', /*options=*/ {
        query: IDBKeyRange.bound(lowerBound, upperBound),
        count: maxCount
      });
  request.onsuccess = test.step_func((event) => {
    // Build the range of expected records.
    const expectedResults = [];
    for (let i = 0; i < maxCount; i++) {
      expectedResults.push({
        primaryKey: lowerBound + i,
        key: lowerBound + i,
        value: {id: lowerBound + i, ch: alphabet[lowerBound + i - 1]},
      });
    }

    const actualResults = event.target.result;
    assert_records_equals(actualResults, expectedResults);
    test.done();
  });
}, 'Get bound range (generated) with maxCount');

object_store_get_all_test((test, connection) => {
  const request = createGetAllRecordsRequest(
      test, connection, /*storeName=*/ 'out-of-line',
      /*options=*/ {query: 'Doesn\'t exist'});
  request.onsuccess = test.step_func((event) => {
    const actualResults = event.target.result;
    assert_records_equals(actualResults, /*expectedResults=*/[]);
    test.done();
  });
}, 'Non existent key');

object_store_get_all_test((test, connection) => {
  const request = createGetAllRecordsRequest(
      test, connection, /*storeName=*/ 'out-of-line', /*options=*/ {count: 0});
  request.onsuccess = test.step_func((event) => {
    const actualResults = event.target.result;
    const expectedResults = getExpectedRecordsForOutOfLineObjectStore();
    assert_records_equals(actualResults, expectedResults);
    test.done();
  });
}, 'Zero count');

object_store_get_all_test((test, connection) => {
  const request = createGetAllRecordsRequest(
      test, connection, /*storeName=*/ 'out-of-line',
      /*options=*/ {count: 4294967295});
  request.onsuccess = test.step_func(event => {
    const actualResults = event.target.result;
    const expectedResults = getExpectedRecordsForOutOfLineObjectStore();
    assert_records_equals(actualResults, expectedResults);
    test.done();
  });
}, 'Max value count');

object_store_get_all_test((test, connection) => {
  const request = createGetAllRecordsRequest(
      test, connection, /*storeName=*/ 'out-of-line',
      /*options=*/ {query: IDBKeyRange.upperBound('0')});
  request.onsuccess = test.step_func((event) => {
    const actualResults = event.target.result;
    assert_records_equals(actualResults, /*expectedResults=*/[]);
    test.done();
  });
}, 'Empty range where  first key < upperBound');

object_store_get_all_test((test, connection) => {
  const request = createGetAllRecordsRequest(
      test, connection, /*storeName=*/ 'out-of-line',
      /*options=*/ {query: IDBKeyRange.lowerBound('zz')});
  request.onsuccess = test.step_func((event) => {
    const actualResults = event.target.result;
    assert_records_equals(actualResults, /*expectedResults=*/[]);
    test.done();
  });
}, 'Empty range where lowerBound < last key');

object_store_get_all_test((test, connection) => {
  const transaction = connection.transaction('out-of-line', 'readonly');
  const store = transaction.objectStore('out-of-line');
  const request = store.getAllRecords();
  transaction.commit();
  transaction.oncomplete =
      test.unreached_func('transaction completed before request succeeded');
  request.onerror = test.unreached_func('getAllRecords request must succeed');
  request.onsuccess = test.step_func((event) => {
    const actualResults = event.target.result;
    const expectedResults = getExpectedRecordsForOutOfLineObjectStore();
    assert_records_equals(actualResults, expectedResults);
    test.done();
  });
}, 'GetAllRecords with transaction.commit()');

object_store_get_all_test((test, connection) => {
  const request = createGetAllRecordsRequest(
      test, connection, /*storeName=*/ 'out-of-line',
      /*options=*/ {direction: 'next'});
  request.onsuccess = test.step_func((event) => {
    const actualResults = event.target.result;
    const expectedResults = getExpectedRecordsForOutOfLineObjectStore();
    assert_records_equals(actualResults, expectedResults);
    test.done();
  });
}, 'direction: "next"');

object_store_get_all_test((test, connection) => {
  const request = createGetAllRecordsRequest(
      test, connection, /*storeName=*/ 'out-of-line',
      /*options=*/ {direction: 'prev'});
  request.onsuccess = test.step_func((event) => {
    const actualResults = event.target.result;
    const expectedResults =
        getExpectedRecordsForOutOfLineObjectStore().reverse();
    assert_records_equals(actualResults, expectedResults);
    test.done();
  });
}, 'direction: "prev"');

object_store_get_all_test((test, connection) => {
  const request = createGetAllRecordsRequest(
      test, connection, /*storeName=*/ 'out-of-line',
      /*options=*/ {direction: 'nextunique'});
  request.onsuccess = test.step_func((event) => {
    const actualResults = event.target.result;
    const expectedResults = getExpectedRecordsForOutOfLineObjectStore();
    assert_records_equals(actualResults, expectedResults);
    test.done();
  });
}, 'direction: "nextunique"');

object_store_get_all_test((test, connection) => {
  const request = createGetAllRecordsRequest(
      test, connection, /*storeName=*/ 'out-of-line',
      /*options=*/ {direction: 'prevunique'});
  request.onsuccess = test.step_func((event) => {
    const actualResults = event.target.result;
    const expectedResults =
        getExpectedRecordsForOutOfLineObjectStore().reverse();
    assert_records_equals(actualResults, expectedResults);
    test.done();
  });
}, 'direction: "prevunique"');

object_store_get_all_test((test, connection) => {
  const lowerBound = 'b';
  const upperBound = 'x';
  const request = createGetAllRecordsRequest(
      test, connection, /*storeName=*/ 'out-of-line',
      /*options=*/ {
        direction: 'prev',
        query: IDBKeyRange.bound(lowerBound, upperBound)
      });
  request.onsuccess = test.step_func((event) => {
    const lowerBoundIndex = alphabet.indexOf(lowerBound);
    const upperBoundIndex = alphabet.indexOf(upperBound) + 1;
    const expectedResults = getExpectedRecordsForOutOfLineObjectStore()
                                .slice(lowerBoundIndex, upperBoundIndex)
                                .reverse();

    const actualResults = event.target.result;
    assert_records_equals(actualResults, expectedResults);
    test.done();
  });
}, 'direction and query');

object_store_get_all_test((test, connection) => {
  const maxCount = 4;
  const lowerBound = 'b';
  const upperBound = 'x';
  const request = createGetAllRecordsRequest(
      test, connection, /*storeName=*/ 'out-of-line',
      /*options=*/ {
        direction: 'prev',
        query: IDBKeyRange.bound(lowerBound, upperBound),
        count: maxCount
      });
  request.onsuccess = test.step_func((event) => {
    const lowerBoundIndex = alphabet.indexOf(lowerBound);
    const upperBoundIndex = alphabet.indexOf(upperBound) + 1;
    const expectedResults = getExpectedRecordsForOutOfLineObjectStore()
                                .slice(lowerBoundIndex, upperBoundIndex)
                                .reverse()
                                .slice(0, maxCount);

    const actualResults = event.target.result;
    assert_records_equals(actualResults, expectedResults);
    test.done();
  });
}, 'direction, query and count');
