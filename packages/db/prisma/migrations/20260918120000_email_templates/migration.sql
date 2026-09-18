-- Customer-facing email templates, edited in admin. The app reads them through Prisma;
-- nothing else should, so the table starts closed to Supabase's public REST API.
CREATE TABLE "email_templates" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "button_label" TEXT NOT NULL,
    "button_path" TEXT NOT NULL,
    "accent_color" TEXT NOT NULL,
    "background_color" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "email_templates" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "email_templates" FROM anon, authenticated;
