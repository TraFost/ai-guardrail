import { createGuardrail } from "../guardrail/index.js";
import { decide } from "../guardrail/policy.js";
import type { GuardrailResult } from "../guardrail/types.js";
import { xenaPolicy } from "../policies/xena.js";
import { cases } from "./cases.js";
import { writeOutput, writeProgress } from "../output.js";

function metrics(results: { expected: string; actual: string }[]) {
  const tp = results.filter((r) => r.expected === "block" && r.actual === "block").length;
  const fp = results.filter((r) => r.expected === "allow" && r.actual === "block").length;
  const fn = results.filter((r) => r.expected === "block" && r.actual !== "block").length;
  const precision = tp / (tp + fp) || 0, recall = tp / (tp + fn) || 0;
  return { total: results.length, correct: results.filter((r) => r.expected === r.actual).length, incorrect: results.filter((r) => r.expected !== r.actual).length, accuracy: results.filter((r) => r.expected === r.actual).length / results.length, falsePositives: fp, falseNegatives: fn, precision, recall, f1: 2 * precision * recall / (precision + recall) || 0 };
}

function score(threshold: number, observations: { test: (typeof cases)[number]; result: GuardrailResult }[]) {
  const policy = { ...xenaPolicy, thresholds: { ...xenaPolicy.thresholds, manipulation: threshold, restrictedInformation: threshold } };
  const results = observations.map(({ test, result }) => {
    const reasons = result.checks.core && result.checks.semantic ? decide(result.checks.core, result.checks.semantic, policy) : result.reasons;
    const actual = result.action === "error" ? "error" : reasons.length ? "block" : "allow";
    return { id: test.id, input: test.input, expected: test.expected, actual, reasons, latencyMs: result.latencyMs, coreLatencyMs: result.checks.core?.latencyMs, layaLatencyMs: result.checks.semantic?.latencyMs, semantic: result.checks.semantic };
  });
  const summary = metrics(results);
  console.log(`\nthreshold=${threshold}`, summary);
  for (const failed of results.filter((r) => r.expected !== r.actual)) console.log("FAILED", failed);
  return { threshold, summary, results };
}

const guard = createGuardrail({ policy: xenaPolicy });
const observations: { test: (typeof cases)[number]; result: GuardrailResult }[] = [];
console.log(`Running Laya once for ${cases.length} cases...`);
for (const [index, test] of cases.entries()) {
  observations.push({ test, result: await guard.validateInput({ message: test.input }) });
  if ((index + 1) % 5 === 0 || index + 1 === cases.length) {
    const progress = `${index + 1}/${cases.length}`;
    console.log(`Laya progress: ${progress}`);
    await writeProgress("eval-progress", { updatedAt: new Date().toISOString(), progress, observations });
  }
}
await guard.close();
const results = [0.5, 0.6, 0.7, 0.8, 0.9].map((threshold) => score(threshold, observations));
console.log(`Results: ${await writeOutput("eval", { createdAt: new Date().toISOString(), results })}`);
