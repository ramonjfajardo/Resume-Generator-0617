/**
 * Phone and LinkedIn for resume PDF header.
 * LinkedIn is shown only when profileData.linkedinShow === "show" (or true) and a URL exists.
 * Optional: linkedin as { url, show: "show" } also works.
 */
export function getContactForPdf(profileData) {
  if (!profileData) {
    return { phone: null, linkedin: null };
  }

  const rawPhone = profileData.phone;
  const phone =
    rawPhone != null && String(rawPhone).trim() !== ''
      ? String(rawPhone).trim()
      : null;

  const rawLi = profileData.linkedin;
  let linkedinUrl = null;
  let showLinkedin = false;

  if (rawLi != null && typeof rawLi === 'object' && !Array.isArray(rawLi)) {
    linkedinUrl =
      rawLi.url != null && String(rawLi.url).trim() !== ''
        ? String(rawLi.url).trim()
        : null;
    showLinkedin = rawLi.show === 'show' || rawLi.show === true;
  } else if (typeof rawLi === 'string') {
    const s = rawLi.trim();
    if (s && s !== 'show') {
      linkedinUrl = s;
    }
    showLinkedin =
      profileData.linkedinShow === 'show' || profileData.linkedinShow === true;
  }

  const linkedin = showLinkedin && linkedinUrl ? linkedinUrl : null;

  return { phone, linkedin };
}

/** Merge stored profile jobs with AI/pasted JSON bullets for React PDF templates. */
export function buildResumePdfData(profileData, resumeContent, presentation = null) {
  const { phone, linkedin } = getContactForPdf(profileData);
  return {
    name: profileData.name,
    title: profileData.title,
    email: profileData.email,
    phone,
    location: profileData.location,
    linkedin,
    website: null,
    summary: resumeContent.summary,
    skills: resumeContent.skills,
    experience: profileData.experience.map((job, idx) => ({
      title: job.title || resumeContent.experience[idx]?.title || "Engineer",
      company: job.company,
      location: job.location,
      start_date: job.start_date,
      end_date: job.end_date,
      details: resumeContent.experience[idx]?.details || [],
    })),
    education: profileData.education,
    headerLayout: presentation?.headerLayout ?? profileData.headerLayout ?? null,
  };
}

