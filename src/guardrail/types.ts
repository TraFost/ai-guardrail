export type Action = "allow" | "block" | "error";

export interface GuardrailInput { message: string }
export interface CoreCheck { passed: boolean; blocked: boolean; reasons: string[]; latencyMs: number; raw: unknown }
export interface GuardrailResult {
  allowed: boolean;
  action: Action;
  checks: { core?: CoreCheck };
  reasons: string[];
  latencyMs: number;
  error?: string;
}
export interface GuardrailPolicy {
  name: string;
  domain: { description: string; allowedTopics: string[]; allowConversationalMessages: boolean };
  tools: string[];
}
