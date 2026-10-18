import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { FileRow } from '@/components/ui/FileRow';
import { IconButton } from '@/components/ui/IconButton';
import { Popover } from '@/components/ui/Popover';

test('IconButton is a labelled button and shows no tooltip until hovered or focused', () => {
  const html = renderToStaticMarkup(createElement(IconButton, { icon: 'delete', label: 'Remove file', tone: 'danger' }));
  expect(html).toContain('aria-label="Remove file"');
  expect(html).not.toContain('role="tooltip"');
});

test('Popover starts closed, with its state on the button', () => {
  const html = renderToStaticMarkup(
    createElement(Popover, { icon: 'sticky_note_2', label: 'Instructions', title: 'Instructions from the SDO', children: 'Bring a copy' }),
  );
  expect(html).toContain('aria-label="Instructions"');
  expect(html).toContain('aria-expanded="false"');
  expect(html).not.toContain('Bring a copy');
});

test('FileRow keeps labelled buttons by default and swaps to icon buttons for templates', () => {
  const base = { name: 'slip.pdf', meta: 'Posted Oct 16, 2026', onView: () => undefined, onReplace: () => undefined, onRemove: () => undefined };
  const pills = renderToStaticMarkup(createElement(FileRow, base));
  expect(pills).toContain('>View<');
  expect(pills).toContain('>Replace<');
  const icons = renderToStaticMarkup(createElement(FileRow, { ...base, actions: 'icon' }));
  expect(icons).not.toContain('>View<');
  expect(icons).toContain('aria-label="View slip.pdf"');
  expect(icons).toContain('aria-label="Replace slip.pdf"');
  expect(icons).toContain('aria-label="Remove slip.pdf"');
});
