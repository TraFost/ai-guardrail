import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { runAgent } from "./agent/openrouter.js";
import { createGuardrail } from "./guardrail/index.js";
import { writeOutput } from "./output.js";
import { xenaPolicy } from "./policies/xena.js";

const fallbackQuestion = "Budget gue maksimal 5 juta per bulan, Toyota apa yang cocok?";
const providedQuestion = process.argv.slice(2).join(" ").trim();
const rl = readline.createInterface({ input, output });
const question = providedQuestion || (await rl.question(`What's your question?: `)).trim() || fallbackQuestion;
const guard = createGuardrail({ policy: xenaPolicy });

try {
  const guardrail = await guard.validateInput({ message: question });
  console.dir({ question, guardrail }, { depth: null });
  if (!guardrail.allowed) {
    console.log("OpenRouter: NOT CALLED");
    console.log(`Results: ${await writeOutput("cli", { createdAt: new Date().toISOString(), question, guardrail, openRouter: "not_called" })}`);
  } else {
    console.log("Calling OpenRouter...");
    try {
      const openRouter = await runAgent(question);
      console.dir(openRouter);
      console.log(`Results: ${await writeOutput("cli", { createdAt: new Date().toISOString(), question, guardrail, openRouter })}`);
    } catch (error) {
      const openRouter = { error: error instanceof Error ? error.message : String(error) };
      console.error("OpenRouter error:", openRouter.error);
      console.log(`Results: ${await writeOutput("cli", { createdAt: new Date().toISOString(), question, guardrail, openRouter })}`);
    }
  }
} finally {
  rl.close();
  await guard.close();
}
