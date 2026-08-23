import {
  MAX_SCORES,
  type StoredScore,
  getRedis,
  getScoreEnvironment,
  getScoreKeys,
  loadLeaderboard,
} from './_leaderboard.js';
import type { ApiRequest, ApiResponse } from './_http.js';

type ScorePayload = {
  id?: unknown;
  playerName?: unknown;
  score?: unknown;
  timeSeconds?: unknown;
  tickets?: unknown;
  won?: unknown;
  recordedAt?: unknown;
};

const MAX_SCORE = 100_000;
const MAX_TIME_SECONDS = 14_400;
const MAX_TICKETS = 16;
const RATE_LIMIT_SECONDS = 10;
const DEDUPE_SECONDS = 60 * 60 * 24 * 7;

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    response.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const parsed = parsePayload(request.body as ScorePayload);
  if (!parsed) {
    response.status(400).json({ error: 'Invalid score payload.' });
    return;
  }

  try {
    const redis = getRedis();
    const environment = getScoreEnvironment();
    const keys = getScoreKeys(environment);
    const duplicate = await redis.get(`${keys.scoreIdPrefix}${parsed.stored.id}`);
    if (duplicate) {
      response.status(200).json({
        environment,
        duplicate: true,
        entries: await loadLeaderboard(redis, environment),
      });
      return;
    }

    const ip = getClientIp(request);
    const allowed = await redis.set(`${keys.rateLimitPrefix}${ip}`, '1', {
      nx: true,
      ex: RATE_LIMIT_SECONDS,
    });
    if (!allowed) {
      response.status(429).json({ error: 'Please wait before submitting another score.' });
      return;
    }

    await redis.zadd(keys.leaderboard, {
      score: parsed.score,
      member: JSON.stringify(parsed.stored),
    });
    await redis.set(`${keys.scoreIdPrefix}${parsed.stored.id}`, '1', { ex: DEDUPE_SECONDS });
    await redis.zremrangebyrank(keys.leaderboard, 0, -(MAX_SCORES + 1));

    response.status(201).json({
      environment,
      duplicate: false,
      entries: await loadLeaderboard(redis, environment),
    });
  } catch {
    response.status(503).json({ error: 'Score service is temporarily unavailable.' });
  }
}

function parsePayload(payload: ScorePayload): { score: number; stored: StoredScore } | null {
  const score = readInteger(payload.score, 0, MAX_SCORE);
  const timeSeconds = readInteger(payload.timeSeconds, 1, MAX_TIME_SECONDS);
  const tickets = readInteger(payload.tickets, 0, MAX_TICKETS);
  const playerName = sanitizePlayerName(payload.playerName);

  if (
    !isUuid(payload.id) ||
    !playerName ||
    score === null ||
    timeSeconds === null ||
    tickets === null ||
    typeof payload.won !== 'boolean' ||
    typeof payload.recordedAt !== 'string' ||
    !Number.isFinite(Date.parse(payload.recordedAt)) ||
    (payload.won && tickets !== MAX_TICKETS)
  ) {
    return null;
  }

  return {
    score,
    stored: {
      id: payload.id,
      playerName,
      timeSeconds,
      tickets,
      won: payload.won,
      recordedAt: payload.recordedAt,
    },
  };
}

function readInteger(value: unknown, min: number, max: number): number | null {
  return Number.isInteger(value) && Number(value) >= min && Number(value) <= max ? Number(value) : null;
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function sanitizePlayerName(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .trim()
    .replace(/[^\p{L}\p{N} _-]/gu, '')
    .replace(/\s+/g, ' ')
    .slice(0, 20);
}

function getClientIp(request: ApiRequest): string {
  const forwarded = request.headers['x-forwarded-for'];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return value?.split(',')[0]?.trim() || request.socket.remoteAddress || 'unknown';
}
