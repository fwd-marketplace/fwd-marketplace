import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function ProjectDetailRedirect({ params }: Props) {
  const { locale, id } = await params;
  redirect(`/${locale}/marketplace/${id}/proceso`);
}
