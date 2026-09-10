
# AlvionBot

A focused Next.js AI workspace using Google AI Studio and Gemini 3.6 Flash.

## Status

The first release is intentionally focused:

- Responsive chat interface
- Non-streaming AI responses
- Browser-only conversation persistence for guests
- Server-side Google AI Studio API access
- Gemini 3.6 Flash with a large context window for long conversations
- Configurable Gemini model selection through environment variables
- Optional Auth0 authentication through the Netlify Auth0 extension
- Authenticated file uploads through Netlify Blobs, limited to 5 files per user per day

Guests can chat without signing in. When Auth0 is configured, users can sign in while anonymous chat remains available. PostgreSQL/Prisma persistence, streaming, multimodal AI processing, and analytics remain separate follow-up work.

Signed-in users can use the plus button in the composer to upload images, PDFs, text, CSV, JSON, Word, and Excel files. Uploads are stored in Netlify Blobs, limited to 10 MB per file and 5 files per UTC day. Guest users cannot upload files. The current upload feature stores files securely; passing file contents into an AI prompt is a separate multimodal processing step.

## Security

Any API keys previously written in this repository must be revoked and replaced. Never commit real credentials, and never use a `NEXT_PUBLIC_` prefix for provider secrets. Keep local values in `.env.local` and deployment values in the hosting provider's environment settings.

Google AI Studio keys are server-only. Create a key in Google AI Studio and never expose it through a `NEXT_PUBLIC_` variable or commit it to Git.

Auth0 credentials are server-only. The Auth0 session is encrypted in an HTTP-only cookie, and no Auth0 client secret is sent to the browser.

## Setup

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local` and provide a Google AI Studio API key:

```env
GOOGLE_AI_API_KEY=your_google_ai_studio_key
GOOGLE_AI_MODEL=gemini-3.6-flash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=AI Chat

# Optional Auth0 / Netlify authentication
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret
AUTH0_SECRET=generate_with_openssl_rand_hex_32
APP_BASE_URL=http://localhost:3000
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
npm run lint
npm run build
```

## Architecture

The browser calls `POST /api/chat`. The Next.js route validates the request and calls Google AI Studio through a server-only adapter. The Google AI Studio key is never sent to the browser.

The provider boundary lives under `src/lib/providers/` so another documented provider can be added later without changing the chat UI or route contract.

## Deployment

For Netlify authentication:

1. Deploy the site from GitHub first.
2. Install the Auth0 extension from Netlify's team Extensions page and link your Auth0 tenant.
3. Configure a **Regular Web Application** in Auth0 for this Next.js server-side SDK. The extension may create a SPA by default; use a confidential client with a client secret for this app.
4. Add the deployed URL plus `/auth/callback` to Auth0 Allowed Callback URLs.
5. Add the deployed URL to Auth0 Allowed Logout URLs.
6. Configure `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_SECRET`, and `APP_BASE_URL` in Netlify. Preview deploys can omit `APP_BASE_URL` if their callback URLs are registered in Auth0.

For local Auth0 testing, register `http://localhost:3000/auth/callback` and `http://localhost:3000` as callback/logout URLs. Generate `AUTH0_SECRET` with `openssl rand -hex 32`.

For Netlify, also configure `GOOGLE_AI_API_KEY`, `GOOGLE_AI_MODEL`, `NEXT_PUBLIC_SITE_URL`, and `NEXT_PUBLIC_SITE_NAME`. Do not upload `.env.local` or commit provider credentials.

Persistent authenticated conversations, database provisioning, rate limiting, monitoring, and custom domain configuration belong to the production phase.