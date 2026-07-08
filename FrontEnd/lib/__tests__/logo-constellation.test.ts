import { describe, it, expect } from "vitest";
import {
  buildConstellationPathData,
  computeNodeFractions,
  buildSparklePoints,
} from "../logo-constellation";
import type { ConstellationNode } from "@/lib/constants/logo-constellation";

const SQUARE: ConstellationNode[] = [
  { x: 0, y: 0, k: "pt" },
  { x: 10, y: 0, k: "pt" },
  { x: 10, y: 10, k: "pt" },
  { x: 0, y: 10, k: "pt" },
];

describe("buildConstellationPathData", () => {
  it("starts with a move command and chains line commands", () => {
    expect(buildConstellationPathData(SQUARE)).toBe(
      "M0 0 L10 0 L10 10 L0 10 L0 0",
    );
  });

  it("returns an empty string for no nodes", () => {
    expect(buildConstellationPathData([])).toBe("");
  });
});

describe("computeNodeFractions", () => {
  it("returns 0 for the first node and increasing fractions in [0,1)", () => {
    const fractions = computeNodeFractions(SQUARE);
    expect(fractions[0]).toBe(0);
    expect(fractions[1]).toBeCloseTo(0.25);
    expect(fractions[2]).toBeCloseTo(0.5);
    expect(fractions[3]).toBeCloseTo(0.75);
    expect(fractions.every((fraction) => fraction >= 0 && fraction < 1)).toBe(
      true,
    );
  });

  it("returns an empty array for no nodes", () => {
    expect(computeNodeFractions([])).toEqual([]);
  });
});

describe("buildSparklePoints", () => {
  it("produces eight alternating points around the center", () => {
    const points = buildSparklePoints(50, 50, 10).split(" ");
    expect(points).toHaveLength(8);
    // El primer punto apunta hacia arriba (radio exterior completo).
    expect(points[0]).toBe("50.00,40.00");
  });
});
