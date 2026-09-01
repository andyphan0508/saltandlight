import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@saltandlight/db";
import { contactFormSchema } from "@saltandlight/domain";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await prisma.contactSubmission.create({
    data: {
      type: parsed.data.type,
      fullName: parsed.data.fullName,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      message: parsed.data.message,
    },
  });

  return NextResponse.json({ ok: true });
}
