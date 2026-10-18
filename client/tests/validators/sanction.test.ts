import { expect, test } from 'vitest';
import { sanctionErrors } from '@/validators/sanction';

test('both fields are required', () => {
  expect(sanctionErrors({ name: '  ', description: '' })).toEqual({ name: 'Enter the sanction name.', description: 'Describe what the sanction involves.' });
  expect(sanctionErrors({ name: 'Community Service', description: 'Hours of service.' })).toEqual({});
});

test('the name is at most 80 characters and the description 500', () => {
  expect(sanctionErrors({ name: 'x'.repeat(81), description: 'ok' }).name).toMatch(/80/);
  expect(sanctionErrors({ name: 'ok', description: 'x'.repeat(501) }).description).toMatch(/500/);
});

test('a name that exists already is refused, ignoring case and spaces', () => {
  expect(sanctionErrors({ name: ' violation slip ', description: 'ok' }, ['Violation Slip']).name).toBe('A sanction with that name already exists.');
});
