// No look-alike characters (l, I, O, 0, 1) so the password can be read out or retyped
const PASSWORD_CHARS = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";

/** Random initial password drawn with crypto.getRandomValues (not Math.random). */
export const generatePassword = (length = 10) => {
  const values = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(values, (n) => PASSWORD_CHARS[n % PASSWORD_CHARS.length]).join("");
};
