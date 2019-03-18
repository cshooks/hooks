'use strict';

import { renderHook, cleanup, act } from 'react-hooks-testing-library';
import useTrie, { Trie } from '../src/index';

describe('useTrie Hook tests', () => {
  afterEach(cleanup);

  const isCaseSensitive = false;

  test('Returns a new Trie instance on "add/remove"', () => {
    const { result } = renderHook(() => useTrie([], isCaseSensitive));
    const trieHook = result.current;

    act(() => {
      trieHook.add('abc');
    });
    expect(trieHook !== result.current).toBe(true);

    act(() => {
      trieHook.remove('abc');
    });
    expect(trieHook !== result.current).toBe(true);
  });
});

describe('Object array tests', () => {
  describe('Typeahead', () => {
    let trie: Trie;
    const isCaseSensitive = false;
    const idSelector = (row: any) => row.id;
    const textSelector = (row: any) => row.text;

    beforeAll(() => {
      const words = [
        { id: 1, text: 'a' },
        { id: 2, text: 'dog' },
        { id: 3, text: 'cat' },
        { id: 4, text: 'hel' },
        { id: 5, text: 'hell' },
        { id: 6, text: 'hello' },
        { id: 7, text: 'help' },
        { id: 8, text: 'helping' },
        { id: 9, text: 'helps' },
      ];

      trie = new Trie(words, isCaseSensitive, idSelector, textSelector);
    });

    test('return an empty array when not found', () => {
      expect(trie.search('')).toEqual([]);
      expect(trie.search('xyz')).toEqual([]);
      expect(trie.search('cay')).toEqual([]);
      expect(trie.search('helllo')).toEqual([]);
      expect(trie.search('helpss')).toEqual([]);
    });

    test('cannot find a removed record', () => {
      const words = [
        { id: 1, meta: '1 - a', text: 'a' },
        { id: 2, meta: '2 - dog', text: 'dog' },
        { id: 3, meta: '3 - cat', text: 'cat' },
      ];

      const idSelector = (row: any) => row.id;
      const textSelector = (row: any) => row.text;
      const trie = new Trie(words, isCaseSensitive, idSelector, textSelector);

      expect(trie.search('a')).toEqual(['a']);
      trie.remove('a');
      expect(trie.search('a')).toEqual([]);

      expect(trie.search('dog')).toEqual(['dog']);
      trie.remove('dog');
      expect(trie.search('dog')).toEqual([]);

      expect(trie.search('cat')).toEqual(['cat']);
      trie.remove('cat');
      expect(trie.search('cat')).toEqual([]);

      expect(trie.isEmpty()).toBe(true);
    });

    test('can find a newly added record', () => {
      const words = [
        { id: 1, meta: '1 - a', text: 'a' },
        { id: 2, meta: '2 - dog', text: 'dog' },
        { id: 3, meta: '3 - cat', text: 'cat' },
      ];

      const idSelector = (row: any) => row.id;
      const textSelector = (row: any) => row.text;
      const trie = new Trie(words, isCaseSensitive, idSelector, textSelector);

      trie.add({ id: 4, meta: '4 - hel', text: 'hel' });
      trie.add({ id: 5, meta: '5 - hell', text: 'hell' });
      trie.add({ id: 6, meta: '6 - hello', text: 'hello' });

      expect(trie.search('hel')).toEqual(['hel', 'hell', 'hello'].sort());
      expect(trie.search('hell')).toEqual(['hell', 'hello'].sort());
      expect(trie.search('hello')).toEqual(['hello']);
    });

    test('Happy Path', () => {
      const result = trie.search('hel');
      const expected = ['hel', 'hell', 'hello', 'help', 'helping', 'helps'];

      expect(result).toEqual(expected.sort());

      const words2 = [
        { id: 1, text: 'abcd', meta: '1 - abcd' },
        { id: 2, text: 'abce', meta: '2 - abce' },
        { id: 3, text: 'ABC', meta: '3 - ABC' },
        { id: 4, text: 'THE', meta: '4 - THE' },
        { id: 5, text: 'their', meta: '5 - their' },
        { id: 6, text: 'there', meta: '6 - there' },
      ];
      const trie2 = new Trie(words2, isCaseSensitive, idSelector, textSelector);

      expect(trie2.search('a')).toEqual(['abcd', 'abce', 'abc'].sort());
      expect(trie2.search('ab')).toEqual(['abcd', 'abce', 'abc'].sort());
      expect(trie2.search('abc')).toEqual(['abcd', 'abce', 'abc'].sort());
      expect(trie2.search('abcd')).toEqual(['abcd']);
      expect(trie2.search('abce')).toEqual(['abce']);
      expect(trie2.search('t')).toEqual(['the', 'their', 'there'].sort());
      expect(trie2.search('th')).toEqual(['the', 'their', 'there'].sort());
      expect(trie2.search('the')).toEqual(['the', 'their', 'there'].sort());
      expect(trie2.search('thei')).toEqual(['their']);
      expect(trie2.search('their')).toEqual(['their']);
      expect(trie2.search('ther')).toEqual(['there']);
      expect(trie2.search('there')).toEqual(['there']);
    });
  });

  describe('Case Insensitive Tests', () => {
    const isCaseSensitive = false;

    test('Trie has an exact search term', () => {
      const words1 = [
        { key: 1, title: 'AbC', meta: 'title - AbC' },
        { key: 2, title: 'aBd', meta: 'title - aBd' },
      ];

      const trie = new Trie(words1, isCaseSensitive, o => o.key, o => o.title);

      expect(trie.has('aBc')).toBe(true);
      expect(trie.has('aBC')).toBe(true);
      expect(trie.has('ABC')).toBe(true);
      expect(trie.has('abc')).toBe(true);
      expect(trie.has('AbC')).toBe(true);

      expect(trie.has('AbD')).toBe(true);
      expect(trie.has('aBD')).toBe(true);
      expect(trie.has('ABD')).toBe(true);
      expect(trie.has('abd')).toBe(true);
      expect(trie.has('aBd')).toBe(true);

      expect(trie.has('')).toBe(false);

      const words2 = [
        { key: 1, body: 'abcd', title: '1 - abcd' },
        { key: 2, body: 'abce', title: '2 - abce' },
        { key: 3, body: 'ABC', title: '3 - ABC' },
        { key: 4, body: 'THE', title: '4 - THE' },
        { key: 5, body: 'their', title: '5 - their' },
        { key: 6, body: 'there', title: '6 - there' },
      ];

      const trie2 = new Trie(words2, isCaseSensitive, o => o.key, o => o.body);
      expect(trie2.has('ABCD')).toBe(true);
      expect(trie2.has('ABCE')).toBe(true);
      expect(trie2.has('abc')).toBe(true);
      expect(trie2.has('the')).toBe(true);
      expect(trie2.has('THEIR')).toBe(true);
      expect(trie2.has('THERE')).toBe(true);
    });

    test('Trie has a fuzz search term', () => {
      const words1 = [
        { key: 1, title: 'abcd', meta: 'title - abcd' },
        { key: 2, title: 'abda', meta: 'title - abda' },
      ];

      const trie = new Trie(words1, isCaseSensitive, o => o.key, o => o.title);

      expect(trie.has('a', false)).toBe(true);
      expect(trie.has('A', false)).toBe(true);
      expect(trie.has('ab', false)).toBe(true);
      expect(trie.has('aB', false)).toBe(true);
      expect(trie.has('abc', false)).toBe(true);
      expect(trie.has('aBc', false)).toBe(true);
      expect(trie.has('aBC', false)).toBe(true);
      expect(trie.has('ABC', false)).toBe(true);
      expect(trie.has('abcd', false)).toBe(true);
      expect(trie.has('Abcd', false)).toBe(true);
      expect(trie.has('ABcd', false)).toBe(true);
      expect(trie.has('ABCd', false)).toBe(true);
      expect(trie.has('ABCD', false)).toBe(true);

      expect(trie.has('ay', false)).toBe(false);
      expect(trie.has('aby', false)).toBe(false);
      expect(trie.has('abcy', false)).toBe(false);
      expect(trie.has('abcy', false)).toBe(false);
      expect(trie.has('b', false)).toBe(false);
      expect(trie.has('c', false)).toBe(false);
      expect(trie.has('d', false)).toBe(false);
      expect(trie.has('', false)).toBe(false);
    });

    test('Add new objects and confirm that it exists', () => {
      const trie = new Trie([], isCaseSensitive, o => o.key, o => o.title);

      trie.add({ key: 1, title: 'abc', meta: 'title - abc' });
      trie.add({ key: 2, title: 'abd', meta: 'title - abd' });

      expect(trie.has('abc')).toBe(true);
      expect(trie.has('abd')).toBe(true);
      expect(trie.has('abx')).toBe(false);
      expect(trie.has('dex')).toBe(false);
      expect(trie.has('')).toBe(false);
      expect(trie.has('a', false)).toBe(true);
      expect(trie.has('d', false)).toBe(false);
      expect(trie.has('', false)).toBe(false);
    });

    test('Remove terms and confirm that it does not exist', () => {
      const words1 = [
        { key: 1, title: 'abcd', meta: 'title - abcd' },
        { key: 2, title: 'abce', meta: 'title - abce' },
      ];

      const trie = new Trie(words1, isCaseSensitive, o => o.key, o => o.title);

      // As the case is "in"-sensitive, removing capitalized word should work too.
      trie.remove('ABCD');
      expect(trie.has('abcd')).toBe(false);
      expect(trie.has('a', false)).toBe(true);
      expect(trie.has('ab', false)).toBe(true);
      expect(trie.has('abc', false)).toBe(true);
      expect(trie.has('abce', false)).toBe(true);
      expect(trie.has('abce')).toBe(true);

      trie.remove('abce');
      expect(trie.has('abce')).toBe(false);
      expect(trie.isEmpty()).toBe(true);

      trie.remove('abcd');
      expect(trie.has('abcd')).toBe(false);
      expect(trie.has('abda')).toBe(false);
    });

    test('Check if trie is empty or not', () => {
      const trie = new Trie([], isCaseSensitive, o => o.key, o => o.title);
      expect(trie.isEmpty()).toBe(true);

      trie.add({ key: 1, title: 'abcd', meta: 'title - abcd' });
      expect(trie.isEmpty()).toBe(false);

      trie.remove('abcd');
      expect(trie.isEmpty()).toBe(true);
    });
  });

  describe('Case Sensitive Tests', () => {
    const isCaseSensitive = true;

    test('Trie has an exact search term', () => {
      const words1 = [
        { key: 1, title: 'AbC', meta: 'title - AbC' },
        { key: 2, title: 'aBd', meta: 'title - aBd' },
      ];

      const trie = new Trie(words1, isCaseSensitive, o => o.key, o => o.title);
      expect(trie.has('AbC')).toBe(true);
      expect(trie.has('abc')).toBe(false);
      expect(trie.has('aBd')).toBe(true);
      expect(trie.has('ABD')).toBe(false);
      expect(trie.has('abx')).toBe(false);
      expect(trie.has('dex')).toBe(false);
      expect(trie.has('')).toBe(false);
    });

    test('Trie has a fuzz search term', () => {
      const words1 = [
        { key: 1, title: 'abcd', meta: 'title - abcd' },
        { key: 2, title: 'abda', meta: 'title - abda' },
      ];

      const trie = new Trie(words1, isCaseSensitive, o => o.key, o => o.title);
      expect(trie.has('a', false)).toBe(true);
      expect(trie.has('d', false)).toBe(false);
      expect(trie.has('', false)).toBe(false);
    });

    test('Add new objects and confirm that it exists', () => {
      const trie = new Trie([], isCaseSensitive, o => o.key, o => o.title);

      trie.add({ key: 1, title: 'abc', meta: 'title - abc' });
      trie.add({ key: 2, title: 'abd', meta: 'title - abd' });

      expect(trie.has('abc')).toBe(true);
      expect(trie.has('abd')).toBe(true);
      expect(trie.has('abx')).toBe(false);
      expect(trie.has('dex')).toBe(false);
      expect(trie.has('')).toBe(false);
      expect(trie.has('a', false)).toBe(true);
      expect(trie.has('d', false)).toBe(false);
      expect(trie.has('', false)).toBe(false);
    });

    test('Remove terms and confirm that it does not exist', () => {
      const words1 = [
        { key: 1, title: 'abcd', meta: 'title - abcd' },
        { key: 2, title: 'abce', meta: 'title - abce' },
      ];

      const trie = new Trie(words1, isCaseSensitive, o => o.key, o => o.title);

      trie.remove('abcd');
      expect(trie.has('abcd')).toBe(false);
      expect(trie.has('a', false)).toBe(true);
      expect(trie.has('ab', false)).toBe(true);
      expect(trie.has('abc', false)).toBe(true);
      expect(trie.has('abce', false)).toBe(true);
      expect(trie.has('abce')).toBe(true);

      trie.remove('abce');
      expect(trie.has('abce')).toBe(false);
      expect(trie.isEmpty()).toBe(true);

      trie.remove('abcd');
      expect(trie.has('abcd')).toBe(false);
      expect(trie.has('abda')).toBe(false);
    });

    test('Check if trie is empty or not', () => {
      const trie = new Trie([], isCaseSensitive, o => o.key, o => o.title);
      expect(trie.isEmpty()).toBe(true);

      trie.add({ key: 999, title: 'ab' });
      expect(trie.isEmpty()).toBe(false);

      trie.remove('ab');
      expect(trie.isEmpty()).toBe(true);
    });
  });
});

describe('String array tests', () => {
  describe('Typeahead', () => {
    const isCaseSensitive = false;

    test('return an empty array when not found', () => {
      const words = ['a1234', 'def'];
      const trie = new Trie(words, isCaseSensitive);

      const result = trie.search('xyz');
      // console.log(`trie`, JSON.stringify(trie, null, 2));
      // console.log(`result ===> `, result);

      expect(result).toEqual([]);
    });

    test('cannot find a removed record', () => {
      const trie = new Trie(['abc', 'def'], isCaseSensitive);
      expect(trie.search('abc')).toEqual(['abc']);
      expect(trie.search('def')).toEqual(['def']);

      trie.remove('abc');
      expect(trie.search('abc')).toEqual([]);

      trie.remove('def');
      expect(trie.search('def')).toEqual([]);
    });

    test('can find a newly added record', () => {
      const trie = new Trie(['abc'], isCaseSensitive);
      expect(trie.search('abc')).toEqual(['abc']);
      expect(trie.search('xyz')).toEqual([]);

      trie.add('xyz');
      expect(trie.search('xyz')).toEqual(['xyz']);

      trie.add('x');
      trie.add('xy');
      expect(trie.search('x')).toEqual(['x', 'xy', 'xyz']);
      expect(trie.search('xy')).toEqual(['xy', 'xyz']);
    });

    test('Happy Path', () => {
      // prettier-ignore
      const words = ['a', 'dog', 'cat', 'hel', 'hell', 'hello', 'help', 'helping', 'helps'];
      const trie = new Trie(words, isCaseSensitive);

      const result = trie.search('hel');
      const expected = ['hel', 'hell', 'hello', 'help', 'helping', 'helps'];

      expect(result).toEqual(expected.sort());

      const words2 = ['abcd', 'abce', 'ABC', 'THE', 'their', 'there'];
      const trie2 = new Trie(words2, isCaseSensitive);

      expect(trie2.search('a')).toEqual(['abcd', 'abce', 'abc'].sort());
      expect(trie2.search('ab')).toEqual(['abcd', 'abce', 'abc'].sort());
      expect(trie2.search('abc')).toEqual(['abcd', 'abce', 'abc'].sort());
      expect(trie2.search('abcd')).toEqual(['abcd']);
      expect(trie2.search('abce')).toEqual(['abce']);
      expect(trie2.search('t')).toEqual(['the', 'their', 'there'].sort());
      expect(trie2.search('th')).toEqual(['the', 'their', 'there'].sort());
      expect(trie2.search('the')).toEqual(['the', 'their', 'there'].sort());
      expect(trie2.search('thei')).toEqual(['their']);
      expect(trie2.search('their')).toEqual(['their']);
      expect(trie2.search('ther')).toEqual(['there']);
      expect(trie2.search('there')).toEqual(['there']);
    });
  });

  describe('Case Insensitive Tests', () => {
    const isCaseSensitive = false;

    test('Trie has an exact search term', () => {
      const trie = new Trie(['AbC', 'aBd'], isCaseSensitive);

      expect(trie.has('aBc')).toBe(true);
      expect(trie.has('aBC')).toBe(true);
      expect(trie.has('ABC')).toBe(true);
      expect(trie.has('abc')).toBe(true);
      expect(trie.has('AbC')).toBe(true);

      expect(trie.has('AbD')).toBe(true);
      expect(trie.has('aBD')).toBe(true);
      expect(trie.has('ABD')).toBe(true);
      expect(trie.has('abd')).toBe(true);
      expect(trie.has('aBd')).toBe(true);

      expect(trie.has('')).toBe(false);

      const words = ['abcd', 'abce', 'ABC', 'THE', 'their', 'there'];
      const trie2 = new Trie(words, isCaseSensitive);
      expect(trie2.has('ABCD')).toBe(true);
      expect(trie2.has('ABCE')).toBe(true);
      expect(trie2.has('abc')).toBe(true);
      expect(trie2.has('the')).toBe(true);
      expect(trie2.has('THEIR')).toBe(true);
      expect(trie2.has('THERE')).toBe(true);
    });

    test('Trie has a fuzz search term', () => {
      const trie = new Trie(['abcd', 'abda'], isCaseSensitive);
      expect(trie.has('a', false)).toBe(true);
      expect(trie.has('A', false)).toBe(true);
      expect(trie.has('ab', false)).toBe(true);
      expect(trie.has('aB', false)).toBe(true);
      expect(trie.has('abc', false)).toBe(true);
      expect(trie.has('aBc', false)).toBe(true);
      expect(trie.has('aBC', false)).toBe(true);
      expect(trie.has('ABC', false)).toBe(true);
      expect(trie.has('abcd', false)).toBe(true);
      expect(trie.has('Abcd', false)).toBe(true);
      expect(trie.has('ABcd', false)).toBe(true);
      expect(trie.has('ABCd', false)).toBe(true);
      expect(trie.has('ABCD', false)).toBe(true);

      expect(trie.has('ay', false)).toBe(false);
      expect(trie.has('aby', false)).toBe(false);
      expect(trie.has('abcy', false)).toBe(false);
      expect(trie.has('abcy', false)).toBe(false);
      expect(trie.has('b', false)).toBe(false);
      expect(trie.has('c', false)).toBe(false);
      expect(trie.has('d', false)).toBe(false);
      expect(trie.has('', false)).toBe(false);
    });

    test('Add new terms and confirm that it exists', () => {
      const trie = new Trie([], isCaseSensitive);
      trie.add('abc');
      trie.add('abd');

      expect(trie.has('abc')).toBe(true);
      expect(trie.has('abd')).toBe(true);
      expect(trie.has('abx')).toBe(false);
      expect(trie.has('dex')).toBe(false);
      expect(trie.has('')).toBe(false);
      expect(trie.has('a', false)).toBe(true);
      expect(trie.has('d', false)).toBe(false);
      expect(trie.has('', false)).toBe(false);
    });

    test('Trying to delete from an empty trie should not fail', () => {
      const trie = new Trie([], isCaseSensitive);
      expect(() => trie.remove('aaa')).not.toThrow();
    });

    test('Remove terms and confirm that it does not exist', () => {
      const trie = new Trie(['abcd', 'abce'], isCaseSensitive);
      // As the case is "in"-sensitive, removing capitalized word should work too.
      trie.remove('ABCD');
      expect(trie.has('abcd')).toBe(false);
      expect(trie.has('a', false)).toBe(true);
      expect(trie.has('ab', false)).toBe(true);
      expect(trie.has('abc', false)).toBe(true);
      expect(trie.has('abce', false)).toBe(true);
      expect(trie.has('abce')).toBe(true);

      trie.remove('abce');
      expect(trie.has('abce')).toBe(false);
      expect(trie.isEmpty()).toBe(true);

      trie.remove('abcd');
      expect(trie.has('abcd')).toBe(false);
      expect(trie.has('abda')).toBe(false);
    });

    test('Check if trie is empty or not', () => {
      const trie = new Trie([], isCaseSensitive);
      expect(trie.isEmpty()).toBe(true);

      trie.add('ab');
      expect(trie.isEmpty()).toBe(false);

      trie.remove('ab');
      expect(trie.isEmpty()).toBe(true);
    });
  });

  describe('Case Sensitive Tests', () => {
    const isCaseSensitive = true;

    test('Trie has an exact search term', () => {
      const trie = new Trie(['abc', 'abd'], isCaseSensitive);
      expect(trie.has('abc')).toBe(true);
      expect(trie.has('abd')).toBe(true);
      expect(trie.has('abx')).toBe(false);
      expect(trie.has('dex')).toBe(false);
      expect(trie.has('')).toBe(false);
    });

    test('Trie has a fuzz search term', () => {
      const trie = new Trie(['abcd', 'abda'], isCaseSensitive);
      expect(trie.has('a', false)).toBe(true);
      expect(trie.has('d', false)).toBe(false);
      expect(trie.has('', false)).toBe(false);
    });

    test('Add new terms and confirm that it exists', () => {
      const trie = new Trie([], isCaseSensitive);
      trie.add('abc');
      trie.add('abd');

      expect(trie.has('abc')).toBe(true);
      expect(trie.has('abd')).toBe(true);
      expect(trie.has('abx')).toBe(false);
      expect(trie.has('dex')).toBe(false);
      expect(trie.has('')).toBe(false);
      expect(trie.has('a', false)).toBe(true);
      expect(trie.has('d', false)).toBe(false);
      expect(trie.has('', false)).toBe(false);
    });

    test('Trying to delete from an empty trie should not fail', () => {
      const trie = new Trie([], isCaseSensitive);
      expect(() => trie.remove('aaa')).not.toThrow();
    });

    test('Remove terms and confirm that it does not exist', () => {
      const trie = new Trie(['abcd', 'abce'], isCaseSensitive);
      trie.remove('abcd');
      expect(trie.has('abcd')).toBe(false);
      expect(trie.has('a', false)).toBe(true);
      expect(trie.has('ab', false)).toBe(true);
      expect(trie.has('abc', false)).toBe(true);
      expect(trie.has('abce', false)).toBe(true);
      expect(trie.has('abce')).toBe(true);

      trie.remove('abce');
      expect(trie.has('abce')).toBe(false);
      expect(trie.isEmpty()).toBe(true);

      trie.remove('abcd');
      expect(trie.has('abcd')).toBe(false);
      expect(trie.has('abda')).toBe(false);
    });

    test('Check if trie is empty or not', () => {
      const trie = new Trie([], isCaseSensitive);
      expect(trie.isEmpty()).toBe(true);

      trie.add('ab');
      expect(trie.isEmpty()).toBe(false);

      trie.remove('ab');
      expect(trie.isEmpty()).toBe(true);
    });
  });
});
