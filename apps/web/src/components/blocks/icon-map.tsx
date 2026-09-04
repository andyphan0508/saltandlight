import {
  Truck,
  ShieldCheck,
  RefreshCw,
  Heart,
  Sparkles,
  CrossIcon,
  Star,
  Gift,
  Phone,
  Mail,
  MapPin,
  Check,
  type IconProps,
} from "@/components/Icons";

/** Icon keys admins can pick in the page-builder — keep in sync with apps/admin/src/lib/page-block-types.ts. */
export const BLOCK_ICONS: Record<string, (props: IconProps) => JSX.Element> = {
  Truck,
  ShieldCheck,
  RefreshCw,
  Heart,
  Sparkles,
  CrossIcon,
  Star,
  Gift,
  Phone,
  Mail,
  MapPin,
  Check,
};

export function BlockIcon({ name, ...props }: { name?: string | null } & IconProps) {
  const Icon = (name && BLOCK_ICONS[name]) || Sparkles;
  return <Icon {...props} />;
}
