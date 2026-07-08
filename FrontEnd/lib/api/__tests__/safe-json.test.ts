    import { describe, expect, it } from "vitest";
import { formatDateLabel, getInitials, parseJsonStringArray } from "../safe-json";

describe("safe-json api helpers", () => {
  it("parses JSON string arrays and ignores non-string entries", () => {
    expect(parseJsonStringArray("[\"remote\",2,\"hybrid\"]")).toEqual(["remote", "hybrid"]);
  });

  it("returns an empty array for invalid JSON", () => {
    expect(parseJsonStringArray("not-json")).toEqual([]);
  });

  it("formats valid dates and falls back to the 2.0 placeholder for missing data", () => {
    expect(formatDateLabel(null, "es")).toBe("2.0");
    expect(formatDateLabel("2026-06-15T00:00:00.000Z", "en")).toContain("2026");
  });

  it("builds initials from a display name", () => {
    expect(getInitials("Ana Soto")).toBe("AS");
    expect(getInitials("Forward")).toBe("FO");
  });
});
