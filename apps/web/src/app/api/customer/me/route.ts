import { NextResponse } from "next/server";
import { getAuthenticatedCustomer } from "@/lib/customer/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const customer = await getAuthenticatedCustomer();
    if (!customer) return NextResponse.json({ customer: null }, { status: 401 });

    return NextResponse.json({
      customer: {
        id: customer.id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (err) {
    console.error("GET /api/customer/me error:", err);
    return NextResponse.json({ error: "Không thể tải thông tin tài khoản" }, { status: 500 });
  }
}
