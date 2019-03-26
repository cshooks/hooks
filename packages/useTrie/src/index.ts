import * as React from 'react';
import {
  TextSelector,
  Word,
  ITrie,
  TrieAction,
  ReducerState,
  ITrieNode,
  Children,
} from './types';

class TrieNode implements ITrieNode {
  id: Word | undefined;
  next: Children = {};

  constructor(public character = '') {}
}

class Trie implements ITrie {
  private root: ITrieNode;

  constructor(
    words: Word[] = [],
    private isCaseInsensitive: boolean = true,
    private getText: TextSelector = obj => obj
  ) {
    this.root = new TrieNode('');
    this.isCaseInsensitive = isCaseInsensitive;
    this.buildTrie(words);
  }

  private buildTrie(words: Word[]): void {
    words.forEach(word => this.add(word, this.getText));
  }

  private normalizeWord = (word: Word) =>
    this.isCaseInsensitive
      ? (typeof word === 'string'
          ? word
          : this.getText(word) || ''
        ).toLowerCase()
      : typeof word === 'string'
      ? word
      : this.getText(word);

  /*
   * @param {string} word A word to check if it exists in the trie
   * @param {boolean} exactSearch Return true only if the exact word is stored
   */
  has = (wordToSearch: string, exactSearch: boolean = true): boolean => {
    let word = this.normalizeWord(wordToSearch);
    if (word === '') return false;

    let head = this.root as ITrieNode;
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

  add = (wordToAdd: Word, getText: TextSelector = obj => obj): void => {
    this.getText = this.getText || getText;

    let word = this.normalizeWord(wordToAdd);
    if (this.has(word)) return;

    let head: ITrieNode = this.root;
    for (let i = 0; i < word.length; i++) {
      const c = word[i];
      if (!head.next[c]) {
        head.next[c] = new TrieNode(c);
      }
      head = head.next[c];
    }

    head.id = wordToAdd;
  };

  // https://www.geeksforgeeks.org/trie-delete/
  remove = (wordToRemove: string): void => {
    let word = this.normalizeWord(wordToRemove);
    if (this.isEmpty() || !this.has(word)) return;

    this.root = this._remove(this.root, word);
  };

  private _remove(node: ITrieNode, word: string, depth: number = 0): ITrieNode {
    if (!node) return new TrieNode();

    if (depth === word.length) {
      if (this._isEmpty(node)) {
        return new TrieNode();
      } else {
        delete node.id;
        return node;
      }
    }

    const c = word[depth];
    node.next[c] = this._remove(node.next[c], word, depth + 1);
    if (this._isEmpty(node.next[c]) && !node.next[c].id) {
      delete node.next[c];
      return node;
    }

    return node;
  }

  private _isEmpty = (root: ITrieNode = this.root): boolean => {
    return Object.keys(root.next).length === 0;
  };
  isEmpty = (): boolean => {
    return this._isEmpty(this.root);
  };

  private isLastNode = (node: ITrieNode): boolean =>
    Object.keys(node.next).length === 0;

  private traverseToChildren(
    node: ITrieNode,
    word: string,
    depth: number
  ): ITrieNode {
    const c = word[depth];
    const exactSearch = false;

    if (!this.has(word, exactSearch)) return new TrieNode();
    if (depth === word.length - 1 && node.next[c]) return node.next[c];

    return this.traverseToChildren(node.next[c], word, depth + 1);
  }

  // https://www.geeksforgeeks.org/auto-complete-feature-using-trie/
  search = (wordToSearch: string): Word[] => {
    const word = this.normalizeWord(wordToSearch);
    const children = this.traverseToChildren(this.root, word, 0);

    const acc: Word[] = [];
    // initially prefix === '' because the we are passing a tree with one root.
    // the Root contains the last letter in the search term
    this.searchChildren(children, '', word, word.length, acc);
    return acc;
  };

  private searchChildren(
    root: ITrieNode,
    prefix: string,
    word: string,
    totalDepth: number,
    acc: Word[]
  ): Word[] {
    if (!!root.id) acc.push(root.id);
    if (this.isLastNode(root)) return [];

    Object.keys(root.next).reduce(
      (words, c) => [
        ...words,
        ...this.searchChildren(root.next[c], prefix + c, word, totalDepth, acc),
      ],
      [] as Word[]
    );

    return acc;
  }
}

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
 * @param isCaseInsensitive: bool "Their" & "their" are different
 * @param getText: TextSelector returns a text from an object to be added
 */
function useTrie(
  initialWords: Word[],
  isCaseInsensitive = true,
  getText: TextSelector = obj => obj
): ITrie {
  const trie = new Trie(initialWords, isCaseInsensitive, getText);
  const [state, dispatch] = React.useReducer(reducer, { trie, word: '' });

  function add(word: Word): void {
    dispatch({ type: 'ADD', trie, word });
  }

  function remove(word: string): void {
    dispatch({ type: 'REMOVE', trie, word });
  }

  return { ...state.trie, add, remove };
}

export { ITrie, Trie, Word };
export default useTrie;
