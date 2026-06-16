import { setRequestLocale } from "next-intl/server";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function RecuperarContrasenaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ResetPasswordForm />;
}
