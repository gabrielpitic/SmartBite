import type { UserProfile } from "@/types";

export type WizardStep = "goal" | "allergies" | "diet" | "budget" | "results";

export interface WizardState {
  step: WizardStep;
  profile: UserProfile;
}

export const WIZARD_STEPS: WizardStep[] = ["goal", "allergies", "diet", "budget", "results"];

export function nextStep(current: WizardStep): WizardStep {
  const idx = WIZARD_STEPS.indexOf(current);
  return WIZARD_STEPS[Math.min(idx + 1, WIZARD_STEPS.length - 1)];
}
