import { GuardrailEngine } from "@llm-guardrails/core";
import type { CoreCheck } from "./types.js";

export class CoreGuard {
  private readonly input = new GuardrailEngine({
    guards: [{ name: "injection" }, { name: "secrets" }, { name: "leakage" }],
    prefilterMode: true,
    failMode: { mode: "closed", perGuard: { injection: "closed", secrets: "closed", leakage: "closed" } },
  });
  private readonly output = new GuardrailEngine({ guards: [{ name: "secrets" }, { name: "leakage" }], prefilterMode: true, failMode: { mode: "closed", perGuard: { secrets: "closed", leakage: "closed" } } });

  async checkInput(message: string): Promise<CoreCheck> {
    const started = performance.now();
    const result = await this.input.checkInput(message);
    return { passed: result.passed, blocked: result.blocked, reasons: result.results.filter((item) => item.blocked).map((item) => item.reason ?? "core_guard"), latencyMs: performance.now() - started, raw: result };
  }

  async checkOutput(message: string): Promise<CoreCheck> {
    const started = performance.now();
    const result = await this.output.checkOutput(message);
    return { passed: result.passed, blocked: result.blocked, reasons: result.results.filter((item) => item.blocked).map((item) => item.reason ?? "core_guard"), latencyMs: performance.now() - started, raw: result };
  }
}
