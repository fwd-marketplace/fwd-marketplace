import { setRequestLocale } from "next-intl/server";
import { ConfiguracionView } from "@/components/comp-administrador/ConfiguracionView";
import { getAdminSettings } from "@/lib/api/admin";
import type { AdminSettings } from "@/lib/api/types";

interface Props {
  params: Promise<{ locale: string }>;
}

const DEFAULT_SETTINGS: AdminSettings = {
  allow_signups: true,
  allow_companies: true,
  allow_applications: true,
  enable_matching: true,
};

export default async function AdminConfiguracionPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const result = await getAdminSettings();
  const settings = result.ok ? result.data.settings : DEFAULT_SETTINGS;
  return <ConfiguracionView initialSettings={settings} />;
}
