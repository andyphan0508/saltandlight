import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/components/Icons";
import { CUSTOM_ORDER_FORM_CONTENT } from "@/helpers/page-block-seeds";
import { displayFont, Eyebrow } from "./shared";

/** The custom-order promises, as a numbered list beside a sticky heading. */
export const Commitments = () => (
  <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="self-start lg:sticky lg:top-24 lg:col-span-5">
        <Eyebrow>Cam kết</Eyebrow>
        <h2 className={`${displayFont.className} mt-4 text-4xl tracking-tight text-ink sm:text-5xl`}>
          {CUSTOM_ORDER_FORM_CONTENT.asideTitle}
        </h2>
        <p className="mt-5 max-w-[40ch] text-base leading-relaxed text-ink/60">
          Dù bạn mua một chiếc áo hay đặt in cho cả hội thánh.
        </p>
      </div>

      <ol className="divide-y divide-ink/10 border-y border-ink/10 lg:col-span-7">
        {CUSTOM_ORDER_FORM_CONTENT.asideItems.map((item, i) => (
          <li key={item} data-reveal className="flex items-baseline gap-6 py-8 sm:gap-10">
            <span className={`${displayFont.className} text-4xl italic text-mint-400 sm:text-5xl`}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="text-lg font-medium leading-snug text-ink sm:text-xl">{item}</p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

export const CustomOrderCta = () => (
  <section className="px-4 sm:px-6">
    <div
      data-reveal
      className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-ink-800 px-6 py-20 text-cream sm:px-14 sm:py-24"
    >
      <div
        aria-hidden="true"
        className="absolute -bottom-40 -left-24 -z-10 h-[460px] w-[460px] animate-[floatSoft_8s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.28),transparent_66%)]"
      />
      <div aria-hidden="true" className="absolute -right-10 -top-10 -z-10 h-56 w-56 opacity-[0.07] sm:h-72 sm:w-72">
        <Image src="/images/logo-emblem.webp" alt="" fill sizes="288px" className="object-contain" />
      </div>

      <div className="grid items-end gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Eyebrow className="!text-mint-300">Đặt in theo yêu cầu</Eyebrow>
          <h2 className={`${displayFont.className} mt-5 text-4xl leading-[1.05] tracking-tight sm:text-6xl`}>
            Đồng phục cho hội thánh, nhóm nhỏ hay <span className="italic text-mint-300">trại hè</span> của bạn?
          </h2>
          <p className="mt-6 max-w-[56ch] text-base leading-relaxed text-cream/65">
            Gửi ý tưởng cho chúng mình — thiết kế demo miễn phí đến khi bạn hài lòng, chiết khấu đến 25% cho số lượng lớn.
          </p>
        </div>
        <div className="flex flex-col gap-3 lg:col-span-4">
          <Link
            href="/dat-theo-yeu-cau"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-cream px-6 py-4 text-sm font-semibold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:bg-white active:translate-y-0 active:scale-[0.98]"
          >
            Gửi yêu cầu báo giá
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            href="/lien-he"
            className="inline-flex items-center justify-center rounded-full border border-cream/20 px-6 py-4 text-sm font-semibold text-cream transition-all duration-300 hover:-translate-y-0.5 hover:border-cream/50 active:translate-y-0 active:scale-[0.98]"
          >
            Liên hệ chúng mình
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export const WelcomeFooter = () => (
  <footer className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 text-sm text-ink/50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
    <div className="flex items-center gap-3">
      <Image src="/images/logo-emblem.webp" alt="" width={28} height={28} className="rounded-full" />
      <span>© {new Date().getFullYear()} Salt &amp; Light · Thời trang &amp; quà tặng lời Chúa</span>
    </div>
    <nav className="flex gap-6">
      <Link href="/san-pham" className="transition-colors hover:text-ink">
        Sản phẩm
      </Link>
      <Link href="/gioi-thieu" className="transition-colors hover:text-ink">
        Về chúng mình
      </Link>
      <Link href="/lien-he" className="transition-colors hover:text-ink">
        Liên hệ
      </Link>
    </nav>
  </footer>
);
