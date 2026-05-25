import { signIn, signUp } from "../auth.ts";
import { cloudAvailable } from "../config.ts";

export function renderLogin(
  app: HTMLElement,
  onCloud: (token: string) => void,
  onGuest: () => void,
) {
  const cloud = cloudAvailable();

  app.innerHTML = `
    <div class="card">
      <h1>🌿 Patient Records</h1>
      <p class="subtitle">Track your health observations, your way.</p>

      ${
        cloud
          ? `
        <label>Email</label>
        <input id="email" type="email" autocomplete="username" />
        <label>Password</label>
        <input id="password" type="password" autocomplete="current-password" />
        <div class="error" id="err"></div>
        <button class="btn-primary" id="signin">Log in</button>
        <p style="text-align:center;margin:10px 0;color:var(--ink-soft)">— or —</p>
        <button class="btn-ghost" id="signup">Create account</button>
        <p style="text-align:center;margin-top:18px">
          <span class="muted-link" id="guest">Continue without an account →</span>
        </p>
      `
          : `
        <div class="notice">
          Cloud sync isn't configured for this build, so the app runs fully on
          your device. No account needed.
        </div>
        <button class="btn-primary" id="guest">Start using the app →</button>
      `
      }
    </div>
  `;

  app.querySelector("#guest")?.addEventListener("click", onGuest);

  if (cloud) {
    const err = app.querySelector<HTMLDivElement>("#err")!;
    const email = () =>
      app.querySelector<HTMLInputElement>("#email")!.value.trim();
    const pass = () => app.querySelector<HTMLInputElement>("#password")!.value;

    app.querySelector("#signin")?.addEventListener("click", async () => {
      err.textContent = "";
      try {
        const token = await signIn(email(), pass());
        onCloud(token);
      } catch (e) {
        err.textContent = (e as Error).message;
      }
    });

    app.querySelector("#signup")?.addEventListener("click", async () => {
      err.textContent = "";
      try {
        await signUp(email(), pass());
        err.textContent =
          "Account created — check your email to confirm, then log in.";
      } catch (e) {
        err.textContent = (e as Error).message;
      }
    });
  }
}
