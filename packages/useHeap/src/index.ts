import React from "react";

// const log = console.log;

const enum ActionType {
  Add = "ADD",
  Set = "SET",
  Remove = "REMOVE",
  Get = "GET",
  Clear = "Clear"
}

type Action<T> =
  | { type: ActionType.Add; payload: { value: T; comparor: any } }
  | { type: ActionType.Set; payload: { values: T[]; comparor: any } }
  | { type: ActionType.Get }
  | { type: ActionType.Clear };

// type HeapValue = Value | undefined;

interface Heap<T> {
  dump: () => T[];
  add: (item: T) => void;
  get: () => T | undefined;
  peek: () => T | undefined;
  clear: () => void;
}

interface Comparor<T> {
  (a: T, b: T): number;
}

type ComparorParameter<T> = T extends string | number
  ? [] | [Comparor<T>]
  : [Comparor<T>];

function isNumberArray(o: any[]): o is number[] {
  return o.every(n => typeof n === "number");
}

function isStringArray(o: any[]): o is string[] {
  return o.every(n => typeof n === "string");
}

const stringComparer = <T extends string>(a: T, b: T) =>
  a < b ? -1 : a > b ? 1 : 0;
const numberComparer = <T extends number>(a: T, b: T) => a - b;
function getDefaultComparor<T>(args: T[]): Comparor<T> | undefined {
  if (isStringArray(args)) {
    return stringComparer as Comparor<T>;
  } else if (isNumberArray(args)) {
    return numberComparer as Comparor<T>;
  }

  return undefined;
}

// In-line swap: https://stackoverflow.com/a/16201730/4035
function swap<T>(values: T[], i1: number, i2: number): T[] {
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
function heapifyDown<T>(values: T[], comparor: Comparor<T>): T[] {
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
    const [left, right] = [
      getRightChild(copy, index),
      getLeftChild(copy, index)
    ];

    if (hasRightChild(index, size) && comparor(left, right) < 0) {
      smallerChildIndex = getRightChildIndex(index);
      // log(`Right child is smaller!`);
    }

    if (copy[index] < copy[smallerChildIndex]) break;

    copy = swap(copy, index, smallerChildIndex);
    index = smallerChildIndex;
  }

  return copy;
}

function heapifyUp<T>(values: T[], comparor: Comparor<T>) {
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
    // getParent(heapedValues, index) > heapedValues[index]
    comparor(heapedValues[index], getParent(heapedValues, index)) < 0
  ) {
    // log(`while curr=${heapedValues[index]} index=${index}`);
    const parentIndex = getParentIndex(index);
    heapedValues = swap(heapedValues, parentIndex, index);
    index = parentIndex;
  }

  // log(`   heapifyup result ===>`, heapedValues);
  return heapedValues;
}

function addValue<T>(values: T[], value: T, comparor: Comparor<T>) {
  // if ()
  return heapifyUp([...values, value], comparor);
}

function reducer<T>(state: T[] = [], action: Action<T>): T[] {
  switch (action.type) {
    case ActionType.Add: {
      const { value, comparor } = action.payload;
      const addValues = addValue(state, value, comparor);
      return [...addValues];
    }
    case ActionType.Set: {
      const { values, comparor } = action.payload;
      const setValues = heapifyDown(values, comparor);
      return [...setValues];
    }
    case ActionType.Clear:
      return [];
    case ActionType.Get:
    default:
      return state;
  }
}

function useMinHeap(initialValues: number[]): Heap<number>;
function useMinHeap(initialValues: string[]): Heap<string>;
function useMinHeap<T extends object>(
  initialValues: T[],
  ...comparor: ComparorParameter<T>
): Heap<T>;
function useMinHeap<T>(
  initialValues: T[] = [],
  comparor?: Comparor<T>
): Heap<T> {
  initializeComparor();

  function initializeComparor() {
    if (!comparor) {
      comparor = getDefaultComparor(initialValues);
      if (!comparor) {
        throw new Error(`😫 unable to determine default comparitor!`);
      }
    }
  }

  const [values, dispatch] = React.useReducer(
    reducer,
    initialValues,
    initializer
  );
  const freshValues = React.useRef(values);
  freshValues.current = values;

  function initializer(values: T[]): T[] {
    if (values.length === 0) return [];

    return values.reduce(
      (acc: T[], value) => addValue(acc, value, comparor as Comparor<T>),
      [] as T[]
    );
  }

  function dump(): T[] {
    return freshValues.current as T[];
  }

  function add(value: T): void {
    initializeComparor();
    dispatch({
      type: ActionType.Add,
      payload: { value, comparor }
    });
  }

  function get(): T {
    initializeComparor();
    const minimumValue = freshValues.current[0];

    // We pop the first value and the current values is set to everything after the first item
    dispatch({
      type: ActionType.Set,
      payload: { values: freshValues.current.slice(1), comparor }
    });

    return minimumValue as T;
  }

  function peek(): T {
    return freshValues.current[0] as T;
  }

  function clear(): void {
    dispatch({ type: ActionType.Clear });
  }

  return { dump, add, get, peek, clear };
}

export { useMinHeap, Heap };
