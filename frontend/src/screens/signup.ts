import { signUp, confirmSignUp, resendCode, signIn } from "../auth.ts";

export function renderSignup(
  app: HTMLElement,
  onConfirmed: (token: string) => void,
  onBackToLogin: () => void,
) {
  // Two stages: "form" (enter email/password) → "confirm" (enter emailed code).
  let stage: "form" | "confirm" = "form";
  let savedEmail = "";
  let savedPassword = "";

  function render() {
    if (stage === "form") {
      app.innerHTML = `
        <div class="card">
          <h1>🌿 Create account</h1>
          <p class="subtitle">We'll email you a code to confirm.</p>
          <label>Email</label>
          <input id="email" type="email" autocomplete="username" />
          <label>Password</label>
          <input id="password" type="password" autocomplete="new-password" />
          <p class="subtitle" style="margin-top:8px;font-size:.8rem">
            At least 8 characters, with upper, lower and a number.
          </p>
          <div class="error" id="err"></div>
          <button class="btn-primary" id="create">Create account</button>
          <p style="text-align:center;margin-top:18px">
            <span class="muted-link" id="back">← Back to login</span>
          </p>
        </div>
      `;
      app.querySelector("#back")?.addEventListener("click", onBackToLogin);
      app.querySelector("#create")?.addEventListener("click", handleCreate);
    } else {
      app.innerHTML = `
        <div class="card">
          <h1>📧 Check your email</h1>
          <p class="subtitle">We sent a 6-digit code to <strong>${savedEmail}</strong>.</p>
          <label>Confirmation code</label>
          <input id="code" inputmode="numeric" placeholder="123456" />
          <div class="error" id="err"></div>
          <button class="btn-primary" id="confirm">Confirm & log in</button>
          <p style="text-align:center;margin-top:14px">
            <span class="muted-link" id="resend">Resend code</span>
          </p>
        </div>
      `;
      app.querySelector("#confirm")?.addEventListener("click", handleConfirm);
      app.querySelector("#resend")?.addEventListener("click", handleResend);
    }
  }

  async function handleCreate() {
    const err = app.querySelector<HTMLDivElement>("#err")!;
    err.textContent = "";
    savedEmail = app.querySelector<HTMLInputElement>("#email")!.value.trim();
    savedPassword = app.querySelector<HTMLInputElement>("#password")!.value;
    if (!savedEmail || !savedPassword) {
      err.textContent = "Please enter an email and password.";
      return;
    }
    try {
      await signUp(savedEmail, savedPassword);
      stage = "confirm";
      render();
    } catch (e) {
      err.textContent = (e as Error).message;
    }
  }

  async function handleConfirm() {
    const err = app.querySelector<HTMLDivElement>("#err")!;
    err.textContent = "";
    const code = app.querySelector<HTMLInputElement>("#code")!.value.trim();
    if (!code) {
      err.textContent = "Enter the code from your email.";
      return;
    }
    try {
      await confirmSignUp(savedEmail, code);
      // Auto-log-in with the credentials they just used to sign up.
      const token = await signIn(savedEmail, savedPassword);
      onConfirmed(token);
    } catch (e) {
      err.textContent = (e as Error).message;
    }
  }

  async function handleResend() {
    const err = app.querySelector<HTMLDivElement>("#err")!;
    err.textContent = "";
    try {
      await resendCode(savedEmail);
      err.textContent = "A new code is on its way.";
    } catch (e) {
      err.textContent = (e as Error).message;
    }
  }

  render();
}
