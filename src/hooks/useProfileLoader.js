import { useState, useEffect } from "react";

/**
 * Resolves profile slug → JSON via API. Mapping module is dynamically imported
 * so the home page route does not pull profile-template-mapping into its bundle.
 */
export function useProfileLoader(profileSlug, router, redirectPath = "/", { includePromptTemplate = false } = {}) {
  const [loading, setLoading] = useState(true);
  const [profileName, setProfileName] = useState("");
  const [selectedProfileData, setSelectedProfileData] = useState(null);

  useEffect(() => {
    if (!profileSlug) return;

    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setSelectedProfileData(null);

      const { slugToProfileName } = await import("@/lib/profile-template-mapping");
      const profileNameFromSlug = slugToProfileName(profileSlug);

      if (!profileNameFromSlug) {
        router.push(redirectPath);
        return;
      }

      if (cancelled) return;
      setProfileName(profileNameFromSlug);

      try {
        const promptQs =
          includePromptTemplate && profileSlug
            ? `?includePrompt=1&slug=${encodeURIComponent(String(profileSlug))}`
            : "";
        const response = await fetch(
          `/api/profiles/${encodeURIComponent(profileNameFromSlug)}${promptQs}`
        );
        if (!response.ok) {
          if (response.status === 404) {
            router.push(redirectPath);
            return;
          }
          throw new Error(`Failed to fetch profile: ${response.statusText}`);
        }
        const data = await response.json();
        if (!cancelled) setSelectedProfileData(data);
      } catch (err) {
        console.error("Failed to load profile data:", err);
        if (!cancelled) router.push(redirectPath);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [profileSlug, router, redirectPath, includePromptTemplate]);

  return { loading, profileName, selectedProfileData };
}
