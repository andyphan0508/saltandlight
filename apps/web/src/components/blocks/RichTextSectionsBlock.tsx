interface Section {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  cards?: { title: string; description: string }[];
  style?: "default" | "note";
}

export interface RichTextSectionsContent {
  sections: Section[];
}

export function RichTextSectionsBlock({ content }: { content: RichTextSectionsContent }) {
  const noteSections = content.sections.filter((s) => s.style === "note");
  const mainSections = content.sections.filter((s) => s.style !== "note");

  return (
    <>
      {mainSections.length > 0 && (
        <div className="rounded-3xl bg-white p-8 sm:p-10 shadow-card border border-ink/5 space-y-8 text-sm text-ink/80 leading-relaxed">
          {mainSections.map((section, i) => (
            <section key={i} className={i > 0 ? "space-y-3 border-t border-ink/10 pt-6" : "space-y-3"}>
              <h2 className="font-display text-base font-black uppercase text-ink">{section.heading}</h2>
              {section.paragraphs?.map((p, j) => (
                <p key={j} className="text-xs text-ink/70">
                  {p}
                </p>
              ))}
              {section.bullets && section.bullets.length > 0 && (
                <ul className="space-y-2 text-xs text-ink/75 list-disc pl-5">
                  {section.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              )}
              {section.cards && section.cards.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  {section.cards.map((c, j) => (
                    <div key={j} className="rounded-2xl bg-cream p-4">
                      <p className="font-bold text-ink">{c.title}</p>
                      <p className="text-ink/60 mt-1">{c.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      {noteSections.map((section, i) => (
        <div key={i} className="rounded-3xl bg-mint-50 p-6 border border-mint-200 text-center text-xs text-ink/70">
          <p className="font-bold text-ink">{section.heading}</p>
          {section.paragraphs?.map((p, j) => (
            <p key={j} className="mt-1">
              {p}
            </p>
          ))}
        </div>
      ))}
    </>
  );
}
