interface CheckoutFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

/** Uncontrolled labelled input; values are read from FormData on submit. */
export const CheckoutField = ({ label, name, type = "text", placeholder, required }: CheckoutFieldProps) => (
  <div>
    <label className="text-xs font-bold uppercase tracking-wide text-ink/70">
      {label} {required && <span className="text-sale">*</span>}
    </label>
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      required={required}
      className="mt-1.5 w-full rounded-2xl border border-ink/15 px-4 py-2.5 text-sm focus:border-ink focus:outline-none transition-colors"
    />
  </div>
);
