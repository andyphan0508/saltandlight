import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@saltandlight/db";
import { requireAdmin, AuthError } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";

const methodSchema = z.object({
  type: z.enum(["flat_rate", "free_shipping"]),
  fee: z.number().nonnegative(),
  freeThreshold: z.number().nonnegative().nullable().optional(),
  isActive: z.boolean().default(true),
});

const bodySchema = z.object({
  name: z.string().min(1).max(120),
  provinceCodes: z.array(z.number().int()).default([]),
  methods: z.array(methodSchema).min(1),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(["owner"]);
    const body = bodySchema.parse(await req.json());

    const zone = await prisma.shippingZone.create({
      data: {
        name: body.name,
        provinceCodes: body.provinceCodes,
        methods: {
          create: body.methods.map((m) => ({
            type: m.type,
            fee: m.fee,
            freeThreshold: m.freeThreshold ?? null,
            isActive: m.isActive,
          })),
        },
      },
      include: { methods: true },
    });

    await logAudit({
      adminUserId: admin.id,
      action: "shipping_zone.create",
      entityType: "shipping_zone",
      entityId: zone.id,
      metadata: { name: zone.name, provinceCodes: zone.provinceCodes },
    });

    revalidateTag("shipping");

    return NextResponse.json({ zone });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.flatten() }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 });
  }
}
