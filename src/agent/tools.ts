import type OpenAI from "openai";

export const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  { type: "function", function: { name: "search_vehicles", description: "Find matching Toyota vehicles.", parameters: { type: "object", properties: { budget: { type: "string" }, useCase: { type: "string" } } } } },
  { type: "function", function: { name: "simulate_installment", description: "Estimate a monthly installment.", parameters: { type: "object", properties: { price: { type: "number" }, downPayment: { type: "number" }, months: { type: "number" } }, required: ["price", "downPayment", "months"] } } },
  { type: "function", function: { name: "find_showrooms", description: "Find a nearby Toyota showroom.", parameters: { type: "object", properties: { city: { type: "string" } }, required: ["city"] } } },
];

export function runTool(name: string, args: Record<string, unknown>): unknown {
  if (name === "search_vehicles") return [{ model: "Toyota Agya", from: "Rp 170 juta" }, { model: "Toyota Raize", from: "Rp 240 juta" }];
  if (name === "simulate_installment") { const price = Number(args.price), downPayment = Number(args.downPayment), months = Number(args.months); return { estimatedMonthly: Math.round((price - downPayment) / months), currency: "IDR", disclaimer: "Illustrative estimate; excludes interest and fees." }; }
  if (name === "find_showrooms") return [{ name: "Toyota Auto2000", city: args.city ?? "Jakarta", appointmentRequired: true }];
  throw new Error(`Unknown tool: ${name}`);
}

export function validateToolArgs(name: string, args: Record<string, unknown>): string | undefined {
  if (name === "search_vehicles" && Object.values(args).every((value) => typeof value === "string")) return;
  if (name === "simulate_installment" && Number.isInteger(args.price) && Number.isInteger(args.downPayment) && Number.isInteger(args.months) && Number(args.price) > Number(args.downPayment) && Number(args.months) >= 12 && Number(args.months) <= 84) return;
  if (name === "find_showrooms" && typeof args.city === "string" && args.city.length > 0 && args.city.length <= 100) return;
  return "Invalid tool arguments";
}
