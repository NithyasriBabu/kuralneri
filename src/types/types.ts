export interface KuralRecord {
  id: number;
  text: string;
  translation: string;
  couplet: string;
  explanation: string;
  line1: string;
  line2: string;
  transliteration1: string;
  transliteration2: string;
  adhikaram_name: string;
  paal_name: string;
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
  Favorites = 'FAVORITES',
  Learn = 'LEARN',
  Guru = 'GURU',
}

export interface TabConfig {
  id: TabType;
  label: string;
  icon: string;
}
