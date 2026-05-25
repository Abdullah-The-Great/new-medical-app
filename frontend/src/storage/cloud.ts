import type { Observation, NewObservation, Storage } from "./types.ts";

export class CloudStorage implements Storage {
  constructor(
    private apiBase: string,
    private getToken: () => string | null,
  ) {}

  private async req(path: string, init: RequestInit = {}) {
    const token = this.getToken();
    const res = await fetch(`${this.apiBase}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
    if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
    return res;
  }

  async list(category?: string): Promise<Observation[]> {
    const q = category ? `?category=${encodeURIComponent(category)}` : "";
    const res = await this.req(`/observations${q}`);
    return res.json();
  }

  async add(obs: NewObservation): Promise<Observation> {
    const res = await this.req("/observations", {
      method: "POST",
      body: JSON.stringify(obs),
    });
    return res.json();
  }

  async remove(observationId: string): Promise<void> {
    await this.req(`/observations/${observationId}`, { method: "DELETE" });
  }
}
