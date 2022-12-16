import { expect, test } from 'vitest';
import { getUnusedRanges } from './get-unused-ranges';

test('one range which covers full file', () => {
  expect(getUnusedRanges(10, [{ start: 0, end: 10 }])).toEqual([]);
});

test('one range with gap at end', () => {
  expect(getUnusedRanges(10, [{ start: 0, end: 5 }])).toEqual([
    { start: 5, end: 10 },
  ]);
});

test('one range with gap at start', () => {
  expect(getUnusedRanges(10, [{ start: 5, end: 10 }])).toEqual([
    { start: 0, end: 5 },
  ]);
});

test('one range with gaps either side', () => {
  expect(getUnusedRanges(30, [{ start: 10, end: 20 }])).toEqual([
    { start: 0, end: 10 },
    { start: 20, end: 30 },
  ]);
});

test('no ranges', () => {
  expect(getUnusedRanges(10, [])).toEqual([]);
});

test('two ranges with gap in middle', () => {
  expect(
    getUnusedRanges(30, [
      { start: 0, end: 10 },
      { start: 20, end: 30 },
    ]),
  ).toEqual([{ start: 10, end: 20 }]);
});

test('three ranges with gaps between', () => {
  expect(
    getUnusedRanges(50, [
      { start: 0, end: 10 },
      { start: 20, end: 30 },
      { start: 40, end: 50 },
    ]),
  ).toEqual([
    { start: 10, end: 20 },
    { start: 30, end: 40 },
  ]);
});

test('two ranges with gap in middle and either side', () => {
  expect(
    getUnusedRanges(50, [
      { start: 10, end: 20 },
      { start: 30, end: 40 },
    ]),
  ).toEqual([
    { start: 0, end: 10 },
    { start: 20, end: 30 },
    { start: 40, end: 50 },
  ]);
});
