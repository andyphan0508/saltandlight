import { revalidateTag } from "next/cache";
import { invalidateMemoryCache } from "@/lib/memory-cache";

/** Busts the storefront's cached block list for one page — call after every write. */
export function revalidatePageBlocks(page: string) {
  try {
    invalidateMemoryCache(`page-blocks-${page}`);
    invalidateMemoryCache("page-blocks");
    revalidateTag("page-blocks");
    revalidateTag(`page-blocks-${page}`);
  } catch {
    // revalidateTag throws outside a request context (e.g. during scripts) — safe to ignore
  }
}
