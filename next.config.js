/** @type {import('next').NextConfig} */
const onVercel = process.env.VERCEL === "1";

const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_AI_GENERATE_ENABLED:
      !onVercel || process.env.ENABLE_VERCEL_AI === "1" ? "1" : "0",
    NEXT_PUBLIC_PREVIEW_ENABLED:
      !onVercel || process.env.ENABLE_VERCEL_PREVIEW === "1" ? "1" : "0",
    NEXT_PUBLIC_MANUAL_PDF_ENABLED:
      !onVercel || process.env.ENABLE_VERCEL_MANUAL_PDF === "1" ? "1" : "0",
  },
  experimental: {
    // Keep @react-pdf on Node's resolver — avoids slow/broken webpack bundles in dev API routes.
    serverComponentsExternalPackages: [
      "@react-pdf/renderer",
      "@react-pdf/layout",
      "@react-pdf/pdfkit",
      "@react-pdf/font",
      "@react-pdf/render",
    ],
  },
};

module.exports = nextConfig;
