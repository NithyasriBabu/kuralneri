const VOWEL_SIGNS: Record<string, string> = {
  a: '',
  aa: 'ா',
  i: 'ி',
  ii: 'ீ',
  u: 'ு',
  uu: 'ூ',
  e: 'ெ',
  ee: 'ே',
  ai: 'ை',
  o: 'ொ',
  oo: 'ோ',
  au: 'ௌ',
};

const INDEPENDENT_VOWELS: Record<string, string> = {
  a: 'அ',
  aa: 'ஆ',
  i: 'இ',
  ii: 'ஈ',
  u: 'உ',
  uu: 'ஊ',
  e: 'எ',
  ee: 'ஏ',
  ai: 'ஐ',
  o: 'ஒ',
  oo: 'ஓ',
  au: 'ஔ',
};

const CONSONANTS: Array<[string, string]> = [
  ['ng', 'ங'],
  ['nj', 'ஞ'],
  ['ch', 'ச'],
  ['sh', 'ஷ'],
  ['zh', 'ழ'],
  ['th', 'த'],
  ['dh', 'த'],
  ['ph', 'ப'],
  ['bh', 'ப'],
  ['kh', 'க'],
  ['gh', 'க'],
  ['rr', 'ற'],
  ['ll', 'ள'],
  ['gn', 'ஞ'],
  ['k', 'க'],
  ['g', 'க'],
  ['c', 'ச'],
  ['j', 'ஜ'],
  ['t', 'ட'],
  ['d', 'ட'],
  ['n', 'ந'],
  ['p', 'ப'],
  ['b', 'ப'],
  ['m', 'ம'],
  ['y', 'ய'],
  ['r', 'ர'],
  ['l', 'ல'],
  ['v', 'வ'],
  ['s', 'ஸ'],
  ['h', 'ஹ'],
];

const PUNCTUATION = /[^a-zA-Z0-9\s.']/g;

function normalizeInput(value: string): string {
  return value.replace(PUNCTUATION, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
}

function consumeVowel(input: string, index: number): [string, number] {
  const pair = input.slice(index, index + 2);
  if (VOWEL_SIGNS[pair]) return [pair, 2];
  const single = input[index];
  if (VOWEL_SIGNS[single]) return [single, 1];
  return ['', 0];
}

function consumeConsonant(input: string, index: number): [string, number] {
  for (const [latin, tamil] of CONSONANTS) {
    if (input.startsWith(latin, index)) return [tamil, latin.length];
  }
  return ['', 0];
}

function transliterateWord(word: string): string {
  let out = '';
  let i = 0;

  while (i < word.length) {
    const [consonant, consonantLen] = consumeConsonant(word, i);
    if (consonantLen > 0) {
      i += consonantLen;
      const [vowel, vowelLen] = consumeVowel(word, i);
      if (vowelLen > 0) {
        out += consonant + VOWEL_SIGNS[vowel];
        i += vowelLen;
      } else {
        out += `${consonant}்`;
      }
      continue;
    }

    const [vowel, vowelLen] = consumeVowel(word, i);
    if (vowelLen > 0) {
      out += INDEPENDENT_VOWELS[vowel];
      i += vowelLen;
      continue;
    }

    out += word[i];
    i += 1;
  }

  return out
    .replace(/க்([ைேொோ])/g, 'க$1')
    .replace(/ச்([ிீெேை])/g, 'ச$1')
    .replace(/ட்([ிீெேை])/g, 'ட$1')
    .replace(/த்([ிீெேை])/g, 'த$1')
    .replace(/ப்([ிீெேை])/g, 'ப$1')
    .replace(/ம்([ிீெேை])/g, 'ம$1');
}

export function transliterateEnglishNameToTamil(input: string): string {
  const normalized = normalizeInput(input);
  if (!normalized) return '';

  return normalized
    .split(' ')
    .map((word) => {
      if (/^\d+$/.test(word)) return word;
      if (/^\.$/.test(word)) return word;
      return transliterateWord(word);
    })
    .join(' ')
    .replace(/\s+\./g, '.')
    .trim();
}
