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
  return (
    <div className="text-center space-y-6 pt-4">
      <h3 className="font-display text-xl font-black uppercase text-ink">{content.headline}</h3>
      <div className="flex flex-wrap justify-center gap-4">
        {content.buttons.map((btn, i) => (
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
