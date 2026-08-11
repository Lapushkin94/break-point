export const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export function isFresh(
  generatedAt: Date,
  ttlMs: number = CACHE_TTL_MS,
): boolean {
  return Date.now() - generatedAt.getTime() < ttlMs;
}
