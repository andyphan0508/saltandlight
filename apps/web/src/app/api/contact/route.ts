import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@saltandlight/db";
import { contactFormSchema } from "@saltandlight/domain";
import { verifyTurnstileToken } from "@/server/turnstile";
import { getClientIp } from "@/server/rate-limit";

export const dynamic = "force-dynamic";

export const POST = async (req: NextRequest) => {
  const body = await req.json().catch(() => null);
  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const isHuman = await verifyTurnstileToken(parsed.data.turnstileToken, getClientIp(req));
  if (!isHuman) {
    return NextResponse.json({ error: "Xác minh Turnstile thất bại, vui lòng thử lại." }, { status: 400 });
  }

  try {
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
  } catch (err) {
    console.error("Contact submission error:", err);
    return NextResponse.json({ error: "Không thể lưu thông tin liên hệ lúc này." }, { status: 500 });
  }
};
