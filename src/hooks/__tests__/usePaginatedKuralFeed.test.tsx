/** @jest-environment jsdom */
import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';

import { usePaginatedKuralFeed } from '../usePaginatedKuralFeed';

const mockGetPaginatedKurals = jest.fn().mockResolvedValue([]);
const mockGetKuralsCount = jest.fn().mockResolvedValue(0);
const mockGetDistinctKuralFilterIds = jest.fn().mockResolvedValue([
  { paal_id: 1, iyal_id: 1, adhigaram_id: 1 },
  { paal_id: 2, iyal_id: 2, adhigaram_id: 2 },
]);

jest.mock('src/data/services', () => ({
  getPaginatedKurals: (...args: unknown[]) => mockGetPaginatedKurals(...args),
  getKuralsCount: (...args: unknown[]) => mockGetKuralsCount(...args),
  getDistinctKuralFilterIds: (...args: unknown[]) => mockGetDistinctKuralFilterIds(...args),
  loadTaxonomy: jest.fn().mockResolvedValue({
    paals: [
      { id: 1, name: 'One', translation: 'One' },
      { id: 2, name: 'Two', translation: 'Two' },
    ],
    iyals: [
      { id: 1, paal_id: 1, name: 'One', translation: 'One' },
      { id: 2, paal_id: 2, name: 'Two', translation: 'Two' },
    ],
    adhigarams: [
      { id: 1, iyal_id: 1, name: 'One', translation: 'One' },
      { id: 2, iyal_id: 2, name: 'Two', translation: 'Two' },
    ],
  }),
  getPaalIdForIyal: jest.fn(),
  getParentsForAdhigaram: jest.fn(),
}));

let feed: ReturnType<typeof usePaginatedKuralFeed>;
let renderer: ReactTestRenderer;

function Harness(): null {
  feed = usePaginatedKuralFeed(10);
  return null;
}

beforeEach(async () => {
  jest.useFakeTimers();
  mockGetPaginatedKurals.mockClear();
  mockGetKuralsCount.mockClear();
  mockGetDistinctKuralFilterIds.mockClear();
  await act(async () => {
    renderer = create(<Harness />);
  });
});

afterEach(() => {
  act(() => renderer.unmount());
  jest.useRealTimers();
});

it('debounces search and keeps category filters in the same query', async () => {
  act(() => {
    feed.selectPaal(1);
    feed.setSearchQuery('love');
  });

  expect(mockGetPaginatedKurals).not.toHaveBeenLastCalledWith(
    10,
    0,
    expect.objectContaining({ search: 'love' }),
  );

  await act(async () => {
    jest.advanceTimersByTime(300);
  });

  expect(mockGetPaginatedKurals).toHaveBeenLastCalledWith(
    10,
    0,
    expect.objectContaining({ search: 'love', paalId: 1 }),
  );
});

it('excludes each facet from its own option query', async () => {
  act(() => feed.selectPaal(1));
  await act(async () => {});

  expect(mockGetDistinctKuralFilterIds).toHaveBeenCalledWith(
    expect.objectContaining({ paalId: undefined }),
  );
  expect(feed.paalOptions).toHaveLength(2);
});
