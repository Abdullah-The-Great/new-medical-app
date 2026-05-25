import { Hono, type Context, type Next } from "hono";
import { cors } from "hono/cors";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import {
  extractBearer,
  validateObservation,
  buildObservationItem,
} from "./lib.ts";

// ---------- config ----------
const REGION = Deno.env.get("AWS_REGION") ?? "us-east-1";
const TABLE = Deno.env.get("DYNAMODB_TABLE")!;
const POOL_ID = Deno.env.get("COGNITO_USER_POOL_ID")!;
const CLIENT_ID = Deno.env.get("COGNITO_CLIENT_ID")!;
const PORT = Number(Deno.env.get("PORT") ?? "8000");
const ORIGIN = Deno.env.get("CORS_ORIGIN") ?? "http://localhost:5173";

// Fail fast with a friendly message if cloud config is missing.
if (!POOL_ID || !CLIENT_ID || !TABLE) {
  console.error(
    "\n❌ Missing AWS config. The backend only runs in cloud mode.\n" +
      "   Set COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID and DYNAMODB_TABLE in backend/.env\n" +
      "   (get the values from:  cd ../terraform && terraform output)\n\n" +
      "   If you just want to build/demo without AWS, use the frontend's guest mode\n" +
      "   and don't start this backend.\n",
  );
  Deno.exit(1);
}

// ---------- AWS clients ----------
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

const verifier = CognitoJwtVerifier.create({
  userPoolId: POOL_ID,
  tokenUse: "id",
  clientId: CLIENT_ID,
});

// ---------- app ----------
type Variables = { patientId: string };

const app = new Hono<{ Variables: Variables }>();
app.use(
  "/*",
  cors({ origin: ORIGIN, allowHeaders: ["Content-Type", "Authorization"] }),
);

// Auth middleware: verify the Bearer token, stash the patientId (Cognito sub).
async function authMiddleware(
  c: Context<{ Variables: Variables }>,
  next: Next,
) {
  const token = extractBearer(c.req.header("Authorization"));
  if (!token) return c.json({ error: "Missing token" }, 401);
  try {
    const payload = await verifier.verify(token);
    c.set("patientId", payload.sub);
    await next();
  } catch {
    return c.json({ error: "Invalid token" }, 401);
  }
}

app.use("/observations/*", authMiddleware);
app.use("/observations", authMiddleware);

// ---------- routes ----------

app.get("/observations", async (c) => {
  const patientId = c.get("patientId");
  const category = c.req.query("category");

  const cmd = category
    ? new QueryCommand({
        TableName: TABLE,
        IndexName: "byCategory",
        KeyConditionExpression: "patientId = :p AND category = :cat",
        ExpressionAttributeValues: { ":p": patientId, ":cat": category },
      })
    : new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: "patientId = :p",
        ExpressionAttributeValues: { ":p": patientId },
      });

  const res = await ddb.send(cmd);
  const items = (res.Items ?? []).sort((a, b) =>
    String(b.createdAt).localeCompare(String(a.createdAt)),
  );
  return c.json(items);
});

app.post("/observations", async (c) => {
  const patientId = c.get("patientId");
  const body = await c.req.json().catch(() => null);

  const result = validateObservation(body);
  if (!result.ok) return c.json({ error: result.error }, 400);

  const item = buildObservationItem(patientId, result.value);
  await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
  return c.json(item, 201);
});

app.delete("/observations/:id", async (c) => {
  const patientId = c.get("patientId");
  const observationId = c.req.param("id");
  await ddb.send(
    new DeleteCommand({
      TableName: TABLE,
      Key: { patientId, observationId },
    }),
  );
  return c.json({ deleted: observationId });
});

app.get("/health", (c) => c.json({ ok: true }));

Deno.serve({ port: PORT }, app.fetch);
console.log(`API listening on http://localhost:${PORT}`);
