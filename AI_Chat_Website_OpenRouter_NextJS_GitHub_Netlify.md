# AI Chat Website with Next.js, OpenRouter, GitHub & Netlify

## 1. Project Overview

This project is a modern AI chat website built with:

- **Next.js** — frontend and server-side application framework
- **TypeScript** — type-safe development
- **Tailwind CSS** — responsive UI styling
- **OpenRouter API** — access to AI models from multiple providers through an OpenAI-compatible API
- **GitHub** — source-code version control
- **Netlify** — deployment and hosting
- **Netlify Database (PostgreSQL) + Prisma** — recommended for persistent chat history
- **Authentication** — recommended for production user accounts

The application will provide a ChatGPT-style interface where users can create conversations, send messages, receive AI responses, and keep chat history.

---

## 2. Main Architecture

```text
                         ┌──────────────────────┐
                         │        User          │
                         │  Browser / Mobile    │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      Next.js         │
                         │                      │
                         │  Chat UI             │
                         │  Authentication      │
                         │  API Route Handler   │
                         └──────────┬───────────┘
                                    │
                    ┌───────────────┴────────────────┐
                    │                                │
                    ▼                                ▼
          ┌──────────────────┐             ┌──────────────────┐
          │    OpenRouter    │             │   PostgreSQL     │
          │      API         │             │   + Prisma       │
          │                  │             │                  │
          │ AI Models        │             │ Users            │
          │ Chat Completion  │             │ Conversations    │
          │ Streaming        │             │ Messages         │
          └──────────────────┘             └──────────────────┘

                         Deployment / Source
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
              ┌───────────┐                   ┌───────────┐
              │  GitHub   │ ────────────────> │  Netlify  │
              │   Repo    │   CI/CD Deploy    │  Hosting  │
              └───────────┘                   └───────────┘
```

---

## 3. Core Features

### Version 1 — Minimum Viable Product

- AI chat interface
- User message input
- AI response display
- Loading state
- Error handling
- Responsive design
- OpenRouter API integration
- Secure server-side API key handling

### Version 2 — ChatGPT-Style

- New Chat
- Multiple conversations
- Conversation history
- Rename conversation
- Delete conversation
- Streaming AI responses
- Markdown rendering
- Code blocks
- Copy response
- Stop generation
- Regenerate response
- Dark mode

### Version 3 — Production Application

- User registration and login
- PostgreSQL database
- Persistent conversation history
- User profile
- Model selector
- File uploads
- Image input
- Usage tracking
- Rate limiting
- Admin dashboard
- Analytics
- Custom domain
- Production monitoring

---

## 4. Recommended Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI | React |
| AI Provider | OpenRouter |
| AI Protocol | OpenAI-compatible Chat Completions API |
| Backend | Next.js Route Handlers |
| Database | Netlify Database (PostgreSQL) |
| ORM | Prisma |
| Authentication | Auth.js or another suitable auth solution |
| Version Control | Git + GitHub |
| Deployment | Netlify |
| Environment Variables | Netlify + `.env.local` |

OpenRouter provides an OpenAI-compatible API, so the application can use the standard chat-completions request structure while changing the API base URL and model identifier. OpenRouter documents the endpoint as:

`https://openrouter.ai/api/v1/chat/completions`

and supports both streaming and non-streaming responses.

---

## 5. Why OpenRouter?

OpenRouter is used instead of directly calling a single AI provider.

Advantages:

- Access to many AI models through one API
- OpenAI-compatible request format
- Easy model switching
- Model/provider routing options
- Streaming support
- Potential fallback models
- The frontend does not need to know which provider serves the model

The model should be stored in configuration rather than hard-coded throughout the application.

Example:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=your-model-slug
```

Do not commit the API key to GitHub.

---

# 6. Project Creation

Create the Next.js application:

```bash
npx create-next-app@latest ai-chat
```

Recommended options:

```text
TypeScript:       Yes
ESLint:           Yes
Tailwind CSS:     Yes
src/ directory:   No
App Router:       Yes
Turbopack:        Yes
```

Move into the project:

```bash
cd ai-chat
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 7. Install Dependencies

Install the OpenAI SDK because it can communicate with OpenRouter by using the OpenRouter-compatible base URL:

```bash
npm install openai
```

Recommended additional packages for a more complete app:

```bash
npm install react-markdown
npm install prisma @prisma/client
```

Authentication can be added later.

---

# 8. Environment Variables

Create:

```text
.env.local
```

Example:

```env
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxx
OPENROUTER_MODEL=your-model-slug
```

Optional site metadata for OpenRouter:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=My AI Chat
```

### Important Security Rule

Never expose:

```text
OPENROUTER_API_KEY
```

as a `NEXT_PUBLIC_` variable.

Correct:

```env
OPENROUTER_API_KEY=...
```

Incorrect:

```env
NEXT_PUBLIC_OPENROUTER_API_KEY=...
```

The key must remain server-side.

---

# 9. Recommended Folder Structure

```text
ai-chat/
│
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts
│   │
│   ├── chat/
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   ├── login/
│   │   └── page.tsx
│   │
│   ├── settings/
│   │   └── page.tsx
│   │
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── Sidebar.tsx
│   ├── ChatWindow.tsx
│   ├── ChatInput.tsx
│   ├── MessageBubble.tsx
│   ├── MessageList.tsx
│   ├── ModelSelector.tsx
│   └── LoadingMessage.tsx
│
├── lib/
│   ├── openrouter.ts
│   ├── prisma.ts
│   └── utils.ts
│
├── prisma/
│   └── schema.prisma
│
├── public/
│
├── .env.local
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

# 10. OpenRouter Client

Create:

```text
lib/openrouter.ts
```

Example:

```ts
import OpenAI from "openai";

export const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});
```

This uses the OpenAI SDK against OpenRouter's OpenAI-compatible endpoint.

---

# 11. Chat API Route

Create:

```text
app/api/chat/route.ts
```

Basic implementation:

```ts
import { openrouter } from "@/lib/openrouter";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const messages = body.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    const completion = await openrouter.chat.completions.create({
      model: process.env.OPENROUTER_MODEL!,
      messages,
    });

    const reply = completion.choices?.[0]?.message?.content ?? "";

    return Response.json({
      reply,
    });
  } catch (error) {
    console.error("OpenRouter error:", error);

    return Response.json(
      { error: "Failed to generate AI response" },
      { status: 500 }
    );
  }
}
```

The browser should call your own endpoint:

```text
POST /api/chat
```

Your Next.js server then calls:

```text
OpenRouter
```

This keeps the OpenRouter secret key away from the browser.

---

# 12. Chat Message Format

A standard conversation can be represented as:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "What is machine learning?"
    },
    {
      "role": "assistant",
      "content": "Machine learning is..."
    },
    {
      "role": "user",
      "content": "Give me a simple example."
    }
  ]
}
```

The main roles are:

```text
system
user
assistant
```

A system message can define the assistant's behavior.

Example:

```json
{
  "role": "system",
  "content": "You are a helpful AI assistant."
}
```

---

# 13. Frontend Chat Flow

The React chat page should work approximately like this:

```text
1. User opens chat page
        ↓
2. User types a message
        ↓
3. Add user message to UI
        ↓
4. Send conversation to /api/chat
        ↓
5. Next.js sends request to OpenRouter
        ↓
6. OpenRouter returns AI response
        ↓
7. Add AI response to UI
```

Example client request:

```ts
const response = await fetch("/api/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    messages,
  }),
});

const data = await response.json();
```

---

# 14. Streaming Responses

For a professional AI chat interface, streaming is recommended.

Without streaming:

```text
User
  ↓
Wait...
  ↓
Complete answer appears
```

With streaming:

```text
User
  ↓
AI starts generating
  ↓
"This"
  ↓
"This is"
  ↓
"This is a"
  ↓
"This is a complete response..."
```

OpenRouter supports streaming via server-sent events (SSE). The API request can use:

```json
{
  "stream": true
}
```

A production implementation should stream data from the Next.js route to the browser instead of waiting for the complete response.

---

# 15. Chat UI Design(Responsive Design)

Recommended layout:

```text
┌────────────────────────────────────────────────────────┐
│ AI Chat                                        ⚙      │
├────────────────┬───────────────────────────────────────┤
│ + New Chat     │                                       │
│                │              AI Assistant              │
│ Chat 1         │                                       │
│ Chat 2         │ User: Explain neural networks         │
│ Chat 3         │                                       │
│ Chat 4         │ AI: Neural networks are...            │
│                │                                       │
│                │                                       │
│ Settings       │───────────────────────────────────────│
│ Profile        │ Type your message...          [Send]  │
└────────────────┴───────────────────────────────────────┘


Desktop Monitor
┌─────────────────────────────────────────────────────────────┐
│ Sidebar │ Header                                            │
│         ├───────────────────────────────────────────────────┤
│         │                                                   │
│         │                  Chat Area                        │
│         │                                                   │
│         │                                                   │
│         ├───────────────────────────────────────────────────┤
│         │                  Chat Input                       │
└─────────────────────────────────────────────────────────────┘

Laptop
┌───────────────────────────────────────────────────┐
│ Sidebar │ Header                                  │
│         ├─────────────────────────────────────────┤
│         │                                         │
│         │              Chat Area                  │
│         │                                         │
│         ├─────────────────────────────────────────┤
│         │              Chat Input                 │
└───────────────────────────────────────────────────┘

Tablet
┌──────────────────────────────────────┐
│ ☰   AI Chat                    ⋯     │
├──────────────────────────────────────┤
│                                      │
│             Chat Area                │
│                                      │
│                                      │
├──────────────────────────────────────┤
│            Chat Input                │
└──────────────────────────────────────┘

Phone
┌────────────────────────────┐
│ ☰  AI Chat            ⋯    │
├────────────────────────────┤
│                            │
│       Chat messages        │
│                            │
│                            │
│                            │
├────────────────────────────┤
│ ＋  Message...        ↑    │
└────────────────────────────┘

Main Chat Area
┌───────────────────────────────────────────────┐
│  ☰ Machine Learning             GPT Model ▼  ⋯│
├───────────────────────────────────────────────┤
│                                               │
│                         User                  │
│                  ┌─────────────────────┐      │
│                  │ Explain CNN         │      │
│                  └─────────────────────┘      │
│                                               │
│ AI                                            │
│ ┌───────────────────────────────────────────┐ │
│ │ Convolutional Neural Networks are...     │ │
│ │                                           │ │
│ │ ```python                                │ │
│ │ model = CNN(...)                         │ │
│ │ ```                                      │ │
│ └───────────────────────────────────────────┘ │
│                                               │
│                    [Copy] [Retry] [Like] ... │
│                                               │
├───────────────────────────────────────────────┤
│        +   Ask anything...             ↑     │
└───────────────────────────────────────────────┘


```

Recommended components:

```text
Sidebar
ChatWindow
MessageList
MessageBubble
ChatInput
ModelSelector
UserMenu
```

---

# 16. Database Design

For persistent chat history, use PostgreSQL.

Recommended entities:

```text
User
  │
  └── Conversation
          │
          └── Message
```

### User

```text
id
name
email
createdAt
updatedAt
```

### Conversation

```text
id
title
userId
createdAt
updatedAt
```

### Message

```text
id
conversationId
role
content
createdAt
```

Optional fields:

```text
model
tokenUsage
finishReason
metadata
```

---

# 17. Example Prisma Schema

```prisma
model User {
  id             String         @id @default(cuid())
  name           String?
  email          String         @unique
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  conversations  Conversation[]
}

model Conversation {
  id          String    @id @default(cuid())
  title       String
  userId      String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages    Message[]
}

model Message {
  id               String       @id @default(cuid())
  conversationId   String
  role             String
  content          String
  createdAt        DateTime     @default(now())

  conversation     Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
}
```

---

# 18. Conversation Features

Each user should be able to:

```text
New Chat
Rename Chat
Delete Chat
Open Chat
Continue Chat
Search Chats
```

Example:

```text
Sidebar
│
├── + New Chat
│
├── Today's Chats
│   ├── Machine Learning
│   ├── Networking Assignment
│   └── Research Ideas
│
├── Older
│   ├── Python Help
│   └── Database Design
│
└── Settings
```

---

# 19. Model Selector

Because OpenRouter supports many models, a model selector can be added.

Example UI:

```text
Model:
[ Select AI Model ▼ ]

- Model A
- Model B
- Model C
```

Store the selected model in the conversation or user settings.

Example API body:

```json
{
  "model": "your-model-slug",
  "messages": []
}
```

Do not assume one model will always be available. Keep model identifiers configurable and verify the current OpenRouter model catalog before deployment.

---

# 20. GitHub Setup

Initialize Git:

```bash
git init
```

Add files:

```bash
git add .
```

Create the first commit:

```bash
git commit -m "Initial AI chat project"
```

Create a GitHub repository, then connect it:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-chat.git
git push -u origin main
```

---

# 21. Protect Secrets from GitHub

Make sure `.gitignore` contains:

```text
node_modules
.next
.env*
```

Never commit:

```text
.env.local
```

Never put:

```text
OPENROUTER_API_KEY
```

inside frontend JavaScript.

If a secret is accidentally pushed to GitHub, revoke/rotate it immediately and replace it with a new key.

---

# 22. Netlify Deployment

### Step 1

Push your application to GitHub.

### Step 2

Open Netlify.

### Step 3

Choose:

```text
Add new project
→ Import an existing project
→ GitHub
```

### Step 4

Select:

```text
ai-chat
```

### Step 5

Deploy the site.

Netlify provides Next.js deployment support, including modern App Router functionality and server-side features through its Next.js integration.

---

# 23. Netlify Environment Variables

In the Netlify project settings, add:

```text
OPENROUTER_API_KEY
OPENROUTER_MODEL
```

Example:

```text
OPENROUTER_API_KEY = sk-or-v1-xxxxxxxx
OPENROUTER_MODEL = your-model-slug
```

Do not put the secret in:

```text
NEXT_PUBLIC_*
```

Only server-side code should read:

```ts
process.env.OPENROUTER_API_KEY
```

After changing environment variables, trigger a new deployment.

---

# 24. Production Environment

The production architecture should be:

```text
Browser
   │
   ▼
Netlify
   │
   ▼
Next.js
   │
   ├──────────────► PostgreSQL
   │
   └──────────────► OpenRouter
```

The user never receives the OpenRouter API key.

---

# 25. Security Requirements

Before production, add:

### API Rate Limiting

Prevent one user from making unlimited requests.

Example policy:

```text
Anonymous users:
5 requests / minute

Authenticated users:
30 requests / minute
```

The actual limits should depend on your cost model and application requirements.

### Input Validation

Validate:

```text
message length
message type
conversation ID
model selection
user permissions
```

### Authentication

Check that users can only access their own conversations.

### Server-Side Secrets

Never expose:

```text
OPENROUTER_API_KEY
DATABASE_URL
AUTH_SECRET
```

to client-side JavaScript.

### Cost Controls

Track:

```text
requests
input tokens
output tokens
estimated cost
model
user
conversation
```

---

# 26. Optional Advanced Features

## File Uploads

Allow users to upload:

```text
PDF
TXT
Images
CSV
Documents
```

The server can then pass supported content to a model that supports the required modality.

OpenRouter documents multimodal requests for supported models, including images and other media types.

---

## Image Understanding

Possible UI:

```text
[ + ] Attach Image

User:
What is shown in this image?

AI:
The image shows...
```

Only use models that support image input.

---

## Voice Input

Possible flow:

```text
Microphone
   ↓
Speech-to-text
   ↓
Chat message
   ↓
OpenRouter
   ↓
AI response
```

---

## AI Model Fallback

A production application can use fallback models so that if a preferred model/provider is unavailable, another configured model can be attempted.

OpenRouter documents model fallback/routing functionality, including fallback configuration.

---

# 27. Suggested API Routes

```text
POST   /api/chat
GET    /api/chats
POST   /api/chats
GET    /api/chats/:id
PATCH  /api/chats/:id
DELETE /api/chats/:id

POST   /api/messages
DELETE /api/messages/:id

GET    /api/models
GET    /api/user
PATCH  /api/user
```

Authentication routes depend on the authentication solution you choose.

---

# 28. Recommended Development Phases

## Phase 1

```text
Next.js
+
Tailwind
+
OpenRouter
```

Deliver:

```text
✓ Chat UI
✓ API route
✓ OpenRouter response
✓ Responsive interface
```

## Phase 2

```text
Conversation state
+
Streaming
+
Markdown
```

Deliver:

```text
✓ Chat history in UI
✓ Streaming tokens
✓ Markdown answers
✓ Code blocks
```

## Phase 3

```text
PostgreSQL
+
Prisma
+
Authentication
```

Deliver:

```text
✓ User accounts
✓ Persistent chats
✓ Database messages
✓ User-specific data
```

## Phase 4

```text
Production deployment
+
Security
+
Monitoring
```

Deliver:

```text
✓ Netlify deployment
✓ Environment variables
✓ Rate limiting
✓ Error handling
✓ Usage tracking
✓ Production domain
```

---

# 29. Example Final User Experience

```text
                    AI CHAT

┌────────────────┬──────────────────────────────────────┐
│ + New Chat     │                                      │
│                │           How can I help?             │
│ Today          │                                      │
│                │  ┌───────────────────────────────┐   │
│ ML Research    │  │ Explain deep learning         │   │
│ Networking     │  └───────────────────────────────┘   │
│ Programming    │                                      │
│                │  AI                                  │
│ Yesterday      │  Deep learning is a subset of...     │
│                │                                      │
│ Old chats      │                                      │
│                │──────────────────────────────────────│
│ Settings       │  Ask anything...              [↑]   │
└────────────────┴──────────────────────────────────────┘
```

---

# 30. Final Stack

```text
Frontend
────────
Next.js
React
TypeScript
Tailwind CSS

Backend
───────
Next.js Route Handlers

AI
──
OpenRouter API

Database
────────
PostgreSQL
Prisma

Authentication
──────────────
Auth.js / suitable authentication provider

Version Control
───────────────
Git
GitHub

Deployment
──────────
Netlify
```

---

# 31. Important OpenRouter Notes

OpenRouter's API is OpenAI-compatible. The standard chat endpoint is:

```text
https://openrouter.ai/api/v1/chat/completions
```

Authentication uses:

```text
Authorization: Bearer $OPENROUTER_API_KEY
```

Streaming can be enabled with:

```json
{
  "stream": true
}
```

OpenRouter-specific headers such as `HTTP-Referer` and `X-Title` are optional and can be used to identify the application in OpenRouter's ecosystem.

Because model availability, pricing, capabilities, and model IDs can change, configure your chosen model through an environment variable rather than hard-coding a model throughout the application.

---

# 32. Development Checklist

```text
[ ] Create Next.js project
[ ] Install OpenAI SDK
[ ] Create OpenRouter API key
[ ] Add .env.local
[ ] Create OpenRouter server client
[ ] Create /api/chat route
[ ] Build chat interface
[ ] Add message state
[ ] Add streaming
[ ] Add Markdown rendering
[ ] Add conversation management
[ ] Add Netlify Database (PostgreSQL)
[ ] Add Prisma
[ ] Add authentication
[ ] Add rate limiting
[ ] Test locally
[ ] Push to GitHub
[ ] Create Netlify project
[ ] Add Netlify environment variables
[ ] Deploy
[ ] Test production API
[ ] Add custom domain
[ ] Monitor usage and errors
```

---


# 33. Where to Host the PostgreSQL Database and File Storage

## Recommended Setup: Netlify Database + Netlify Blobs

For this project, use **Netlify Database** as the managed PostgreSQL database and **Netlify Blobs** for file/object storage. This keeps the infrastructure centered on Netlify while Prisma provides the application database layer.

- **Netlify Database (PostgreSQL)** — users, conversations, messages, usage records, settings, and application metadata
- **Netlify Blobs** — uploaded images, documents, attachments, and other unstructured files
- **Authentication** — use a dedicated authentication solution such as Auth.js or another suitable provider
- **Realtime** — implement only if required by the product; use a suitable realtime service or application architecture rather than adding an unnecessary backend dependency

The recommended production stack is:

```text
GitHub
   │
   ▼
Netlify
   │
   ▼
Next.js
   │
   ├──────────────► Prisma
   │                    │
   │                    ▼
   │             Netlify Database
   │               PostgreSQL
   │                    │
   │                    ├── users
   │                    ├── conversations
   │                    ├── messages
   │                    └── usage
   │
   ├──────────────► Netlify Blobs
   │                    ├── images
   │                    ├── documents
   │                    └── attachments
   │
   └──────────────► OpenRouter API
                        └── AI models
```

### Why Netlify Database?

Netlify Database provides managed PostgreSQL within the Netlify ecosystem. It is a good fit when the application is already deployed on Netlify and you want a simpler infrastructure footprint. Prisma can be used as the ORM to define models, run migrations, and query the PostgreSQL database from server-side Next.js code.

### What goes into PostgreSQL?

Store structured application data such as:

```text
Users
Conversations
Messages
User settings
AI model selections
Usage/token records
Rate-limit records
File metadata
```

### What goes into Netlify Blobs?

Do **not** put large uploaded files directly into PostgreSQL. Store the actual file in Netlify Blobs and keep its metadata/path in PostgreSQL.

Example:

```text
Netlify Blobs
└── chat-files/
    └── user-id/
        ├── image.png
        ├── assignment.pdf
        └── document.docx

Netlify Database
└── attachments
    ├── id
    ├── user_id
    ├── conversation_id
    ├── file_name
    ├── blob_key
    ├── mime_type
    └── created_at
```

### Database Environment Variable

Store the PostgreSQL connection string as a server-side environment variable:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
```

Use the connection string provided for your Netlify Database environment. Never expose `DATABASE_URL` through a `NEXT_PUBLIC_` variable and never commit `.env.local` to GitHub.

### File Storage Configuration

Use server-side authorization and access controls so users can only access files belonging to their own conversations or account. Keep the file key/path in PostgreSQL and the file contents in Netlify Blobs.

A typical logical structure is:

```text
Netlify Blobs
│
└── chat-files
    ├── user-1/
    ├── user-2/
    └── user-3/
```

### Development, Preview, and Production

Use separate database environments/branches for development, preview/staging, and production where supported by your Netlify Database setup:

```text
Netlify Development
        │
        ├── Development database
        └── Development blob storage

Netlify Preview/Staging
        │
        ├── Staging database
        └── Staging blob storage

Netlify Production
        │
        ├── Production database
        └── Production blob storage
```

This helps prevent test data and uploaded development files from mixing with production data.

### Production Database Requirements

```text
✓ SSL/TLS database connection
✓ Strong database credentials
✓ Proper authorization checks
✓ Proper indexes
✓ Prisma migrations
✓ Automatic backups / recovery plan
✓ Separate production environment
✓ Monitoring and logging
✓ Least-privilege access
✓ Usage and storage monitoring
```

### Recommended Final Infrastructure

```text
Frontend + API       → Next.js on Netlify
Source control       → GitHub
AI                   → OpenRouter
Database             → Netlify Database (PostgreSQL)
ORM                  → Prisma
File storage         → Netlify Blobs
Authentication       → Auth.js or another suitable provider
Realtime             → Optional; add only when required
```

Netlify hosts and deploys the Next.js application, Netlify Database hosts the persistent PostgreSQL data, Netlify Blobs stores uploaded files, Prisma provides the database access layer, GitHub stores source code, and OpenRouter provides the AI model API.

---

# 34. References

- OpenRouter API documentation: https://openrouter.ai/docs
- OpenRouter API reference: https://openrouter.ai/docs/api/reference/overview
- OpenRouter model catalog: https://openrouter.ai/models
- Next.js documentation: https://nextjs.org/docs
- Netlify Next.js documentation: https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/
- GitHub documentation: https://docs.github.com/

---

## Project Goal

The final application should be a secure, scalable, ChatGPT-style AI website where:

```text
User
  ↓
Next.js Chat Interface
  ↓
Next.js Server API
  ↓
OpenRouter
  ↓
Selected AI Model
  ↓
Streaming Response
  ↓
User
```

while PostgreSQL stores users, conversations, and messages, GitHub manages the source code, and Netlify handles deployment.
