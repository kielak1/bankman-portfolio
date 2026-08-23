import type { ScoreEntry } from './systems/ScoreStore';

export const GAME_READY_EVENT = 'bankman:ready';
export const GAME_FINISHED_EVENT = 'bankman:finished';

export type GameFinishedDetail = {
  result: 'won' | 'lost';
  scoreEntry: ScoreEntry;
  sla: string;
  totalTickets: number;
};

export function announceGameReady(): void {
  window.dispatchEvent(new Event(GAME_READY_EVENT));
}

export function announceGameFinished(detail: GameFinishedDetail): void {
  window.dispatchEvent(new CustomEvent<GameFinishedDetail>(GAME_FINISHED_EVENT, { detail }));
}
