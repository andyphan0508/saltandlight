import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/components/Icons";

export interface IntroStoryContent {
  /** "warm" = the homepage intro colours, "forest" = the About page story colours. */
  palette?: "warm" | "forest";
  emblemUrl?: string;
  eyebrow?: string;
  headline: string;
  body?: string;
  imageUrl?: string;
  imageAlt?: string;
  buttons?: { label: string; href: string; variant?: "primary" | "outline" }[];
}

const PALETTES = {
  warm: {
    eyebrow: "text-sm sm:text-base font-semibold tracking-wide italic text-[#2096c7]",
    headline: "font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#b66700]",
    body: "text-sm sm:text-base text-[#6b727c]",
  },
  forest: {
    eyebrow: "text-base sm:text-lg font-medium italic tracking-wide text-emerald-700",
    headline: "font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink",
    body: "text-sm sm:text-base text-ink/80",
  },
} as const;

/** Centred brand story: optional emblem, eyebrow, heading, body, photo and buttons. */
export const IntroStoryBlock = ({ content }: { content: IntroStoryContent }) => {
  const palette = PALETTES[content.palette === "forest" ? "forest" : "warm"];
  const buttons = (content.buttons ?? []).filter((b) => b.label?.trim() && b.href?.trim());

  return (
    <section className="mx-auto max-w-4xl px-4 py-8 sm:py-12 text-center">
      {content.emblemUrl && (
        <div className="mb-3 sm:mb-4 inline-flex items-center justify-center transition-transform duration-200 hover:scale-105">
          <Image
            src={content.emblemUrl}
            alt={content.imageAlt || content.headline}
            width={140}
            height={140}
            sizes="140px"
            className="h-28 w-28 sm:h-36 sm:w-36 object-contain"
          />
        </div>
      )}

      {content.eyebrow && <p className={palette.eyebrow}>{content.eyebrow}</p>}
      <h2 className={`mt-1.5 ${palette.headline}`}>{content.headline}</h2>
      {content.body && (
        <p className={`mx-auto mt-4 max-w-3xl leading-relaxed whitespace-pre-line ${palette.body}`}>{content.body}</p>
      )}

      {content.imageUrl && (
        <div className="relative mx-auto mt-10 max-w-xl sm:max-w-2xl overflow-hidden rounded-2xl sm:rounded-3xl border border-mint-200/80 bg-white p-1 shadow-xl">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[14px] sm:rounded-[22px]">
            <Image
              src={content.imageUrl}
              alt={content.imageAlt || content.headline}
              fill
              sizes="(max-width: 768px) 100vw, 672px"
              className="object-cover"
            />
          </div>
        </div>
      )}

      {buttons.length > 0 && (
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {buttons.map((button, i) =>
            button.variant === "outline" ? (
              <Link
                key={i}
                href={button.href}
                className="inline-flex items-center gap-2 rounded-full border border-ink/20 bg-white px-7 py-4 text-sm font-semibold text-ink/80 transition-all duration-200 hover:bg-cream hover:text-ink"
              >
                {button.label}
              </Link>
            ) : (
              <Link
                key={i}
                href={button.href}
                className="inline-flex items-center gap-2.5 rounded-full bg-brand-forest px-8 py-4 text-sm font-bold text-white shadow-lg shadow-brand-forest/25 transition-all duration-300 hover:scale-105 hover:bg-brand-forest/90 active:scale-95"
              >
                <span>{button.label}</span>
                <ArrowRight size={16} />
              </Link>
            ),
          )}
        </div>
      )}
    </section>
  );
};
