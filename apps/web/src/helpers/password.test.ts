import { test } from "node:test";
import assert from "node:assert/strict";
import { generatePassword } from "./password";

test("generatePassword returns the requested length from the unambiguous alphabet", () => {
  const password = generatePassword(16);
  assert.equal(password.length, 16);
  assert.match(password, /^[abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%]+$/);
  assert.equal(generatePassword().length, 10);
  assert.notEqual(generatePassword(), generatePassword());
});
