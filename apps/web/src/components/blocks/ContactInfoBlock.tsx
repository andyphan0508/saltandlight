import { BlockIcon } from "./icon-map";

interface ContactItem {
  icon: string;
  label: string;
  value: string;
  note?: string;
}

export interface ContactInfoContent {
  items: ContactItem[];
  quote?: string;
  quoteRef?: string;
}

export function ContactInfoBlock({ content }: { content: ContactInfoContent }) {
  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-white p-6 shadow-card border border-ink/5 space-y-5">
        {content.items.map((item, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-mint-100 text-brand-forest">
              <BlockIcon name={item.icon} size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase text-ink/60">{item.label}</h4>
              <p className="text-sm font-bold text-ink mt-0.5">{item.value}</p>
              {item.note && <p className="text-[11px] text-ink/50 mt-0.5">{item.note}</p>}
            </div>
          </div>
        ))}
      </div>

      {content.quote && (
        <div className="rounded-3xl bg-mint-100 p-6 border border-mint-200 text-xs text-brand-forest">
          <p className="font-bold">&ldquo;{content.quote}&rdquo;</p>
          {content.quoteRef && <p className="mt-1 text-[11px] opacity-75">— {content.quoteRef}</p>}
        </div>
      )}
    </div>
  );
}
