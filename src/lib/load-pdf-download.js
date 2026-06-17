const LOAD_TIMEOUT_MS = 20_000;

/** Load PDF download helpers only when the user generates a resume. */
export function loadPdfDownload() {
  return Promise.race([
    import("@/lib/client-pdf-download"),
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Failed to load PDF module. Refresh the page and try again.")),
        LOAD_TIMEOUT_MS
      )
    ),
  ]);
}
