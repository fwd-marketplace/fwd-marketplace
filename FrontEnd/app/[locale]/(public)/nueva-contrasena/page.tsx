import { setRequestLocale } from "next-intl/server";
import { NewPasswordForm } from "@/components/auth/NewPasswordForm";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function NuevaContrasenaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <NewPasswordForm />;
}
