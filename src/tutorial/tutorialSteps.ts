import { TabType } from 'src/types/types';

export const TUTORIAL_DONE_STEP = 99;

export const TUTORIAL_STEPS = [
  { value: 0, tab: TabType.Home, targetId: 'nav-HOME', bodyKey: 'homeCardBody' },
  {
    value: 1,
    tab: TabType.Home,
    targetId: 'home-bookmark',
    titleKey: 'bookmarkTipTitle',
    bodyKey: 'bookmarkTipBody',
  },
  { value: 2, tab: TabType.Explore, targetId: 'nav-EXPLORE', bodyKey: 'exploreCardBody' },
  {
    value: 2.1,
    tab: TabType.Explore,
    targetId: 'explore-search',
    titleKey: 'searchTipTitle',
    bodyKey: 'searchTipBody',
  },
  {
    value: 2.2,
    tab: TabType.Explore,
    targetId: 'explore-filters',
    titleKey: 'filtersTipTitle',
    bodyKey: 'filtersTipBody',
  },
  { value: 3, tab: TabType.Bookmarks, targetId: 'nav-BOOKMARKS', bodyKey: 'bookmarksCardBody' },
  {
    value: 5,
    tab: TabType.Bookmarks,
    targetId: 'bookmarks-remove-one',
    titleKey: 'bookmarkRemoveTipTitle',
    bodyKey: 'bookmarkRemoveTipBody',
  },
  {
    value: 6,
    tab: TabType.Bookmarks,
    targetId: 'bookmarks-clear-all',
    titleKey: 'bookmarkClearTipTitle',
    bodyKey: 'bookmarkClearTipBody',
  },
  { value: 7, tab: TabType.Settings, targetId: 'nav-SETTINGS', bodyKey: 'settingsCardBody' },
  {
    value: 10,
    tab: TabType.Settings,
    targetId: 'settings-author',
    titleKey: 'settingsAuthorTipTitle',
    bodyKey: 'settingsAuthorTipBody',
  },
  {
    value: 12,
    tab: TabType.Settings,
    targetId: 'settings-color-scheme',
    titleKey: 'settingsColorTipTitle',
    bodyKey: 'settingsColorTipBody',
  },
  {
    value: 14,
    tab: TabType.Settings,
    targetId: 'settings-font-size',
    titleKey: 'settingsSizeTipTitle',
    bodyKey: 'settingsSizeTipBody',
  },
  {
    value: 18,
    tab: TabType.Settings,
    targetId: 'settings-language-display',
    titleKey: 'settingsLanguageTipTitle',
    bodyKey: 'settingsLanguageTipBody',
  },
  {
    value: 21,
    tab: TabType.Settings,
    targetId: 'settings-reset-data',
    titleKey: 'settingsResetTipTitle',
    bodyKey: 'settingsResetTipBody',
  },
] as const;
