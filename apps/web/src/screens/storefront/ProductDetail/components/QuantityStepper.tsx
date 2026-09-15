interface QuantityStepperProps {
  value: number;
  onChange: (quantity: number) => void;
}

const stepClass = "flex h-9 w-9 items-center justify-center rounded-xl text-ink hover:bg-ink/5 active-press";

/** − / + quantity control; never goes below 1. */
export const QuantityStepper = ({ value, onChange }: QuantityStepperProps) => (
  <div className="flex items-center rounded-2xl border border-ink/20 bg-white p-1 shadow-sm">
    <button
      type="button"
      className={`${stepClass} disabled:opacity-30`}
      disabled={value <= 1}
      onClick={() => onChange(Math.max(1, value - 1))}
      aria-label="Giảm số lượng"
    >
      −
    </button>
    <span className="w-10 text-center text-sm font-bold text-ink">{value}</span>
    <button type="button" className={stepClass} onClick={() => onChange(value + 1)} aria-label="Tăng số lượng">
      +
    </button>
  </div>
);
