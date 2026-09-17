/**
 * Workers Analytics Engine is write-only from the Worker binding; reading goes
 * through Cloudflare's SQL API with an API token that has
 * "Account › Account Analytics › Read". Both values are Worker secrets.
 */
export const analyticsQueryConfig = () => {
  const accountId = process.env.CF_ACCOUNT_ID;
  const token = process.env.CF_ANALYTICS_API_TOKEN;
  return accountId && token ? { accountId, token } : null;
};

export class AnalyticsQueryError extends Error {}

export const runAnalyticsSql = async <T extends Record<string, unknown>>(sql: string): Promise<T[]> => {
  const config = analyticsQueryConfig();
  if (!config) throw new AnalyticsQueryError("Chưa cấu hình CF_ACCOUNT_ID / CF_ANALYTICS_API_TOKEN");

  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${config.accountId}/analytics_engine/sql`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.token}` },
    body: `${sql}\nFORMAT JSON`,
  });
  const text = await res.text();
  if (!res.ok) throw new AnalyticsQueryError(`Analytics Engine ${res.status}: ${text.slice(0, 300)}`);
  // 64-bit numbers arrive as strings in ClickHouse JSON; callers coerce with Number()
  return (JSON.parse(text) as { data?: T[] }).data ?? [];
};
