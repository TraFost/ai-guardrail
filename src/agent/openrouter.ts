import OpenAI from "openai";
import { runTool, tools, validateToolArgs } from "./tools.js";

const system = "You are XENA, a helpful Indonesian automotive sales assistant. Help customers choose vehicles, explain specifications, financing, promotions, and showroom visits.";
type Guard = { validateToolCall(input: { message: string; toolName: string; arguments: unknown }): Promise<{ allowed: boolean }>; validateOutput(input: { message: string }): Promise<{ allowed: boolean; reasons: string[] }> };
export async function runAgent(message: string, guard: Guard): Promise<{ text: string; latencyMs: number; tools: string[] }> {
  if (!process.env.OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is required to call the downstream agent");
  const started = performance.now();
  const client = new OpenAI({ apiKey: process.env.OPENROUTER_API_KEY, baseURL: "https://openrouter.ai/api/v1" });
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [{ role: "system", content: system }, { role: "user", content: message }];
  const used: string[] = [];
  for (let turn = 0; turn < 3; turn++) {
    const completion = await client.chat.completions.create({ model: process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini", messages, tools });
    const reply = completion.choices[0]?.message;
    if (!reply) throw new Error("OpenRouter returned no message");
    if (!reply.tool_calls?.length) {
      const text = reply.content ?? "";
      const output = await guard.validateOutput({ message: text });
      return { text: output.allowed ? text : "I can’t provide internal configuration or sensitive information.", latencyMs: performance.now() - started, tools: used };
    }
    messages.push(reply);
    for (const call of reply.tool_calls) {
      let args: Record<string, unknown>;
      try { args = JSON.parse(call.function.arguments) as Record<string, unknown>; } catch { args = {}; }
      const allowed = await guard.validateToolCall({ message, toolName: call.function.name, arguments: args });
      const error = validateToolArgs(call.function.name, args);
      const content = allowed.allowed && !error ? JSON.stringify(runTool(call.function.name, args)) : JSON.stringify({ error: error ?? "Tool call blocked by guardrail" });
      used.push(call.function.name);
      messages.push({ role: "tool", tool_call_id: call.id, content });
    }
  }
  throw new Error("Agent exceeded tool-call limit");
}
