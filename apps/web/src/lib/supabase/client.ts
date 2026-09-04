import { createBrowserClient, type CookieOptions } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (typeof document === "undefined") return [];
          try {
            const cookies = document.cookie;
            if (!cookies) return [];
            return cookies.split("; ").map((c) => {
              const [name, ...rest] = c.split("=");
              return { name, value: rest.join("=") };
            });
          } catch {
            // Safe fallback when Firefox blocks cookie access (SecurityError: The operation is insecure)
            return [];
          }
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          if (typeof document === "undefined") return;
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              let cookieStr = `${name}=${value}`;
              if (options?.maxAge) cookieStr += `; Max-Age=${options.maxAge}`;
              if (options?.path) cookieStr += `; Path=${options.path || "/"}`;
              if (options?.sameSite) cookieStr += `; SameSite=${options.sameSite}`;
              if (options?.secure) cookieStr += `; Secure`;
              document.cookie = cookieStr;
            });
          } catch {
            // Safe fallback
          }
        },
      },
    }
  );
}
