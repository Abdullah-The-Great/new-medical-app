import { describe, it, expect } from "vitest";
import {
  OBSERVATION_TYPES,
  categoryForName,
  typeByName,
  allCategories,
} from "./observations.ts";

describe("observation catalog", () => {
  it("auto-selects the correct category for a known observation", () => {
    expect(categoryForName("Blood Pressure")).toBe("Cardiovascular");
    expect(categoryForName("Weight")).toBe("Body");
  });

  it("falls back to Uncategorized for an unknown name", () => {
    expect(categoryForName("Mystery Reading")).toBe("Uncategorized");
  });

  it("exposes multi-unit types so the UI can render a dropdown", () => {
    const sugar = typeByName("Blood Sugar");
    expect(sugar?.units.length).toBeGreaterThan(1);
    expect(sugar?.units).toContain("mmol/L");
  });

  it("exposes single-unit types with exactly one unit", () => {
    const hr = typeByName("Heart Rate");
    expect(hr?.units).toEqual(["bpm"]);
  });

  it("returns a deduplicated list of categories", () => {
    const cats = allCategories();
    expect(new Set(cats).size).toBe(cats.length); // no duplicates
    expect(cats).toContain("Vitals");
  });

  it("every type has at least one unit and a category", () => {
    for (const t of OBSERVATION_TYPES) {
      expect(t.units.length).toBeGreaterThan(0);
      expect(t.category).toBeTruthy();
    }
  });
});
