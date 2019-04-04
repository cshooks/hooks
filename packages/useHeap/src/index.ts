import React from "react";

// const log = console.log;

type Value = number | string | object;
const enum ActionType {
  Add = "ADD",
  Set = "SET",
  Remove = "REMOVE",
  Get = "GET",
  Clear = "Clear"
}

type Action<T> =
  | { type: ActionType.Add; payload: { value: T } }
  | { type: ActionType.Set; payload: { values: T[] } }
  | { type: ActionType.Get }
  | { type: ActionType.Clear };

// In-line swap: https://stackoverflow.com/a/16201730/4035
function swap<T>(values: T[], i1: number, i2: number): T[] {
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
const getParent = <T>(values: T[], childIndex: number): T =>
  values[getParentIndex(childIndex)];

// type GetChildIndex = (parentIndex: number) => number;
// const hasChild = (parentIndex: number, size: number): boolean => (
//   getChildIndex: GetChildIndex
// ) => getChildIndex(parentIndex) < size;

const getRightChildIndex = (parentIndex: number) => parentIndex * 2 + 2;
const hasRightChild = (parentIndex: number, size: number): boolean =>
  getRightChildIndex(parentIndex) < size;
const getRightChild = <T>(values: T[], parentIndex: number) =>
  values[getRightChildIndex(parentIndex)];

const getLeftChildIndex = (parentIndex: number) => parentIndex * 2 + 1;
const hasLeftChild = (parentIndex: number, size: number): boolean =>
  getLeftChildIndex(parentIndex) < size;
const getLeftChild = <T>(values: T[], parentIndex: number) =>
  values[getLeftChildIndex(parentIndex)];

/**
 * Heapify the last item
 * @param {T[]} values Values to re-heapify
 * @returns {T[]} A valid MinHeap
 */
function heapifyDown<T>(values: T[]): T[] {
  let index = 0;
  // let copy = [...values];
  // Move the last item to the top and trickle down
  let lastIndex = values.length - 1;
  let copy = [values[lastIndex], ...values.slice(0, lastIndex)];
  const size = copy.length;

  while (hasLeftChild(index, copy.length)) {
    let smallerChildIndex = getLeftChildIndex(index);
    // log(
    //   `index=${index} size=${size} smallerChildIndex=${smallerChildIndex},
    //   getRightChildIndex=${getRightChildIndex(index)}
    //   getLeftChildIndex=${getLeftChildIndex(index)}
    //   hasRightChild()=${hasRightChild(index, size)},
    //   getRightChild()=${getRightChild(copy, size)},
    //   getLeftChild()=${getLeftChild(copy, size)}`
    // );
    if (
      hasRightChild(index, size) &&
      getRightChild(copy, index) < getLeftChild(copy, index)
    ) {
      smallerChildIndex = getRightChildIndex(index);
      // log(`Right child is smaller!`);
    }

    if (copy[index] < copy[smallerChildIndex]) break;

    copy = swap(copy, index, smallerChildIndex);
    index = smallerChildIndex;
  }

  return copy;
}

function heapifyUp<T>(values: T[]) {
  let heapedValues = [...values];
  let index = heapedValues.length - 1;

  // log(
  //   `index=${index},
  //   getParentIndex(index)=${getParentIndex(index)},
  //   hasParent(index)=${hasParent(index)},
  //   getParent(heapedValues, index)=${getParent(heapedValues, index)},
  //   heapedValues[index]=${heapedValues[index]}`,
  //   heapedValues
  // );

  while (
    hasParent(index) &&
    getParent(heapedValues, index) > heapedValues[index]
  ) {
    // log(`while curr=${heapedValues[index]} index=${index}`);
    const parentIndex = getParentIndex(index);
    heapedValues = swap(heapedValues, parentIndex, index);
    index = parentIndex;
  }

  // log(`   heapifyup result ===>`, heapedValues);
  return heapedValues;
}

function addValue<T>(values: T[], value: T) {
  return heapifyUp([...values, value]);
}

function reducer<T>(state: T[], action: Action<T>): T[] {
  switch (action.type) {
    case ActionType.Add:
      const addValues = addValue(state, action.payload.value);
      return [...addValues];
    case ActionType.Set:
      const setValues = heapifyDown(action.payload.values);
      return [...setValues];
    case ActionType.Clear:
      return [];
    case ActionType.Get:
    default:
      return state;
  }
}

// type HeapValue = Value | undefined;

interface Heap<T> {
  dump: () => T[];
  add: (item: T) => void;
  get: () => T | undefined;
  peek: () => T | undefined;
  clear: () => void;
}

// function useMinHeap(initialValues: number[] | string[] = []);

function useMinHeap<T extends Value>(initialValues: T[] = []): Heap<T> {
  const [values, dispatch] = React.useReducer(
    reducer,
    initialValues,
    initializer
  );
  const freshValues = React.useRef(values);
  freshValues.current = values;

  function initializer(values: T[]): T[] {
    return values.reduce((acc: T[], value) => addValue(acc, value), [] as T[]);
  }

  function dump() {
    return freshValues.current as T[];
  }

  function add(value: T) {
    dispatch({ type: ActionType.Add, payload: { value } });
  }

  function get() {
    const minimumValue = freshValues.current[0];

    // We pop the first value and the current values is set to everything after the first item
    dispatch({
      type: ActionType.Set,
      payload: { values: freshValues.current.slice(1) }
    });

    return minimumValue as T;
  }

  function peek() {
    return freshValues.current[0] as T;
  }

  function clear(): void {
    dispatch({ type: ActionType.Clear });
  }

  return { dump, add, get, peek, clear };
}

export { useMinHeap, Heap };
