import { Platform } from 'react-native';
import {
  deleteUserNote,
  getPaginatedKurals,
  notifyAllBookmarksCleared,
  saveUserNote,
  setKuralBookmarkStatus,
  subscribeToBookmarkChanges,
} from '../kuralService';

const mockWrite = jest.fn();
const mockRead = jest.fn();
jest.mock('src/data/database', () => ({
  db: {
    getAllSync: (...args: unknown[]) => mockRead(...args),
    getAllAsync: async (...args: unknown[]) => mockRead(...args),
    runSync: (...args: unknown[]) => mockWrite(...args),
    runAsync: async (...args: unknown[]) => mockWrite(...args),
  },
}));

const failure = new Error('Storage unavailable');
const existing = {
  id: 9,
  author_id: 1,
  author_name: 'Reader',
  author_name_tamil: 'வாசகர்',
  author_code: 'self',
  note_text: 'Original',
  created_at: '2026-09-27T00:00:00Z',
};
let logSpy: jest.SpyInstance;
beforeEach(() => {
  mockWrite.mockReset().mockReturnValue({ changes: 1, lastInsertRowId: 9 });
  mockRead
    .mockReset()
    .mockImplementation((sql: string) => (sql.includes('FROM authors') ? [{ id: 1 }] : [existing]));
  logSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => logSpy.mockRestore());

describe.each(['ios', 'android', 'web'])('%s write failures', (platform) => {
  beforeEach(() => Object.defineProperty(Platform, 'OS', { configurable: true, value: platform }));
  it('rejects a failed bookmark write and permits a subsequent retry', async () => {
    mockWrite.mockImplementationOnce(() => {
      throw failure;
    });
    await expect(setKuralBookmarkStatus(423, true)).rejects.toBe(failure);
    await expect(setKuralBookmarkStatus(423, true)).resolves.toBe(true);
    expect(mockWrite).toHaveBeenLastCalledWith(expect.stringContaining('UPDATE kurals'), [1, 423]);
  });
  it('rejects a failed note update without returning an apparently saved note', async () => {
    mockWrite.mockImplementationOnce(() => {
      throw failure;
    });
    await expect(saveUserNote(423, 'Edited draft')).rejects.toBe(failure);
    await expect(saveUserNote(423, 'Edited draft')).resolves.toMatchObject({
      note_text: 'Edited draft',
    });
  });
  it('rejects a failed new-note insert and permits a retry', async () => {
    mockRead.mockImplementation((sql: string) => (sql.includes('FROM authors') ? [{ id: 1 }] : []));
    mockWrite.mockImplementationOnce(() => {
      throw failure;
    });
    await expect(saveUserNote(423, 'New draft')).rejects.toBe(failure);
    await expect(saveUserNote(423, 'New draft')).resolves.toMatchObject({ note_text: 'New draft' });
  });
  it('rejects a failed deletion and permits a retry', async () => {
    mockWrite.mockImplementationOnce(() => {
      throw failure;
    });
    await expect(deleteUserNote(423)).rejects.toBe(failure);
    await expect(deleteUserNote(423)).resolves.toBeUndefined();
  });
});

it('combines text search with taxonomy filters', async () => {
  Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
  mockRead.mockReturnValue([]);

  await getPaginatedKurals(10, 0, { search: 'love', paalId: 1, iyalId: 2, adhigaramId: 3 });

  expect(mockRead).toHaveBeenCalledWith(
    expect.stringMatching(
      /i\.paal_id = \?[\s\S]*a\.iyal_id = \?[\s\S]*k\.adhikaram_id = \?[\s\S]*kural_search MATCH \?/,
    ),
    [1, 2, 3, '"love"*', 10, 0],
  );
});

it('publishes successful bookmark changes to active feeds', async () => {
  Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
  const listener = jest.fn();
  const unsubscribe = subscribeToBookmarkChanges(listener);

  await setKuralBookmarkStatus(423, true);
  unsubscribe();
  await setKuralBookmarkStatus(423, false);

  expect(listener).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenCalledWith({ kuralId: 423, isBookmarked: true });
});

it('publishes a bulk bookmark clear to active feeds', () => {
  const listener = jest.fn();
  const unsubscribe = subscribeToBookmarkChanges(listener);

  notifyAllBookmarksCleared();
  unsubscribe();

  expect(listener).toHaveBeenCalledWith({ kuralId: null, isBookmarked: false });
});

it('builds a safe prefix query for multiple full-text terms', async () => {
  Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
  mockRead.mockReturnValue([]);

  await getPaginatedKurals(10, 0, { search: 'love "virtue"' });

  expect(mockRead).toHaveBeenCalledWith(expect.stringContaining('kural_search MATCH ?'), [
    '"love"* AND """virtue"""*',
    10,
    0,
  ]);
});

it('uses the portable search document on web', async () => {
  Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
  mockRead.mockReturnValue([]);

  await getPaginatedKurals(10, 0, { search: 'love' });

  expect(mockRead).toHaveBeenCalledWith(expect.stringContaining('search_text LIKE ?'), [
    '%love%',
    10,
    0,
  ]);
});
