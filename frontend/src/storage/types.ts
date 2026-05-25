// A single recorded observation.
export interface Observation {
  observationId: string; // unique id
  patientId: string; // Cognito sub (cloud) OR local device id (guest)
  name: string; // e.g. "Blood Pressure"
  category: string; // e.g. "Cardiovascular"
  unit: string; // the unit chosen/used, e.g. "mmHg"
  amount: string; // the value the user entered (string keeps "120/80" valid)
  createdAt: string; // ISO timestamp
}

// New observation before it gets an id/timestamp.
export type NewObservation = Omit<
  Observation,
  "observationId" | "patientId" | "createdAt"
>;

// Both LocalStorage and CloudStorage implement this. The rest of the
// app only ever talks to this interface — it never knows which is active.
export interface Storage {
  list(category?: string): Promise<Observation[]>;
  add(obs: NewObservation): Promise<Observation>;
  remove(observationId: string): Promise<void>;
}
