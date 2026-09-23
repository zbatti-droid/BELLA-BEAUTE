import { describe, expect, it } from 'vitest';
import { calculateCartTotal, formatOrderMessage, parsePrice } from './commerce';

describe('commerce utilities', () => {
  it('parses Moroccan price strings', () => {
    expect(parsePrice('1,490 DH')).toBe(1490);
    expect(parsePrice('invalid')).toBe(0);
  });
  it('calculates the cart total', () => {
    expect(calculateCartTotal([{ name: 'A', price: '1,490 DH' }, { name: 'B', price: '250 DH' }])).toBe(1740);
  });
  it('creates a WhatsApp order message', () => {
    expect(formatOrderMessage([{ name: 'Rose Veil', price: '1,000 DH' }])).toContain('Rose Veil');
  });
});
