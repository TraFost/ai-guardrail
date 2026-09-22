import type { CoreCheck, GuardrailPolicy, SemanticCheck } from "./types.js";

export function decide(core: CoreCheck, semantic: SemanticCheck, policy: GuardrailPolicy): string[] {
  const reasons = [...core.reasons.map((reason) => `core:${reason}`)];
  if (semantic.agentManipulation >= policy.thresholds.manipulation) reasons.push("agent_manipulation");
  if (semantic.restrictedInformation >= policy.thresholds.restrictedInformation) reasons.push("restricted_information");
  if (semantic.domainRelevance < policy.thresholds.minimumDomainRelevance) reasons.push("off_topic");
  return reasons;
}
