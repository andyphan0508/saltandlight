import Image from "next/image";
import { Sparkles } from "@/components/Icons";
import { ABOUT_STORY_CONTENT } from "@/helpers/page-block-seeds";
import { displayFont, Eyebrow } from "./shared";

const MARQUEE_ITEMS = [
  "Muối của đất",
  "Ánh sáng của thế gian",
  "100% Cotton",
  "In lời Kinh Thánh",
  "Giao hàng toàn quốc",
  "Thiết kế demo miễn phí",
];

/** Endless band; the list is rendered twice so the -50% loop in globals.css is seamless. */
export const VerseMarquee = () => (
  <div className="overflow-hidden bg-brand-forest py-5 text-cream sm:py-6">
    <div className="animate-marquee">
      {[0, 1].map((copy) => (
        <ul key={copy} aria-hidden={copy === 1 || undefined} className="flex shrink-0 items-center">
          {MARQUEE_ITEMS.map((item) => (
            <li key={item} className={`${displayFont.className} flex items-center gap-8 pr-8 text-2xl italic sm:text-3xl`}>
              {item}
              <Sparkles size={18} className="text-gold-500/80" />
            </li>
          ))}
        </ul>
      ))}
    </div>
  </div>
);

/** The question the brand was started to answer, next to a photo of the products. */
export const BrandStory = () => (
  <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
    <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
      <div data-reveal className="lg:col-span-7">
        <Eyebrow>Câu chuyện của chúng mình</Eyebrow>
        <blockquote className={`${displayFont.className} mt-6 text-[2rem] leading-[1.12] tracking-tight text-ink sm:text-5xl`}>
          “Áo câu gốc thì chắc chỉ <span className="italic text-brand-forest">mặc đi trại</span> được thôi?”
        </blockquote>
        <p className="mt-8 text-lg font-semibold text-ink">{ABOUT_STORY_CONTENT.headline}</p>
        <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-ink/65">{ABOUT_STORY_CONTENT.body}</p>
      </div>

      <figure data-reveal className="lg:col-span-5">
        <div className="relative aspect-[16/11] rotate-[1.5deg] overflow-hidden rounded-[2rem] bg-cream-100 shadow-[0_40px_80px_-36px_rgba(19,62,43,0.5)]">
          <Image src={ABOUT_STORY_CONTENT.imageUrl} alt={ABOUT_STORY_CONTENT.imageAlt} fill sizes="(min-width: 1024px) 460px, 100vw" className="object-cover" />
        </div>
        <figcaption className="mt-5 text-xs text-ink/45">Áo thun &amp; túi tote in lời Chúa của Salt &amp; Light</figcaption>
      </figure>
    </div>
  </section>
);

/** Ma-thi-ơ 5:13–14, the verse the brand is named after, as two unequal panels. */
export const SaltAndLightVerses = () => (
  <section className="mx-auto max-w-7xl px-4 sm:px-6">
    <div className="grid gap-5 lg:grid-cols-12">
      <article
        data-reveal
        className="flex flex-col rounded-[2.5rem] border border-ink/5 bg-white p-8 shadow-[0_20px_40px_-15px_rgba(24,24,27,0.06)] sm:p-12 lg:col-span-5"
      >
        <p className="font-mono text-[11px] tracking-[0.22em] text-ink/40">MA-THI-Ơ 5:13</p>
        <h3 className={`${displayFont.className} mt-6 text-6xl tracking-tight text-ink sm:text-7xl`}>Muối</h3>
        <p className={`${displayFont.className} mb-10 mt-6 text-xl italic leading-snug text-ink/80 sm:text-2xl`}>
          “Các ngươi là muối của đất; song nếu mất mặn đi, thì sẽ lấy giống chi mà làm cho mặn lại?”
        </p>
        <p className="mt-auto border-t border-ink/10 pt-6 text-sm leading-relaxed text-ink/60">
          Như muối giữ trọn vị mặn — áo may từ cotton 100%, giữ form, không phai, không xù sau nhiều lần giặt.
        </p>
      </article>

      <article
        data-reveal
        className="relative isolate flex flex-col overflow-hidden rounded-[2.5rem] bg-brand-forest p-8 text-cream sm:p-12 lg:col-span-7 lg:mt-16"
      >
        <div
          aria-hidden="true"
          className="absolute -right-28 -top-28 -z-10 h-96 w-96 animate-[floatSoft_7s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.38),transparent_68%)]"
        />
        <p className="font-mono text-[11px] tracking-[0.22em] text-cream/50">MA-THI-Ơ 5:14</p>
        <h3 className={`${displayFont.className} mt-6 text-6xl tracking-tight sm:text-7xl`}>Ánh sáng</h3>
        <p className={`${displayFont.className} mt-6 max-w-[34ch] text-xl italic leading-snug text-cream/90 sm:text-2xl`}>
          “Các ngươi là sự sáng của thế gian; một cái thành ở trên núi thì không khi nào bị khuất được.”
        </p>
        <p className="mt-10 max-w-[52ch] border-t border-cream/15 pt-6 text-sm leading-relaxed text-cream/70">
          Như ánh sáng không bị che khuất — thiết kế đủ đẹp để mặc ra phố, đi học, đi làm, để Lời Chúa được nhìn thấy mỗi
          ngày.
        </p>
      </article>
    </div>
  </section>
);
