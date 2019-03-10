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

  static Empty = new TrieNode('');

  constructor(public character: string) {}
}

class Trie {
  root: TrieNode;
  isCaseSensitive: boolean;

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
    word: string,
    node: TrieNode,
    depth: number
  ): TrieNode {
    if (depth === word.length - 1) return node;

    let head = node;
    for (let i = 0; i < word.length; i++) {
      const c = word[depth];
      if (!head.children[c]) return head;

      head = head.children[c];
    }

    return node;
  }

  // https://www.geeksforgeeks.org/auto-complete-feature-using-trie/
  public search = (wordToSearch: string): string[] => {
    const word = this.normalizeWord(wordToSearch);
    if (!this.has(word)) return [];

    const children = this.traverseToChildren(word, this.root, 0);
    // log(`children`, JSON.stringify(children, null, 2));
    // return this.searchChildren(children, word[0]);
    const acc: string[] = [];
    // return Array.from(this.searchChildren(children, word[0], acc));
    this.searchChildren(children, word[0], acc);

    return acc;
  };

  private searchChildren(
    root: TrieNode,
    prefix: string,
    acc: string[]
  ): string[] {
    console.log(`prefix="${prefix}", root.character="${root.character}"`);
    if (root.isWord) acc.push(prefix);
    if (this.isLastNode(root)) return [];

    // return Object.keys(root.children).map(c => {
    //   log(`Object.keys c=${c}`);
    //   return this.searchChildren(root.children[c], c, acc);
    // });

    return Object.keys(root.children).reduce(
      (acc, c) => {
        console.log(`acc, c`, acc, c);
        return [
          ...acc,
          ...this.searchChildren(root.children[c], prefix + c, acc),
        ];
      },
      [] as string[]
    );
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

export { Trie };
export default useTrie;
