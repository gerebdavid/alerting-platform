import { describe, expect, it } from "vitest";
import { matchAlerts } from "./matcher.js";

const baseAlert = { id: "alert-1", userId: "user-1", categoryId: "cat-markets", channel: "email" };

describe("matchAlerts", () => {
  it("matches an enabled alert in the event's category", () => {
    const alerts = [{ ...baseAlert, isEnabled: true }];
    const result = matchAlerts(alerts, { categoryId: "cat-markets" });
    expect(result).toEqual(alerts);
  });

  it("excludes a disabled alert even if the category matches", () => {
    const alerts = [{ ...baseAlert, isEnabled: false }];
    const result = matchAlerts(alerts, { categoryId: "cat-markets" });
    expect(result).toEqual([]);
  });

  it("excludes an alert for a different category", () => {
    const alerts = [{ ...baseAlert, categoryId: "cat-breaking-news", isEnabled: true }];
    const result = matchAlerts(alerts, { categoryId: "cat-markets" });
    expect(result).toEqual([]);
  });

  it("only returns the matching subset from a mixed list", () => {
    const matching = { ...baseAlert, id: "alert-match", isEnabled: true };
    const disabled = { ...baseAlert, id: "alert-disabled", isEnabled: false };
    const wrongCategory = { ...baseAlert, id: "alert-wrong-cat", categoryId: "cat-other", isEnabled: true };
    const result = matchAlerts([matching, disabled, wrongCategory], { categoryId: "cat-markets" });
    expect(result).toEqual([matching]);
  });
});
