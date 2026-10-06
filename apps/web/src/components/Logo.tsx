import Image from "next/image";
import type { LogoSize } from "@/interfaces/site-settings";
import { LOGO_SIZE_CLASSES } from "@/interfaces/site-settings";

interface LogoProps {
  src: string;
  size: LogoSize;
  placement: "header" | "footer";
  alt?: string;
  priority?: boolean;
}

/**
 * Single source of truth for rendering the site logo, so Header/Footer/
 * MobileDrawer stop each hand-rolling their own size classes — sizing now
 * comes from the admin-editable `logoSize` preset (see site-settings-types.ts).
 */
export const Logo = ({
  src,
  size,
  placement,
  alt = "Salt & Light",
  priority,
}: LogoProps) => {
  const className = LOGO_SIZE_CLASSES[size][placement];
  return (
    <div className={`relative ${className}`}>
      {/* Widest preset is w-72 (288px); without sizes the srcset assumed a full-width image */}
      <Image src={src} alt={alt} fill sizes="288px" priority={priority} className="object-contain object-left" />
    </div>
  );
};
