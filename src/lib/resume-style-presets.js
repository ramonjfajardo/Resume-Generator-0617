/**
 * Resume presentation: one field in each resume JSON is enough.
 *
 *   resumeStyle  — required in data/resumes/*.json (e.g. "technical-left")
 *                  → sets PDF template + header alignment from RESUME_STYLE_PRESETS
 *
 * Optional overrides (rare; omit in normal use):
 *   template       — force a specific PDF template id
 *   headerLayout   — force center | split | left
 *
 * Fallback when resumeStyle is missing:
 *   profile-template-mapping.js (per URL slug) → template only
 */

export const RESUME_STYLE_PRESETS = {
  standard: {
    template: "Resume",
    headerLayout: "center",
  },
  classic: {
    template: "Resume-Classic-Charcoal",
    headerLayout: "center",
  },
  technical: {
    template: "Resume-Tech-Teal",
    headerLayout: "split",
  },
  "technical-left": {
    template: "Resume-Tech-Teal",
    headerLayout: "left",
  },
  executive: {
    template: "Resume-Executive-Navy",
    headerLayout: "center",
  },
  "executive-split": {
    template: "Resume-Executive-Navy",
    headerLayout: "split",
  },
  "executive-left": {
    template: "Resume-Executive-Navy",
    headerLayout: "left",
  },
  professional: {
    template: "Resume-Corporate-Slate",
    headerLayout: "split",
  },
  "professional-center": {
    template: "Resume-Corporate-Slate",
    headerLayout: "center",
  },
  academic: {
    template: "Resume-Academic-Purple",
    headerLayout: "center",
  },
  "academic-left": {
    template: "Resume-Academic-Purple",
    headerLayout: "left",
  },
  creative: {
    template: "Resume-Creative-Burgundy",
    headerLayout: "center",
  },
  bold: {
    template: "Resume-Bold-Emerald",
    headerLayout: "center",
  },
  "bold-split": {
    template: "Resume-Bold-Emerald",
    headerLayout: "split",
  },
  consultant: {
    template: "Resume-Consultant-Steel",
    headerLayout: "center",
  },
  modern: {
    template: "Resume-Modern-Green",
    headerLayout: "split",
  },
  "modern-center": {
    template: "Resume-Modern-Green",
    headerLayout: "center",
  },
  "standard-left": {
    template: "Resume",
    headerLayout: "left",
  },
};

const VALID_HEADER_LAYOUTS = new Set(["center", "split", "left"]);

/**
 * @param {object|null|undefined} profileData - Parsed resume JSON
 * @param {string|null|undefined} profileSlug - Profile slug for mapping fallback
 * @param {(slug: string) => string} getTemplateForProfile - e.g. from profile-template-mapping
 * @returns {{ template: string, headerLayout: string, resumeStyle: string|null }}
 */
export function resolveResumePresentation(profileData, profileSlug, getTemplateForProfile) {
  const resumeStyle =
    profileData?.resumeStyle != null && String(profileData.resumeStyle).trim() !== ""
      ? String(profileData.resumeStyle).trim().toLowerCase()
      : null;

  const preset = resumeStyle ? RESUME_STYLE_PRESETS[resumeStyle] : null;

  const templateFromJson =
    profileData?.template != null && String(profileData.template).trim() !== ""
      ? String(profileData.template).trim()
      : null;

  const template =
    templateFromJson ||
    preset?.template ||
    (profileSlug && getTemplateForProfile ? getTemplateForProfile(profileSlug) : null) ||
    "Resume";

  let headerLayout = "center";
  if (profileData?.headerLayout != null) {
    const raw = String(profileData.headerLayout).trim().toLowerCase();
    if (VALID_HEADER_LAYOUTS.has(raw)) {
      headerLayout = raw;
    }
  } else if (preset?.headerLayout) {
    headerLayout = preset.headerLayout;
  }

  return { template, headerLayout, resumeStyle };
}

export function getResumeStylePresetKeys() {
  return Object.keys(RESUME_STYLE_PRESETS);
}

/** Expand a resumeStyle key to { template, headerLayout }. */
export function getPresetPresentation(resumeStyle) {
  if (!resumeStyle) return null;
  const key = String(resumeStyle).trim().toLowerCase();
  return RESUME_STYLE_PRESETS[key] || null;
}
