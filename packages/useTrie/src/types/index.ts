// https://dev.to/nickytonline/comment/9j7l
// https://www.geeksforgeeks.org/trie-insert-and-search/

interface ITrieNode {
  id: Word | undefined;
  next: Children;
}

type Children = Record<string, ITrieNode>;
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
  ITrieNode,
  Children,
  TextSelector,
  Word,
  ITrie,
  TrieActionType,
  TrieAction,
  ReducerState,
};
