import { prisma } from "@saltandlight/db";
import { ShippingMethodRow } from "@/components/ShippingMethodRow";

export default async function ShippingPage() {
  const zones = await prisma.shippingZone.findMany({ include: { methods: true } });

  return (
    <div>
      <h1 className="font-display text-2xl font-black uppercase">Vận chuyển</h1>
      <div className="mt-6 space-y-6">
        {zones.map((zone) => (
          <div key={zone.id}>
            <h2 className="text-sm font-bold uppercase text-ink/60">{zone.name}</h2>
            <div className="mt-3 space-y-3">
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
      </div>
    </div>
  );
}
