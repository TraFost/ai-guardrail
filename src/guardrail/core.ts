import { GuardrailEngine } from "@llm-guardrails/core";
import type { CoreCheck } from "./types.js";

export class CoreGuard {
  private readonly engine = new GuardrailEngine({
    guards: [{ name: "injection" }, { name: "secrets" }, { name: "leakage" }],
    prefilterMode: true,
    failMode: { mode: "closed", perGuard: { injection: "closed", secrets: "closed", leakage: "closed" } },
  });

  async checkInput(message: string): Promise<CoreCheck> {
    const started = performance.now();
    const result = await this.engine.checkInput(message);
    return { passed: result.passed, blocked: result.blocked, reasons: result.results.filter((item) => item.blocked).map((item) => item.reason ?? "core_guard"), latencyMs: performance.now() - started, raw: result };
  }
}
