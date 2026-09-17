import { ContactForm } from "@/components/ContactForm";
import { HotlineLink } from "@/components/ContactInfoProvider";
import { Check, Phone } from "@/components/Icons";
import { ContactInfoBlock, type ContactInfoContent } from "./ContactInfoBlock";

export interface ContactFormContent {
  headline: string;
  formType?: "contact" | "custom_order";
  /** What sits beside the form: nothing, a checklist card, or contact channels. */
  aside?: "none" | "checklist" | "contact_info";
  asideTitle?: string;
  asideItems?: string[];
  isHotlineShown?: boolean;
  contactItems?: ContactInfoContent["items"];
  quote?: string;
  quoteRef?: string;
}

/** A contact / quote-request form, optionally beside a checklist or the shop's contact channels. */
export const ContactFormBlock = ({ content }: { content: ContactFormContent }) => {
  const aside = content.aside ?? "none";
  const checklist = (content.asideItems ?? []).filter((item) => item.trim());
  const hasAside =
    (aside === "checklist" && (checklist.length > 0 || content.asideTitle)) ||
    (aside === "contact_info" && (content.contactItems?.length ?? 0) > 0);

  const form = (
    <div className={`rounded-3xl bg-white p-6 sm:p-8 shadow-card border border-ink/5 ${hasAside ? "lg:col-span-7" : ""}`}>
      <h2 className="font-display text-base font-bold uppercase text-ink mb-6">{content.headline}</h2>
      <ContactForm type={content.formType === "custom_order" ? "custom_order" : "contact"} />
    </div>
  );

  if (!hasAside) return <section className="mx-auto max-w-4xl px-4">{form}</section>;

  return (
    <section className="mx-auto max-w-4xl px-4">
      <div className="grid gap-10 lg:grid-cols-12 items-start">
        <div className="space-y-6 lg:col-span-5">
          {aside === "contact_info" ? (
            <ContactInfoBlock
              content={{ items: content.contactItems ?? [], quote: content.quote, quoteRef: content.quoteRef }}
            />
          ) : (
            <div className="rounded-3xl bg-white p-6 shadow-card border border-ink/5 space-y-4">
              {content.asideTitle && (
                <h3 className="font-display text-base font-bold uppercase text-ink">{content.asideTitle}</h3>
              )}
              <ul className="space-y-3 text-xs text-ink/75">
                {checklist.map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check size={16} className="text-emerald-600 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {content.isHotlineShown && (
                <div className="border-t border-ink/10 pt-4 flex items-center gap-2 text-xs text-brand-forest font-bold">
                  <Phone size={16} />
                  <span>
                    Tư vấn trực tiếp: <HotlineLink className="hover:underline" />
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        {form}
      </div>
    </section>
  );
};
