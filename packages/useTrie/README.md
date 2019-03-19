# `@cshooks/useTrie`

![npm](https://img.shields.io/npm/v/@cshooks/usetrie.svg)
![npm bundle size](https://img.shields.io/bundlephobia/min/@cshooks/usetrie.svg)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@cshooks/usetrie.svg)
[![Known Vulnerabilities](https://snyk.io/test/github/cshooks/hooks/badge.svg?targetFile=packages%2FuseTrie%2Fpackage.json)](https://snyk.io/test/github/cshooks/hooks?targetFile=packages%2FuseTrie%2Fpackage.json)

A React Hook that returns a [Trie](https://en.wikipedia.org/wiki/Trie), which enables a fast text match with a small memory foot print

# NPM Package

https://www.npmjs.com/package/@cshooks/usetrie

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

Pass an array of string to the `useTrie` hook and optionally specify the case sensitivity  
(**default**: `isCaseSensitive = true`)

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
  const words = [
    { id: 1, text: 'a' metadata: "1 - a"},
    { id: 2, text: 'dog' metadata: "2 - dog"},
    { id: 3, text: 'cat' metadata: "3 - cat"},
    { id: 4, text: 'hel' metadata: "4 - hel"},
    { id: 5, text: 'hell' metadata: "5 - hell"},
    { id: 6, text: 'hello' metadata: "6 - hello"},
    { id: 7, text: 'help' metadata: "7 - help"},
    { id: 8, text: 'helping' metadata: "8 - helping"},
    { id: 9, text: 'helps' metadata: "9 - helps"},
  ];
  const isCaseSensitive = false;
  const idSelector = row => row.id;
  const textSelector = row => row.text;
  const trie = useTrie(words, isCaseSensitive, idSelector, textSelector);
  // or just pass lambdas (anonymous functions)
  const trie = useTrie(words, isCaseSensitive, o => o.id, o => o.text);

  return <div>...</div>;
}
```

# Demo

![simple demo](cshooks-simple-demo.gif)

[![Edit @cshooks/usetrie demo - simple](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/3jzy58wqq)

<details>
  <summary>A Simple demo Source</summary>

```ts
import * as React from 'react';
import { render } from 'react-dom';

import useTrie, { Trie } from '@cshooks/usetrie';
import styled, { createGlobalStyle } from 'styled-components';
// import { Reset } from "styled-reset";

import './styles.css';

const log = console.log;

const ContentContainer = styled.section`
  display: grid;
  grid: 1fr / 2fr 3fr;
  margin-top: 2rem;
`;

function reducer(state, action) {
  switch (action.type) {
    case 'SET_WORD':
      return { ...state, word: action.word };
    case 'ADD_WORD':
      // Mutating the trie returns a new instance
      state.trie.add(action.word);
      return { ...state, words: [...state.words, action.word] };
    case 'REMOVE_WORD':
      const removed = state.words.filter(word => word !== action.word);
      // Mutating the trie returns a new instance
      state.trie.remove(action.word);
      return { ...state, words: [...removed] };
    case 'SET_TERM':
      return { ...state, term: action.term };
    case 'SET_ISEXACT': {
      return { ...state, isExact: action.isExact };
    }
    default:
      return state;
  }
}

function App() {
  // prettier-ignore
  const initialWords = [
    "abcd", "abce", "ABC", "THE", "their",
    "there", "hel", "hell", "hello", "help",
    "helping", "helps"
  ];
  const isCaseSensitive = false;
  const trie = useTrie(initialWords, isCaseSensitive);

  const initialState = {
    words: initialWords,
    word: '',
    term: '',
    isExact: true,
    trie,
  };
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const checkIfTermExists = e =>
    dispatch({ type: 'SET_TERM', term: e.target.value });

  const removeWord = React.useCallback(
    (word: string) => {
      log(`removing "${word}"`);
      trie.remove(word);
      dispatch({ type: 'REMOVE_WORD', word });
    },
    [trie]
  );

  const AvailableWords = React.useMemo(
    () =>
      state.words.map(word => {
        return (
          <li key={word}>
            <button key={word} onClick={() => removeWord(word)}>
              ❌
            </button>{' '}
            {word}
          </li>
        );
      }),
    [state.words]
  );

  const setWord = React.useCallback(
    e => dispatch({ type: 'SET_WORD', word: e.target.value }),
    [state.word]
  );

  const addWord = React.useCallback(
    e => {
      e.preventDefault();

      dispatch({ type: 'ADD_WORD', word: state.word });
    },
    [state.word]
  );

  const getMatches = React.useCallback(() => {
    return trie.search(state.term).map(word => <li key={word}>{word}</li>);
  }, [trie]);

  return (
    <React.Fragment>
      <header>
        <h1>Case Insensitive search</h1>
      </header>
      <section>
        <form onSubmit={addWord}>
          <input
            placeholder="Add a new word"
            onChange={setWord}
            value={state.word}
          />
          <button type="submit">Add</button>
        </form>
      </section>
      <ContentContainer>
        <section>
          <h2>Available for search</h2>
          <ol>{AvailableWords}</ol>
        </section>
        <section>
          <article>
            <div>
              <input
                placeholder="Search"
                type="text"
                value={state.term}
                onChange={checkIfTermExists}
              />
            </div>
            <label>
              Exact match?
              <input
                type="checkbox"
                checked={state.isExact}
                onChange={e =>
                  dispatch({ type: 'SET_ISEXACT', isExact: e.target.checked })
                }
              />
            </label>
          </article>
          <article>
            The term "{state.term}"{' '}
            {trie.has(state.term, state.isExact) ? 'exists' : 'does not exist!'}
          </article>
          <article>
            <h2>Possible Matches</h2>
            <ol>{getMatches()}</ol>
          </article>{' '}
        </section>
      </ContentContainer>
    </React.Fragment>
  );
}

const GlobalStyle = createGlobalStyle({
  boxSizing: 'border-box',
});

const rootElement = document.getElementById('root');
render(
  <React.Fragment>
    <GlobalStyle />
    <App />
  </React.Fragment>,
  rootElement
);
```

</details>

## For both String & Object arrays

[![Edit @cshooks/usetrie demo](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/zz2mxlxzp)

# API

## useTrie

```ts
useTrie(
  initialWords: Words,
  isCaseSensitive = true,
  getId?: (obj: any) => string | number = obj => obj,
  getText?: (obj: any) => string = obj => obj
): Trie
```

- `initialWords: Words`: An array of string or object to populate the trie with
- `isCaseSensitive: boolean`: Word comparison flag
  - Is "abc" === "ABC"? If `isCaseSensitive === true`, then false else true
- `getId?: (obj: any) => string | number = obj => obj`: "ID" selector when dealing with an object array
  - e.g.) When `[{id: 1, text: "text1"}, {id: 2, text: "text2"}]` is passed as `initialWords`, then `o => o.id` would use the `id` property as the ID property internally.
- `getText?: (obj: any) => string = obj => obj`: "Text" selector when when dealing with an object Array
  - e.g.) When `[{id: 1, text: "text1"}, {id: 2, text: "text2"}]` is passed as `initialWords`, then `o => o.text` would use the `text` property as the text to store internally.

```ts
/*
  Public types
*/
type Word = string | object;
type Words = Word[];

class Node {
  character: string;
  id: number | string | undefined;
  children: ChildrenType;
  constructor(character?: string);
}
class Trie {
  constructor(
    words: Words,
    isCaseSensitive?: boolean,
    getId?: (obj: any) => string | number,
    getText?: (obj: any) => string
  );
  has: (wordToSearch: string, exactSearch?: boolean) => boolean;
  add: (wordToAdd: Word) => void;
  remove: (wordToRemove: string) => void;
  isEmpty: (root?: Node) => boolean;
  search: (wordToSearch: string) => string[];
}
```

## Trie

- `search = (word: string): string[]`
  - Search for the "word" in the trie
  - & returns an array of possible matches else an empty array.
    - e.g.) If the trie has ["abYZ", "abcd", "abce"], `trie.search('abc')` will return `["abcd", "abce"]`.
    - `trie.search('none-existing-word')` will return `[]`.
- `has = (word: string, exactSearch: boolean = true): boolean`
  - Check if the `word` exists in the trie
  - `word` - a word to search in trie
  - `exactSearch` - match the `word` exactly else does a fuzzy match
- `add = (word: string): void`
  - Add the `word` to trie
- `remove = (word: string): void`
  - Remove the `word` from trie
- `isEmpty = (node: TrieNode = this.root): boolean`
  - Check if the current trie is empty or not.
  - Optionally check if the trie node is empty or not
