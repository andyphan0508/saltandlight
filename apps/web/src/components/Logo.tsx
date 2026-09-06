import Image from "next/image";
import type { LogoSize } from "@/lib/site-settings-types";
import { LOGO_SIZE_CLASSES } from "@/lib/site-settings-types";

/**
 * Single source of truth for rendering the site logo, so Header/Footer/
 * MobileDrawer stop each hand-rolling their own size classes — sizing now
 * comes from the admin-editable `logoSize` preset (see site-settings-types.ts).
 */
export function Logo({
  src,
  size,
  placement,
  alt = "Salt & Light",
  priority,
}: {
  src: string;
  size: LogoSize;
  placement: "header" | "footer";
  alt?: string;
  priority?: boolean;
}) {
  const className = LOGO_SIZE_CLASSES[size][placement];
  return (
    <div className={`relative ${className}`}>
      <Image src={src} alt={alt} fill priority={priority} className="object-contain object-left" />
    </div>
  );
}
