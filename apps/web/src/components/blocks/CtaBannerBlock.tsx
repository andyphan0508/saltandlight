import Link from "next/link";
import { Button } from "@saltandlight/ui";

interface CtaButton {
  label: string;
  href: string;
  variant?: "primary" | "outline";
}

export interface CtaBannerContent {
  headline: string;
  buttons: CtaButton[];
}

export function CtaBannerBlock({ content }: { content: CtaBannerContent }) {
  const buttons = Array.isArray(content?.buttons) ? content.buttons : [];

  return (
    <div className="text-center space-y-6 pt-4">
      <h3 className="font-display text-xl font-bold uppercase text-ink">{content.headline}</h3>
      <div className="flex flex-wrap justify-center gap-4">
        {buttons.map((btn, i) => (
          <Link key={i} href={btn.href}>
            <Button variant={btn.variant === "outline" ? "outline" : "primary"} size="lg" className="shadow-md">
              {btn.label}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
