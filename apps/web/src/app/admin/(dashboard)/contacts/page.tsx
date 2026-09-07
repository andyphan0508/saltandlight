import { prisma } from "@saltandlight/db";
import {
  ContactSubmissionsManager,
  type ContactSubmissionItem,
} from "./ContactSubmissionsManager";

export const dynamic = "force-dynamic";

export default async function AdminContactsPage() {
  const contacts = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <ContactSubmissionsManager
      initialContacts={JSON.parse(JSON.stringify(contacts)) as ContactSubmissionItem[]}
    />
  );
}
