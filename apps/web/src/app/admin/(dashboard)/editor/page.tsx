import { redirect } from "next/navigation";
import { prisma } from "@saltandlight/db";
import { getCurrentAdminUser } from "@/lib/admin/auth";
import { PAGE_SLUGS, type PageSlug } from "@/lib/admin/schemas";
import { ElementorEditorClient } from "./ElementorEditorClient";

export const dynamic = "force-dynamic";

function isPageSlug(value: string): value is PageSlug {
  return (PAGE_SLUGS as readonly string[]).includes(value);
}

export default async function EditorPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const admin = await getCurrentAdminUser();
  if (!admin) redirect("/admin/login");

  const page: PageSlug = isPageSlug(searchParams.page || "")
    ? (searchParams.page as PageSlug)
    : "home";

  const blocks = await prisma.pageBlock.findMany({
    where: { page },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="h-full">
      <ElementorEditorClient
        initialPage={page}
        initialBlocks={JSON.parse(JSON.stringify(blocks))}
      />
    </div>
  );
}
