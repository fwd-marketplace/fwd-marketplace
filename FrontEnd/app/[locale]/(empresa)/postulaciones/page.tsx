import { setRequestLocale } from "next-intl/server";
import { PostulacionesEmpresa } from "@/components/comp-perfil-empresa/PostulacionesEmpresa";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function PostulacionesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-[100dvh] bg-canvas px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl">
        <PostulacionesEmpresa />
      </div>
    </main>
  );
}
