import { useCallback, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useProfileLoader } from "@/hooks/useProfileLoader";
import { profileColors as colors } from "@/lib/theme-colors";
import DeploymentNotice, { isPreviewEnabledClient } from "@/components/profile/DeploymentNotice";

export default function ProfileTemplatePreviewPage() {
  const router = useRouter();
  const { profile: profileSlug } = router.query;
  const { loading, profileName, selectedProfileData } = useProfileLoader(
    profileSlug,
    router,
    "/"
  );

  const [templates, setTemplates] = useState([]);
  const [defaultTemplate, setDefaultTemplate] = useState("Resume");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [pdfKey, setPdfKey] = useState(0);

  useEffect(() => {
    if (!profileSlug) return;
    fetch(`/api/profile-preview-meta?profile=${encodeURIComponent(String(profileSlug))}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.templates) setTemplates(data.templates);
        if (data.defaultTemplate) setDefaultTemplate(data.defaultTemplate);
      })
      .catch(console.error);
  }, [profileSlug]);

  useEffect(() => {
    if (!router.isReady || !profileSlug) return;
    const fromQuery = typeof router.query.template === "string" ? router.query.template : "";
    setSelectedTemplate(fromQuery || defaultTemplate || "Resume");
  }, [router.isReady, router.query.template, profileSlug, defaultTemplate]);

  const pdfSrc = useMemo(() => {
    if (!profileSlug || !selectedTemplate) return "";
    const qs = new URLSearchParams({
      profile: String(profileSlug),
      template: selectedTemplate,
    });
    return `/api/preview?${qs.toString()}`;
  }, [profileSlug, selectedTemplate, pdfKey]);

  const onTemplateChange = useCallback(
    (templateId) => {
      setSelectedTemplate(templateId);
      setPdfKey((k) => k + 1);
      router.replace(
        { pathname: `/${profileSlug}/show`, query: { template: templateId } },
        undefined,
        { shallow: true }
      );
    },
    [profileSlug, router]
  );

  const isBootstrapping =
    !router.isReady || !profileSlug || loading || !selectedProfileData;

  if (isBootstrapping) {
    return (
      <>
        <Head>
          <title>Template preview</title>
        </Head>
        <div
          style={{
            minHeight: "100vh",
            background: colors.bg,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <LoadingSpinner label="Loading preview..." />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>
          Template preview — {profileName} ({selectedTemplate})
        </title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div
        style={{
          minHeight: "100vh",
          background: colors.bg,
          color: colors.text,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <header
          style={{
            padding: "12px 16px",
            borderBottom: `1px solid ${colors.cardBorder}`,
            background: colors.cardBg,
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
              Template preview — {profileName}
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: colors.textMuted }}>
              Sample bullets only · your name, jobs, and contact are real · no AI generation
            </p>
          </div>
        </header>

        <div
          style={{
            padding: "12px 16px",
            borderBottom: `1px solid ${colors.cardBorder}`,
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
          }}
        >
          <label style={{ fontSize: 13, color: colors.textSecondary }}>
            Template
            <select
              value={selectedTemplate}
              onChange={(e) => onTemplateChange(e.target.value)}
              style={{
                marginLeft: 8,
                padding: "8px 10px",
                borderRadius: 6,
                border: `1px solid ${colors.inputBorder}`,
                background: colors.inputBg,
                color: colors.text,
                fontSize: 13,
                minWidth: 220,
              }}
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <a
            href={pdfSrc}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 12, color: colors.linkColor }}
          >
            Open PDF in new tab
          </a>
        </div>

        <div style={{ flex: 1, minHeight: 0, padding: 8 }}>
          {!isPreviewEnabledClient() ? (
            <div style={{ padding: 16, maxWidth: 640 }}>
              <DeploymentNotice feature="preview" />
            </div>
          ) : pdfSrc ? (
            <iframe
              key={pdfKey}
              title="Resume template preview"
              src={pdfSrc}
              style={{
                width: "100%",
                height: "calc(100vh - 140px)",
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: 8,
                background: "#fff",
              }}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}
