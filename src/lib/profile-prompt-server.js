import fs from "fs";
import { defaultPromptPath, getPromptPath } from "./paths";
import { getPromptForProfile } from "./profile-template-mapping";
import { applyPromptVariables } from "./profile-prompt";
import { isVercelDeployment } from "./runtime-limits";

/**
 * Load the raw prompt template for a profile slug.
 * Each profile maps to data/prompts/{prompt}.txt — edit that file to change generation rules.
 */
export function loadPromptTemplateForProfile(profileSlug) {
  const promptName = getPromptForProfile(profileSlug);
  const profilePromptPath = getPromptPath(promptName);

  const pathToUse = fs.existsSync(profilePromptPath) ? profilePromptPath : defaultPromptPath;
  if (!fs.existsSync(pathToUse)) {
    throw new Error(
      `Prompt file missing for profile "${profileSlug}" (tried ${profilePromptPath} and ${defaultPromptPath})`
    );
  }
  return fs.readFileSync(pathToUse, "utf-8");
}

/** Final prompt sent to the AI — profile template + work history / JD variables only. */
function compactPromptForVercel(prompt) {
  if (!isVercelDeployment()) return prompt;
  const markerMatch = prompt.match(/\r?\n---\r?\n/);
  if (!markerMatch) return prompt;
  const index = markerMatch.index;
  return prompt.slice(0, index).trim() + "\n";
}

export function loadPromptForProfile(profileSlug, variables) {
  const template = loadPromptTemplateForProfile(profileSlug);
  const prompt = applyPromptVariables(template, variables);
  return compactPromptForVercel(prompt);
}

export { buildPromptVariables, buildManualPrompt } from "./profile-prompt";
