import * as React from "react";

// const log = console.log;

// function trie(initialWords: string[], isCaseSensitive = true) {
//   function has(term: string): boolean {
//     return false;
//   }
//   function add(term: string) {}
//   function remove(term: string) {}

//   const trie = { has, add, remove };
//   return { trie };
// }

interface ChildrenType {
  [key: string]: TrieNode;
}

// https://www.geeksforgeeks.org/trie-insert-and-search/
class TrieNode {
  isWord: boolean = false;
  children: ChildrenType = {};

  static Empty = new TrieNode("");

  constructor(public character: string) {}
}

class Trie {
  root: TrieNode;

  constructor(words: string[]) {
    this.root = new TrieNode("");
    this.buildTrie(words);
  }

  private buildTrie(words: string[]): void {
    words.forEach(this.add);
  }

  /*
   * @param {string} word A word to check if it exists in the trie
   * @param {boolean} exactSearch Return true only if the exact word is stored
   */
  public has = (word: string, exactSearch: boolean = true): boolean => {
    if (word === "") return false;

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

  public add = (word: string): void => {
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
  public remove = (word: string): void => {
    if (this.isEmpty() || !this.has(word)) return;

    this.root = this.removeRecursively(this.root, word);
  };

  private removeRecursively(
    node: TrieNode,
    word: string,
    depth: number = 0
  ): TrieNode {
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
    node.children[c] = this.removeRecursively(
      node.children[c],
      word,
      depth + 1
    );
    if (this.isEmpty(node.children[c]) && !node.children[c].isWord) {
      delete node.children[c];
      return node;
    }

    return node;
  }

  public isEmpty = (root: TrieNode = this.root): boolean => {
    return Object.keys(root.children).length === 0;
  };
}

/*
 * Build a trie for an efficient string search
 * @param initialWords: string[] List of words to build
 * @param isCaseSensitive: bool "Their" & "their" are different
 */
function useTrie(initialWords: string[], isCaseSensitive = true): Trie {
  //   const [words, setWords] = React.useState(initialWords);
  const [trie, setTrie] = React.useState(new Trie(initialWords));

  return trie;
}

export { Trie };
export default useTrie;