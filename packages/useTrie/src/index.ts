import * as React from 'react';
// import { withStatement } from '@babel/types';

const log = console.log;

interface ChildrenType {
  [key: string]: TrieNode;
}

// https://www.geeksforgeeks.org/trie-insert-and-search/
class TrieNode {
  isWord: boolean = false;
  children: ChildrenType = {};

  static get Empty() {
    return new TrieNode('');
  }

  constructor(public character: string) {}
}

function Trie2(words: string[], isCaseSensitive: boolean = true) {
  let root = new TrieNode('');
  buildTrie(words);

  function normalizeWord(word: string): string {
    return isCaseSensitive ? word : word.toLowerCase();
  }
  function isLastNode(node: TrieNode): boolean {
    return Object.keys(node.children).length === 0;
  }

  function buildTrie(words: string[]) {
    words.forEach(add);
  }

  function has(wordToSearch: string, exactSearch: boolean = true): boolean {
    let word = normalizeWord(wordToSearch);
    if (word === '') return false;

    let head = root;
    for (let i = 0; i < word.length; i++) {
      const c = word[i];
      if (!head.children[c]) {
        return false;
      }
      head = head.children[c];
    }

    return exactSearch ? head.isWord : true;
  }

  function add(wordToAdd: string): void {
    let word = normalizeWord(wordToAdd);
    if (has(word)) return;

    let head: TrieNode = root;
    for (let i = 0; i < word.length; i++) {
      const c = word[i];
      if (!head.children[c]) {
        head.children[c] = new TrieNode(c);
      }
      head = head.children[c];
    }

    head.isWord = true;
  }

  function remove(wordToRemove: string): void {
    let word = normalizeWord(wordToRemove);
    if (isEmpty() || !has(word)) return;

    root = removeChildren(root, word);
  }

  function removeChildren(
    node: TrieNode,
    word: string,
    depth: number = 0
  ): TrieNode {
    if (!node) return TrieNode.Empty;

    if (depth === word.length) {
      if (isEmpty(node)) {
        return TrieNode.Empty;
      } else {
        node.isWord = false;
        return node;
      }
    }

    const c = word[depth];
    node.children[c] = removeChildren(node.children[c], word, depth + 1);
    if (isEmpty(node.children[c]) && !node.children[c].isWord) {
      delete node.children[c];
      return node;
    }

    return node;
  }

  function isEmpty(node: TrieNode = root): boolean {
    return Object.keys(node.children).length === 0;
  }

  function traverseToChildren(
    node: TrieNode,
    word: string,
    depth: number
  ): TrieNode {
    const c = word[depth];
    const exactSearch = false;

    if (!has(word, exactSearch)) return TrieNode.Empty;
    if (depth === word.length - 1 && node.children[c]) return node.children[c];

    return traverseToChildren(node.children[c], word, depth + 1);
  }

  // https://www.geeksforgeeks.org/auto-complete-feature-using-trie/
  function search(wordToSearch: string): string[] {
    const word = normalizeWord(wordToSearch);
    const children = traverseToChildren(root, word, 0);

    const acc: string[] = [];
    // log(`children for "${word}"`, JSON.stringify(children, null, 2));
    // initially prefix === '' because the we are passing a tree with one root.
    // the Root contains the last letter in the search term
    searchChildren(children, '', word, word.length, acc);
    return acc;
  }

  function searchChildren(
    root: TrieNode,
    prefix: string,
    word: string,
    totalDepth: number,
    acc: string[]
  ): string[] {
    if (root.isWord) acc.push(`${word}${prefix}`);
    if (isLastNode(root)) return [];

    Object.keys(root.children).reduce(
      (words, c) => [
        ...words,
        ...searchChildren(root.children[c], prefix + c, word, totalDepth, acc),
      ],
      [] as string[]
    );

    return acc;
  }

  return {
    has,
    add,
    remove,
    isEmpty,
    search,
  };
}

class Trie {
  private root: TrieNode;
  private isCaseSensitive: boolean;

  constructor(words: string[], isCaseSensitive: boolean = true) {
    this.root = new TrieNode('');
    this.isCaseSensitive = isCaseSensitive;
    this.buildTrie(words);
  }

  private buildTrie(words: string[]): void {
    words.forEach(this.add);
  }

  private normalizeWord = (word: string) =>
    this.isCaseSensitive ? word : word.toLowerCase();

  /*
   * @param {string} word A word to check if it exists in the trie
   * @param {boolean} exactSearch Return true only if the exact word is stored
   */
  public has = (wordToSearch: string, exactSearch: boolean = true): boolean => {
    let word = this.normalizeWord(wordToSearch);
    if (word === '') return false;

    let head = this.root;
    for (let i = 0; i < word.length; i++) {
      const c = word[i];
      if (!head.children[c]) {
        return false;
      }
      head = head.children[c];
    }

    return exactSearch ? head.isWord : true;
  };

  public add = (wordToAdd: string): void => {
    let word = this.normalizeWord(wordToAdd);
    if (this.has(word)) return;

    let head: TrieNode = this.root;
    for (let i = 0; i < word.length; i++) {
      const c = word[i];
      if (!head.children[c]) {
        head.children[c] = new TrieNode(c);
      }
      head = head.children[c];
    }

    head.isWord = true;
  };

  // https://www.geeksforgeeks.org/trie-delete/
  public remove = (wordToRemove: string): void => {
    let word = this.normalizeWord(wordToRemove);
    if (this.isEmpty() || !this.has(word)) return;

    this.root = this.removeChildren(this.root, word);
  };

  // prettier-ignore
  private removeChildren(node: TrieNode,word: string, depth: number = 0): TrieNode {
    if (!node) return TrieNode.Empty;

    if (depth === word.length) {
      if (this.isEmpty(node)) {
        return TrieNode.Empty;
      } else {
        node.isWord = false;
        return node;
      }
    }

    const c = word[depth];
    node.children[c] = this.removeChildren(node.children[c], word, depth + 1);
    if (this.isEmpty(node.children[c]) && !node.children[c].isWord) {
      delete node.children[c];
      return node;
    }

    return node;
  }

  public isEmpty = (root: TrieNode = this.root): boolean => {
    return Object.keys(root.children).length === 0;
  };

  private isLastNode = (node: TrieNode): boolean =>
    Object.keys(node.children).length === 0;

  private traverseToChildren(
    node: TrieNode,
    word: string,
    depth: number
  ): TrieNode {
    const c = word[depth];
    const exactSearch = false;

    if (!this.has(word, exactSearch)) return TrieNode.Empty;
    if (depth === word.length - 1 && node.children[c]) return node.children[c];

    return this.traverseToChildren(node.children[c], word, depth + 1);
  }

  // https://www.geeksforgeeks.org/auto-complete-feature-using-trie/
  public search = (wordToSearch: string): string[] => {
    const word = this.normalizeWord(wordToSearch);
    const children = this.traverseToChildren(this.root, word, 0);

    const acc: string[] = [];
    // log(`children for "${word}"`, JSON.stringify(children, null, 2));
    // initially prefix === '' because the we are passing a tree with one root.
    // the Root contains the last letter in the search term
    this.searchChildren(children, '', word, word.length, acc);
    return acc;
  };

  private searchChildren(
    root: TrieNode,
    prefix: string,
    word: string,
    totalDepth: number,
    acc: string[]
  ): string[] {
    if (root.isWord) acc.push(`${word}${prefix}`);
    if (this.isLastNode(root)) return [];

    Object.keys(root.children).reduce(
      (words, c) => [
        ...words,
        ...this.searchChildren(
          root.children[c],
          prefix + c,
          word,
          totalDepth,
          acc
        ),
      ],
      [] as string[]
    );

    return acc;
  }
}

/*
 * Build a trie for an efficient string search
 * @param initialWords: string[] List of words to build
 * @param isCaseSensitive: bool "Their" & "their" are different
 */
function useTrie(initialWords: string[], isCaseSensitive = true): Trie {
  const [trie, _] = React.useState(new Trie(initialWords, isCaseSensitive));

  return trie;
}

export { Trie, Trie2 };
export default useTrie;
