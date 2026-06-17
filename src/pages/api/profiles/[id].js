import fs from "fs";
import { getResumePath } from "@/lib/paths";
import { loadPromptTemplateForProfile } from "@/lib/profile-prompt-server";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id, slug, includePrompt } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Profile ID required" });
    }

    const profilePath = getResumePath(id);

    if (!fs.existsSync(profilePath)) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const profileData = JSON.parse(fs.readFileSync(profilePath, "utf-8"));

    if (includePrompt === "1" && slug && typeof slug === "string") {
      profileData.promptTemplate = loadPromptTemplateForProfile(slug);
    }

    res.status(200).json(profileData);
  } catch (error) {
    console.error("Error reading profile:", error);
    res.status(500).json({ error: "Failed to load profile" });
  }
}
