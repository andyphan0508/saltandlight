import { prisma } from "@saltandlight/db";
import { PageHeader } from "@/components/PageHeader";
import { ShippingMethodRow } from "@/components/ShippingMethodRow";
import { Truck } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function ShippingPage() {
  const zones = await prisma.shippingZone.findMany({ include: { methods: true } });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý chính sách vận chuyển"
        subtitle="Cấu hình biểu phí giao hàng toàn quốc và điều kiện miễn phí vận chuyển (Freeship)"
      />

      <div className="space-y-6">
        {zones.map((zone) => (
          <div key={zone.id} className="luno-card p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 text-sm font-bold uppercase text-slate-800 tracking-wider">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-mint-100 text-brand-forest">
                <Truck size={17} />
              </span>
              <span>Khu vực: {zone.name}</span>
            </div>

            <div className="space-y-3 pt-1">
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
          <div className="luno-card p-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Truck size={28} />
            </div>
            <h3 className="mt-4 font-bold text-slate-800 text-sm">Chưa có khu vực vận chuyển</h3>
            <p className="mt-1 text-xs text-slate-400">
              Vui lòng thiết lập cấu hình biểu phí vận chuyển cho hệ thống.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
