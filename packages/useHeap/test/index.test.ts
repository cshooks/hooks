import { renderHook, act } from "react-hooks-testing-library";
import { useMinHeap } from "../src";

// const log = console.log;

describe("useMinHeap", () => {
  it("returns undefined when heap is empty", () => {
    const { result } = renderHook(() => useMinHeap([]));
    const heap = result.current;

    act(() => expect(heap.get()).toBeUndefined());
    act(() => expect(heap.peek()).toBeUndefined());
  });

  it("peeks correctly without removing any items", () => {
    const input = [10, 2, 1, 99, 3];
    const { result } = renderHook(() => useMinHeap(input));
    const heap = result.current;

    input.map(_ => expect(heap.peek()).toEqual(1));
  });

  it("gets minimum correctly", () => {
    const { result } = renderHook(() => useMinHeap([]));
    const heap = result.current;

    const input = [10, 2, 1, 99, 3];
    // ascending order
    const expectedValues = [...input].sort((a, b) => a - b);

    input.map(value => act(() => heap.add(value)));
    expectedValues.map(expected =>
      act(() => expect(heap.get()).toBe(expected))
    );

    // Nothing else to pop, so the result should be undefined
    act(() => expect(heap.get()).toBeUndefined());
  });

  it("renders hook correctly", () => {
    const { result } = renderHook(() => useMinHeap([]));
    expect(result.current).not.toBeNull();
  });

  it("adds all correctly", () => {
    const { result } = renderHook(() => useMinHeap([]));
    const heap = result.current;

    act(() => {
      [9, 8, 6, 5, 3, 1].forEach(heap.add);
    });

    expect(heap.dump()).toEqual([1, 5, 3, 9, 6, 8]);
  });

  // prettier-ignore
  it("adds correctly", () => {
    const { result } = renderHook(() => useMinHeap([]));
    const heap = result.current;

    act(() => { heap.add(1); });
    expect(heap.dump()).toEqual([1]);
    act(() => { heap.add(3); });
    expect(heap.dump()).toEqual([1, 3]);
    act(() => { heap.add(5); });
    expect(heap.dump()).toEqual([1, 3, 5]);
    act(() => { heap.add(6); });
    expect(heap.dump()).toEqual([1, 3, 5, 6]);
    act(() => { heap.add(8); });
    expect(heap.dump()).toEqual([1, 3, 5, 6, 8]);
    act(() => { heap.add(9); });
    expect(heap.dump()).toEqual([1, 3, 5, 6, 8, 9]);
  });

  it("dumps correctly", () => {
    const values = [1, 3, 5, 6, 8, 9];
    const { result } = renderHook(() => useMinHeap(values));

    expect(result.current.dump()).toEqual([1, 3, 5, 6, 8, 9]);
  });
});
