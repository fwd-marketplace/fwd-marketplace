'use client';

import React, { useEffect } from 'react';
import { Download, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CosmosBackground } from '@/components/ui/cosmos-background';

export function PoliticasDePrivacidad() {
  useEffect(() => {
    const beforePrint = () => {
      document.querySelectorAll('details').forEach(d => d.setAttribute('open', ''));
    };
    const afterPrint = () => {
      document.querySelectorAll('details').forEach(d => d.removeAttribute('open'));
    };
    window.addEventListener('beforeprint', beforePrint);
    window.addEventListener('afterprint', afterPrint);
    return () => {
      window.removeEventListener('beforeprint', beforePrint);
      window.removeEventListener('afterprint', afterPrint);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-secondary font-sans pb-20 pt-32 px-6 md:px-10 lg:px-16 overflow-hidden print:bg-transparent print:p-0 print:m-0 print:min-h-0 print:block">
      <style>{`
        @media print {
          header, nav, [data-navbar] { display: none !important; }
          body { background: white !important; color: black !important; margin: 0; padding: 0; }
          details > :not(summary) { display: block !important; }
          details { border-bottom: none !important; }
        }
      `}</style>
      <div className="print:hidden">
        <CosmosBackground showMoon />
      </div>
      <div className="relative z-10 mx-auto max-w-4xl bg-surface rounded-xl p-8 md:p-12 shadow-[0_0_40px_rgba(0,0,0,0.2)] border border-white/10 print:bg-transparent print:shadow-none print:border-none print:p-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold tracking-tight text-ink-strong">
            Políticas de Privacidad<span className="text-primary">.</span>
          </h1>
          <Button variant="outline" className="flex items-center gap-2 rounded-full border-border-strong hover:bg-canvas print:hidden" onClick={() => window.print()}>
            <Download className="h-4 w-4" />
            Descargar en PDF
          </Button>
        </div>
        
        <div className="space-y-8 text-ink leading-relaxed">
          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              1. Información General y Responsable
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <p>
              En la Fundación Forward Costa Rica y el ecosistema FWD Talent, valoramos y respetamos tu privacidad. Esta Política de Privacidad describe cómo recopilamos, utilizamos, almacenamos, compartimos y protegemos tu información personal cuando utilizas nuestro Marketplace de Proyectos Freelance. El responsable del tratamiento de tus datos es la Fundación Forward Costa Rica.
            </p>
          </div>
          </details>

          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              2. Datos que Recopilamos
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <p className="mb-2">Recopilamos información para proporcionar y mejorar nuestros servicios. Esto incluye:</p>
            <ul className="list-disc pl-6 space-y-2 text-ink-muted">
              <li><strong>Datos de Registro:</strong> Nombre, correo electrónico, contraseña (encriptada) y rol (Junior o Empresa).</li>
              <li><strong>Información Profesional (Juniors FWD):</strong> Habilidades técnicas, enlaces a portafolios (GitHub, LinkedIn, Behance), historial educativo en la Fundación y experiencia.</li>
              <li><strong>Información Comercial (Empresas):</strong> Nombre de la empresa, descripción, datos de contacto comercial y detalles de los proyectos publicados.</li>
              <li><strong>Datos de Uso:</strong> Información sobre cómo interactúas con la plataforma, registros de acceso y postulaciones.</li>
            </ul>
          </div>
          </details>

          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              3. Uso de la Información
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <p>
              Utilizamos tus datos personales exclusivamente para:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2 text-ink-muted">
              <li>Facilitar la creación y gestión de tu cuenta en la plataforma.</li>
              <li>Habilitar la herramienta de &quot;matching&quot;, conectando perfiles de Juniors FWD con los requerimientos técnicos de los proyectos publicados por las Empresas.</li>
              <li>Permitir la comunicación inicial y las postulaciones a proyectos.</li>
              <li>Enviar notificaciones importantes sobre el estado de tus proyectos, actualizaciones de la plataforma o cambios en nuestras políticas.</li>
              <li>Mejorar el rendimiento, la seguridad y la experiencia de usuario del marketplace.</li>
            </ul>
          </div>
          </details>

          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              4. Compartir y Divulgación de Datos
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
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
          </div>
          </details>

          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              5. Retención de Datos
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <p>
              Conservaremos tu información personal mientras tu cuenta permanezca activa o según sea necesario para proporcionarte los servicios de la plataforma. Si decides eliminar tu cuenta, tus datos personales serán eliminados o anonimizados de nuestros sistemas, salvo aquellos que debamos conservar por obligaciones legales o para la resolución de disputas.
            </p>
          </div>
          </details>

          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              6. Seguridad de la Información
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <p>
              Implementamos medidas de seguridad técnicas y organizativas para proteger tu información contra acceso no autorizado, pérdida o alteración. Esto incluye el uso de encriptación para contraseñas y comunicaciones seguras. Sin embargo, ningún sistema en internet es 100% seguro, por lo que te instamos a utilizar contraseñas fuertes y mantener tus credenciales confidenciales.
            </p>
          </div>
          </details>

          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              7. Tus Derechos
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <p>
              Tienes el derecho de acceder, rectificar, actualizar o solicitar la eliminación de tu información personal en cualquier momento. Puedes gestionar la mayoría de tus datos directamente desde la sección &quot;Perfil&quot; en la plataforma. Si deseas ejercer algún derecho adicional o solicitar la eliminación completa de tu cuenta, puedes contactarnos.
            </p>
          </div>
          </details>

          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              8. Cookies y Tecnologías Similares
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <p>
              Utilizamos cookies esenciales para mantener tu sesión activa y garantizar la seguridad de tu navegación. También podemos utilizar cookies analíticas de forma anonimizada para entender cómo se utiliza la plataforma y mejorar nuestros servicios. Puedes configurar tu navegador para rechazar cookies, aunque esto podría afectar el funcionamiento del sitio.
            </p>
          </div>
          </details>

          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              9. Servicios de Terceros e IA
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <p>
              Para el funcionamiento de la plataforma y el análisis de compatibilidad (matching), utilizamos APIs de terceros (como servicios de IA para procesar coincidencias de habilidades). Los datos enviados a estos servicios se limitan a la información estrictamente necesaria y se procesan bajo acuerdos de confidencialidad y privacidad estrictos.
            </p>
          </div>
          </details>

          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              10. Cambios a esta Política
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <p>
              Nos reservamos el derecho de actualizar esta Política de Privacidad periódicamente para reflejar cambios en nuestras prácticas o por requerimientos legales. Te notificaremos sobre actualizaciones significativas mediante un aviso en la plataforma o por correo electrónico.
            </p>
          </div>
          </details>

          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              11. Contacto
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <p>
              Si tienes dudas, consultas o inquietudes relacionadas con el manejo de tus datos personales o esta Política de Privacidad, no dudes en ponerte en contacto con el equipo de soporte técnico de la Fundación Forward Costa Rica.
            </p>
          </div>
          </details>
        </div>
      </div>
    </div>
  );
}
