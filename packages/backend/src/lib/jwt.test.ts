import { describe, expect, it } from "vitest";
import { signToken, verifyToken } from "./jwt.js";

describe("jwt", () => {
  it("round-trips a signed payload", () => {
    const token = signToken({ userId: "user-1", role: "user" });
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe("user-1");
    expect(decoded.role).toBe("user");
  });

  it("throws on an invalid token", () => {
    expect(() => verifyToken("not-a-real-token")).toThrow();
  });
});
