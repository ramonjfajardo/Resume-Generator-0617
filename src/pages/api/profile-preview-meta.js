import { loadProfilePreviewPayload } from "@/lib/profile-preview-server";
import { TEMPLATE_THEMES } from "@/lib/pdf-templates/template-themes";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { profile } = req.query;
  if (!profile || typeof profile !== "string") {
    return res.status(400).json({ error: "profile query required (e.g. jd1)" });
  }

  const loaded = loadProfilePreviewPayload(profile);
  if (!loaded.ok) {
    return res.status(loaded.status).json({ error: loaded.message });
  }

  const templates = Object.values(TEMPLATE_THEMES).map(({ id, label }) => ({
    id,
    name: label,
  }));

  res.status(200).json({
    profileSlug: profile,
    profileName: loaded.profileName,
    resumeName: loaded.resumeName,
    defaultTemplate: loaded.templateId,
    headerLayout: loaded.presentation.headerLayout,
    resumeStyle: loaded.presentation.resumeStyle,
    templates,
  });
}
