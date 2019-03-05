"use strict";

// const useTrie = require('..');

// describe('@cshooks/useTrie', () => {
//     it('needs tests');
// });

import { Trie } from "../src/useTrie";

test("Trie has an exact search term", () => {
  const trie = new Trie(["abc", "abd"]);
  expect(trie.has("abc")).toBe(true);
  expect(trie.has("abd")).toBe(true);
  expect(trie.has("abx")).toBe(false);
  expect(trie.has("dex")).toBe(false);
  expect(trie.has("")).toBe(false);
});

test("Trie has a fuzz search term", () => {
  const trie = new Trie(["abcd", "abda"]);
  expect(trie.has("a", false)).toBe(true);
  expect(trie.has("d", false)).toBe(false);
  expect(trie.has("", false)).toBe(false);
});

test("Add new terms and confirm that it exists", () => {
  const trie = new Trie([]);
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
  const trie = new Trie([]);
  expect(() => trie.remove("aaa")).not.toThrow();
});

test("Remove terms and confirm that it does not exist", () => {
  const trie = new Trie(["abcd", "abce"]);
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
  const trie = new Trie([]);
  expect(trie.isEmpty()).toBe(true);

  trie.add("ab");
  expect(trie.isEmpty()).toBe(false);

  trie.remove("ab");
  expect(trie.isEmpty()).toBe(true);
});
