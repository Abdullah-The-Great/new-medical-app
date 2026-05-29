# 🌿 Patient Records

A personal health observation tracker. Log in (or stay anonymous) and record
measurements like blood pressure, blood sugar, weight, and temperature. The app
runs in two modes:

- **Guest mode** — works with **zero setup**. Records are stored locally in your
  browser (IndexedDB). No account, no AWS, no cost. Clone and run.
- **Cloud mode** — sign up with an email, and records sync to AWS (Cognito for
  auth, DynamoDB for storage).

The same UI runs in both modes; only the storage layer underneath changes.

## ⚠️ Disclaimer

This app is a **personal observation log**, not a medical device or diagnostic
tool. It exists to record and display values you enter yourself.

- **Not medical advice.** Nothing the app shows is a diagnosis, treatment
  recommendation, or interpretation of your health. Do not use it to make
  medical decisions. Always consult a qualified healthcare professional.
- **No clinical validation.** The app has not been reviewed or approved by any
  medical regulator (FDA, MHRA, CE, etc.) and is not intended for clinical use.
- **Your data, your responsibility.** In guest mode, records live only on your
  device — clearing your browser data deletes them, and the project provides no
  backup. In cloud mode, records are stored in your own AWS account; the
  project authors have no access to it.
- **No warranty.** The software is provided "as is", without warranty of any
  kind. Use at your own risk.
- **Privacy.** This is a personal/demo project, not a HIPAA- or GDPR-compliant
  health platform. Do not store records for anyone other than yourself, and do
  not enter information you wouldn't be comfortable seeing in a personal note
  app.

If you are experiencing a medical emergency, contact your local emergency
services immediately.

---

## Tech stack

| Layer          | Technology                           |
| -------------- | ------------------------------------ |
| Frontend       | Vite + TypeScript                    |
| Backend        | Deno + Hono (cloud mode only)        |
| Auth           | Amazon Cognito (cloud mode only)     |
| Storage        | DynamoDB (cloud) / IndexedDB (guest) |
| Infrastructure | Terraform                            |

---

## Quick start (guest mode — no AWS needed)

This is the fastest way to try the app. It needs only Node.

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173). With no cloud config
present, the app starts in guest-only mode: click **Start using the app** and
everything is saved on your device.

That's it. No backend, no AWS, no environment variables.

---

## Full setup (cloud mode)

Cloud mode adds real accounts and cross-device storage. It requires an AWS
account and the AWS CLI configured with valid credentials.

### 1. Configure AWS credentials

You need an IAM user with permission to create Cognito and DynamoDB resources.
For a personal project, the simplest path is an IAM user with the
`AdministratorAccess` policy. In the AWS Console: IAM → Users → create a user →
attach `AdministratorAccess` → create an access key (choose "Command Line
Interface").

Then configure the CLI with that key (no `--profile` flag, so it lands in the
default profile that Terraform reads automatically):

```bash
aws configure
#   AWS Access Key ID:     <your key id>
#   AWS Secret Access Key: <your secret>
#   Default region name:   us-east-1
#   Default output format: json
```

Verify it works:

```bash
aws sts get-caller-identity
```

You should see your account ID and user ARN. If you get
`InvalidClientTokenId`, the key is wrong, deleted, or mistyped — create a fresh
access key and re-run `aws configure`.

### 2. Provision the infrastructure with Terraform

```bash
cd terraform
terraform init
terraform plan      # review: should show "5 to add, 0 to change, 0 to destroy"
terraform apply     # type "yes" to confirm
terraform output    # prints the IDs you need next
```

This creates a Cognito user pool, an app client, a Cognito domain, a DynamoDB
table, and a random id. Keep the `terraform output` visible — you'll copy those
values into the env files.

### 3. Create the environment files

Both env files use **uppercase variable names without quotes and without spaces
around the `=`**. Do not paste the raw `terraform output` (which uses lowercase
names and quotes) — the variable names must be mapped:

| Terraform output      | Env variable                                     |
| --------------------- | ------------------------------------------------ |
| `user_pool_id`        | `COGNITO_USER_POOL_ID` / `VITE_USER_POOL_ID`     |
| `user_pool_client_id` | `COGNITO_CLIENT_ID` / `VITE_USER_POOL_CLIENT_ID` |
| `dynamodb_table`      | `DYNAMODB_TABLE`                                 |

Create `backend/.env`:

```
AWS_REGION=us-east-1
DYNAMODB_TABLE=patient-records-observations
COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
PORT=8000
CORS_ORIGIN=http://localhost:5173
```

Create `frontend/.env`:

```
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_API_BASE=http://localhost:8000
```

> Cognito pool and client IDs are **not secrets** — the frontend ships them to
> the browser by design. Your AWS access keys, however, are secret and must
> never be committed.

### 4. Run both servers

In one terminal — the backend:

```bash
cd backend
deno task dev
```

It should print `API listening on http://localhost:8000`. If it instead prints
"Missing AWS config", the env file isn't being read (see Troubleshooting).

In a second terminal — the frontend:

```bash
cd frontend
npm run dev
```

Because `frontend/.env` now has Cognito config, the login screen shows the
email/password form **plus** a "Continue without an account" link.

### 5. Sign up and log in

1. Click **Create account**, enter an email and a password meeting the policy
   (8+ characters, with upper, lower, and a number).
2. Cognito emails a 6-digit confirmation code (check spam).
3. Enter the code → the app confirms you and logs you in automatically.
4. Add an observation → it's now stored in DynamoDB.

---

## Where to see things in the AWS Console

Set the region to **us-east-1** first (top-right selector) or resources look
missing.

- **Saved records:** DynamoDB → Tables → `patient-records-observations` →
  Explore table items.
- **Signed-up users:** Cognito → User pools → `patient-records-users` → Users.
- **Your IAM user / access keys:** IAM → Users → your user → Security
  credentials.

To list everything Terraform created: `cd terraform && terraform state list`.

---

## Tearing it down

To remove all AWS resources and stop any charges:

```bash
cd terraform
terraform destroy   # type "yes"
```

You can `terraform apply` again later to recreate everything identically.
Idle cost is essentially zero (DynamoDB is pay-per-request, Cognito has a free
tier), so there's no urgency — this is just the clean off-switch.

---

## Troubleshooting

**Backend prints "Missing AWS config" even though `.env` exists.** Deno doesn't
auto-load `.env`. The `deno task dev` command must include the `--env-file`
flag (it does in the committed `deno.json`). Also check the variable names are
uppercase and there are no quotes or spaces around `=`.

**`InvalidClientTokenId` from any AWS command.** The access key is invalid.
Create a fresh key in IAM and re-run `aws configure`. Make sure there's no stale
`aws_session_token` in `~/.aws/credentials`.

**Resources "missing" in the AWS Console.** You're in the wrong region. Switch
the top-right selector to **us-east-1**.

**`tslib` import error in the frontend.** Run `npm install tslib` — the AWS SDK
expects it as a peer dependency.

**Guest records don't show after logging in (or vice versa).** This is correct.
Guest data (IndexedDB) and cloud data (DynamoDB) are separate stores and don't
merge — they're effectively two different accounts.

**Session lost on page refresh.** Expected. The auth token is held in memory
only; refreshing logs you out. (A future improvement would persist the refresh
token.)

---

## Project structure

```
.
├── frontend/          # Vite + TypeScript app
│   └── src/
│       ├── main.ts        # entry + screen routing
│       ├── auth.ts        # Cognito signup/confirm/login
│       ├── config.ts      # reads env, decides cloud vs guest
│       ├── observations.ts # the observation-type catalog
│       ├── screens/       # login, signup, menu, add, view
│       └── storage/       # local (IndexedDB) + cloud (API) implementations
├── backend/           # Deno + Hono API (cloud mode only)
│   ├── main.ts            # routes + Cognito token verification
│   └── lib.ts             # pure helpers (validation, token parsing)
└── terraform/         # Cognito + DynamoDB infrastructure
```

See `ARCHITECTURE.md` for how the pieces fit together.
