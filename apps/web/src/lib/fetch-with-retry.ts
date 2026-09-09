/**
 * Client-side fetch wrapper with automatic retry buffer for transient
 * failures, service cold boots, and Cloudflare limits (e.g. 524, 502, 503, 504).
 */

export interface FetchWithRetryOptions extends RequestInit {
  retries?: number;
  retryDelayMs?: number;
  retryCondition?: (res: Response | null, error: unknown) => boolean;
}

const RETRYABLE_STATUS_CODES = new Set([429, 502, 503, 504, 524]);

function isRetryableResponse(res: Response): boolean {
  return RETRYABLE_STATUS_CODES.has(res.status);
}

function isRetryableError(error: unknown): boolean {
  if (!error) return false;
  const msg = error instanceof Error ? error.message : String(error);
  return /network|fetch|timeout|abort|connection|failed/i.test(msg);
}

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: FetchWithRetryOptions,
): Promise<Response> {
  const {
    retries = 2,
    retryDelayMs = 1200,
    retryCondition,
    ...fetchInit
  } = init || {};

  let attempt = 0;

  while (true) {
    try {
      const res = await fetch(input, fetchInit);

      const shouldRetry = retryCondition
        ? retryCondition(res, null)
        : isRetryableResponse(res);

      if (shouldRetry && attempt < retries) {
        attempt++;
        const waitTime = retryDelayMs * attempt;
        console.warn(
          `[fetchWithRetry] Response status ${res.status}. Retrying in ${waitTime}ms (attempt ${attempt}/${retries})...`,
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      return res;
    } catch (err) {
      const shouldRetry = retryCondition
        ? retryCondition(null, err)
        : isRetryableError(err);

      if (shouldRetry && attempt < retries) {
        attempt++;
        const waitTime = retryDelayMs * attempt;
        console.warn(
          `[fetchWithRetry] Request failed: "${err instanceof Error ? err.message : String(err)}". Retrying in ${waitTime}ms (attempt ${attempt}/${retries})...`,
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      throw err;
    }
  }
}
