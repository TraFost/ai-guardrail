import type { GuardrailPolicy } from "../guardrail/types.js";

export const xenaPolicy: GuardrailPolicy = {
  name: "xena",
  domain: {
    description: "An Indonesian automotive sales assistant for vehicle discovery, specifications, financing, promotions, and showrooms.",
    allowedTopics: ["vehicle discovery", "vehicle recommendations", "vehicle specifications", "automotive financing", "installments", "down payments", "tenor", "promotions", "showrooms", "automotive sales"],
    allowConversationalMessages: true,
  },
  tools: ["search_vehicles", "simulate_installment", "find_showrooms"],
};
