import React from "react";

// const log = console.log;

type Value = number;
const enum ActionType {
  Add = "ADD",
  Set = "SET",
  Remove = "REMOVE",
  Get = "GET"
}

type Action =
  | { type: ActionType.Add; payload: { value: Value } }
  | { type: ActionType.Set; payload: { values: Value[] } }
  | { type: ActionType.Get };

// In-line swap: https://stackoverflow.com/a/16201730/4035
function swap(values: Value[], i1: number, i2: number): Value[] {
  // log(`       swap Before => ${values}, i1=${i1}, i2=${i2}`);
  // values[i2] = [values[i1], (values[i1] = values[i2])][0];
  // log(`       swap AFTER => ${values}, i1=${i1}, i2=${i2}`);
  //          0, 1, 2, 3, 4, 5, 6
  // values=[10,20,30,40,50,60,70], i1=1 (20), i2=4(50) then
  // [10], [?], [30, 40], [?], [60, 70]

  const left = values.slice(0, i1);
  const middle = values.slice(i1 + 1, i2);
  const right = values.slice(i2 + 1);

  // log(
  //   `values=${values}, i1=${i1}, i2=${i2}, left, values[i2], middle, values[i1], right`,
  //   left,
  //   values[i2],
  //   middle,
  //   values[i1],
  //   right
  // );

  return [...left, values[i2], ...middle, values[i1], ...right];
}

const getParentIndex = (childIndex: number): number => ~~((childIndex - 1) / 2);
const hasParent = (childIndex: number): boolean =>
  getParentIndex(childIndex) >= 0;
const getParent = (values: Value[], childIndex: number): Value =>
  values[getParentIndex(childIndex)];

// type GetChildIndex = (parentIndex: number) => number;
// const hasChild = (parentIndex: number, size: number): boolean => (
//   getChildIndex: GetChildIndex
// ) => getChildIndex(parentIndex) < size;

const getRightChildIndex = (parentIndex: number) => parentIndex * 2 + 2;
const hasRightChild = (parentIndex: number, size: number): boolean =>
  getRightChildIndex(parentIndex) < size;
const getRightChild = (values: Value[], parentIndex: number) =>
  values[getRightChildIndex(parentIndex)];

const getLeftChildIndex = (parentIndex: number) => parentIndex * 2 + 1;
const hasLeftChild = (parentIndex: number, size: number): boolean =>
  getLeftChildIndex(parentIndex) < size;
const getLeftChild = (values: Value[], parentIndex: number) =>
  values[getLeftChildIndex(parentIndex)];

/**
 * Heapify the last item
 * @param {Value[]} values Values to re-heapify
 * @returns {Value[]} A valid MinHeap
 */
function heapifyDown(values: Value[]): Value[] {
  let index = 0;
  let copy = [...values];
  const size = copy.length;

  while (hasLeftChild(index, copy.length)) {
    let smallerChildIndex = getLeftChildIndex(index);
    if (
      hasRightChild(index, size) &&
      getRightChild(copy, size) < getLeftChild(copy, size)
    ) {
      smallerChildIndex = getRightChildIndex(index);
    }

    if (copy[index] < copy[smallerChildIndex]) break;

    copy = swap(copy, index, smallerChildIndex);
    index = smallerChildIndex;
  }

  return copy;
}

function heapifyUp(values: Value[]) {
  let heapedValues = [...values];
  let index = heapedValues.length - 1;

  while (
    hasParent(index) &&
    getParent(heapedValues, index) > heapedValues[index]
  ) {
    const parentIndex = getParentIndex(index);
    heapedValues = swap(heapedValues, parentIndex, index);
    index = parentIndex;
  }
  return heapedValues;
}

function addValue(values: Value[], value: Value) {
  return heapifyUp([...values, value]);
}

function reducer(state: Value[], action: Action): Value[] {
  switch (action.type) {
    case ActionType.Add:
      const addValues = addValue(state, action.payload.value);
      return [...addValues];
    case ActionType.Set:
      const setValues = heapifyDown(action.payload.values);
      return [...setValues];
    case ActionType.Get:
    default:
      return state;
  }
}

type HeapValue = Value | undefined;

function useMinHeap(initialValues: Value[] = []) {
  const [values, dispatch] = React.useReducer(
    reducer,
    initialValues,
    initializer
  );
  const freshValues = React.useRef(values);
  freshValues.current = values;

  function initializer(values: Value[]): Value[] {
    return values.reduce((acc, value) => addValue(acc, value), [] as Value[]);
  }

  function dump() {
    return freshValues.current;
  }

  function add(value: Value) {
    dispatch({ type: ActionType.Add, payload: { value } });
  }

  function get(): HeapValue {
    const minimumValue = freshValues.current[0];

    // We pop the first value and the current values is set to everything after the first item
    dispatch({
      type: ActionType.Set,
      payload: { values: freshValues.current.slice(1) }
    });

    return minimumValue;
  }

  function peek(): HeapValue {
    return freshValues.current[0];
  }

  return { dump, add, get, peek };
}

export { useMinHeap };
