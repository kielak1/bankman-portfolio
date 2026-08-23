export type ScoreEntry = {
  score: number;
  timeSeconds: number;
  tickets: number;
  won: boolean;
  recordedAt: string;
};

const STORAGE_KEY = 'bankman.high-scores.v1';
const MAX_ENTRIES = 5;

export class ScoreStore {
  record(entry: ScoreEntry): ScoreEntry[] {
    const entries = [...this.load(), entry]
      .sort((left, right) => right.score - left.score || left.timeSeconds - right.timeSeconds)
      .slice(0, MAX_ENTRIES);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // The game remains playable when storage is unavailable.
    }

    return entries;
  }

  load(): ScoreEntry[] {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      if (!value) {
        return [];
      }

      const entries = JSON.parse(value) as ScoreEntry[];
      return entries.filter((entry) => Number.isFinite(entry.score) && Number.isFinite(entry.timeSeconds));
    } catch {
      return [];
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // The game remains playable when storage is unavailable.
    }
  }
}
