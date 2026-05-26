import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { config } from "./config.ts";

function client() {
  return new CognitoIdentityProviderClient({ region: config.region });
}

// In-memory token holder. (For a demo we keep it simple; production apps
// would handle refresh tokens and secure persistence.)
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

// Confirm a newly signed-up user with the code Cognito emailed them.
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

// Resend the confirmation code if it expired or didn't arrive.
export async function resendCode(email: string): Promise<void> {
  await client().send(
    new ResendConfirmationCodeCommand({
      ClientId: config.clientId!,
      Username: email,
    }),
  );
}
