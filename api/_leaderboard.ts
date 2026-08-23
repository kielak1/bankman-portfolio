import { Redis } from '@upstash/redis';

export const MAX_SCORES = 100;

export type ScoreEnvironment = 'production' | 'preview' | 'development';

export type StoredScore = {
  id: string;
  playerName: string;
  timeSeconds: number;
  tickets: number;
  won: boolean;
  recordedAt: string;
};

export type LeaderboardEntry = StoredScore & {
  rank: number;
  score: number;
};

export function getRedis(): Redis {
  return Redis.fromEnv({ automaticDeserialization: false });
}

export function getScoreEnvironment(): ScoreEnvironment {
  if (process.env.VERCEL_ENV === 'production') {
    return 'production';
  }

  if (process.env.VERCEL_ENV === 'preview') {
    return 'preview';
  }

  return 'development';
}

export function getScoreKeys(environment = getScoreEnvironment()): {
  leaderboard: string;
  scoreIdPrefix: string;
  rateLimitPrefix: string;
} {
  const prefix = `bankman:${environment}`;
  return {
    leaderboard: `${prefix}:leaderboard:v1`,
    scoreIdPrefix: `${prefix}:score-id:`,
    rateLimitPrefix: `${prefix}:score-rate:`,
  };
}

export async function loadLeaderboard(
  redis: Redis,
  environment = getScoreEnvironment(),
  limit = 10,
): Promise<LeaderboardEntry[]> {
  const values = await redis.zrange<string[]>(getScoreKeys(environment).leaderboard, 0, limit - 1, {
    rev: true,
    withScores: true,
  });
  const entries: LeaderboardEntry[] = [];

  for (let index = 0; index < values.length; index += 2) {
    const member = values[index];
    const score = Number(values[index + 1]);
    if (typeof member !== 'string' || !Number.isFinite(score)) {
      continue;
    }

    try {
      const stored = JSON.parse(member) as StoredScore;
      entries.push({ ...stored, score, rank: entries.length + 1 });
    } catch {
      // Ignore malformed entries instead of breaking the public leaderboard.
    }
  }

  return entries;
}

export function setPublicCache(
  response: { setHeader(name: string, value: string): unknown },
  environment: ScoreEnvironment,
): void {
  response.setHeader(
    'Cache-Control',
    environment === 'production' ? 'public, s-maxage=10, stale-while-revalidate=30' : 'no-store',
  );
}
