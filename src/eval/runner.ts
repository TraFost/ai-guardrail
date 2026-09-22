import { createGuardrail } from "../guardrail/index.js";
import { xenaPolicy } from "../policies/xena.js";
import { cases } from "./cases.js";

function metrics(results: { expected: string; actual: string }[]) {
  const tp = results.filter((r) => r.expected === "block" && r.actual === "block").length;
  const fp = results.filter((r) => r.expected === "allow" && r.actual === "block").length;
  const fn = results.filter((r) => r.expected === "block" && r.actual !== "block").length;
  const precision = tp / (tp + fp) || 0, recall = tp / (tp + fn) || 0;
  return { total: results.length, correct: results.filter((r) => r.expected === r.actual).length, incorrect: results.filter((r) => r.expected !== r.actual).length, accuracy: results.filter((r) => r.expected === r.actual).length / results.length, falsePositives: fp, falseNegatives: fn, precision, recall, f1: 2 * precision * recall / (precision + recall) || 0 };
}

async function run(threshold: number) {
  const policy = { ...xenaPolicy, thresholds: { ...xenaPolicy.thresholds, manipulation: threshold, restrictedInformation: threshold } };
  const guard = createGuardrail({ policy });
  const results = [] as { id: string; input: string; expected: string; actual: string; reasons: string[]; latencyMs: number; coreLatencyMs?: number; layaLatencyMs?: number; semantic?: unknown }[];
  for (const test of cases) {
    const result = await guard.validateInput({ message: test.input });
    results.push({ id: test.id, input: test.input, expected: test.expected, actual: result.action, reasons: result.reasons, latencyMs: result.latencyMs, coreLatencyMs: result.checks.core?.latencyMs, layaLatencyMs: result.checks.semantic?.latencyMs, semantic: result.checks.semantic });
  }
  await guard.close();
  const summary = metrics(results);
  console.log(`\nthreshold=${threshold}`, summary);
  for (const failed of results.filter((r) => r.expected !== r.actual)) console.log("FAILED", failed);
}

for (const threshold of [0.5, 0.6, 0.7, 0.8, 0.9]) await run(threshold);
