// https://dev.to/nickytonline/comment/9j7l
// https://www.geeksforgeeks.org/trie-insert-and-search/

class TrieNode {
  id: Word | undefined;
  next: Children = {};

  constructor(public character = '') {}
}
type Children = Record<string, TrieNode>;
type TextSelector = (obj: any) => string;

type Word = string | object;
interface ITrie {
  has: (word: string, exactSearch?: boolean) => boolean;
  add: (word: Word, getText?: TextSelector) => void;
  remove: (word: string) => void;
  isEmpty: () => boolean;
  search: (word: string) => Word[];
}

type TrieActionType = 'ADD' | 'REMOVE';
interface TrieAction {
  type: TrieActionType;
  word: Word;
  trie: ITrie;
}

type ReducerState = {
  trie: ITrie;
  word: string | Word;
};

export {
  TrieNode,
  Children,
  TextSelector,
  Word,
  ITrie,
  TrieActionType,
  TrieAction,
  ReducerState,
};
