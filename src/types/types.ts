export interface KuralRecord {
  id: number;
  paal_id?: number;
  iyal_id?: number;
  adhikaram_id?: number;
  text: string;
  translation: string;
  couplet: string;
  explanation: string;
  line1: string;
  line2: string;
  transliteration1: string;
  transliteration2: string;
  adhikaram_name: string;
  adhikaram_english_name: string;
  paal_name: string;
  paal_english_name: string;
  iyal_name: string;
  iyal_english_name: string;
  notes?: AuthorNote[];
  is_bookmarked?: boolean;
}

export interface AuthorNote {
  author_id: number;
  author_name: string;
  author_name_tamil?: string;
  author_code: string;
  note_text: string;
}

export interface PaalRecord {
  id: number;
  name: string;
  translation: string;
  transliteration: string;
}

export interface IyalRecord {
  id: number;
  paal_id: number;
  name: string;
  translation: string;
  transliteration: string;
}

export interface AdhigaramRecord {
  id: number;
  iyal_id: number;
  name: string;
  translation: string;
  transliteration: string;
  start: number;
  end: number;
}

export interface KuralFilters {
  search?: string;
  paalId?: number;
  iyalId?: number;
  adhigaramId?: number;
}

export type Taxonomy = {
  paals: PaalRecord[];
  iyals: IyalRecord[];
  adhigarams: AdhigaramRecord[];
};

export enum TabType {
  Home = 'HOME',
  Explore = 'EXPLORE',
  Bookmarks = 'BOOKMARKS',
  Learn = 'LEARN',
  Guru = 'GURU',
  Settings = 'SETTINGS',
}

export interface TabConfig {
  id: TabType;
  label: string;
  tamilLabel: string;
  icon: string;
}
