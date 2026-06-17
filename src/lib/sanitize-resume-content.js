/** Normalize AI JSON before PDF render — safety trims only; content rules live in each profile prompt. */

const MAX_SUMMARY_CHARS = 2200;
const MAX_BULLET_CHARS = 400;
const MAX_SKILL_CATEGORIES = 10;
const MAX_SKILLS_PER_CATEGORY = 14;

function trimText(value, maxLen) {
  if (value == null) return value;
  const s = String(value).trim();
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen - 1) + "…";
}

/** Strip markdown/HTML bold so PDF output is plain text only. */
export function stripMarkdownBold(text) {
  if (typeof text !== "string") return text;
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong\s*>/gi, "$1")
    .replace(/<b[^>]*>([\s\S]*?)<\/b\s*>/gi, "$1");
}

export function sanitizeResumeContentForPdf(resumeContent) {
  if (!resumeContent || typeof resumeContent !== "object") return resumeContent;

  const out = { ...resumeContent };

  if (typeof out.title === "string") {
    out.title = stripMarkdownBold(trimText(out.title, 120));
  }

  if (typeof out.summary === "string") {
    out.summary = stripMarkdownBold(trimText(out.summary, MAX_SUMMARY_CHARS));
  }

  if (out.skills && typeof out.skills === "object") {
    const skills = {};
    const entries = Object.entries(out.skills).slice(0, MAX_SKILL_CATEGORIES);
    for (const [cat, list] of entries) {
      skills[cat] = Array.isArray(list)
        ? list.slice(0, MAX_SKILLS_PER_CATEGORY).map((s) => stripMarkdownBold(trimText(s, 60)))
        : list;
    }
    out.skills = skills;
  }

  if (Array.isArray(out.experience)) {
    out.experience = out.experience.map((exp) => {
      if (!exp || typeof exp !== "object") return exp;
      const details = Array.isArray(exp.details)
        ? exp.details.map((d) => stripMarkdownBold(trimText(d, MAX_BULLET_CHARS)))
        : exp.details;
      return {
        ...exp,
        title: typeof exp.title === "string" ? stripMarkdownBold(trimText(exp.title, 120)) : exp.title,
        details,
      };
    });
  }

  return out;
}
