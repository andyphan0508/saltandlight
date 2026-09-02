import { prisma } from "@saltandlight/db";
import { PageHeader } from "@/components/PageHeader";
import { ShippingMethodRow } from "@/components/ShippingMethodRow";
import { Truck } from "@/components/Icons";

export default async function ShippingPage() {
  const zones = await prisma.shippingZone.findMany({ include: { methods: true } });

  return (
    <div>
      <PageHeader title="Vận chuyển" subtitle="Cấu hình phí ship theo từng vùng giao hàng" />
      <div className="space-y-6">
        {zones.map((zone) => (
          <div key={zone.id}>
            <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase text-ink/60">
              <Truck size={16} className="text-brand-forest" />
              {zone.name}
            </div>
            <div className="space-y-3">
              {zone.methods.map((m) => (
                <ShippingMethodRow
                  key={m.id}
                  id={m.id}
                  type={m.type}
                  fee={Number(m.fee)}
                  freeThreshold={m.freeThreshold ? Number(m.freeThreshold) : null}
                  isActive={m.isActive}
                />
              ))}
            </div>
          </div>
        ))}
        {zones.length === 0 && (
          <div className="rounded-2xl border border-ink/10 bg-white p-12 text-center shadow-card">
            <Truck size={28} className="mx-auto text-ink/20" />
            <p className="mt-3 text-sm text-ink/50">Chưa có vùng vận chuyển nào.</p>
          </div>
        )}
      </div>
    </div>
  );
}
