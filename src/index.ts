import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { runAgent } from "./agent/openrouter.js";
import { createGuardrail } from "./guardrail/index.js";
import { xenaPolicy } from "./policies/xena.js";

const guard = createGuardrail({ policy: xenaPolicy });
const rl = readline.createInterface({ input, output });
try {
  for (;;) {
    const message = await rl.question("> ");
    if (["exit", "quit"].includes(message.trim().toLowerCase())) break;
    const result = await guard.validateInput({ message });
    console.dir({ guardrail: result }, { depth: null });
    if (!result.allowed) { console.log("OpenRouter: NOT CALLED"); continue; }
    console.log("Calling OpenRouter...");
    try { console.dir(await runAgent(message)); } catch (error) { console.error("OpenRouter error:", error instanceof Error ? error.message : error); }
  }
} finally { rl.close(); await guard.close(); }
