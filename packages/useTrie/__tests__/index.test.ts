"use strict";

import { Trie } from "../src/index";

describe("Case Insensitive Tests", () => {
  const isCaseSensitive = false;

  test("Trie has an exact search term", () => {
    const trie = new Trie(["AbC", "aBd"], isCaseSensitive);

    expect(trie.has("aBc")).toBe(true);
    expect(trie.has("aBC")).toBe(true);
    expect(trie.has("ABC")).toBe(true);
    expect(trie.has("abc")).toBe(true);
    expect(trie.has("AbC")).toBe(true);

    expect(trie.has("AbD")).toBe(true);
    expect(trie.has("aBD")).toBe(true);
    expect(trie.has("ABD")).toBe(true);
    expect(trie.has("abd")).toBe(true);
    expect(trie.has("aBd")).toBe(true);

    expect(trie.has("")).toBe(false);
  });
});

describe("Case Sensitive Tests", () => {
  const isCaseSensitive = true;

  test("Trie has an exact search term", () => {
    const trie = new Trie(["abc", "abd"], isCaseSensitive);
    expect(trie.has("abc")).toBe(true);
    expect(trie.has("abd")).toBe(true);
    expect(trie.has("abx")).toBe(false);
    expect(trie.has("dex")).toBe(false);
    expect(trie.has("")).toBe(false);
  });

  test("Trie has a fuzz search term", () => {
    const trie = new Trie(["abcd", "abda"], isCaseSensitive);
    expect(trie.has("a", false)).toBe(true);
    expect(trie.has("d", false)).toBe(false);
    expect(trie.has("", false)).toBe(false);
  });

  test("Add new terms and confirm that it exists", () => {
    const trie = new Trie([], isCaseSensitive);
    trie.add("abc");
    trie.add("abd");

    expect(trie.has("abc")).toBe(true);
    expect(trie.has("abd")).toBe(true);
    expect(trie.has("abx")).toBe(false);
    expect(trie.has("dex")).toBe(false);
    expect(trie.has("")).toBe(false);
    expect(trie.has("a", false)).toBe(true);
    expect(trie.has("d", false)).toBe(false);
    expect(trie.has("", false)).toBe(false);
  });

  test("Trying to delete from an empty trie should not fail", () => {
    const trie = new Trie([], isCaseSensitive);
    expect(() => trie.remove("aaa")).not.toThrow();
  });

  test("Remove terms and confirm that it does not exist", () => {
    const trie = new Trie(["abcd", "abce"], isCaseSensitive);
    trie.remove("abcd");
    expect(trie.has("abcd")).toBe(false);
    expect(trie.has("a", false)).toBe(true);
    expect(trie.has("ab", false)).toBe(true);
    expect(trie.has("abc", false)).toBe(true);
    expect(trie.has("abce", false)).toBe(true);
    expect(trie.has("abce")).toBe(true);

    trie.remove("abce");
    expect(trie.has("abce")).toBe(false);
    expect(trie.isEmpty()).toBe(true);

    trie.remove("abcd");
    expect(trie.has("abcd")).toBe(false);
    expect(trie.has("abda")).toBe(false);
  });

  test("Check if trie is empty or not", () => {
    const trie = new Trie([], isCaseSensitive);
    expect(trie.isEmpty()).toBe(true);

    trie.add("ab");
    expect(trie.isEmpty()).toBe(false);

    trie.remove("ab");
    expect(trie.isEmpty()).toBe(true);
  });
});
