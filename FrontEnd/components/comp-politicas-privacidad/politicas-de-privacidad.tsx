'use client';

import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FwdGeoBackdrop } from '@/components/ui/fwd-geo-backdrop';

export function PoliticasDePrivacidad() {
  return (
    <div className="relative min-h-screen bg-secondary font-sans pb-20 pt-32 px-6 md:px-10 lg:px-16 overflow-hidden">
      <FwdGeoBackdrop />
      <div className="relative z-10 mx-auto max-w-4xl bg-surface rounded-xl p-8 md:p-12 shadow-[0_0_40px_rgba(0,0,0,0.2)] border border-white/10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold tracking-tight text-ink-strong">
            Políticas de Privacidad<span className="text-primary">.</span>
          </h1>
          <Button variant="outline" className="flex items-center gap-2 rounded-full border-border-strong hover:bg-canvas" onClick={() => window.print()}>
            <Download className="h-4 w-4" />
            Descargar en PDF
          </Button>
        </div>
        
        <div className="space-y-8 text-ink leading-relaxed">
          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">1. Información General y Responsable</h2>
            <p>
              En la Fundación Forward Costa Rica y el ecosistema FWD Talent, valoramos y respetamos tu privacidad. Esta Política de Privacidad describe cómo recopilamos, utilizamos, almacenamos, compartimos y protegemos tu información personal cuando utilizas nuestro Marketplace de Proyectos Freelance. El responsable del tratamiento de tus datos es la Fundación Forward Costa Rica.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">2. Datos que Recopilamos</h2>
            <p className="mb-2">Recopilamos información para proporcionar y mejorar nuestros servicios. Esto incluye:</p>
            <ul className="list-disc pl-6 space-y-2 text-ink-muted">
              <li><strong>Datos de Registro:</strong> Nombre, correo electrónico, contraseña (encriptada) y rol (Junior o Empresa).</li>
              <li><strong>Información Profesional (Juniors FWD):</strong> Habilidades técnicas, enlaces a portafolios (GitHub, LinkedIn, Behance), historial educativo en la Fundación y experiencia.</li>
              <li><strong>Información Comercial (Empresas):</strong> Nombre de la empresa, descripción, datos de contacto comercial y detalles de los proyectos publicados.</li>
              <li><strong>Datos de Uso:</strong> Información sobre cómo interactúas con la plataforma, registros de acceso y postulaciones.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">3. Uso de la Información</h2>
            <p>
              Utilizamos tus datos personales exclusivamente para:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2 text-ink-muted">
              <li>Facilitar la creación y gestión de tu cuenta en la plataforma.</li>
              <li>Habilitar la herramienta de "matching", conectando perfiles de Juniors FWD con los requerimientos técnicos de los proyectos publicados por las Empresas.</li>
              <li>Permitir la comunicación inicial y las postulaciones a proyectos.</li>
              <li>Enviar notificaciones importantes sobre el estado de tus proyectos, actualizaciones de la plataforma o cambios en nuestras políticas.</li>
              <li>Mejorar el rendimiento, la seguridad y la experiencia de usuario del marketplace.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">4. Compartir y Divulgación de Datos</h2>
            <p className="mb-4">
              La premisa principal del marketplace es conectar talento con oportunidades. Por lo tanto:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-ink-muted mb-4">
              <li><strong>Para Juniors FWD:</strong> Al postularte a un proyecto o hacer tu perfil público, las Empresas registradas podrán ver tu nombre, habilidades, historial de proyectos y portafolio.</li>
              <li><strong>Para Empresas:</strong> La información general de tu empresa y los detalles de los proyectos publicados serán visibles para los Juniors registrados.</li>
            </ul>
            <p className="font-medium bg-warning/10 text-warning px-4 py-3 rounded-lg border border-warning/20">
              <strong>Compromiso:</strong> La Fundación Forward Costa Rica no vende, alquila ni comercializa tu información personal con terceros ajenos al ecosistema FWD Talent bajo ninguna circunstancia.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">5. Retención de Datos</h2>
            <p>
              Conservaremos tu información personal mientras tu cuenta permanezca activa o según sea necesario para proporcionarte los servicios de la plataforma. Si decides eliminar tu cuenta, tus datos personales serán eliminados o anonimizados de nuestros sistemas, salvo aquellos que debamos conservar por obligaciones legales o para la resolución de disputas.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">6. Seguridad de la Información</h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas para proteger tu información contra acceso no autorizado, pérdida o alteración. Esto incluye el uso de encriptación para contraseñas y comunicaciones seguras. Sin embargo, ningún sistema en internet es 100% seguro, por lo que te instamos a utilizar contraseñas fuertes y mantener tus credenciales confidenciales.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">7. Tus Derechos</h2>
            <p>
              Tienes el derecho de acceder, rectificar, actualizar o solicitar la eliminación de tu información personal en cualquier momento. Puedes gestionar la mayoría de tus datos directamente desde la sección "Perfil" en la plataforma. Si deseas ejercer algún derecho adicional o solicitar la eliminación completa de tu cuenta, puedes contactarnos.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">8. Cookies y Tecnologías Similares</h2>
            <p>
              Utilizamos cookies esenciales para mantener tu sesión activa y garantizar la seguridad de tu navegación. También podemos utilizar cookies analíticas de forma anonimizada para entender cómo se utiliza la plataforma y mejorar nuestros servicios. Puedes configurar tu navegador para rechazar cookies, aunque esto podría afectar el funcionamiento del sitio.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">9. Servicios de Terceros e IA</h2>
            <p>
              Para el funcionamiento de la plataforma y el análisis de compatibilidad (matching), utilizamos APIs de terceros (como servicios de IA para procesar coincidencias de habilidades). Los datos enviados a estos servicios se limitan a la información estrictamente necesaria y se procesan bajo acuerdos de confidencialidad y privacidad estrictos.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">10. Cambios a esta Política</h2>
            <p>
              Nos reservamos el derecho de actualizar esta Política de Privacidad periódicamente para reflejar cambios en nuestras prácticas o por requerimientos legales. Te notificaremos sobre actualizaciones significativas mediante un aviso en la plataforma o por correo electrónico.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">11. Contacto</h2>
            <p>
              Si tienes dudas, consultas o inquietudes relacionadas con el manejo de tus datos personales o esta Política de Privacidad, no dudes en ponerte en contacto con el equipo de soporte técnico de la Fundación Forward Costa Rica.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
