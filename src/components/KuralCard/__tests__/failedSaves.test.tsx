import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { Text } from 'react-native';
import KuralCardShell from '../KuralCardShell';
import KuralUserNotes from '../KuralUserNotes';
import { KuralInput } from 'src/components/common/KuralInput';
import { KuralIconButton } from 'src/components/common/KuralIconButton';
import { saveUserNote, deleteUserNote } from 'src/data/services';
import { AuthorNote, KuralRecord } from 'src/types/types';

jest.mock('src/data/services', () => ({ saveUserNote: jest.fn(), deleteUserNote: jest.fn() }));
jest.mock('src/theme/ThemeContextProvider', () => ({
  useTheme: () => ({
    componentStyles: {},
    theme: { colors: { primary: '#344E41', textSecondary: '#4A6153', accent: '#A3B18A' } },
  }),
}));
jest.mock('src/context/SettingsContext', () => ({
  useSettings: () => ({
    settings: {
      langToggles: { uiChrome: { english: true }, kuralCard: {}, sectionHeaders: {} },
    },
  }),
}));
jest.mock('src/content/translation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    pair: (key: string) => ({ visible: key, hover: key }),
  }),
}));
jest.mock('src/components/common/KuralText', () => ({ KuralText: require('react-native').Text }));
jest.mock('src/components/common/KuralInput', () => ({ KuralInput: () => null }));
jest.mock('src/components/common/KuralIconButton', () => ({ KuralIconButton: () => null }));
jest.mock('../KuralCouplet', () => () => null);
jest.mock('../KuralNotesBlock', () => () => null);
jest.mock('lucide-react-native', () => ({
  Bookmark: () => null,
  Eraser: () => null,
  Pencil: () => null,
  Save: () => null,
  Trash2: () => null,
}));

let renderer: ReactTestRenderer;
const failure = new Error('Disk full');
const save = jest.mocked(saveUserNote);
const remove = jest.mocked(deleteUserNote);
function today(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
const note: AuthorNote = {
  author_id: 1,
  author_name: 'Reader',
  author_name_tamil: 'வாசகர்',
  author_code: 'self',
  note_source: 'user',
  note_text: 'Original',
  note_date: today(),
};
function messages(): unknown[] {
  return renderer.root.findAllByType(Text).map((node) => node.props.children);
}
function noteButton(label: string) {
  return renderer.root.findAllByType(KuralIconButton).find((node) => node.props.label === label)!;
}
beforeEach(() => jest.clearAllMocks());
afterEach(() => {
  act(() => renderer?.unmount());
});

it('keeps the bookmark state on failure and clears the error after retry', async () => {
  const toggle = jest.fn().mockRejectedValueOnce(failure).mockResolvedValueOnce(undefined);
  act(() => {
    renderer = create(
      <KuralCardShell
        kural={{ id: 423, is_bookmarked: false } as KuralRecord}
        onBookmarkToggle={toggle}
      />,
    );
  });
  const button = () => renderer.root.findByProps({ accessibilityLabel: 'addBookmark' });
  await act(async () => {
    await button().props.onPress();
  });
  expect(messages()).toContain('bookmarkSaveFailed');
  expect(button().props.disabled).toBeFalsy();
  await act(async () => {
    await button().props.onPress();
  });
  expect(toggle.mock.calls).toEqual([[true], [true]]);
  expect(messages()).not.toContain('bookmarkSaveFailed');
});

it('prevents duplicate bookmark writes while a save is pending', async () => {
  let finish!: () => void;
  const toggle = jest.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  act(() => {
    renderer = create(
      <KuralCardShell
        kural={{ id: 423, is_bookmarked: false } as KuralRecord}
        onBookmarkToggle={toggle}
      />,
    );
  });
  const press = renderer.root.findByProps({ accessibilityLabel: 'addBookmark' }).props.onPress;
  let pending!: Promise<void>;
  act(() => {
    pending = press();
    void press();
  });
  expect(toggle).toHaveBeenCalledTimes(1);
  await act(async () => {
    finish();
    await pending;
  });
});

it.each([false, true])(
  'preserves the draft after a failed save (existing note: %s)',
  async (existing) => {
    save
      .mockRejectedValueOnce(failure)
      .mockResolvedValueOnce({ ...note, note_text: 'Edited draft' });
    act(() => {
      renderer = create(<KuralUserNotes kuralId={423} notes={existing ? [note] : []} />);
    });
    act(() => renderer.root.findByType(KuralInput).props.onChangeText('Edited draft'));
    await act(async () => {
      await noteButton(existing ? 'saveNote' : 'addNote').props.onPress();
    });
    expect(renderer.root.findByType(KuralInput).props.value).toBe('Edited draft');
    expect(messages()).toContain('noteSaveFailed');
    expect(messages()).not.toContain('notesSavedToday');
    expect(renderer.root.findByType(KuralInput).props.editable).toBe(true);
    await act(async () => {
      await noteButton(existing ? 'saveNote' : 'addNote').props.onPress();
    });
    expect(messages()).toContain('notesSavedToday');
    expect(messages()).not.toContain('noteSaveFailed');
  },
);

it('keeps the note and draft after failed deletion, then removes them after retry', async () => {
  remove.mockRejectedValueOnce(failure).mockResolvedValueOnce(undefined);
  act(() => {
    renderer = create(<KuralUserNotes kuralId={423} notes={[note]} />);
  });
  act(() => renderer.root.findByType(KuralInput).props.onChangeText('Unsaved edit'));
  await act(async () => {
    await noteButton('deleteNote').props.onPress();
  });
  expect(renderer.root.findByType(KuralInput).props.value).toBe('Unsaved edit');
  expect(messages()).toContain('noteDeleteFailed');
  expect(noteButton('deleteNote')).toBeDefined();
  await act(async () => {
    await noteButton('deleteNote').props.onPress();
  });
  expect(renderer.root.findByType(KuralInput).props.value).toBe('');
  expect(noteButton('deleteNote')).toBeUndefined();
  expect(messages()).not.toContain('noteDeleteFailed');
});

it('blocks overlapping note save/delete actions while preserving the pending draft', async () => {
  let finish!: (value: AuthorNote) => void;
  save.mockImplementationOnce(
    () =>
      new Promise<AuthorNote>((resolve) => {
        finish = resolve;
      }),
  );
  act(() => {
    renderer = create(<KuralUserNotes kuralId={423} notes={[note]} />);
  });
  act(() => renderer.root.findByType(KuralInput).props.onChangeText('Pending edit'));
  const persist = noteButton('saveNote').props.onPress;
  const deleteNote = noteButton('deleteNote').props.onPress;
  let pending!: Promise<void>;
  act(() => {
    pending = persist();
    void persist();
    void deleteNote();
  });
  expect(save).toHaveBeenCalledTimes(1);
  expect(remove).not.toHaveBeenCalled();
  expect(renderer.root.findByType(KuralInput).props.editable).toBe(false);
  await act(async () => {
    finish({ ...note, note_text: 'Pending edit' });
    await pending;
  });
  expect(renderer.root.findByType(KuralInput).props.editable).toBe(true);
  expect(renderer.root.findByType(KuralInput).props.value).toBe('Pending edit');
});
