import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ demo?: string }>;
}

export default async function ProcesoRedirect({ params, searchParams }: Props) {
  const { locale, id } = await params;
  const { demo } = await searchParams;
  const demoParam = demo ? `&demo=${demo}` : "";
  redirect(`/${locale}/gestion?proyecto=${id}${demoParam}`);
}
