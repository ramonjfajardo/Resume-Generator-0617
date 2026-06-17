import fs from "fs";
import { defaultPromptPath, getPromptPath } from "./paths";
import { getPromptForProfile } from "./profile-template-mapping";
import { applyPromptVariables } from "./profile-prompt";

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
export function loadPromptForProfile(profileSlug, variables) {
  const template = loadPromptTemplateForProfile(profileSlug);
  return applyPromptVariables(template, variables);
}

export { buildPromptVariables, buildManualPrompt } from "./profile-prompt";
