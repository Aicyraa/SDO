import { expect, test } from 'vitest';
import { placeAnchored } from '@/utils/anchor';

const view = { width: 1000, height: 700 };
const tip = { width: 120, height: 30 };

test('sits centred above the anchor', () => {
  const placed = placeAnchored({ top: 300, left: 400, width: 24, height: 24 }, tip, view);
  expect(placed).toEqual({ top: 264, left: 352, side: 'above' });
});

test('flips below when there is no room above', () => {
  const placed = placeAnchored({ top: 10, left: 400, width: 24, height: 24 }, tip, view);
  expect(placed.side).toBe('below');
  expect(placed.top).toBe(40);
});

test('is kept inside the window edges', () => {
  expect(placeAnchored({ top: 300, left: 0, width: 24, height: 24 }, tip, view).left).toBe(8);
  expect(placeAnchored({ top: 300, left: 990, width: 24, height: 24 }, tip, view).left).toBe(872);
});
