import { getRedis, getScoreEnvironment, loadLeaderboard, setPublicCache } from './_leaderboard.js';
import type { ApiRequest, ApiResponse } from './_http.js';

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    response.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  try {
    const environment = getScoreEnvironment();
    const entries = await loadLeaderboard(getRedis(), environment);
    setPublicCache(response, environment);
    response.status(200).json({ environment, entries });
  } catch {
    response.status(503).json({ error: 'Leaderboard is temporarily unavailable.' });
  }
}
