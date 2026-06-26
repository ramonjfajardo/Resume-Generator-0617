// Profile slug → resume JSON, PDF template, and prompt file (data/prompts/{prompt}.txt).
// To change generated content for a profile, edit only that profile's prompt file.
export const profileTemplateMapping = {
    "jn": {
        resume: "Jakub Nowak",
        template: "Resume-Modern-Green",
        prompt: "Jakub Nowak",
    },
    "kj": {
        resume: "Krzysztof Jankowski",
        template: "Resume-Modern-Green",
        prompt: "Krzysztof Jankowski",
    },
    "lp": {
        resume: "Lucas Peralta",
        template: "Resume-Modern-Green",
        prompt: "Lucas Peralta",
    },
    "mo": {
        resume: "Magno Oliveira",
        template: "Resume-Modern-Green",
        prompt: "Magno Oliveira",
    },
    "kw": {
        resume: "Karol Wojcik",
        template: "Resume-Modern-Green",
        prompt: "Karol Wojcik",
    },
    "tw": {
        resume: "Tomasz Wojcik",
        template: "Resume-Modern-Green",
        prompt: "Tomasz Wojcik",
    },
    "jd": {
        resume: "Jason Dunkley",
        template: "Resume-Modern-Green",
        prompt: "Jason Dunkley",
    },
    "sy": {
        resume: "Shibo Yang",
        template: "Resume-Modern-Green",
        prompt: "Shibo Yang",
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
