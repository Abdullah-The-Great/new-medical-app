import { assertEquals, assert } from "jsr:@std/assert@^1.0.0";
import {
  extractBearer,
  validateObservation,
  buildObservationItem,
} from "./lib.ts";

Deno.test("extractBearer: pulls token from valid header", () => {
  assertEquals(extractBearer("Bearer abc.def.ghi"), "abc.def.ghi");
});

Deno.test("extractBearer: rejects missing/malformed headers", () => {
  assertEquals(extractBearer(undefined), null);
  assertEquals(extractBearer(""), null);
  assertEquals(extractBearer("Basic xyz"), null);
  assertEquals(extractBearer("abc.def.ghi"), null); // no "Bearer " prefix
});

Deno.test("validateObservation: accepts a complete body", () => {
  const r = validateObservation({
    name: "Weight",
    category: "Body",
    unit: "kg",
    amount: "70",
  });
  assert(r.ok);
  if (r.ok) assertEquals(r.value.unit, "kg");
});

Deno.test("validateObservation: rejects missing fields", () => {
  const r = validateObservation({ name: "Weight", unit: "kg" });
  assert(!r.ok);
});

Deno.test("validateObservation: rejects non-objects", () => {
  assert(!validateObservation(null).ok);
  assert(!validateObservation("nope").ok);
});

Deno.test("buildObservationItem: stamps id, patientId and createdAt", () => {
  const item = buildObservationItem("patient-123", {
    name: "Heart Rate",
    category: "Cardiovascular",
    unit: "bpm",
    amount: "72",
  });
  assertEquals(item.patientId, "patient-123");
  assertEquals(item.name, "Heart Rate");
  assert(item.observationId.length > 0);
  assert(!Number.isNaN(Date.parse(item.createdAt)));
});
