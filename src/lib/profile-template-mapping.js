// Profile slug → resume JSON, PDF template, and prompt file (data/prompts/{prompt}.txt).
// To change generated content for a profile, edit only that profile's prompt file.
export const profileTemplateMapping = {
    "vm1": {
        resume: "Vinay Matoori",
        template: "Resume-Modern-Green",
        prompt: "vinay-matoori",
    },
    "ok1": {
        resume: "Olexandr Kutakh",
        template: "Resume-Academic-Purple",
        prompt: "olexandr-kutakh",
    },
    "samuelacord": {
        resume: "Samuel Acord",
        template: "Resume-Bold-Emerald",
        prompt: "samuel-acord",
    },
    "al1": {
        resume: "Adam Lee",
        template: "Resume-Bold-Emerald",
        prompt: "adam-lee",
    },
    "md1": {
        resume: "Michael Douglas",
        template: "Resume-Executive-Navy",
        prompt: "michael-douglas",
    },
    "jd1": {
        resume: "James Davis",
        template: "Resume-Modern-Green",
        prompt: "james-davis",
    },
    "er1": {
        resume: "Edward Reyes",
        template: "Resume-Academic-Purple",
        prompt: "edward-reyes",
    },
    "jh1": {
        resume: "Johnny Ha",
        template: "Resume-Creative-Burgundy",
        prompt: "johnny-ha",
    },
    "kl1": {
        resume: "Kendall Lewis",
        template: "Resume-Tech-Teal",
        prompt: "kendall-lewis",
    },
    "by1": {
        resume: "Buck Young",
        template: "Resume-Classic-Charcoal",
        prompt: "buck-young",
    },
    "kb1": {
        resume: "Kenton Brown",
        template: "Resume-Corporate-Slate",
        prompt: "kenton-brown",
    },
    "cl1": {
        resume: "Chris Lewis",
        template: "Resume-Tech-Teal",
        prompt: "chris-lewis",
    },
    "dg1": {
        resume: "Dawid Gupta",
        template: "Resume-Corporate-Slate",
        prompt: "dawid-gupta",
    },
    "dw1": {
        resume: "Drew Wilson",
        template: "Resume",
        prompt: "drew-wilson",
    },
    "jp1": {
        resume: "James Principe",
        template: "Resume-Consultant-Steel",
        prompt: "james-principe",
    },
    "ap1": {
        resume: "Angelica Penalba",
        template: "Resume-Executive-Navy",
        prompt: "angelica-penalba",
    },
    "mv1": {
        resume: "Manuel Vargas",
        template: "Resume",
        prompt: "manuel-vargas",
    },
    "jm1": {
        resume: "Joel Matos",
        template: "Resume",
        prompt: "joel-matos",
    },
};

/**
 * Get profile configuration by slug (numeric ID)
 * @param {string} slug - The numeric ID slug (e.g., "1", "2", "3")
 * @returns {object|null} - Profile configuration or null if not found
 */
export const getProfileBySlug = (slug) => {
    if (!slug) return null;
    return profileTemplateMapping[slug] || null;
};

/**
 * Get resume name (profile name) by slug
 * @param {string} slug - The numeric ID slug (e.g., "1", "2", "3")
 * @returns {string|null} - Resume name or null if not found
 */
export const slugToProfileName = (slug) => {
    const config = getProfileBySlug(slug);
    return config?.resume || null;
};

/**
 * Get template for a profile by slug
 * @param {string} slug - The numeric ID slug (e.g., "1", "2", "3")
 * @returns {string} - Template ID or "Resume" as default
 */
export const getTemplateForProfile = (slug) => {
    const config = getProfileBySlug(slug);
    return config?.template || "Resume";
};

/**
 * Prompt file name (without .txt) for a profile slug
 * @param {string} slug
 * @returns {string}
 */
export const getPromptForProfile = (slug) => {
    const config = getProfileBySlug(slug);
    return config?.prompt || "default";
};

/**
 * Get all available slug values (numeric IDs from mapping)
 * @returns {string[]} - Array of available slugs (numeric IDs)
 */
export const getAvailableSlugs = () => {
    return Object.keys(profileTemplateMapping);
};

export default profileTemplateMapping;
