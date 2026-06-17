import fs from "fs";
import { getTemplateAsync } from "@/lib/pdf-templates";
import { getTemplateForProfile, getProfileBySlug } from "@/lib/profile-template-mapping";
import { buildResumePdfData } from "@/lib/profile-utils";
import { resolveResumePresentation } from "@/lib/resume-style-presets";
import { sanitizeResumeContentForPdf } from "@/lib/sanitize-resume-content";
import {
  extractJsonObjectString,
  parseResumeJsonString,
  validateResumeShape,
} from "@/lib/resume-json";
import {
  renderPdfBuffer,
  pdfAttachmentFilename,
  sendPdfResponseWithDrive,
  MANUAL_PDF_RENDER_TIMEOUT_MS,
} from "@/lib/pdf-render";
import { getResumePath } from "@/lib/paths";
import { heavyApiDisabledMessage, isManualPdfEnabled } from "@/lib/runtime-limits";

/**
 * POST: { profile: slug, chatgptResponse: string, companyName?: string, roleName?: string }
 */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  if (!isManualPdfEnabled()) {
    return res.status(503).send(heavyApiDisabledMessage("Manual PDF generation"));
  }

  try {
    const { profile: profileSlug, chatgptResponse: rawResponse, companyName = null, roleName = null } = req.body;

    if (!profileSlug) return res.status(400).send("Profile slug required");
    if (!rawResponse || typeof rawResponse !== "string") {
      return res.status(400).send("ChatGPT response (JSON) required");
    }

    const profileConfig = getProfileBySlug(profileSlug);
    if (!profileConfig) {
      return res.status(404).send(`Profile "${profileSlug}" not found`);
    }

    const resumeName = profileConfig.resume;
    const profilePath = getResumePath(resumeName);

    if (!fs.existsSync(profilePath)) {
      return res.status(404).send(`Profile file "${resumeName}.json" not found`);
    }

    const profileData = JSON.parse(fs.readFileSync(profilePath, "utf-8"));
    const presentation = resolveResumePresentation(profileData, profileSlug, getTemplateForProfile);
    const templateName = presentation.template;
    const jsonStr = extractJsonObjectString(rawResponse);
    const parsed = parseResumeJsonString(jsonStr);
    if (!parsed.ok) {
      throw new Error(
        `Invalid JSON: ${parsed.error}. Often: unescaped double-quotes in a bullet, ` +
          `a line break inside a string, or a truncated copy. ` +
          `Re-copy the full block or ask ChatGPT for minified valid JSON with escaped quotes.`
      );
    }

    const resumeContent = parsed.data;
    const experienceCount = profileData.experience?.length ?? 0;
    const shape = validateResumeShape(resumeContent, experienceCount);
    if (!shape.ok) {
      throw new Error(
        `Invalid resume JSON: ${shape.reason}. ` +
          `Your profile has ${experienceCount} job(s)—the JSON "experience" array must have exactly that many entries, each with a non-empty "details" array.`
      );
    }

    const TemplateComponent = await getTemplateAsync(templateName);
    if (!TemplateComponent) {
      return res.status(404).send(`Template "${templateName}" not found`);
    }

    const sanitized = sanitizeResumeContentForPdf(resumeContent);
    const templateData = buildResumePdfData(profileData, sanitized, presentation);
    console.log(`[generate-manual] rendering PDF for ${resumeName} (${templateName})`);
    const pdfBuffer = await renderPdfBuffer(TemplateComponent, templateData, MANUAL_PDF_RENDER_TIMEOUT_MS);
    console.log(`[generate-manual] PDF ready (${pdfBuffer.length} bytes)`);
    const fileName = pdfAttachmentFilename(resumeName, companyName, roleName);
    await sendPdfResponseWithDrive(res, pdfBuffer, fileName, {
      profileName: profileData.name || resumeName,
    });
  } catch (err) {
    console.error("Manual PDF generation error:", err);
    if (!res.headersSent) {
      res.status(500).send("PDF generation failed: " + err.message);
    }
  }
}

export const config = {
  api: {
    responseLimit: "10mb",
    bodyParser: { sizeLimit: "2mb" },
  },
};
