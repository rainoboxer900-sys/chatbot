"use client";

import { Children, FormEvent, isValidElement, startTransition, useEffect, useRef, useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DEFAULT_GOOGLE_MODEL, GOOGLE_MODELS } from "@/lib/providers/models";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
};

type AuthState = {
  configured: boolean;
  authenticated: boolean;
  user?: { name: string; email: string; picture: string | null };
};

const STORAGE_KEY = "ai-chat-conversations";
const INITIAL_MESSAGE = "Ask me anything. I will keep this conversation in your browser.";

function createConversation(): Conversation {
  return {
    id: crypto.randomUUID(),
    title: "New conversation",
    messages: [],
    updatedAt: Date.now(),
  };
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp);
}

function CodeBlock({ children }: { children?: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const codeElement = Children.toArray(children)[0];
  const language = isValidElement<{ className?: string }>(codeElement)
    ? codeElement.props.className?.replace("language-", "") ?? "text"
    : "text";
  const code = isValidElement<{ children?: ReactNode }>(codeElement)
    ? String(codeElement.props.children ?? "")
    : String(codeElement ?? "");

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="code-block">
      <div className="code-toolbar">
        <span>{language}</span>
        <button type="button" onClick={copyCode}>{copied ? "Copied" : "Copy code"}</button>
      </div>
      <pre>{children}</pre>
    </div>
  );
}

function AssistantMessage({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  async function copyMessage() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <>
      <div className="markdown-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noreferrer">
                {children}
              </a>
            ),
            pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
            code: ({ className, children, ...props }) => {
              const isBlock = Boolean(className);
              return isBlock ? (
                <code className={className} {...props}>{children}</code>
              ) : (
                <code className="inline-code" {...props}>{children}</code>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
      <div className="message-actions">
        <button type="button" className="message-action" onClick={copyMessage} aria-label="Copy response">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </>
  );
}

export default function ChatApp() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState("");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_GOOGLE_MODEL);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [auth, setAuth] = useState<AuthState>({ configured: false, authenticated: false });
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeConversation = conversations.find((conversation) => conversation.id === activeId);

  useEffect(() => {
    startTransition(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        const parsed = saved ? (JSON.parse(saved) as Conversation[]) : [];
        const restored = Array.isArray(parsed) && parsed.length > 0 ? parsed : [createConversation()];
        setConversations(restored);
        setActiveId(restored[0].id);
      } catch {
        const initial = createConversation();
        setConversations([initial]);
        setActiveId(initial.id);
      }
    });
  }, []);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((response) => response.json() as Promise<AuthState>)
      .then(setAuth)
      .catch(() => setAuth({ configured: false, authenticated: false }));
  }, []);

  useEffect(() => {
    if (conversations.length > 0) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    }
  }, [conversations]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  function selectConversation(id: string) {
    abortRef.current?.abort();
    setIsLoading(false);
    setError("");
    setActiveId(id);
    setIsSidebarOpen(false);
  }

  function deleteConversation(id: string) {
    abortRef.current?.abort();
    setIsLoading(false);
    setError("");

    setConversations((current) => {
      const remaining = current.filter((conversation) => conversation.id !== id);
      const nextConversations = remaining.length > 0 ? remaining : [createConversation()];

      if (id === activeId) {
        setActiveId(nextConversations[0].id);
      }

      return nextConversations;
    });
  }

  function clearHistory() {
    abortRef.current?.abort();
    const initial = createConversation();
    setConversations([initial]);
    setActiveId(initial.id);
    setInput("");
    setError("");
    setIsLoading(false);
  }

  function handleNewConversation() {
    abortRef.current?.abort();
    const next = createConversation();
    setConversations((current) => [next, ...current]);
    setActiveId(next.id);
    setInput("");
    setError("");
    setIsLoading(false);
    setIsSidebarOpen(false);
    window.setTimeout(() => textareaRef.current?.focus(), 0);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = input.trim();

    if (!content || !activeConversation || isLoading) {
      return;
    }

    const conversationId = activeConversation.id;
    const userMessage: Message = { role: "user", content };
    const messagesForRequest = [...activeConversation.messages, userMessage];

    setInput("");
    setError("");
    setIsLoading(true);
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              title: conversation.messages.length === 0 ? content.slice(0, 42) : conversation.title,
              messages: messagesForRequest,
              updatedAt: Date.now(),
            }
          : conversation,
      ),
    );

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messagesForRequest, model: selectedModel }),
        signal: controller.signal,
      });
      const data = (await response.json()) as { reply?: string; error?: string };

      if (!response.ok || !data.reply) {
        throw new Error(data.error ?? "The AI service could not respond.");
      }

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                messages: [...messagesForRequest, { role: "assistant", content: data.reply! }],
                updatedAt: Date.now(),
              }
            : conversation,
        ),
      );
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") {
        return;
      }
      setError(requestError instanceof Error ? requestError.message : "Something went wrong. Try again.");
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setIsLoading(false);
      }
    }
  }

  return (
    <main className="chat-shell">
      <aside className={`sidebar ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <div className="brand-mark" aria-hidden="true">A</div>
          <div>
            <p className="eyebrow">Personal AI workspace</p>
            <h1>AlvionBot</h1>
          </div>
          <button className="icon-button mobile-close" type="button" onClick={() => setIsSidebarOpen(false)} aria-label="Close conversation list">×</button>
        </div>
        <button className="new-chat-button" type="button" onClick={handleNewConversation}>
          <span aria-hidden="true">+</span>
          New conversation
        </button>
        <div className="conversation-section">
          <p className="section-label">Recent conversations</p>
          <nav aria-label="Conversations" className="conversation-list">
            {conversations.map((conversation) => (
              <div
                className={`conversation-item ${conversation.id === activeId ? "conversation-active" : ""}`}
                key={conversation.id}
              >
                <button className="conversation-select" type="button" onClick={() => selectConversation(conversation.id)}>
                  <span className="conversation-dot" aria-hidden="true" />
                  <span className="conversation-copy">
                    <strong>{conversation.title}</strong>
                    <small>{conversation.messages.length ? `${conversation.messages.length} messages` : "Empty conversation"}</small>
                  </span>
                  <time dateTime={new Date(conversation.updatedAt).toISOString()}>{formatTime(conversation.updatedAt)}</time>
                </button>
                <button
                  className="conversation-delete"
                  type="button"
                  title={`Delete ${conversation.title}`}
                  aria-label={`Delete ${conversation.title}`}
                  onClick={() => deleteConversation(conversation.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </nav>
        </div>
        <div className="sidebar-footer">
          <span className="status-dot" aria-hidden="true" />
          <span>Local history enabled</span>
          <button className="clear-history-button" type="button" onClick={clearHistory}>Clear</button>
        </div>
        <div className="account-area">
          {auth.authenticated && auth.user ? (
            <>
              <div className="account-avatar" aria-hidden="true">{auth.user.name.slice(0, 1).toUpperCase()}</div>
              <div className="account-copy"><strong>{auth.user.name}</strong><small>Saved account</small></div>
              <a className="account-action" href="/auth/logout">Sign out</a>
            </>
          ) : (
            <>
              <div className="account-avatar account-guest" aria-hidden="true">?</div>
              <div className="account-copy"><strong>Guest mode</strong><small>History stays in browser</small></div>
              {auth.configured && <a className="account-action" href="/auth/login">Sign in</a>}
            </>
          )}
        </div>
      </aside>

      {isSidebarOpen && <button className="sidebar-scrim" type="button" onClick={() => setIsSidebarOpen(false)} aria-label="Close conversation list" />}

      <section className="chat-panel">
        <header className="chat-header">
          <button className="icon-button menu-button" type="button" onClick={() => setIsSidebarOpen(true)} aria-label="Open conversation list">☰</button>
          <div>
            <p className="eyebrow">Conversation</p>
            <h2>{activeConversation?.title ?? "New conversation"}</h2>
          </div>
          <div className="header-controls">
            <div className="model-selector">
              <button
                className="model-trigger"
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isModelMenuOpen}
                onClick={() => setIsModelMenuOpen((open) => !open)}
              >
                <span>Default</span>
                <span className="model-chevron" aria-hidden="true">⌄</span>
              </button>
              {isModelMenuOpen && (
                <div className="model-menu" role="listbox" aria-label="Choose a model">
                  {GOOGLE_MODELS.map((model) => (
                    <button
                      className={`model-option ${model.id === selectedModel ? "model-option-active" : ""} ${!model.available ? "model-option-disabled" : ""}`}
                      key={model.id}
                      type="button"
                      role="option"
                      aria-selected={model.id === selectedModel}
                      disabled={!model.available}
                      onClick={() => {
                        setSelectedModel(model.id);
                        setIsModelMenuOpen(false);
                      }}
                    >
                      <span className="model-check" aria-hidden="true">{model.id === selectedModel ? "✓" : ""}</span>
                      <span className="model-option-copy"><strong>{model.label}</strong><small>{model.description}</small></span>
                      <span className="model-badge">{model.available ? model.badge : "In next update"}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="header-status"><span className="status-dot" aria-hidden="true" /> Ready</div>
          </div>
        </header>

        <div className="message-area" aria-live="polite">
          {activeConversation?.messages.length ? (
            <div className="message-list">
              {activeConversation.messages.map((message, index) => (
                <article className={`message-row message-${message.role}`} key={`${message.role}-${index}`}>
                  <div className="message-avatar" aria-hidden="true">{message.role === "user" ? "YOU" : "A"}</div>
                  <div className="message-body">
                    <div className="message-meta"><strong>{message.role === "user" ? "You" : "Signal"}</strong><span>{message.role === "assistant" ? "Assistant" : "Message"}</span></div>
                    {message.role === "assistant" ? <AssistantMessage content={message.content} /> : <p>{message.content}</p>}
                  </div>
                </article>
              ))}
              {isLoading && <div className="message-row message-assistant"><div className="message-avatar" aria-hidden="true">A</div><div className="message-body"><div className="message-meta"><strong>AlvionBot</strong><span>Thinking</span></div><div className="typing-indicator" aria-label="Assistant is thinking"><span /><span /><span /></div></div></div>}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-orbit" aria-hidden="true"><span>✦</span></div>
              <p className="eyebrow">A clear place to think</p>
              <h3>Start a conversation</h3>
              <p>{INITIAL_MESSAGE}</p>
              <div className="suggestion-row" aria-hidden="true"><span>Summarize an idea</span><span>Explore a question</span></div>
            </div>
          )}
        </div>

        <div className="composer-wrap">
          {error && <div className="error-banner" role="alert"><strong>Could not send.</strong> {error}<button type="button" onClick={() => setError("")}>Dismiss</button></div>}
          <form className="composer" onSubmit={handleSubmit}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder="Write a message..."
              aria-label="Message"
              rows={1}
              disabled={isLoading}
            />
            <button className="send-button" type="submit" disabled={!input.trim() || isLoading} aria-label="Send message">↑</button>
          </form>
          <p className="composer-note">Responses use your configured provider. Conversations stay in this browser.</p>
        </div>
      </section>
    </main>
  );
}
