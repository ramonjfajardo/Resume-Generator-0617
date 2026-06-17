import { getGoogleDriveStatus } from "@/lib/google-drive";

/** GET — whether My Drive upload is ready (for UI). */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const status = await getGoogleDriveStatus();
    res.status(200).json(status);
  } catch (err) {
    console.error("[google-drive/status]", err);
    res.status(500).json({ error: err.message || String(err) });
  }
}
