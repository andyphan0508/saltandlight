import { prisma } from "@saltandlight/db";
import {
  ContactsView,
  type ContactSubmissionItem,
} from "@/components/admin";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;

export default async function AdminContactsPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string; status?: string; type?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const q = searchParams.q?.trim();
  const status = searchParams.status?.trim();
  const type = searchParams.type?.trim();

  const where: any = {
    ...(status && status !== "all" ? { status } : {}),
    ...(type && type !== "all" ? { type } : {}),
    ...(q
      ? {
          OR: [
            { fullName: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
            { email: { contains: q, mode: "insensitive" } },
            { message: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [contacts, total, countAll, countNew, countInProgress, countClosed] = await Promise.all([
    prisma.contactSubmission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.contactSubmission.count({ where }),
    prisma.contactSubmission.count(),
    prisma.contactSubmission.count({ where: { status: "new" } }),
    prisma.contactSubmission.count({ where: { status: "in_progress" } }),
    prisma.contactSubmission.count({ where: { status: "closed" } }),
  ]);

  return (
    <ContactsView
      initialContacts={JSON.parse(JSON.stringify(contacts)) as ContactSubmissionItem[]}
      total={total}
      page={page}
      pageSize={PAGE_SIZE}
      counts={{
        all: countAll,
        new: countNew,
        in_progress: countInProgress,
        closed: countClosed,
      }}
      currentFilters={{
        q: q || "",
        status: status || "all",
        type: type || "all",
      }}
    />
  );
}
