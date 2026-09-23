# Portable Guardrail PoC

Node 20+ TypeScript proof of concept for a reusable pre-agent guardrail. XENA is only a policy; the engine has no XENA dependency.

```text
User → Combined Guardrail ┬→ @llm-guardrails/core (injection, secrets, leakage)
                          └→ Laya multilingual (local semantic decisions)
     → Policy decision → ALLOW / BLOCK → OpenRouter agent (only for ALLOW)
```

`@llm-guardrails/core` supplies fast deterministic checks. Laya supplies batched local semantic probabilities for domain relevance, manipulation, and restricted-information requests. OpenRouter is strictly downstream and is never used as a judge.

Input and output use deterministic core checks. Tool names and arguments are validated deterministically before execution. Laya remains installed for later experiments but is not on the active request path. The test agent can search vehicles, simulate installments, and find showrooms.

## Run

```sh
npm run cli
npm run cli -- "Cari Toyota untuk cicilan maksimal 5 juta per bulan"
npm run eval
```

The CLI asks for a question when no argument is supplied. Press Enter to use its automotive-budget fallback. Allowed requests call OpenRouter automatically.

The supplied `.env` points at `models/laya-multilingual-onnx`, exported from the official `convaiinnovations/laya-multilingual` checkpoint using Receptron's exporter. Fill `OPENROUTER_API_KEY` only to let allowed CLI requests reach the downstream test agent. Allow roughly 2 GB RAM. The first load is reported by the guard object; each result reports core, Laya, and combined latencies. OpenRouter latency is kept separate.

See [the local Laya installation guide](docs/local-laya-model.md) for the full export and verification process.

Each CLI session and evaluation run writes a timestamped JSON result to `temp/output/`.

The eval has 55 Indonesian, English, and mixed-language cases, including informal Indonesian automotive requests. It runs Laya once per case, then scores thresholds 0.50–0.90 from the recorded probabilities. It prints progress and updates `temp/output/eval-progress.json` every five cases before writing the final report. Tune `xenaPolicy.thresholds` only after inspecting failures, accuracy, false positives/negatives, block precision, recall, and F1.

To add another product, create a policy matching `GuardrailPolicy` and call `createGuardrail({ policy })`. Move `src/guardrail` into XENA unchanged; retain product behavior in `src/policies/xena.ts`.

Guardrail load/inference/core failures return `action: "error"` and block the downstream call. There is intentionally no fail-open fallback.
