/**
 * One-time bootstrap: invites the first `owner` admin account. Needed
 * because the admin dashboard's "invite staff" feature (apps/admin
 * /users) itself requires being logged in as an owner already — this
 * script breaks that chicken-and-egg problem.
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   OWNER_EMAIL=you@example.com OWNER_NAME="Chủ shop" \
 *   pnpm --filter @saltandlight/scripts bootstrap:owner
 *
 * The invited email receives a Supabase magic link to set their password.
 */
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@saltandlight/db";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OWNER_EMAIL = process.env.OWNER_EMAIL;
const OWNER_NAME = process.env.OWNER_NAME;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !OWNER_EMAIL) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / OWNER_EMAIL environment variables."
  );
  process.exit(1);
}

async function main() {
  const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { data, error } = await supabase.auth.admin.inviteUserByEmail(
    OWNER_EMAIL!
  );
  if (error || !data.user) {
    throw new Error(error?.message ?? "Invite failed");
  }

  await prisma.adminUser.upsert({
    where: { email: OWNER_EMAIL! },
    update: { authUserId: data.user.id, role: "owner", isActive: true },
    create: {
      authUserId: data.user.id,
      email: OWNER_EMAIL!,
      fullName: OWNER_NAME,
      role: "owner"
    }
  });

  console.log(
    `Invited ${OWNER_EMAIL} as owner — check their inbox for the Supabase magic link.`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
