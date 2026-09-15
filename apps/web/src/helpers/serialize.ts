/** Prisma Decimal / Date fields aren't plain-serializable across the RSC boundary. */
export const toPlain = <T>(value: T): T => {
  return JSON.parse(JSON.stringify(value));
};
