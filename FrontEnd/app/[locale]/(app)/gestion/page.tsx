import { setRequestLocale } from "next-intl/server";
import { getMe } from "@/lib/api/profile";
import { getMyOffers, getProjectById } from "@/lib/api/marketplace";
import { GestionPage } from "@/components/gestion/GestionPage";
import type { ApiProject, ApiRoleName, MyOffer } from "@/lib/api/types";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ demo?: string; proyecto?: string; seccion?: string }>;
}

export default async function GestionRoute({ params, searchParams }: Props) {
  const { locale } = await params;
  const { demo, proyecto, seccion } = await searchParams;
  setRequestLocale(locale);

  const meResult = await getMe();
  const profile  = meResult.ok ? meResult.data.profile : null;
  const authRole = profile?.role.nombre ?? null;

  const demoRole: ApiRoleName | null =
    demo === "empresa" ? "company"
    : demo === "junior" ? "student"
    : null;

  const role   = demoRole ?? authRole;
  const userId = profile?.id ?? null;
  const disponible = profile?.estudiante?.disponible ?? true;

  const isStudent = role === "student" || demoRole === "student";

  // Pre-load offers and project server-side so GestionPage has them immediately.
  let initialOffers: MyOffer[] = [];
  let initialProject: ApiProject | null = null;

  if (isStudent) {
    const [offersResult, projectResult] = await Promise.all([
      getMyOffers(),
      proyecto ? getProjectById(proyecto) : Promise.resolve(null),
    ]);
    if (offersResult.ok) initialOffers = offersResult.data.ofertas;
    if (projectResult && projectResult.ok) initialProject = projectResult.data;
  } else if (proyecto) {
    const projectResult = await getProjectById(proyecto);
    if (projectResult.ok) initialProject = projectResult.data;
  }

  return (
    <GestionPage
      role={role}
      userId={userId}
      initialProjectId={proyecto ?? null}
      initialSection={seccion === "chat" ? "chat" : null}
      disponible={disponible}
      initialOffers={initialOffers}
      initialProject={initialProject}
    />
  );
}
