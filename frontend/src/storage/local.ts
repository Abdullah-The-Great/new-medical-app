import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Observation, NewObservation, Storage } from "./types.ts";

interface PatientDB extends DBSchema {
  observations: {
    key: string;
    value: Observation;
    indexes: { byCategory: string };
  };
}

function getLocalPatientId(): string {
  const KEY = "local-patient-id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = `local-${crypto.randomUUID()}`;
    localStorage.setItem(KEY, id);
  }
  return id;
}

export class LocalStorage implements Storage {
  private dbPromise: Promise<IDBPDatabase<PatientDB>>;
  private patientId = getLocalPatientId();

  constructor(dbName = "patient-records") {
    this.dbPromise = openDB<PatientDB>(dbName, 1, {
      upgrade(db) {
        const store = db.createObjectStore("observations", {
          keyPath: "observationId",
        });
        store.createIndex("byCategory", "category");
      },
    });
  }

  async list(category?: string): Promise<Observation[]> {
    const db = await this.dbPromise;
    const all = await db.getAll("observations");
    const mine = all.filter((o) => o.patientId === this.patientId);
    const filtered = category
      ? mine.filter((o) => o.category === category)
      : mine;
    return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async add(obs: NewObservation): Promise<Observation> {
    const db = await this.dbPromise;
    const full: Observation = {
      ...obs,
      observationId: crypto.randomUUID(),
      patientId: this.patientId,
      createdAt: new Date().toISOString(),
    };
    await db.put("observations", full);
    return full;
  }

  async remove(observationId: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete("observations", observationId);
  }
}
