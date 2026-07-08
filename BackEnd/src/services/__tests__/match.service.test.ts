import { describe, it, expect } from "vitest";
import { computeMatchScore } from "../match.service";

describe("computeMatchScore", () => {
  it("100 cuando cubre todas las skills y está disponible", () => {
    const r = computeMatchScore(["React", "Node"], ["react", "node", "css"], true);
    expect(r.score).toBe(100);
    expect(r.matchedSkills).toEqual(["React", "Node"]);
    expect(r.missingSkills).toEqual([]);
  });

  it("80 cuando cubre todas las skills pero está ocupado", () => {
    const r = computeMatchScore(["React", "Node"], ["React", "Node"], false);
    expect(r.score).toBe(80);
  });

  it("cobertura parcial: cuenta solo las coincidentes (case-insensitive)", () => {
    const r = computeMatchScore(["React", "Node", "Go", "AWS"], ["react", "go"], true);
    // cobertura 2/4 = 0.5 -> 0.5*80 + 20 = 60
    expect(r.score).toBe(60);
    expect(r.matchedSkills).toEqual(["React", "Go"]);
    expect(r.missingSkills).toEqual(["Node", "AWS"]);
  });

  it("sin coincidencias y ocupado da 0", () => {
    const r = computeMatchScore(["React"], ["Python"], false);
    expect(r.score).toBe(0);
    expect(r.matchedSkills).toEqual([]);
    expect(r.missingSkills).toEqual(["React"]);
  });

  it("proyecto sin skills: cobertura neutra (0.5)", () => {
    expect(computeMatchScore([], ["React"], true).score).toBe(60); // 0.5*80 + 20
    expect(computeMatchScore([], ["React"], false).score).toBe(40); // 0.5*80
  });

  it("la reputación suma un bonus positivo (hasta +10), topado en 100", () => {
    // base 60 (media cobertura + disponible) + (5/5)*10 = 70
    expect(computeMatchScore(["React", "Node"], ["react"], true, 5).score).toBe(70);
    // base 60 + (3/5)*10 = 66
    expect(computeMatchScore(["React", "Node"], ["react"], true, 3).score).toBe(66);
    // base 100 + bonus se topa en 100
    expect(computeMatchScore(["React"], ["React"], true, 5).score).toBe(100);
  });

  it("sin reputación (null) no penaliza al junior nuevo", () => {
    // mismo score que sin el argumento de reputación
    expect(computeMatchScore(["React", "Node"], ["react"], true, null).score).toBe(60);
    expect(computeMatchScore(["React", "Node"], ["react"], true).score).toBe(60);
  });
});
