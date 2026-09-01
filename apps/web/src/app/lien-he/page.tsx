import { ContactForm } from "@/components/ContactForm";

export const metadata = { title: "Liên hệ" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-center font-display text-2xl font-black uppercase">Liên hệ</h1>
      <p className="mt-2 text-center text-sm text-ink/60">
        Email: saltandlight.lienhe@gmail.com · Hotline: (+84) 847 25 2025
      </p>
      <div className="mt-8">
        <ContactForm type="contact" />
      </div>
    </div>
  );
}
