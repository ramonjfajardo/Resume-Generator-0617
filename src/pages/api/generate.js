import fs from "fs";
import { getTemplateAsync } from "@/lib/pdf-templates";
import { callAI } from "@/lib/ai-service";
import { getTemplateForProfile, getProfileBySlug } from "@/lib/profile-template-mapping";
import { buildResumePdfData } from "@/lib/profile-utils";
import { resolveResumePresentation } from "@/lib/resume-style-presets";
import { sanitizeResumeContentForPdf } from "@/lib/sanitize-resume-content";
import { loadPromptForProfile, buildPromptVariables } from "@/lib/profile-prompt-server";
import {
  makeConcisePrompt,
  extractJsonObjectString,
  parseResumeJsonString,
  validateResumeShape,
  isAiRefusal,
} from "@/lib/resume-json";
import {
  renderPdfBuffer,
  pdfAttachmentFilename,
  sendPdfResponseWithDrive,
  AI_PDF_RENDER_TIMEOUT_MS,
} from "@/lib/pdf-render";
import { getResumePath } from "@/lib/paths";
import {
  aiCallRetries,
  aiCallTimeoutMs,
  aiGenerateMaxAttempts,
  heavyApiDisabledMessage,
  isAiGenerateEnabled,
} from "@/lib/runtime-limits";

const RESUME_MAX_TOKENS_OPENAI = 16384;
const RESUME_MAX_TOKENS_CLAUDE = 8192;

function maxOutTokens(provider) {
  return provider === "openai" ? RESUME_MAX_TOKENS_OPENAI : RESUME_MAX_TOKENS_CLAUDE;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  if (!isAiGenerateEnabled()) {
    return res.status(503).send(heavyApiDisabledMessage("AI resume generation"));
  }

  try {
    const {
      profile: profileSlug,
      jd,
      template,
      provider = "openai",
      model = null,
      companyName = null,
      roleName = null,
    } = req.body;

    if (!profileSlug) return res.status(400).send("Profile slug required");
    if (!jd) return res.status(400).send("Job description required");

    const profileConfig = getProfileBySlug(profileSlug);
    if (!profileConfig) {
      return res.status(404).send(`Profile with slug "${profileSlug}" not found`);
    }

    const resumeName = profileConfig.resume;

    if (!["claude", "openai"].includes(provider)) {
      return res.status(400).send(`Unsupported provider: ${provider}. Supported: claude, openai`);
    }

    const profilePath = getResumePath(resumeName);
    if (!fs.existsSync(profilePath)) {
      return res.status(404).send(`Profile file "${resumeName}.json" not found`);
    }

    const profileData = JSON.parse(fs.readFileSync(profilePath, "utf-8"));
    const presentation = resolveResumePresentation(profileData, profileSlug, getTemplateForProfile);
    const templateName = template || presentation.template;

    const prompt = loadPromptForProfile(profileSlug, buildPromptVariables(profileData, jd));

    const maxTokens = maxOutTokens(provider);
    const aiOpts = { jsonObject: provider === "openai" };
    const experienceCount = profileData.experience.length;

    const aiRetries = aiCallRetries();
    const aiTimeout = aiCallTimeoutMs();
    const maxAttempts = aiGenerateMaxAttempts();

    async function tryResumeJson(userPrompt, label) {
      const resp = await callAI(userPrompt, provider, model, maxTokens, aiRetries, aiTimeout, aiOpts);
      if (!resp) {
        throw new Error("AI provider returned no response");
      }
      console.log(
        `[resume AI ${label}] stop=${resp.stop_reason ?? "unknown"} out=${resp.usage?.output_tokens ?? "unknown"}`
      );
      const raw = resp.content?.[0]?.text ?? "";
      if (isAiRefusal(raw)) {
        throw new Error("AI refused to generate resume. Try a shorter job description.");
      }
      const jsonStr = extractJsonObjectString(raw);
      const parsed = parseResumeJsonString(jsonStr);
      if (!parsed.ok) {
        return { ok: false, resp, raw, reason: "parse", detail: parsed.error };
      }
      const shape = validateResumeShape(parsed.data, experienceCount);
      if (!shape.ok) {
        return { ok: false, resp, raw, reason: "shape", detail: shape.reason };
      }
      return { ok: true, resumeContent: parsed.data };
    }

    let attempt = await tryResumeJson(prompt, "full");
    const retry =
      !attempt.ok &&
      (attempt.reason === "parse" ||
        attempt.reason === "shape" ||
        attempt.resp?.stop_reason === "max_tokens" ||
        attempt.resp?.stop_reason === "length" ||
        attempt.resp?.stop_reason === "content_filter");

    if (!attempt.ok && retry && maxAttempts >= 2) {
      attempt = await tryResumeJson(makeConcisePrompt(prompt), "concise");
    }

    if (!attempt.ok && maxAttempts >= 3) {
      const fragment = (attempt.raw || "").slice(0, 120000);
      const repairPrompt = `You are fixing incomplete or invalid resume JSON.

Return ONLY a single valid JSON object (no markdown, no commentary). Root keys: "title" (string), "summary" (string), "skills" (object: category -> array of strings), "experience" (array).
The "experience" array MUST have exactly ${experienceCount} entries, in the same order as the candidate work history. Each entry MUST have "title" and "details" (non-empty array of strings).
Follow the same content rules as the original request. Fill gaps sensibly from context if the fragment is truncated.

Original request:
${prompt}

Fragment to repair:
${fragment}`;
      attempt = await tryResumeJson(repairPrompt, "repair");
    }

    if (!attempt.ok) {
      throw new Error(
        `AI returned incomplete or invalid JSON (${attempt.reason}: ${attempt.detail || "unknown"}). Try again or shorten the job description.`
      );
    }

    const TemplateComponent = await getTemplateAsync(templateName);
    if (!TemplateComponent) {
      return res.status(404).send(`Template "${templateName}" not found`);
    }

    const templateData = buildResumePdfData(
      profileData,
      sanitizeResumeContentForPdf(attempt.resumeContent),
      presentation
    );
    const pdfBuffer = await renderPdfBuffer(TemplateComponent, templateData, AI_PDF_RENDER_TIMEOUT_MS);
    const fileName = pdfAttachmentFilename(resumeName, companyName, roleName);
    await sendPdfResponseWithDrive(res, pdfBuffer, fileName, {
      profileName: profileData.name || resumeName,
    });
  } catch (err) {
    console.error("PDF generation error:", err);
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
