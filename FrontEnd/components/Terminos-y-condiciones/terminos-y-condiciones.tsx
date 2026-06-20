'use client';

import React, { useEffect } from 'react';
import { Download, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CosmosBackground } from '@/components/ui/cosmos-background';

export function TerminosYCondiciones() {
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
            Términos y Condiciones<span className="text-primary">.</span>
          </h1>
          <Button variant="outline" className="flex items-center gap-2 rounded-full border-border-strong hover:bg-canvas print:hidden" onClick={() => window.print()}>
            <Download className="h-4 w-4" />
            Descargar en PDF
          </Button>
        </div>
        
        <div className="space-y-8 text-ink leading-relaxed">
          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              1. Introducción y Aceptación
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <p>
              Bienvenido al Marketplace de Proyectos Freelance de FWD Talent, una iniciativa de la Fundación Forward Costa Rica. Este documento constituye un acuerdo legalmente vinculante entre usted (el &quot;Usuario&quot;) y la Fundación Forward Costa Rica (&quot;la Fundación&quot;). Al utilizar esta plataforma, usted acepta en su totalidad estos Términos y Condiciones.
            </p>
          </div>
          </details>

          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              2. Naturaleza del Servicio
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <p>
              Nuestra plataforma funciona exclusivamente como un espacio de intermediación tecnológica. Su propósito es conectar a egresados de la Fundación (&quot;Juniors FWD&quot;) con empresas o clientes (&quot;Empresas&quot;) que buscan talento para proyectos de corta duración.
            </p>
          </div>
          </details>

          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              3. Registro y Elegibilidad
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <p>
              Para registrarse como Junior, es un requisito estricto ser egresado certificado de los programas de formación de la Fundación Forward Costa Rica. Las Empresas pueden registrarse tras un proceso de validación comercial. El uso de la plataforma está restringido a mayores de edad.
            </p>
          </div>
          </details>

          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              4. Cuentas de Usuario y Seguridad
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <p>
              El Usuario es el único responsable de salvaguardar la confidencialidad de sus credenciales. Queda estrictamente prohibido compartir cuentas, transferirlas o crear perfiles falsos. Toda actividad realizada desde una cuenta se considerará responsabilidad de su titular.
            </p>
          </div>
          </details>

          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              5. Rol de los Juniors FWD
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <p>
              Los Juniors utilizan la plataforma para acceder a sus primeras oportunidades profesionales remuneradas o pro-bono (según se especifique en cada proyecto), construir experiencia y ampliar su portafolio. Deben actuar siempre con profesionalismo, honestidad y diligencia.
            </p>
          </div>
          </details>

          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              6. Rol de las Empresas
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <p>
              Las Empresas acceden a talento emergente a costos competitivos. Se comprometen a brindar un entorno de respeto, comunicación clara y retroalimentación constructiva, reconociendo que están trabajando con perfiles en etapa formativa o junior.
            </p>
          </div>
          </details>

          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              7. Reglas de Publicación de Proyectos
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <p>
              Todo proyecto debe tener requerimientos claros, plazos definidos y expectativas realistas. No se permitirá la publicación de proyectos ilegales, ofensivos, discriminatorios, o que impliquen el desarrollo de software malicioso.
            </p>
          </div>
          </details>

          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              8. Reglas de Postulación
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <p>
              Los Juniors deben postularse únicamente a proyectos para los cuales posean las habilidades requeridas y la disponibilidad de tiempo necesaria. El abandono injustificado de un proyecto impactará negativamente su reputación en la plataforma.
            </p>
          </div>
          </details>

          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              9. Prohibición de Inteligencia Artificial en Postulaciones
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <div className="bg-warning/10 text-warning px-5 py-4 rounded-xl border border-warning/20">
              <p className="text-sm">
                Toda comunicación y carta de presentación debe ser de autoría humana. <strong>El uso exclusivo de Inteligencia Artificial (ChatGPT, Claude, etc.) para generar mensajes automatizados está prohibido</strong>. Valoramos la autenticidad sobre la perfección sintáctica generada por máquinas.
              </p>
            </div>
          </div>
          </details>

          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              10. Proceso de Selección y Adjudicación
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <p>
              La Empresa es la única responsable de evaluar y seleccionar al candidato idóneo. La Fundación ofrece herramientas de &quot;matching&quot;, pero no garantiza la adjudicación, ni obliga a la Empresa a seleccionar a un Junior específico.
            </p>
          </div>
          </details>

          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              11. Desarrollo y Ejecución de Proyectos
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <p>
              Una vez iniciado el proyecto, ambas partes acuerdan trabajar bajo metodologías ágiles o los estándares pactados. La Fundación no supervisa ni audita el código generado por los Juniors ni las directrices de las Empresas.
            </p>
          </div>
          </details>

          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              12. Comunicación
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <p>
              Se insta a los Usuarios a mantener la comunicación preliminar dentro de la plataforma por seguridad y transparencia. La Fundación se reserva el derecho de auditar las comunicaciones dentro del ecosistema en caso de disputas reportadas.
            </p>
          </div>
          </details>

          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              13. Pagos y Compensaciones
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <p>
              La plataforma <strong>no actúa como procesador de pagos</strong>. Todo acuerdo económico se negocia, factura y liquida externamente entre la Empresa y el Junior. La Fundación no cobra comisiones transaccionales por la adjudicación de proyectos.
            </p>
          </div>
          </details>

          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              14. Relación Laboral
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <p>
              En ningún momento se establece una relación laboral (empleador-empleado) entre la Fundación y el Junior, ni inherentemente entre la Empresa y el Junior (a menos que firmen un contrato laboral formal fuera de la plataforma). La naturaleza predeterminada de los proyectos es <em>freelance</em> o servicios profesionales independientes.
            </p>
          </div>
          </details>

          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              15. Propiedad Intelectual de los Entregables
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <p>
              Como norma general, una vez liquidado el pago acordado, los derechos patrimoniales sobre el código y el producto desarrollado se transfieren a la Empresa. Los derechos morales del autor son inalienables según la ley aplicable.
            </p>
          </div>
          </details>

          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              16. Derechos de Portafolio
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <p>
              Salvo prohibición explícita vía NDA (Acuerdo de Confidencialidad), los Juniors conservan el derecho de mencionar el proyecto, describir la arquitectura y mostrar capturas de pantalla de la interfaz pública en sus portafolios profesionales con fines de promoción laboral.
            </p>
          </div>
          </details>

          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              17. Confidencialidad y NDAs
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <p>
              Las Empresas pueden requerir la firma de un Acuerdo de Confidencialidad (NDA) antes de compartir detalles sensibles. Es responsabilidad del Junior leer, comprender y acatar las restricciones de cualquier contrato legal firmado externamente.
            </p>
          </div>
          </details>

          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              18. Comportamiento y Código de Conducta
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <p>
              Tolerancia cero ante acoso, discriminación, extorsión, lenguaje abusivo o prácticas fraudulentas. Cualquier violación al código de conducta resultará en la expulsión inmediata del infractor del ecosistema de FWD Talent.
            </p>
          </div>
          </details>

          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              19. Responsabilidad y Limitaciones (Disclaimer)
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <p>
              La Fundación provee la plataforma &quot;tal cual&quot; (as is) sin garantías implícitas. No seremos responsables por daños indirectos, lucro cesante, pérdida de datos o interrupciones de negocio derivados del uso de la plataforma o del resultado de los proyectos freelance.
            </p>
          </div>
          </details>

          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              20. Privacidad y Tratamiento de Datos
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <p>
              Toda recolección y tratamiento de datos personales se rige por nuestra Política de Privacidad, alineada a las regulaciones nacionales pertinentes. La información se utiliza exclusivamente para fines de &quot;matching&quot; y operación de la plataforma.
            </p>
          </div>
          </details>

          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              21. Resolución de Disputas
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <p>
              Las diferencias entre Empresa y Junior deben resolverse de mutuo acuerdo. La Fundación no ofrece servicios de mediación legal o arbitraje, y se exime de participar en cualquier litigio derivado de la ejecución de los proyectos.
            </p>
          </div>
          </details>

          <details className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              22. Modificaciones a los Términos
              <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                <ChevronDown className="h-6 w-6 text-primary" />
              </span>
            </summary>
            <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <p>
              Nos reservamos el derecho de modificar estos Términos en cualquier momento. Cualquier actualización será notificada a través de la plataforma. Su uso continuado implica la aceptación de los nuevos términos.
            </p>
          </div>
          </details>
        </div>
      </div>
    </div>
  );
}
