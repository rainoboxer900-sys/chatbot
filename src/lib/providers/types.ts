export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export interface ChatProvider {
  generateReply(messages: ChatMessage[], model?: string): Promise<string>;
}
