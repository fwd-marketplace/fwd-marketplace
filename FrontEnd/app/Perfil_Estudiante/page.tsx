import PerfilUsuario from "@/components/CompPerfilEstudiante/PerfilUsuario";
import { MOCK_PROFILE, MOCK_ACTIVITIES, MOCK_APPLICATIONS } from "@/app/Perfil_Estudiante/mock-data";

export default function EstudianteProfile() {
  return (
    <PerfilUsuario
      initialProfile={MOCK_PROFILE}
      initialActivities={MOCK_ACTIVITIES}
      initialApplications={MOCK_APPLICATIONS}
    />
  );
}