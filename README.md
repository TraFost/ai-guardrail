# Portable Guardrail PoC

Node 20+ TypeScript proof of concept for a reusable pre-agent guardrail. XENA is only a policy; the engine has no XENA dependency.

```text
User → Combined Guardrail ┬→ @llm-guardrails/core (injection, secrets, leakage)
                          └→ Laya multilingual (local semantic decisions)
     → Policy decision → ALLOW / BLOCK → OpenRouter agent (only for ALLOW)
```

`@llm-guardrails/core` supplies fast deterministic checks. Laya supplies batched local semantic probabilities for domain relevance, manipulation, and restricted-information requests. OpenRouter is strictly downstream and is never used as a judge.

## Run

```sh
cp .env.example .env # fill OPENROUTER_API_KEY to call the test agent
npm run cli
npm run eval
```

Laya downloads the multilingual ONNX model once (about 1.7 GB) and caches it at `~/.cache/receptron-laya`; set `LAYA_MODEL_DIR` to a local bundle to avoid downloading. Allow roughly 2 GB RAM. The first load is reported by the guard object; each result reports core, Laya, and combined latencies. OpenRouter latency is kept separate.

The eval has 40 Indonesian, English, and mixed-language cases. It runs thresholds 0.50–0.90, prints all failures, and reports accuracy, false positives/negatives, block precision, recall, and F1. Tune `xenaPolicy.thresholds` only after inspecting those failures.

To add another product, create a policy matching `GuardrailPolicy` and call `createGuardrail({ policy })`. Move `src/guardrail` into XENA unchanged; retain product behavior in `src/policies/xena.ts`.

Guardrail load/inference/core failures return `action: "error"` and block the downstream call. There is intentionally no fail-open fallback.
