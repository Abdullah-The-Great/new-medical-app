// A single recorded observation.
export interface Observation {
  observationId: string;
  patientId: string;
  name: string;
  category: string;
  unit: string;
  amount: string;
  createdAt: string;
}

export type NewObservation = Omit<
  Observation,
  "observationId" | "patientId" | "createdAt"
>;
export interface Storage {
  list(category?: string): Promise<Observation[]>;
  add(obs: NewObservation): Promise<Observation>;
  remove(observationId: string): Promise<void>;
}
