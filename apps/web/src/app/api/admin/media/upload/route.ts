import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/lib/admin/auth";
import { createSupabaseAdminClient, PRODUCT_IMAGES_BUCKET } from "@/lib/supabase/admin";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const MIME_EXT_MAP = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

/**
 * Identifies the real image format from its magic bytes. The client-supplied
 * `file.type` (multipart Content-Type) is just a header the uploader wrote —
 * trusting it alone would let anyone upload arbitrary bytes with a spoofed
 * "image/png" label into public storage.
 */
function detectImageType(bytes: Uint8Array): keyof typeof MIME_EXT_MAP | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Thiếu tệp tin" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Ảnh vượt quá 5MB" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const detectedType = detectImageType(new Uint8Array(buffer.slice(0, 12)));
    if (!detectedType) {
      return NextResponse.json({ error: "Chỉ hỗ trợ ảnh JPEG, PNG, WebP" }, { status: 400 });
    }

    const ext = MIME_EXT_MAP[detectedType];
    const path = `${crypto.randomUUID()}.${ext}`;

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(path, buffer, { contentType: detectedType });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Tải ảnh lên thất bại" }, { status: 500 });
    }

    const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 });
  }
}
