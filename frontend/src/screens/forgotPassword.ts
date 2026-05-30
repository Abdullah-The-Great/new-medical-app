import { forgotPassword, confirmForgotPassword, signIn } from "../auth.ts";

export function renderForgotPassword(
  app: HTMLElement,
  onReset: (token: string) => void,
  onBackToLogin: () => void,
) {
  let stage: "request" | "confirm" = "request";
  let savedEmail = "";

  function render() {
    if (stage === "request") {
      app.innerHTML = `
        <div class="card">
          <h1>🔐 Reset password</h1>
          <p class="subtitle">We'll email you a code to reset it.</p>
          <label>Email</label>
          <input id="email" type="email" autocomplete="username" />
          <div class="error" id="err"></div>
          <button class="btn-primary" id="send">Send reset code</button>
          <p style="text-align:center;margin-top:18px">
            <span class="muted-link" id="back">← Back to login</span>
          </p>
        </div>
      `;
      app.querySelector("#back")?.addEventListener("click", onBackToLogin);
      app.querySelector("#send")?.addEventListener("click", handleSend);
    } else {
      app.innerHTML = `
        <div class="card">
          <h1>📧 Check your email</h1>
          <p class="subtitle">We sent a 6-digit code to <strong>${savedEmail}</strong>.</p>
          <label>Confirmation code</label>
          <input id="code" inputmode="numeric" placeholder="123456" />
          <label>New password</label>
          <input id="password" type="password" autocomplete="new-password" />
          <p class="subtitle" style="margin-top:8px;font-size:.8rem">
            At least 8 characters, with upper, lower and a number.
          </p>
          <div class="error" id="err"></div>
          <button class="btn-primary" id="confirm">Set new password & log in</button>
          <p style="text-align:center;margin-top:14px">
            <span class="muted-link" id="resend">Resend code</span>
          </p>
        </div>
      `;
      app.querySelector("#confirm")?.addEventListener("click", handleConfirm);
      app.querySelector("#resend")?.addEventListener("click", handleResend);
    }
  }

  async function handleSend() {
    const err = app.querySelector<HTMLDivElement>("#err")!;
    err.textContent = "";
    savedEmail = app.querySelector<HTMLInputElement>("#email")!.value.trim();
    if (!savedEmail) {
      err.textContent = "Please enter your email.";
      return;
    }
    try {
      await forgotPassword(savedEmail);
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
    const newPassword = app.querySelector<HTMLInputElement>("#password")!.value;
    if (!code || !newPassword) {
      err.textContent = "Enter the code and a new password.";
      return;
    }
    try {
      await confirmForgotPassword(savedEmail, code, newPassword);
      // Auto-log-in with the new password.
      const token = await signIn(savedEmail, newPassword);
      onReset(token);
    } catch (e) {
      err.textContent = (e as Error).message;
    }
  }

  async function handleResend() {
    const err = app.querySelector<HTMLDivElement>("#err")!;
    err.textContent = "";
    try {
      await forgotPassword(savedEmail);
      err.textContent = "A new code is on its way.";
    } catch (e) {
      err.textContent = (e as Error).message;
    }
  }

  render();
}
