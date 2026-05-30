import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { config } from "./config.ts";

function client() {
  return new CognitoIdentityProviderClient({ region: config.region });
}

let idToken: string | null = null;
export function getToken(): string | null {
  return idToken;
}
export function clearToken(): void {
  idToken = null;
}

export async function signIn(email: string, password: string): Promise<string> {
  const res = await client().send(
    new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: config.clientId!,
      AuthParameters: { USERNAME: email, PASSWORD: password },
    }),
  );
  const token = res.AuthenticationResult?.IdToken;
  if (!token) throw new Error("Login failed — no token returned.");
  idToken = token;
  return token;
}

export async function signUp(email: string, password: string): Promise<void> {
  await client().send(
    new SignUpCommand({
      ClientId: config.clientId!,
      Username: email,
      Password: password,
      UserAttributes: [{ Name: "email", Value: email }],
    }),
  );
}

export async function confirmSignUp(
  email: string,
  code: string,
): Promise<void> {
  await client().send(
    new ConfirmSignUpCommand({
      ClientId: config.clientId!,
      Username: email,
      ConfirmationCode: code,
    }),
  );
}

export async function forgotPassword(email: string): Promise<void> {
  await client().send(
    new ForgotPasswordCommand({
      ClientId: config.clientId!,
      Username: email,
    }),
  );
}

// Step 2 of password reset — verify the code and set the new password.
export async function confirmForgotPassword(
  email: string,
  code: string,
  newPassword: string,
): Promise<void> {
  await client().send(
    new ConfirmForgotPasswordCommand({
      ClientId: config.clientId!,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
    }),
  );
}
export async function resendCode(email: string): Promise<void> {
  await client().send(
    new ResendConfirmationCodeCommand({
      ClientId: config.clientId!,
      Username: email,
    }),
  );
}
