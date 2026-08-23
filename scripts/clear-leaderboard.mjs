import { Redis } from '@upstash/redis';

const environment = process.argv[2];
const confirmed = process.argv.includes('--confirm');
const allowed = new Set(['development', 'preview', 'production']);

if (!allowed.has(environment)) {
  console.error('Usage: npm run leaderboard:clear -- <development|preview|production> --confirm');
  process.exitCode = 1;
} else if (!confirmed) {
  console.error(`Refusing to clear ${environment} leaderboard without --confirm.`);
  process.exitCode = 1;
} else {
  const redis = Redis.fromEnv({ automaticDeserialization: false });
  const prefix = `bankman:${environment}:`;
  const keys = await redis.keys(`${prefix}*`);

  if (keys.length === 0) {
    console.log(`No ${environment} leaderboard keys found.`);
  } else {
    await redis.del(...keys);
    console.log(`Cleared ${keys.length} ${environment} leaderboard key(s).`);
  }
}
