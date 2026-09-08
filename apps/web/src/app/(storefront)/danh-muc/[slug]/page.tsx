import ProductsPage from "@/app/(storefront)/san-pham/page";
import type { CatalogSearchParams } from "@/app/(storefront)/san-pham/components/parseCatalogParams";

export const dynamic = "force-dynamic";

const SLUG_ALIASES: Record<string, string> = {
  "ao-thun": "ao-thun-nguoi-lon",
  "ao-thun-nam-nu": "ao-thun-nguoi-lon",
  "tui-canvas": "tui-tote-canvas",
  "set-qua-ao-tui": "ao-thun-nguoi-lon",
};

export default function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: CatalogSearchParams;
}) {
  const targetSlug = SLUG_ALIASES[params.slug] || params.slug;
  return <ProductsPage searchParams={{ ...searchParams, categories: targetSlug }} />;
}


