## Plan: Build Secure AI Chat MVP

Build a fresh Next.js App Router application in this empty workspace, starting with a responsive browser-based chat experience and a server-side provider boundary. The first release will use non-streaming responses, browser-only conversation persistence, OpenRouter as the active provider, and a configurable model. Haimaker remains deferred until its official API contract is supplied.

**Steps**

### Phase 0: Security and workspace preparation
1. Revoke/rotate the exposed OpenRouter and Haimaker credentials from `README.md` before using either value. Treat both as compromised.
2. Redact the credential values from `README.md`; document placeholders and the rule that provider secrets must never use `NEXT_PUBLIC_` names.
3. Initialize the repository as a Next.js project in the current workspace using TypeScript, ESLint, Tailwind CSS, App Router, and a `src/` directory if the chosen current `create-next-app` prompts support it. Preserve the two brief documents and avoid overwriting user-authored content.
4. Confirm the generated `.gitignore` excludes `.env*` files except any intentionally committed example template.

### Phase 1: Configuration and provider boundary
5. Add `.env.example` with `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, and optional site metadata placeholders. Keep the real values only in local `.env.local` or deployment settings.
6. Add a typed provider contract under `src/lib/providers/` that accepts normalized chat messages and returns a normalized assistant reply. Keep provider-specific SDK/request details behind the adapter.
7. Implement the OpenRouter adapter using the OpenAI-compatible API endpoint and server-only environment variables. Validate missing configuration with actionable server errors. Do not add key rotation or quota evasion behavior.
8. Leave a documented extension point for another provider, but do not invoke `@haimaker/connect` or include an unverified Haimaker integration.

### Phase 2: Server route
9. Add `src/app/api/chat/route.ts` as the only browser-facing AI endpoint. Validate the request body, message roles/content, message count/size limits, and configured model before calling the provider.
10. Return a stable JSON response for successful replies and sanitized error responses for invalid input, provider failures, and missing configuration. Log diagnostic details only on the server.
11. Add a narrow route/provider test or executable validation for valid input, invalid input, missing configuration, and provider failure behavior, using mocks rather than real credentials.

### Phase 3: Chat UI
12. Replace the starter page with the actual chat workflow: a responsive layout, conversation list/new-chat action, message transcript, empty state, text input, send action, disabled/loading state, and visible error recovery.
13. Keep the UI componentized around the local ownership boundaries described in the brief: sidebar/history, chat window, message list/bubble, input, and loading state. Use existing Tailwind conventions and accessible labels/keyboard behavior.
14. Implement browser-only conversation state with stable conversation IDs and localStorage persistence. Support creating a new conversation and retaining messages after reload, but do not claim cross-device or account persistence.
15. Display assistant replies as plain text in this phase. Defer Markdown, code rendering, streaming, stop generation, regenerate, rename/delete, authentication, database persistence, uploads, usage tracking, admin features, and analytics to later phases unless explicitly expanded.
16. Add client-side request cancellation where practical so navigation/new-chat does not leave stale responses attached to the wrong conversation.

### Phase 4: Verification and documentation
17. Run formatting/lint/type checks and the focused route/UI tests. Start the development server and manually verify first load, empty state, successful send, loading state, invalid/error response, new chat, reload persistence, mobile layout, and that no secret appears in browser bundles or rendered output.
18. Update `README.md` with setup commands, environment-variable instructions, the selected architecture, local run command, test command, and explicit next-phase boundaries.
19. Add a deployment follow-up for GitHub and Netlify: configure server-side environment variables in Netlify, set the production site URL metadata, verify the build, and never commit `.env.local` or provider keys. Do not provision PostgreSQL/Prisma until persistent authenticated conversations are approved.

**Relevant files**
- `/Users/alviarman/ALVI/projects/all_projects/chatbot/AI_Chat_Website_OpenRouter_NextJS_GitHub_Netlify.md` — source brief and phased feature requirements; preserve as reference.
- `/Users/alviarman/ALVI/projects/all_projects/chatbot/README.md` — redact exposed credentials, then replace the note with safe setup and project documentation.
- `/Users/alviarman/ALVI/projects/all_projects/chatbot/package.json` — generated scripts and dependencies.
- `/Users/alviarman/ALVI/projects/all_projects/chatbot/.env.example` — safe configuration template only.
- `/Users/alviarman/ALVI/projects/all_projects/chatbot/src/app/api/chat/route.ts` — request validation and provider invocation.
- `/Users/alviarman/ALVI/projects/all_projects/chatbot/src/lib/providers/` — provider interface, normalized types, and OpenRouter adapter.
- `/Users/alviarman/ALVI/projects/all_projects/chatbot/src/app/page.tsx` and nearby `src/components/` files — responsive chat workflow and state integration.
- `/Users/alviarman/ALVI/projects/all_projects/chatbot/src/app/globals.css` — global visual treatment consistent with the generated Tailwind setup.

**Verification**
1. Run the project lint and type checks, plus focused tests for the chat route/provider boundary.
2. Run the development server and exercise the complete MVP flow in a desktop and mobile viewport.
3. Inspect the browser network payload and built client output to confirm `OPENROUTER_API_KEY` never reaches the client.
4. Test with missing/invalid environment variables and provider errors to confirm sanitized failures.
5. Check `git status` and secret scanning/search before any GitHub push; only `.env.example` may contain placeholder names/values.
6. For deployment, configure Netlify environment variables and run a production build/deploy smoke test after local checks pass.

**Decisions**
- Initial scope is MVP only.
- OpenRouter is the only active provider; the code has an adapter boundary for future providers.
- Haimaker is deferred; its exposed key is not reused, and its package is not executed.
- No automated multi-key rotation is included because quota circumvention may violate provider terms and is not a dependable failover design.
- The default model remains configuration-driven and must be supplied by the user before live API testing.
- Conversations persist in the browser only for the first release.
- Streaming is deferred; responses are returned as complete JSON payloads.
- PostgreSQL, Prisma, authentication, uploads, and production account features are explicitly out of the first implementation.

**Further Considerations**
1. Before live testing, supply a currently valid OpenRouter model slug and a newly rotated credential through `.env.local` or the deployment dashboard.
2. Before adding a second provider, confirm its official API docs, terms, request/response contract, authentication method, and authorized fallback behavior.
3. After the MVP is stable, the next coherent increment is streaming plus Markdown and conversation rename/delete before adding auth and database persistence.
