/** Local Vietnamese number for tel:/Zalo links ("+84 912…" → "0912…"); null when there is no phone. */
export const normalizeVietnamesePhone = (phone: string | null) => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("84") && digits.length === 11) return `0${digits.slice(2)}`;
  return digits.startsWith("0") ? digits : `0${digits}`;
};
