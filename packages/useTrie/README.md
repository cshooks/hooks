# `@cshooks/useTrie`

A React Hook that returns a [Trie](https://en.wikipedia.org/wiki/Trie), which enables a fast text match with a small memory foot print

# Usage

```jsx
import useTrie from "@cshooks/usetrie";

function App() {
  const words = ["abcd", "abce", "ABC", "THE", "their", "there"];
  const isCaseSensitive = false;
  const trie = useTrie(words, isCaseSensitive);

  return <div>...</div>;
}
```

# Demo

[![Edit @cshooks/usetrie demo](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/9j6r7113z4?fontsize=14)

# API

- `has = (word: string, exactSearch: boolean = true): boolean`
  - what? check if the `word` exists
  - `word` - a word to search in trie
  - `exactSearch` - match the `word` exactly else does a fuzzy match
- `add = (word: string): void`
  - add the `word` to trie
- `remove = (word: string): void`
  - remove the `word` from trie
- `isEmpty = (root: TrieNode = this.root): boolean`
  - check if the current trie is empty or not.
  - optionally check if current trie node is empty or not
