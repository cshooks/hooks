# `@cshooks/useTrie`

A React Hook that returns a [Trie](https://en.wikipedia.org/wiki/Trie), which enables a fast text match with a small memory foot print

# Installation

```bash
npm install @cshooks/usetrie
```

_Note for beginners_:

- Don't install `@cshooks/usetrie` as a `devDependency` ([--save-dev](https://docs.npmjs.com/cli/install) flag for `npm install`) as it won't be included in your final build and will get an error complaining that the package cannot be found.
- This library has a [peer dependency](https://nodejs.org/en/blog/npm/peer-dependencies/) for React version `^16.8.0`: This library needs to have React version 16.8.0 & up required.

# Usage

You can initialize the trie with either an array of

1. strings
1. objects

## 1. Initializing the trie with an array of `strings`

```jsx
import useTrie from '@cshooks/usetrie';

function App() {
  const words = ['abcd', 'abce', 'ABC', 'THE', 'their', 'there'];
  const isCaseSensitive = false;
  const trie = useTrie(words, isCaseSensitive);

  return <div>...</div>;
}
```

## 2. Initializing the trie with an array of `objects`

```jsx
import useTrie from '@cshooks/usetrie';

function App() {
  const words = ['abcd', 'abce', 'ABC', 'THE', 'their', 'there'];
  const isCaseSensitive = false;
  const trie = useTrie(words, isCaseSensitive);

  return <div>...</div>;
}
```

# Demo

[![Edit @cshooks/usetrie demo](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/zz2mxlxzp)

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
