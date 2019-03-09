'use strict';

import { Trie } from '../src/index';

describe('Typeahead', () => {
  const isCaseSensitive = false;

  test('If not found, return an empty array', () => {
    const words = ['a1234', 'def'];
    const trie = new Trie(words, isCaseSensitive);

    expect(trie.search('abc').length).toBe(0);
  });

  test('Happy Path', () => {
    const words = [
      'hello',
      'dog',
      'hell',
      'cat',
      'a',
      'hel',
      'help',
      'helps',
      'helping',
    ];
    const trie = new Trie(words, isCaseSensitive);

    const result = trie.search('hel');
    const expected = ['hel', 'hell', 'hello', 'help', 'helping', 'helps'];
    expect(result).toBe(expected);
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
