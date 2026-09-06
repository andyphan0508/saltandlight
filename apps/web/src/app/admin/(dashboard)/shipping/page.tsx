import { prisma } from "@saltandlight/db";
import { getAllProvinces } from "@saltandlight/domain/vn-locations";
import { PageHeader } from "@/components/admin/PageHeader";
import { ShippingZonesManager } from "@/components/admin/ShippingZoneForm";

export const dynamic = "force-dynamic";

export default async function ShippingPage() {
  const zonesRaw = await prisma.shippingZone.findMany({ include: { methods: true } });
  const provinces = getAllProvinces();

  const zones = zonesRaw.map((z) => ({
    id: z.id,
    name: z.name,
    provinceCodes: z.provinceCodes,
    methods: z.methods.map((m) => ({
      id: m.id,
      type: m.type,
      fee: Number(m.fee),
      freeThreshold: m.freeThreshold ? Number(m.freeThreshold) : null,
      isActive: m.isActive,
    })),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý chính sách vận chuyển"
        subtitle="Cấu hình biểu phí giao hàng theo khu vực và điều kiện miễn phí vận chuyển (Freeship)"
      />

      <ShippingZonesManager initialZones={zones} provinces={provinces} />
    </div>
  );
}
