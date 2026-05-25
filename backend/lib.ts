// Pure helpers extracted so they can be unit-tested without AWS.

export interface NewObservationInput {
  name: string;
  category: string;
  unit: string;
  amount: string;
}

// Returns the bearer token from an Authorization header, or null.
export function extractBearer(
  header: string | undefined | null,
): string | null {
  if (!header) return null;
  return header.startsWith("Bearer ") ? header.slice(7) : null;
}

// Validates a POST body. Returns the cleaned input, or an error message.
export function validateObservation(
  body: unknown,
): { ok: true; value: NewObservationInput } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Body must be an object" };
  }
  const b = body as Record<string, unknown>;
  const { name, category, unit, amount } = b;
  if (!name || !category || !unit || !amount) {
    return { ok: false, error: "name, category, unit and amount are required" };
  }
  return {
    ok: true,
    value: {
      name: String(name),
      category: String(category),
      unit: String(unit),
      amount: String(amount),
    },
  };
}

// Builds the DynamoDB item for an observation (id + timestamp added here).
export function buildObservationItem(
  patientId: string,
  input: NewObservationInput,
) {
  return {
    patientId,
    observationId: crypto.randomUUID(),
    ...input,
    createdAt: new Date().toISOString(),
  };
}
