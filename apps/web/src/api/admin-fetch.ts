/**
 * JSON fetch for admin API routes. Returns the parsed body; throws an Error
 * carrying the route's message on a non-2xx response, or a Vietnamese
 * connection message when the request never reaches the server.
 */
export const adminFetch = async <T = Record<string, any>>(
  url: string,
  init: { method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown } = {},
): Promise<T> => {
  const hasBody = init.body !== undefined;
  let res: Response;
  try {
    res = await fetch(url, {
      method: init.method ?? "GET",
      headers: hasBody ? { "Content-Type": "application/json" } : undefined,
      body: hasBody ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new Error("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Validation routes send zod's flatten() object instead of a string
    const message = typeof data.error === "string" ? data.error : data.error ? JSON.stringify(data.error) : "Có lỗi xảy ra";
    throw new Error(message);
  }
  return data as T;
};
