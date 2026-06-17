import fs from "fs";
import { getResumePath } from "@/lib/paths";
import { getProfileBySlug, getTemplateForProfile } from "@/lib/profile-template-mapping";
import { buildResumePdfData } from "@/lib/profile-utils";
import { resolveResumePresentation } from "@/lib/resume-style-presets";
import { mockResumeContentForExperienceCount } from "@/lib/preview-mock-content";

/**
 * Load profile JSON + mock resume body for template preview (no AI).
 * @returns {{ ok: true, templateData: object, templateId: string, profileName: string, presentation: object } | { ok: false, status: number, message: string }}
 */
export function loadProfilePreviewPayload(
  profileSlug,
  { templateOverride = null, headerLayoutOverride = null } = {}
) {
  const profileConfig = getProfileBySlug(profileSlug);
  if (!profileConfig) {
    return { ok: false, status: 404, message: `Profile "${profileSlug}" not found` };
  }

  const resumeName = profileConfig.resume;
  const profilePath = getResumePath(resumeName);
  if (!fs.existsSync(profilePath)) {
    return { ok: false, status: 404, message: `Resume file "${resumeName}.json" not found` };
  }

  const profileData = JSON.parse(fs.readFileSync(profilePath, "utf-8"));
  const presentation = resolveResumePresentation(profileData, profileSlug, getTemplateForProfile);
  if (templateOverride && String(templateOverride).trim() !== "") {
    presentation.template = String(templateOverride).trim();
  }
  if (headerLayoutOverride && String(headerLayoutOverride).trim() !== "") {
    presentation.headerLayout = String(headerLayoutOverride).trim().toLowerCase();
  }
  const templateId = presentation.template;

  const mockContent = mockResumeContentForExperienceCount(profileData.experience?.length);
  const templateData = buildResumePdfData(profileData, mockContent, presentation);

  return {
    ok: true,
    templateData,
    templateId,
    profileName: profileData.name || resumeName,
    presentation,
    resumeName,
  };
}
