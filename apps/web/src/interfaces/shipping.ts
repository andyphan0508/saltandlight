export interface Province {
  code: number;
  name: string;
}

export type ShippingMethodType = "flat_rate" | "free_shipping";

export interface ShippingMethodItem {
  id: string;
  type: ShippingMethodType;
  fee: number;
  freeThreshold: number | null;
  isActive: boolean;
}

export interface ZoneItem {
  id: string;
  name: string;
  provinceCodes: number[];
  methods: ShippingMethodItem[];
}
