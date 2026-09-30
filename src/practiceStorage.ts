export interface MistakeRecord {
  id: string;
  verbId: string;
  tenseId: string;
  subjectId: string;
  wrongCount: number;
  correctStreak: number;
  lastPracticedAt: string;
  version: 1;
}

export interface PracticeStorage {
  getMistakes(): Promise<MistakeRecord[]>;
  markIncorrect(input: Pick<MistakeRecord, 'verbId' | 'tenseId' | 'subjectId'>): Promise<MistakeRecord[]>;
  markCorrect(id: string): Promise<MistakeRecord[]>;
  clearMistakes(): Promise<void>;
}

const STORAGE_KEY = 'french_verb_practice_v1';
const REQUIRED_CORRECT_STREAK = 3;

export function createMistakeId(verbId: string, tenseId: string, subjectId: string) {
  return `${verbId}::${tenseId}::${subjectId}`;
}

function readRecords(): MistakeRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((record): record is MistakeRecord =>
      record?.version === 1
      && typeof record.id === 'string'
      && typeof record.verbId === 'string'
      && typeof record.tenseId === 'string'
      && typeof record.subjectId === 'string'
      && typeof record.wrongCount === 'number'
      && typeof record.correctStreak === 'number'
      && typeof record.lastPracticedAt === 'string'
    );
  } catch {
    return [];
  }
}

function writeRecords(records: MistakeRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export const localPracticeStorage: PracticeStorage = {
  async getMistakes() {
    return readRecords();
  },

  async markIncorrect(input) {
    const records = readRecords();
    const id = createMistakeId(input.verbId, input.tenseId, input.subjectId);
    const existing = records.find(record => record.id === id);
    const now = new Date().toISOString();

    const updated = existing
      ? records.map(record => record.id === id
          ? { ...record, wrongCount: record.wrongCount + 1, correctStreak: 0, lastPracticedAt: now }
          : record)
      : [...records, { ...input, id, wrongCount: 1, correctStreak: 0, lastPracticedAt: now, version: 1 as const }];

    writeRecords(updated);
    return updated;
  },

  async markCorrect(id) {
    const records = readRecords();
    const existing = records.find(record => record.id === id);
    if (!existing) return records;

    const nextStreak = existing.correctStreak + 1;
    const updated = nextStreak >= REQUIRED_CORRECT_STREAK
      ? records.filter(record => record.id !== id)
      : records.map(record => record.id === id
          ? { ...record, correctStreak: nextStreak, lastPracticedAt: new Date().toISOString() }
          : record);

    writeRecords(updated);
    return updated;
  },

  async clearMistakes() {
    localStorage.removeItem(STORAGE_KEY);
  },
};
