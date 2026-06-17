/**
 * Appended to every resume prompt (auto + manual) to maximize ATS keyword match.
 * Industry/domain language comes from the JD only — never from resume JSON.
 */
export const ATS_100_PROMPT_BLOCK = `
---

## ATS 100% TARGET (mandatory — verify before returning JSON)

**Goal:** Score **100%** on keyword-matching ATS for this JOB DESCRIPTION.

**Industry rule:** Resume JSON has **no industry field**. Extract sector/domain/compliance terms **only from the JD**. Do not infer industry from employer names unless the JD supports that framing.

### Step 1 — Extract JD keywords (do this first)

**From the JD:**
- Every **required** and **preferred** skill, tool, platform, framework, cloud service, methodology, certification.
- **Industry/sector**, product type, and business-context phrases **as written in the JD**.
- **Compliance/regulatory** terms (HIPAA, SOC 2, PCI-DSS, GDPR, etc.) **only if the JD mentions them**.
- **Workflow/domain nouns** (EHR, TMS, ERP, payment rails, etc.) **only if the JD mentions them**.
- **Exact job title** phrasing and **seniority**.

### Step 2 — 100% coverage rules

1. **\`"title"\`** — JD job title **verbatim**.
2. **\`"summary"\`** — open with title + years + **JD role/sector fit** (use JD industry terms when present). Include all must-have technologies (exact JD spelling).
3. **\`"skills"\`** — every **required** skill/tool (exact wording). Add **Industry & Domain** category **only when the JD signals a sector** — list terms from the JD, not from profile JSON. **≥80% of preferred** skills. ~40–48 skills total.
4. **\`"experience"\` bullets** — every **required** JD keyword plus **JD industry/domain terms** (when present) appear at least once, framed credibly per employer/dates. **Each bullet MUST be 38–43 words** (hard minimum 38). Short bullets (~20 words) fail ATS depth — expand with stack, scope, stakeholders, and outcome.
5. **Terminology** — exact JD spellings for tools, sectors, regulations, and products named in the JD.
6. **Metrics** — **6–8 quantified outcomes** total: **3–4 % improvements** (**15–45%**, use **~**) + **2–3 scale metrics**.

### Step 3 — ATS self-check (silent, before output)
- [ ] Industry/domain terms used **only if present in the JD** (not invented from employers)
- [ ] Every **required** technical skill in skills, summary, or experience
- [ ] **Preferred** skills: ≥80% covered
- [ ] Job title matches JD; seniority tone matches JD
- [ ] Natural prose — not a keyword dump
- [ ] **6–8 metrics total** across summary + all bullets
- [ ] **Every experience bullet is 38–43 words** (count words; expand any under 38)

Only return JSON after this check passes.
`;

/** Append ATS block once (avoids duplicate if template already includes it). */
export function appendAtsBlock(prompt) {
  if (!prompt?.trim()) return prompt;
  if (prompt.includes("ATS 100% TARGET")) return prompt;
  return `${prompt.trim()}\n${ATS_100_PROMPT_BLOCK}`;
}

export function finalizeResumePrompt(prompt) {
  return appendAtsBlock(prompt);
}
