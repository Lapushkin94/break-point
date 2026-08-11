// No accounts yet. Every caller scopes its query/cache by this value, so
// the moment real auth lands, swapping this implementation is the only
// change needed for per-user data to start working correctly.
export async function getCurrentUserId(): Promise<string | null> {
  return null;
}
