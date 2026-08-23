import type { ScoreEntry } from './ScoreStore';

export type GlobalScoreEntry = ScoreEntry & {
  id: string;
  playerName: string;
  rank: number;
};

type LeaderboardResponse = {
  entries: GlobalScoreEntry[];
};

const PLAYER_NAME_KEY = 'bankman.player-name.v1';

export class GlobalScoreStore {
  async record(entry: ScoreEntry, playerName: string): Promise<GlobalScoreEntry[]> {
    const response = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...entry,
        id: crypto.randomUUID(),
        playerName: this.setPlayerName(playerName),
      }),
    });

    if (!response.ok) {
      throw new Error(`Score submission failed with status ${response.status}.`);
    }

    return this.readEntries(response);
  }

  async load(): Promise<GlobalScoreEntry[]> {
    const response = await fetch('/api/leaderboard');
    if (!response.ok) {
      throw new Error(`Leaderboard request failed with status ${response.status}.`);
    }

    return this.readEntries(response);
  }

  private async readEntries(response: Response): Promise<GlobalScoreEntry[]> {
    const body = (await response.json()) as LeaderboardResponse;
    return Array.isArray(body.entries) ? body.entries : [];
  }

  getPlayerName(): string {
    try {
      return this.sanitizePlayerName(localStorage.getItem(PLAYER_NAME_KEY) || '');
    } catch {
      return 'BANKMAN';
    }
  }

  setPlayerName(value: string): string {
    const playerName = this.sanitizePlayerName(value);
    try {
      localStorage.setItem(PLAYER_NAME_KEY, playerName);
    } catch {
      // The game remains usable when local storage is unavailable.
    }
    return playerName;
  }

  private sanitizePlayerName(value: string): string {
    return (
      value
        .trim()
        .replace(/[^\p{L}\p{N} _-]/gu, '')
        .replace(/\s+/g, ' ')
        .slice(0, 20) || 'BANKMAN'
    );
  }
}
