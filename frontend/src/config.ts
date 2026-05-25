// Vite exposes env vars prefixed with VITE_ on import.meta.env.
// If these aren't set (e.g. someone cloned the repo with no AWS),
// cloudAvailable() returns false and the app runs in guest-only mode.
export const config = {
  region: import.meta.env.VITE_AWS_REGION as string | undefined,
  userPoolId: import.meta.env.VITE_USER_POOL_ID as string | undefined,
  clientId: import.meta.env.VITE_USER_POOL_CLIENT_ID as string | undefined,
  apiBase:
    (import.meta.env.VITE_API_BASE as string | undefined) ??
    "http://localhost:8000",
};

export function cloudAvailable(): boolean {
  return Boolean(config.region && config.userPoolId && config.clientId);
}
