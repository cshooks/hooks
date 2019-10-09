'use strict';

import { renderHook, act } from '@testing-library/react-hooks';
import { cleanup, } from '@testing-library/react'
import useTrie, { Trie } from '../src/index';

describe('useTrie Hook tests', () => {
  afterEach(cleanup);

  const isCaseInsensitive = true;

  test('Returns a new Trie instance on "add/remove"', () => {
    const { result } = renderHook(() => useTrie([], isCaseInsensitive));
    const trieHook = result.current;

    act(() => {
      trieHook.add('abc');
    });
    expect(trieHook).not.toBe(result.current);

    act(() => {
      trieHook.remove('abc');
    });
    expect(trieHook).not.toBe(result.current);
  });
});

describe('Object array tests', () => {
  const isCaseInsensitive = true;

  describe('Typeahead', () => {
    test('return an empty array when not found', () => {
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

      const textSelector = (row: any) => row.text;
      let trie = new Trie(words, isCaseInsensitive, textSelector);

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

      const textSelector = (row: any) => row.text;
      const trie = new Trie(words, isCaseInsensitive, textSelector);

      expect(trie.search('a')).toEqual([{ id: 1, meta: '1 - a', text: 'a' }]);
      trie.remove('a');
      expect(trie.search('a')).toEqual([]);

      expect(trie.search('dog')).toEqual([
        { id: 2, meta: '2 - dog', text: 'dog' },
      ]);
      trie.remove('dog');
      expect(trie.search('dog')).toEqual([]);

      expect(trie.search('cat')).toEqual([
        { id: 3, meta: '3 - cat', text: 'cat' },
      ]);
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

      const textSelector = (row: any) => row.text;
      const trie = new Trie(words, isCaseInsensitive, textSelector);

      trie.add({ id: 4, meta: '4 - hel', text: 'hel' });
      // Passing a custom text selector should work too
      trie.add({ id: 5, meta: '5 - hell', text: 'hell' }, o => o.text);
      trie.add({ id: 6, meta: '6 - hello', text: 'hello' });

      expect(trie.search('hel')).toEqual([
        { id: 4, meta: '4 - hel', text: 'hel' },
        { id: 5, meta: '5 - hell', text: 'hell' },
        { id: 6, meta: '6 - hello', text: 'hello' },
      ]);
      expect(trie.search('hell')).toEqual([
        { id: 5, meta: '5 - hell', text: 'hell' },
        { id: 6, meta: '6 - hello', text: 'hello' },
      ]);
      expect(trie.search('hello')).toEqual([
        { id: 6, meta: '6 - hello', text: 'hello' },
      ]);
    });

    // prettier-ignore
    test('Happy Path', () => {
      const words2 = [
        { id: 1, text: 'abcd', meta: '1 - abcd' },
        { id: 2, text: 'abce', meta: '2 - abce' },
        { id: 3, text: 'ABC', meta: '3 - ABC' },
        { id: 4, text: 'THE', meta: '4 - THE' },
        { id: 5, text: 'their', meta: '5 - their' },
        { id: 6, text: 'there', meta: '6 - there' },
      ];

      const textSelector = (row: any) => row.text;
      const trie2 = new Trie(words2, isCaseInsensitive, textSelector);

      const expectedForA = [
        { id: 3, text: 'ABC', meta: '3 - ABC' },
        { id: 1, text: 'abcd', meta: '1 - abcd' },
        { id: 2, text: 'abce', meta: '2 - abce' },
      ].sort();
      expect(trie2.search('a')).toEqual(expectedForA);
      expect(trie2.search('ab')).toEqual(expectedForA);
      expect(trie2.search('abc')).toEqual(expectedForA);

      expect(trie2.search('abcd')).toEqual([{ id: 1, text: 'abcd', meta: '1 - abcd' }]);
      expect(trie2.search('abce')).toEqual([{ id: 2, text: 'abce', meta: '2 - abce' }]);

      const expectedForT = [
        { id: 4, text: 'THE', meta: '4 - THE' },
        { id: 5, text: 'their', meta: '5 - their' },
        { id: 6, text: 'there', meta: '6 - there' },
      ];
      expect(trie2.search('t')).toEqual(expectedForT);
      expect(trie2.search('th')).toEqual(expectedForT);
      expect(trie2.search('the')).toEqual(expectedForT);
      expect(trie2.search('thei')).toEqual([{ id: 5, text: 'their', meta: '5 - their' }]);
      expect(trie2.search('their')).toEqual([{ id: 5, text: 'their', meta: '5 - their' }]);
      expect(trie2.search('ther')).toEqual([{ id: 6, text: 'there', meta: '6 - there' }]);
      expect(trie2.search('there')).toEqual([{ id: 6, text: 'there', meta: '6 - there' }]);
    });
  });

  describe('Case Insensitive Tests', () => {
    const isCaseInsensitive = true;

    test('Trie has an exact search term', () => {
      const words1 = [
        { key: 1, title: 'AbC', meta: 'title - AbC' },
        { key: 2, title: 'aBd', meta: 'title - aBd' },
      ];

      const trie = new Trie(words1, isCaseInsensitive, o => o.title);

      [
        'aBc',
        'aBC',
        'ABC',
        'abc',
        'AbC',
        'AbD',
        'aBD',
        'ABD',
        'abd',
        'aBd',
      ].forEach(word => {
        expect(trie.has(word)).toBe(true);
      });

      expect(trie.has('')).toBe(false);

      const words2 = [
        { key: 1, body: 'abcd', title: '1 - abcd' },
        { key: 2, body: 'abce', title: '2 - abce' },
        { key: 3, body: 'ABC', title: '3 - ABC' },
        { key: 4, body: 'THE', title: '4 - THE' },
        { key: 5, body: 'their', title: '5 - their' },
        { key: 6, body: 'there', title: '6 - there' },
      ];

      const trie2 = new Trie(words2, isCaseInsensitive, o => o.body);

      ['ABCD', 'ABCD', 'ABCE', 'abc', 'the', 'THEIR', 'THERE'].forEach(word => {
        expect(trie2.has(word)).toBe(true);
      });
    });

    test('Trie has a fuzz search term', () => {
      const words1 = [
        { key: 1, title: 'abcd', meta: 'title - abcd' },
        { key: 2, title: 'abda', meta: 'title - abda' },
      ];

      const trie = new Trie(words1, isCaseInsensitive, o => o.title);

      [
        'a',
        'A',
        'ab',
        'aB',
        'abc',
        'aBc',
        'aBC',
        'ABC',
        'abcd',
        'Abcd',
        'ABcd',
        'ABCd',
        'ABCD',
      ].forEach(word => {
        expect(trie.has(word, false)).toBe(true);
      });

      ['ay', 'aby', 'abcy', 'abcy', 'b', 'c', 'd', ''].forEach(word => {
        expect(trie.has(word, false)).toBe(false);
      });
    });

    test('Add new objects and confirm that it exists', () => {
      const trie = new Trie([], isCaseInsensitive, o => o.title);

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

      const trie = new Trie(words1, isCaseInsensitive, o => o.title);

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
      const trie = new Trie([], isCaseInsensitive, o => o.title);
      expect(trie.isEmpty()).toBe(true);

      trie.add({ key: 1, title: 'abcd', meta: 'title - abcd' });
      expect(trie.isEmpty()).toBe(false);

      trie.remove('abcd');
      expect(trie.isEmpty()).toBe(true);
    });
  });

  describe('Case Sensitive Tests', () => {
    const isCaseInsensitive = false;

    test('Trie has an exact search term', () => {
      const words1 = [
        { key: 1, title: 'AbC', meta: 'title - AbC' },
        { key: 2, title: 'aBd', meta: 'title - aBd' },
      ];

      const trie = new Trie(words1, isCaseInsensitive, o => o.title);
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

      const trie = new Trie(words1, isCaseInsensitive, o => o.title);
      expect(trie.has('a', false)).toBe(true);
      expect(trie.has('d', false)).toBe(false);
      expect(trie.has('', false)).toBe(false);
    });

    test('Add new objects and confirm that it exists', () => {
      const trie = new Trie([], isCaseInsensitive, o => o.title);

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

      const trie = new Trie(words1, isCaseInsensitive, o => o.title);

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
      const trie = new Trie([], isCaseInsensitive, o => o.title);
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
    const isCaseInsensitive = true;

    test('return an empty array when not found', () => {
      const words = ['a1234', 'def'];
      const trie = new Trie(words, isCaseInsensitive);

      const result = trie.search('xyz');
      expect(result).toEqual([]);
    });

    test('cannot find a removed record', () => {
      const trie = new Trie(['abc', 'def'], isCaseInsensitive);
      expect(trie.search('abc')).toEqual(['abc']);
      expect(trie.search('def')).toEqual(['def']);

      trie.remove('abc');
      expect(trie.search('abc')).toEqual([]);

      trie.remove('def');
      expect(trie.search('def')).toEqual([]);
    });

    test('can find a newly added record', () => {
      const trie = new Trie(['abc'], isCaseInsensitive);
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
      const trie = new Trie(words, isCaseInsensitive);

      const result = trie.search('hel');
      const expected = ['hel', 'hell', 'hello', 'help', 'helping', 'helps'];

      expect(result).toEqual(expected.sort());

      const words2 = ['abcd', 'abce', 'ABC', 'THE', 'their', 'there'];
      const trie2 = new Trie(words2, isCaseInsensitive);

      expect(trie2.search('a')).toEqual(['abcd', 'abce', 'ABC'].sort());
      expect(trie2.search('ab')).toEqual(['abcd', 'abce', 'ABC'].sort());
      expect(trie2.search('abc')).toEqual(['abcd', 'abce', 'ABC'].sort());
      expect(trie2.search('abcd')).toEqual(['abcd']);
      expect(trie2.search('abce')).toEqual(['abce']);
      expect(trie2.search('t')).toEqual(['THE', 'their', 'there'].sort());
      expect(trie2.search('th')).toEqual(['THE', 'their', 'there'].sort());
      expect(trie2.search('the')).toEqual(['THE', 'their', 'there'].sort());
      expect(trie2.search('thei')).toEqual(['their']);
      expect(trie2.search('their')).toEqual(['their']);
      expect(trie2.search('ther')).toEqual(['there']);
      expect(trie2.search('there')).toEqual(['there']);
    });
  });

  describe('Case Insensitive Tests', () => {
    const isCaseInsensitive = true;

    test('Trie has an exact search term', () => {
      const trie = new Trie(['AbC', 'aBd'], isCaseInsensitive);

      [
        'aBc',
        'aBC',
        'ABC',
        'abc',
        'AbC',
        'AbD',
        'aBD',
        'ABD',
        'abd',
        'aBd',
      ].forEach(word => {
        expect(trie.has(word)).toBe(true);
      });

      expect(trie.has('')).toBe(false);

      const words = ['abcd', 'abce', 'ABC', 'THE', 'their', 'there'];
      const trie2 = new Trie(words, isCaseInsensitive);

      ['ABCD', 'ABCE', 'abc', 'the', 'THEIR', 'THERE'].forEach(word => {
        expect(trie2.has(word)).toBe(true);
      });
    });

    test('Trie has a fuzz search term', () => {
      const trie = new Trie(['abcd', 'abda'], isCaseInsensitive);

      [
        'a',
        'A',
        'ab',
        'aB',
        'abc',
        'aBc',
        'aBC',
        'ABC',
        'abcd',
        'Abcd',
        'ABcd',
        'ABCd',
        'ABCD',
      ].forEach(word => {
        expect(trie.has(word, false)).toBe(true);
      });

      ['ay', 'aby', 'abcy', 'abcy', 'b', 'c', 'd', ''].forEach(word => {
        expect(trie.has(word, false)).toBe(false);
      });
    });

    test('Add new terms and confirm that it exists', () => {
      const trie = new Trie([], isCaseInsensitive);
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
      const trie = new Trie([], isCaseInsensitive);
      expect(() => trie.remove('aaa')).not.toThrow();
    });

    test('Remove terms and confirm that it does not exist', () => {
      const trie = new Trie(['abcd', 'abce'], isCaseInsensitive);
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
      const trie = new Trie([], isCaseInsensitive);
      expect(trie.isEmpty()).toBe(true);

      trie.add('ab');
      expect(trie.isEmpty()).toBe(false);

      trie.remove('ab');
      expect(trie.isEmpty()).toBe(true);
    });
  });

  describe('Case Sensitive Tests', () => {
    const isCaseInsensitive = true;

    test('Trie has an exact search term', () => {
      const trie = new Trie(['abc', 'abd'], isCaseInsensitive);
      expect(trie.has('abc')).toBe(true);
      expect(trie.has('abd')).toBe(true);
      expect(trie.has('abx')).toBe(false);
      expect(trie.has('dex')).toBe(false);
      expect(trie.has('')).toBe(false);
    });

    test('Trie has a fuzz search term', () => {
      const trie = new Trie(['abcd', 'abda'], isCaseInsensitive);
      expect(trie.has('a', false)).toBe(true);
      expect(trie.has('d', false)).toBe(false);
      expect(trie.has('', false)).toBe(false);
    });

    test('Add new terms and confirm that it exists', () => {
      const trie = new Trie([], isCaseInsensitive);
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
      const trie = new Trie([], isCaseInsensitive);
      expect(() => trie.remove('aaa')).not.toThrow();
    });

    test('Remove terms and confirm that it does not exist', () => {
      const trie = new Trie(['abcd', 'abce'], isCaseInsensitive);
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
      const trie = new Trie([], isCaseInsensitive);
      expect(trie.isEmpty()).toBe(true);

      trie.add('ab');
      expect(trie.isEmpty()).toBe(false);

      trie.remove('ab');
      expect(trie.isEmpty()).toBe(true);
    });
  });
});
