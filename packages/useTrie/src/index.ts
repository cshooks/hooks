import * as React from 'react';

interface Children {
  [key: string]: Node;
}

type Word = string | object;
type Words = Word[];

// https://www.geeksforgeeks.org/trie-insert-and-search/
class Node {
  id: Word | undefined;
  next: Children = {};

  constructor(public character: string = '') {}
}

interface ITrie {
  has: (wordToSearch: string, exactSearch?: boolean) => boolean;
  add: (wordToAdd: Word) => void;
  remove: (wordToRemove: string) => void;
  isEmpty: (root?: Node) => boolean;
  search: (wordToSearch: string) => Words;
}

class Trie implements ITrie {
  private root: Node;
  // private isCaseSensitive: boolean;

  constructor(
    words: Words = [],
    private isCaseSensitive: boolean = true,
    private getId: (obj: any) => string | number = obj => obj,
    private getText: (obj: any) => string = obj => obj
  ) {
    this.root = new Node('');
    this.isCaseSensitive = isCaseSensitive;
    this.buildTrie(words);
  }

  private buildTrie(words: Words): void {
    words.forEach(word => this.add(word, this.getId, this.getText));
  }

  private normalizeWord = (word: Word) =>
    this.isCaseSensitive
      ? typeof word === 'string'
        ? word
        : this.getText(word)
      : (typeof word === 'string'
          ? word
          : this.getText(word) || ''
        ).toLowerCase();

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
      if (!head.next[c]) {
        return false;
      }
      head = head.next[c];
    }

    // If "id" at the current node exists, then it's a word
    return exactSearch ? !!head.id : true;
  };

  public add = (
    wordToAdd: Word,
    getId: (obj: any) => string | number = obj => obj,
    getText: (obj: any) => string = obj => obj
  ): void => {
    this.getId = this.getId || getId;
    this.getText = this.getText || getText;

    let word = this.normalizeWord(wordToAdd);
    if (this.has(word)) return;

    let head: Node = this.root;
    for (let i = 0; i < word.length; i++) {
      const c = word[i];
      if (!head.next[c]) {
        head.next[c] = new Node(c);
      }
      head = head.next[c];
    }

    // head.id = this.getId(wordToAdd);
    head.id = wordToAdd;
  };

  // https://www.geeksforgeeks.org/trie-delete/
  public remove = (wordToRemove: string): void => {
    let word = this.normalizeWord(wordToRemove);
    if (this.isEmpty() || !this.has(word)) return;

    this.root = this.removeChildren(this.root, word);
  };

  // prettier-ignore
  private removeChildren(node: Node, word: string, depth: number = 0): Node {
    if (!node) return new Node();

    if (depth === word.length) {
      if (this.isEmpty(node)) {
        return new Node();
      } else {
        delete node.id;
        return node;
      }
    }

    const c = word[depth];
    node.next[c] = this.removeChildren(node.next[c], word, depth + 1);
    if (this.isEmpty(node.next[c]) && !node.next[c].id) {
      delete node.next[c];
      return node;
    }

    return node;
  }

  public isEmpty = (root: Node = this.root): boolean => {
    return Object.keys(root.next).length === 0;
  };

  private isLastNode = (node: Node): boolean =>
    Object.keys(node.next).length === 0;

  private traverseToChildren(node: Node, word: string, depth: number): Node {
    const c = word[depth];
    const exactSearch = false;

    if (!this.has(word, exactSearch)) return new Node();
    if (depth === word.length - 1 && node.next[c]) return node.next[c];

    return this.traverseToChildren(node.next[c], word, depth + 1);
  }

  // https://www.geeksforgeeks.org/auto-complete-feature-using-trie/
  public search = (wordToSearch: string): Words => {
    const word = this.normalizeWord(wordToSearch);
    const children = this.traverseToChildren(this.root, word, 0);

    const acc: Words = [];
    // initially prefix === '' because the we are passing a tree with one root.
    // the Root contains the last letter in the search term
    this.searchChildren(children, '', word, word.length, acc);
    return acc;
  };

  private searchChildren(
    root: Node,
    prefix: string,
    word: string,
    totalDepth: number,
    acc: Words
  ): Words {
    // if (!!root.id) acc.push(`${word}${prefix}`);
    if (!!root.id) acc.push(root.id);
    if (this.isLastNode(root)) return [];

    Object.keys(root.next).reduce(
      (words, c) => [
        ...words,
        ...this.searchChildren(root.next[c], prefix + c, word, totalDepth, acc),
      ],
      [] as Words
    );

    return acc;
  }
}

interface TrieHook {
  has: (wordToSearch: string, exactSearch?: boolean) => boolean;
  add: (wordToAdd: Word) => void;
  remove: (wordToRemove: string) => void;
  isEmpty: (root?: Node) => boolean;
  search: (wordToSearch: string) => Words;
}

type TrieActionType = 'ADD' | 'REMOVE';
interface TrieAction {
  type: TrieActionType;
  word: Word;
  trie: TrieHook;
}

type ReducerState = {
  trie: Trie;
  word: string | Word;
};

function reducer(state: ReducerState, action: TrieAction): ReducerState {
  switch (action.type) {
    case 'ADD':
      state.trie.add(action.word);
      return { ...state, trie: state.trie };
    case 'REMOVE':
      state.trie.remove(action.word as string);
      return { ...state, trie: state.trie };
    default:
      return state;
  }
}

/*
 * Build a trie for an efficient string search
 * @param initialWords: string[] List of words to build
 * @param isCaseSensitive: bool "Their" & "their" are different
 * @param getId: (obj: any) => string | number returns an ID from an object to be added
 * @param getText: (obj: any) => string returns a text from an object to be added
 */
function useTrie(
  initialWords: Words,
  isCaseSensitive = true,
  getId: (obj: any) => string | number = obj => obj,
  getText: (obj: any) => string = obj => obj
): TrieHook {
  const trie = new Trie(initialWords, isCaseSensitive, getId, getText);
  const [state, dispatch] = React.useReducer(reducer, { trie, word: '' });

  function add(word: Word): void {
    dispatch({ type: 'ADD', trie, word });
  }

  function remove(word: string): void {
    dispatch({ type: 'REMOVE', trie, word });
  }

  return { ...state.trie, add, remove };
}

export { TrieHook, Trie, Word, Words };
export default useTrie;
