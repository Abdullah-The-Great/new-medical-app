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
