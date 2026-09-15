/** Prisma Decimal / Date fields aren't plain-serializable across the RSC boundary. */
export function toPlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
