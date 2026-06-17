/** Shared JSON extraction / validation for AI and manual paste flows. */

import { parse as jsoncParse, stripComments } from "jsonc-parser";

const JSONC_OPTS = { allowTrailingComma: true };

export function makeConcisePrompt(fullPrompt) {
  return (
    fullPrompt +
    "\n\n**RETRY:** Return valid JSON only. Use the same JSON schema and complete the resume with concise bullet points only."
  );
}

export function extractJsonObjectString(raw) {
  if (raw == null || typeof raw !== "string") return null;
  let text = raw.trim();
  text = text.replace(/```json\s*/gi, "");
  text = text.replace(/```javascript\s*/gi, "");
  text = text.replace(/```\s*/g, "");
  text = text.replace(/^(here is|here's|this is|the json is):?\s*/gi, "");
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;
  return text.substring(firstBrace, lastBrace + 1).trim();
}

function looksLikeResumeObject(obj) {
  return (
    obj &&
    typeof obj === "object" &&
    (obj.experience != null || obj.title != null || obj.summary != null)
  );
}

/** True if the " at s[i] is an escaped string quote (backslash-escaped). */
function isEscapedStringQuote(s, i) {
  let n = 0;
  for (let j = i - 1; j >= 0 && s[j] === "\\"; j--) n++;
  return n % 2 === 1;
}

/**
 * LLMs often break long bullets with real line breaks inside "..."; JSON disallows that.
 * Escapes \n \r \t and other C0 control chars when inside a quoted string.
 */
export function escapeControlCharsInJsonStrings(s) {
  if (s == null || s === "") return s;
  let out = "";
  let inString = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '"') {
      if (inString && isEscapedStringQuote(s, i)) {
        out += c;
        continue;
      }
      inString = !inString;
      out += c;
      continue;
    }
    if (inString) {
      if (c === "\r") {
        if (s[i + 1] === "\n") {
          out += "\\n";
          i++;
        } else {
          out += "\\n";
        }
        continue;
      }
      if (c === "\n") {
        out += "\\n";
        continue;
      }
      if (c === "\t") {
        out += "\\t";
        continue;
      }
      const code = c.charCodeAt(0);
      if (code < 0x20) {
        out += `\\u${code.toString(16).padStart(4, "0")}`;
        continue;
      }
    }
    out += c;
  }
  return out;
}

function tryJsoncParse(s) {
  const errList = [];
  const parsed = jsoncParse(s, errList, JSONC_OPTS);
  if (looksLikeResumeObject(parsed) && (parsed.experience == null || Array.isArray(parsed.experience))) {
    if (errList.length) {
      console.warn("resume JSON: lenient parse;", errList.length, "parse warning(s)");
    }
    return { ok: true, data: parsed, lenient: true };
  }
  return { ok: false };
}

/** Strict JSON, then common AI fixes, then lenient jsonc. */
export function parseResumeJsonString(jsonStr) {
  if (!jsonStr) return { ok: false, error: "empty" };

  let lastMsg = "parse failed";
  const tryJson = (s) => {
    try {
      return { ok: true, data: JSON.parse(s) };
    } catch (e) {
      lastMsg = e.message;
      return { ok: false };
    }
  };

  const normalized = jsonStr.replace(/^\uFEFF/, "");
  const variants = [
    normalized,
    normalized.replace(/,(\s*[}\]])/g, "$1"),
    escapeControlCharsInJsonStrings(normalized),
    escapeControlCharsInJsonStrings(normalized).replace(/,(\s*[}\]])/g, "$1"),
  ];

  for (const raw of variants) {
    const r = tryJson(raw);
    if (r.ok) return r;
  }

  for (const raw of variants) {
    const noComments = stripComments(raw);
    const j = tryJsoncParse(noComments);
    if (j.ok) return j;
    const deCurly = noComments.replace(/\u201c/g, '"').replace(/\u201d/g, '"');
    if (deCurly !== noComments) {
      const j2 = tryJsoncParse(deCurly);
      if (j2.ok) return j2;
    }
  }

  return { ok: false, error: lastMsg };
}

export function validateResumeShape(resumeContent, expectedExperienceCount) {
  if (!resumeContent || typeof resumeContent !== "object") {
    return { ok: false, reason: "not an object" };
  }
  if (!resumeContent.title || !resumeContent.summary || !resumeContent.skills || !resumeContent.experience) {
    return { ok: false, reason: "missing title, summary, skills, or experience" };
  }
  if (!Array.isArray(resumeContent.experience)) {
    return { ok: false, reason: "experience is not an array" };
  }
  if (resumeContent.experience.length !== expectedExperienceCount) {
    return {
      ok: false,
      reason: `experience count ${resumeContent.experience.length} !== expected ${expectedExperienceCount}`,
    };
  }
  for (let i = 0; i < resumeContent.experience.length; i++) {
    const exp = resumeContent.experience[i];
    if (!exp || !Array.isArray(exp.details) || exp.details.length === 0) {
      return { ok: false, reason: `experience[${i}] missing or empty details` };
    }
  }
  return { ok: true };
}

export function isAiRefusal(text) {
  const t = (text || "").trim().toLowerCase();
  return t.startsWith("i'm sorry") || t.startsWith("i cannot") || t.startsWith("i apologize");
}
