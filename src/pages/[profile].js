import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useProfileLoader } from "@/hooks/useProfileLoader";
import { profileColors } from "@/lib/theme-colors";

const ProfileGeneratorView = dynamic(
  () => import("@/components/profile/ProfileGeneratorView"),
  { loading: () => <LoadingSpinner label="Loading editor..." />, ssr: false }
);

export default function ProfilePage() {
  const router = useRouter();
  const { profile: profileSlug } = router.query;
  const { loading, profileName, selectedProfileData } = useProfileLoader(
    profileSlug,
    router,
    "/"
  );

  const isBootstrapping =
    !router.isReady || !profileSlug || loading || !selectedProfileData;

  if (isBootstrapping) {
    return (
      <>
        <Head>
          <title>Resume Generator</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div
          style={{
            minHeight: "100vh",
            background: profileColors.bg,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <LoadingSpinner />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Resume Generator - {profileName}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <ProfileGeneratorView
        profileSlug={profileSlug}
        profileName={profileName}
        selectedProfileData={selectedProfileData}
      />
    </>
  );
}
