import { describe, it, expect, beforeEach } from "vitest";
import { LocalStorage } from "./local.ts";

describe("LocalStorage (IndexedDB)", () => {
  let store: LocalStorage;

  beforeEach(() => {
    localStorage.clear();
    // Unique DB name per test → no reuse, no deleteDatabase race.
    store = new LocalStorage(`patient-records-test-${crypto.randomUUID()}`);
  });

  it("starts empty", async () => {
    expect(await store.list()).toEqual([]);
  });

  it("adds an observation and returns it with id + timestamp", async () => {
    const saved = await store.add({
      name: "Weight",
      category: "Body",
      unit: "kg",
      amount: "70",
    });
    expect(saved.observationId).toBeTruthy();
    expect(saved.patientId).toMatch(/^local-/);
    expect(Number.isNaN(Date.parse(saved.createdAt))).toBe(false);
  });

  it("lists saved observations newest-first", async () => {
    await store.add({
      name: "Weight",
      category: "Body",
      unit: "kg",
      amount: "70",
    });
    await new Promise((r) => setTimeout(r, 10));
    await store.add({
      name: "Heart Rate",
      category: "Cardiovascular",
      unit: "bpm",
      amount: "72",
    });
    const all = await store.list();
    expect(all.length).toBe(2);
    expect(all[0].name).toBe("Heart Rate");
  });

  it("filters by category", async () => {
    await store.add({
      name: "Weight",
      category: "Body",
      unit: "kg",
      amount: "70",
    });
    await store.add({
      name: "Heart Rate",
      category: "Cardiovascular",
      unit: "bpm",
      amount: "72",
    });
    const body = await store.list("Body");
    expect(body.length).toBe(1);
    expect(body[0].name).toBe("Weight");
  });

  it("removes an observation", async () => {
    const saved = await store.add({
      name: "Weight",
      category: "Body",
      unit: "kg",
      amount: "70",
    });
    await store.remove(saved.observationId);
    expect(await store.list()).toEqual([]);
  });
});
