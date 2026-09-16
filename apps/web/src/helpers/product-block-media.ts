/**
 * The media slot inside a layout preset. It is one cell that can hold a fixed
 * image or a slideshow, so the admin picks *what* fills the cell rather than
 * being stuck with a single picture.
 */
export const MEDIA_EFFECTS = [
  { id: "none", label: "Ảnh cố định", hint: "Một ảnh duy nhất, không chuyển động." },
  { id: "fade", label: "Mờ chồng (fade)", hint: "Ảnh sau hiện chồng lên ảnh trước, đứng yên tại chỗ." },
  { id: "slide", label: "Trượt ngang (slide)", hint: "Từng ảnh trượt sang, xem trọn một ảnh mỗi lần." },
  { id: "carousel", label: "Carousel nhiều ảnh", hint: "Nhiều ảnh cùng lúc, kéo qua lại tự do." },
] as const;

export type MediaEffect = (typeof MEDIA_EFFECTS)[number]["id"];
const EFFECT_IDS = MEDIA_EFFECTS.map((e) => e.id) as readonly string[];

export interface MediaSlide {
  url: string;
  href?: string;
  alt?: string;
}

export interface BlockMedia {
  slides: MediaSlide[];
  effect: MediaEffect;
  isAutoplay: boolean;
  intervalMs: number;
  hasDots: boolean;
  hasArrows: boolean;
}

export const INTERVAL_MIN_MS = 2000;
export const INTERVAL_MAX_MS = 15000;
export const INTERVAL_DEFAULT_MS = 5000;

export const INTERVAL_CHOICES = [3000, 4000, 5000, 7000, 10000] as const;

const clampInterval = (value: unknown): number => {
  const ms = Number(value);
  if (!Number.isFinite(ms)) return INTERVAL_DEFAULT_MS;
  return Math.min(INTERVAL_MAX_MS, Math.max(INTERVAL_MIN_MS, Math.round(ms)));
};

/**
 * Reads the media slot out of a block's content, tolerating every older shape:
 * blocks saved before the slot existed only have `imageUrl` / `imageHref`.
 *
 * Two invariants the renderer then relies on and never re-checks:
 * an effect needs at least two slides, and autoplay needs an effect.
 */
export const readBlockMedia = (content: Record<string, any> | undefined | null): BlockMedia => {
  const raw = (content?.media ?? {}) as Record<string, any>;

  const slides: MediaSlide[] = (Array.isArray(raw.slides) ? raw.slides : [])
    .filter((slide: any) => typeof slide?.url === "string" && slide.url.trim())
    .map((slide: any) => ({
      url: String(slide.url).trim(),
      href: typeof slide.href === "string" ? slide.href.trim() : "",
      alt: typeof slide.alt === "string" ? slide.alt.trim() : "",
    }));

  // Content written before the media slot existed
  if (slides.length === 0 && typeof content?.imageUrl === "string" && content.imageUrl.trim()) {
    slides.push({
      url: content.imageUrl.trim(),
      href: typeof content.imageHref === "string" ? content.imageHref.trim() : "",
      alt: typeof content.imageAlt === "string" ? content.imageAlt.trim() : "",
    });
  }

  const requestedEffect = EFFECT_IDS.includes(raw.effect) ? (raw.effect as MediaEffect) : "none";
  const effect: MediaEffect = slides.length > 1 ? requestedEffect : "none";

  return {
    slides,
    effect,
    isAutoplay: effect !== "none" && raw.isAutoplay === true,
    intervalMs: clampInterval(raw.intervalMs),
    hasDots: effect !== "none" && raw.hasDots !== false,
    hasArrows: effect !== "none" && raw.hasArrows !== false,
  };
};
