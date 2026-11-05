import { describe, it, expect } from 'vitest';
import { num, fmt, normQ, readMin, tileOf, glyphOf } from '../../src/utils.js';

describe('num', () => {
  it('понимает запятую и точку', () => { expect(num('1,5')).toBe(1.5); expect(num('2.25')).toBe(2.25); expect(num(3)).toBe(3); });
  it('мусор и пустое — NaN', () => { expect(num('abc')).toBeNaN(); expect(num('')).toBeNaN(); expect(num(undefined)).toBeNaN(); });
});

describe('fmt', () => {
  it('русская запятая и округление', () => { expect(fmt(1.5)).toBe('1,5'); expect(fmt(2.345, 2)).toBe('2,35'); expect(fmt(600)).toBe('600'); });
  it('нечисло — прочерк', () => { expect(fmt(NaN)).toBe('—'); expect(fmt(Infinity)).toBe('—'); });
});

describe('normQ', () => {
  it('регистр, пробелы и ё', () => expect(normQ('  Ёжик МАЙЯР ')).toBe('ежик майяр'));
  it('пустое значение', () => expect(normQ(null)).toBe(''));
});

describe('readMin', () => {
  it('не меньше минуты и растёт с длиной текста', () => {
    const short = { what: 'a', why: '', factors: '', practice: '', mistakes: '', experiment: '', summary: '' };
    const long = { ...short, what: 'слово '.repeat(1700) };
    expect(readMin(short)).toBe(1);
    expect(readMin(long)).toBe(10);
  });
});

describe('плитки разделов', () => {
  it('цвет и иконка по разделу', () => {
    expect([tileOf('E'), glyphOf('E')]).toEqual(['t-chem', 'atom']);
    expect([tileOf('G'), glyphOf('G')]).toEqual(['t-phys', 'therm']);
    expect([tileOf('H'), glyphOf('H')]).toEqual(['t-exp', 'flask']);
    expect([tileOf('A'), glyphOf('A')]).toEqual(['t-tech', 'hat']);
  });
});
