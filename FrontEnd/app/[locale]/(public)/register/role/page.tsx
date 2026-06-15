import { setRequestLocale } from "next-intl/server";
import { RoleSelector } from "@/components/auth/RoleSelector";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function RolePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RoleSelector />;
}
