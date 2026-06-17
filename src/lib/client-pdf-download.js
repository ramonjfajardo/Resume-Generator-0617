function parseContentDispositionFilename(contentDisposition, fallback) {
  if (!contentDisposition) return fallback;
  const utf8 = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8) {
    try {
      return decodeURIComponent(utf8[1].trim());
    } catch {
      return utf8[1].trim();
    }
  }
  const quoted = contentDisposition.match(/filename="([^"]+)"/);
  if (quoted) return quoted[1];
  const plain = contentDisposition.match(/filename=([^;\s]+)/);
  if (plain) return plain[1];
  return fallback;
}

async function blobStartsWithPdf(blob) {
  const header = await blob.slice(0, 5).arrayBuffer();
  return new TextDecoder().decode(header).startsWith("%PDF");
}

/**
 * Trigger a browser download from a fetch Response that should contain a PDF.
 * @returns {{ filename: string, size: number, driveUrl: string | null, driveError: string | null }}
 */
export async function downloadPdfFromResponse(response, fallbackFilename) {
  if (!response.ok) {
    const message = (await response.text()).trim();
    throw new Error(message || `Request failed (${response.status})`);
  }

  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes("application/pdf")) {
    const message = (await response.text()).trim();
    throw new Error(message || "Server did not return a PDF. Check your API keys and try again.");
  }

  const blob = await response.blob();

  if (blob.size < 100) {
    throw new Error("Received an empty PDF file. Please try again.");
  }

  if (!(await blobStartsWithPdf(blob))) {
    throw new Error(
      "Downloaded file is not a valid PDF. The server may have timed out or returned an error page."
    );
  }

  const filename = parseContentDispositionFilename(
    response.headers.get("Content-Disposition"),
    fallbackFilename.endsWith(".pdf") ? fallbackFilename : `${fallbackFilename}.pdf`
  );

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();

  // Revoking the blob URL immediately after click can cancel the download in Chrome/Edge.
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
    anchor.remove();
  }, 1000);

  const driveUrl = response.headers.get("X-Google-Drive-Url");
  const driveError = response.headers.get("X-Google-Drive-Error");

  return {
    filename,
    size: blob.size,
    driveUrl: driveUrl || null,
    driveError: driveError || null,
  };
}

export function fetchWithTimeout(url, options = {}, timeoutMs = 600000) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { ...options, signal: controller.signal }).finally(() => {
    window.clearTimeout(timeoutId);
  });
}

export function formatFetchError(error, { manual = false } = {}) {
  if (error?.name === "AbortError") {
    if (manual) {
      return (
        "Request timed out while building the PDF. In dev, the first PDF after restart can take 1–3 minutes. " +
        "Run: npm run clean && npm run dev, use profile jd1 for James Davis JSON, and keep ≤8 bullets per job."
      );
    }
    return "Request timed out. Resume generation can take several minutes—try a shorter job description or try again.";
  }
  return error?.message || "Unknown error";
}

const vercelLimited =
  process.env.NEXT_PUBLIC_AI_GENERATE_ENABLED === "0" &&
  process.env.NEXT_PUBLIC_MANUAL_PDF_ENABLED === "1";

/** Manual PDF — must be longer than server render timeout (see MANUAL_PDF_RENDER_TIMEOUT_MS). */
export const MANUAL_GENERATE_TIMEOUT_MS = vercelLimited ? 70_000 : 210_000;

/** AI + PDF — allow several minutes. */
export const AI_GENERATE_TIMEOUT_MS = vercelLimited ? 120_000 : 600_000;
