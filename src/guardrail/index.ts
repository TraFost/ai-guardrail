import { CoreGuard } from "./core.js";
import { LayaGuard } from "./laya.js";
import { decide } from "./policy.js";
import type { GuardrailInput, GuardrailPolicy, GuardrailResult } from "./types.js";

export { type GuardrailInput, type GuardrailPolicy, type GuardrailResult } from "./types.js";

export function createGuardrail({ policy }: { policy: GuardrailPolicy }) {
  const core = new CoreGuard();
  const laya = new LayaGuard();
  return {
    modelLoadLatencyMs: () => laya.loadLatencyMs,
    close: () => laya.close(),
    async validateInput({ message }: GuardrailInput): Promise<GuardrailResult> {
      const started = performance.now();
      try {
        const coreResult = await core.checkInput(message);
        const semantic = await laya.check(message, policy);
        const reasons = decide(coreResult, semantic, policy);
        return { allowed: reasons.length === 0, action: reasons.length ? "block" : "allow", checks: { core: coreResult, semantic }, reasons, latencyMs: performance.now() - started };
      } catch (error) {
        return { allowed: false, action: "error", checks: {}, reasons: ["guardrail_failure"], latencyMs: performance.now() - started, error: error instanceof Error ? error.message : String(error) };
      }
    },
  };
}
