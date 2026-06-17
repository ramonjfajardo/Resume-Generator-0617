/** Client-safe prompt building (no Node fs). */

export function applyPromptVariables(template, variables) {
  let out = template;
  for (const [key, value] of Object.entries(variables)) {
    out = out.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value ?? ""));
  }
  return out;
}

export function yearsFromExperience(experience) {
  if (!experience?.length) return 0;
  const parseDate = (dateStr) =>
    dateStr.toLowerCase() === "present" ? new Date() : new Date(dateStr);
  const earliest = experience.reduce((min, job) => {
    const d = parseDate(job.start_date);
    return d < min ? d : min;
  }, new Date());
  return Math.round((new Date() - earliest) / (1000 * 60 * 60 * 24 * 365));
}

export function buildPromptVariables(profileData, jd) {
  const workHistory = profileData.experience
    .map((job, idx) => {
      const parts = [`${idx + 1}. ${job.company}`];
      if (job.title) parts.push(job.title);
      if (job.location) parts.push(job.location);
      parts.push(`${job.start_date} - ${job.end_date}`);
      return parts.join(" | ");
    })
    .join("\n");

  const education = profileData.education
    .map((edu) => {
      let s = `- ${edu.degree}, ${edu.school} (${edu.start_year}-${edu.end_year})`;
      if (edu.grade) s += ` | GPA: ${edu.grade}`;
      return s;
    })
    .join("\n");

  return {
    name: profileData.name,
    email: profileData.email,
    location: profileData.location,
    yearsOfExperience: yearsFromExperience(profileData.experience),
    workHistory,
    education,
    jobDescription: jd,
    experienceCount: profileData.experience.length,
    resumeTitle: profileData.title || "Senior Software Engineer",
  };
}

/** Build the ChatGPT prompt in the browser (template loaded once with the profile). */
export function buildManualPrompt(profileData, jd, promptTemplate) {
  if (!promptTemplate?.trim()) {
    throw new Error("Prompt template not loaded");
  }
  return applyPromptVariables(promptTemplate, buildPromptVariables(profileData, jd));
}
