export type Action = "allow" | "block" | "error";

export interface GuardrailInput { message: string }
export interface CoreCheck { passed: boolean; blocked: boolean; reasons: string[]; latencyMs: number; raw: unknown }
export interface SemanticCheck {
  domainRelevance: number;
  agentManipulation: number;
  restrictedInformation: number;
  latencyMs: number;
  raw: unknown;
}
export interface GuardrailResult {
  allowed: boolean;
  action: Action;
  checks: { core?: CoreCheck; semantic?: SemanticCheck };
  reasons: string[];
  latencyMs: number;
  error?: string;
}
export interface GuardrailPolicy {
  name: string;
  domain: { description: string; allowedTopics: string[]; allowConversationalMessages: boolean };
  semanticChecks: { domainRelevance: boolean; manipulation: boolean; restrictedInformation: boolean };
  thresholds: { minimumDomainRelevance: number; manipulation: number; restrictedInformation: number };
}
