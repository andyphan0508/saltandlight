import { BlockIcon } from "./icon-map";

export interface PageHeroContent {
  icon?: string;
  eyebrow?: string;
  title?: string;
  headline?: string;
  subtitle?: string;
  subheadline?: string;
  quote?: string;
  quoteRef?: string;
}

export function PageHeroBlock({ content }: { content: PageHeroContent }) {
  const title = content.title || content.headline || "";
  const subtitle = content.subtitle || content.subheadline;

  return (
    <div className="text-center space-y-4">
      {content.icon && (
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ink text-white shadow-md">
          <BlockIcon name={content.icon} size={24} className="text-mint-200" />
        </div>
      )}
      {content.eyebrow && (
        <span className="text-xs font-bold uppercase tracking-widest text-brand-forest">{content.eyebrow}</span>
      )}
      <h1 className="font-display text-3xl sm:text-5xl font-bold uppercase text-ink tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-ink/70 max-w-xl mx-auto">{subtitle}</p>
      )}
      {content.quote && (
        <p className="text-sm sm:text-base text-ink/75 max-w-2xl mx-auto leading-relaxed">
          &ldquo;{content.quote}&rdquo;
          {content.quoteRef && (
            <>
              <br />
              <strong className="text-brand-forest text-xs uppercase tracking-wider">— {content.quoteRef}</strong>
            </>
          )}
        </p>
      )}
    </div>
  );
}
