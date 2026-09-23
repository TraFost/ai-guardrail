import { CoreGuard } from "./core.js";
import type { GuardrailInput, GuardrailPolicy, GuardrailResult } from "./types.js";

export { type GuardrailInput, type GuardrailPolicy, type GuardrailResult } from "./types.js";

export function createGuardrail({ policy }: { policy: GuardrailPolicy }) {
  const core = new CoreGuard();
  return {
    close: async () => undefined,
    async validateInput({ message }: GuardrailInput): Promise<GuardrailResult> {
      const started = performance.now();
      try {
        const coreResult = await core.checkInput(message);
        const reasons = coreResult.reasons.map((reason) => `core:${reason}`);
        return { allowed: reasons.length === 0, action: reasons.length ? "block" : "allow", checks: { core: coreResult }, reasons, latencyMs: performance.now() - started };
      } catch (error) {
        return { allowed: false, action: "error", checks: {}, reasons: ["guardrail_failure"], latencyMs: performance.now() - started, error: error instanceof Error ? error.message : String(error) };
      }
    },
    async validateToolCall({ message, toolName, arguments: args }: { message: string; toolName: string; arguments: unknown }): Promise<GuardrailResult> {
      const started = performance.now();
      try {
        if (!policy.tools.includes(toolName)) return { allowed: false, action: "block", checks: {}, reasons: ["tool_not_allowed"], latencyMs: performance.now() - started };
        return { allowed: true, action: "allow", checks: {}, reasons: [], latencyMs: performance.now() - started };
      } catch (error) { return { allowed: false, action: "error", checks: {}, reasons: ["guardrail_failure"], latencyMs: performance.now() - started, error: error instanceof Error ? error.message : String(error) }; }
    },
    async validateOutput({ message }: GuardrailInput): Promise<GuardrailResult> {
      const started = performance.now();
      try {
        const coreResult = await core.checkOutput(message);
        const reasons = coreResult.reasons.map((reason) => `core:${reason}`);
        return { allowed: reasons.length === 0, action: reasons.length ? "block" : "allow", checks: { core: coreResult }, reasons, latencyMs: performance.now() - started };
      } catch (error) { return { allowed: false, action: "error", checks: {}, reasons: ["guardrail_failure"], latencyMs: performance.now() - started, error: error instanceof Error ? error.message : String(error) }; }
    },
  };
}
