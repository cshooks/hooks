import * as React from 'react';

interface ChildrenType {
  [key: string]: TrieNode;
}

type Word = string | object;
type Words = Word[];

// https://www.geeksforgeeks.org/trie-insert-and-search/
class TrieNode {
  isWord: boolean = false;
  children: ChildrenType = {};

  static get Empty() {
    return new TrieNode('');
  }

  constructor(public character: string) {}
}

class Trie {
  private root: TrieNode;
  // private isCaseSensitive: boolean;

  constructor(
    words: Words,
    private isCaseSensitive: boolean = true,
    private getId: (obj: any) => string = obj => obj,
    private getText: (obj: any) => string = obj => obj
  ) {
    this.root = new TrieNode('');
    this.isCaseSensitive = isCaseSensitive;
    this.buildTrie(words);
  }

  private buildTrie(words: Words): void {
    words.forEach(this.add);
  }

  private normalizeWord = (word: Word) =>
    this.isCaseSensitive
      ? this.getText(word)
      : (this.getText(word) || '').toLowerCase();

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

  public add = (wordToAdd: Word): void => {
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
function useTrie(
  initialWords: Words,
  isCaseSensitive = true,
  getId: (obj: any) => string = obj => obj,
  getText: (obj: any) => string = obj => obj
): Trie {
  const [trie, _] = React.useState(
    () => new Trie(initialWords, isCaseSensitive, getId, getText)
  );

  return trie;
}

export { Trie, Word, Words };
export default useTrie;
