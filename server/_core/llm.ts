import { ENV } from "./env";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type MessageContent = string | TextContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
};

export type InvokeParams = {
  messages: Message[];
  maxTokens?: number;
  max_tokens?: number;
};

export type InvokeResult = {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: "assistant";
      content: string;
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-sonnet-4-6";

const assertApiKey = () => {
  if (!ENV.anthropicApiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
};

const contentToText = (content: MessageContent | MessageContent[]): string => {
  const parts = Array.isArray(content) ? content : [content];
  return parts
    .map(part => (typeof part === "string" ? part : part.text))
    .join("\n");
};

/**
 * Invoke Claude directly via the Anthropic Messages API.
 * Returns an OpenAI-compatible shape (`choices[0].message.content`)
 * so existing callers don't need to change.
 */
export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  assertApiKey();

  const systemMessages = params.messages.filter(m => m.role === "system");
  const conversationMessages = params.messages.filter(m => m.role !== "system");

  const system = systemMessages.map(m => contentToText(m.content)).join("\n\n") || undefined;

  const messages = conversationMessages.map(m => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: contentToText(m.content),
  }));

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": ENV.anthropicApiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      max_tokens: params.max_tokens ?? params.maxTokens ?? 1024,
      system,
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  const data = await response.json();
  const text = (data.content ?? [])
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("\n");

  return {
    id: data.id,
    model: data.model,
    choices: [
      {
        index: 0,
        message: { role: "assistant", content: text },
        finish_reason: data.stop_reason ?? null,
      },
    ],
    usage: data.usage
      ? {
          prompt_tokens: data.usage.input_tokens,
          completion_tokens: data.usage.output_tokens,
          total_tokens: data.usage.input_tokens + data.usage.output_tokens,
        }
      : undefined,
  };
}
