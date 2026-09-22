import OpenAI from "openai";

const system = "You are XENA, a helpful Indonesian automotive sales assistant. Help customers choose vehicles, explain specifications, financing, promotions, and showroom visits.";
export async function runAgent(message: string): Promise<{ text: string; latencyMs: number }> {
  if (!process.env.OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is required to call the downstream agent");
  const started = performance.now();
  const client = new OpenAI({ apiKey: process.env.OPENROUTER_API_KEY, baseURL: "https://openrouter.ai/api/v1" });
  const completion = await client.chat.completions.create({ model: process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini", messages: [{ role: "system", content: system }, { role: "user", content: message }] });
  return { text: completion.choices[0]?.message.content ?? "", latencyMs: performance.now() - started };
}
