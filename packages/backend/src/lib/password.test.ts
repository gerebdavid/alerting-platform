import { describe, expect, it } from "vitest";
import { comparePassword, hashPassword } from "~/lib/password.js";

describe("password", () => {
  it("round-trips a hashed password", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    expect(await comparePassword("correct-horse-battery-staple", hash)).toBe(true);
    expect(await comparePassword("wrong-password", hash)).toBe(false);
  });
});
