// META: script=nested-cloning-common.js
// META: script=support.js
// META: script=support-promises.js

'use strict';

// Define constants used to populate object stores and indexes.
const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
const vowels = 'aeiou'.split('');
const largeValueCount = 3;

// Setup multiple object stores to test `getAllKeys()`, `getAll()` and
// `getAllRecords()`.
function object_store_get_all_test(func, name) {
  indexeddb_test((test, connection, transaction) => {
    // Create an object store with auto-generated, auto-incrementing, inline
    // keys.
    let store = connection.createObjectStore(
        'generated', {autoIncrement: true, keyPath: 'id'});
    alphabet.forEach(letter => {
      store.put({ch: letter});
    });

    // Create an object store with out-of-line keys.
    store = connection.createObjectStore('out-of-line');
    alphabet.forEach(letter => {
      store.put(`value-${letter}`, letter);
    });

    // Create an empty object store.
    store = connection.createObjectStore('empty');

    // Create an object store with `largeValueCount` large values.
    // `largeValue()` generates the value using the key as the seed.
    // The keys start at 0 and increment by 1 until `largeValueCount`.
    store = connection.createObjectStore('large-values');
    for (let i = 0; i < largeValueCount; i++) {
      const value = largeValue(/*size=*/ wrapThreshold, /*seed=*/ i);
      store.put(value, i);
    }
  }, func, name);
}

// Create a `getAllRecords()` request for either `storeName` or
// `optionalIndexName`.  The 'options' parameter is an `IDBGetAllOptions`
// dictionary, which may include: `{ query: IDBKeyRange, count: unsigned long,
// direction: IDBCursorDirection }`.
function createGetAllRecordsRequest(
    test, connection, storeName, options, optionalIndexName) {
  const transaction = connection.transaction(storeName, 'readonly');
  let queryTarget = transaction.objectStore(storeName);
  if (optionalIndexName) {
    queryTarget = queryTarget.index(optionalIndexName);
  }
  const request = queryTarget.getAllRecords(options);
  request.onerror = test.unreached_func('getAllRecords request must succeed');
  return request;
}

// Verifies each record from the results of `getAllRecords()`.
function assert_record_equals(actual_record, expected_record) {
  assert_class_string(
      actual_record, 'IDBRecord', 'The record must be an IDBRecord');
  assert_idl_attribute(
      actual_record, 'key', 'The record must have a key attribute');
  assert_idl_attribute(
      actual_record, 'primaryKey',
      'The record must have a primaryKey attribute');
  assert_idl_attribute(
      actual_record, 'value', 'The record must have a value attribute');

  // Verify the key properties.
  assert_equals(
      actual_record.primaryKey, expected_record.primaryKey,
      'The record must have the expected primaryKey');
  assert_equals(
      actual_record.key, expected_record.key,
      'The record must have the expected key');

  // Verify the value.
  const actual_value = actual_record.value;
  const expected_value = expected_record.value;
  if (typeof expected_value === 'object') {
    // Verify each property of the object value.
    for (let property_name of Object.keys(expected_value)) {
      if (Array.isArray(expected_value[property_name])) {
        // Verify the array property value.
        assert_array_equals(
            actual_value[property_name], expected_value[property_name],
            `The record must contain the array value "${
                JSON.stringify(
                    expected_value)}" with property "${property_name}"`);
      } else {
        // Verify the primitive property value.
        assert_equals(
            actual_value[property_name], expected_value[property_name],
            `The record must contain the value "${
                JSON.stringify(
                    expected_value)}" with property "${property_name}"`);
      }
    }
  } else {
    // Verify the primitive value.
    assert_equals(
        actual_value, expected_value,
        'The record must have the expected value');
  }
}

// Verifies the results from `getAllRecords()`, which is an array of records:
// [
//   { 'key': key1, 'primaryKey': primary_key1, 'value': value1 },
//   { 'key': key2, 'primaryKey': primary_key2, 'value': value2 },
//   ...
// ]
function assert_records_equals(actual_records, expected_records) {
  assert_true(
      Array.isArray(actual_records),
      'The records must be an array of IDBRecords');
  assert_equals(
      actual_records.length, expected_records.length,
      'The records array must contain the expected number of records');

  for (let i = 0; i < actual_records.length; i++) {
    assert_record_equals(actual_records[i], expected_records[i]);
  }
}
