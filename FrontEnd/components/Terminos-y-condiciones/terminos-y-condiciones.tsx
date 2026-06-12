'use client';

import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FwdGeoBackdrop } from '@/components/ui/fwd-geo-backdrop';

export function TerminosYCondiciones() {
  return (
    <div className="relative min-h-screen bg-secondary font-sans pb-20 pt-32 px-6 md:px-10 lg:px-16 overflow-hidden">
      <FwdGeoBackdrop />
      <div className="relative z-10 mx-auto max-w-4xl bg-surface rounded-xl p-8 md:p-12 shadow-[0_0_40px_rgba(0,0,0,0.2)] border border-white/10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold tracking-tight text-ink-strong">
            Términos y Condiciones<span className="text-primary">.</span>
          </h1>
          <Button variant="outline" className="flex items-center gap-2 rounded-full border-border-strong hover:bg-canvas" onClick={() => window.print()}>
            <Download className="h-4 w-4" />
            Descargar en PDF
          </Button>
        </div>
        
        <div className="space-y-8 text-ink leading-relaxed">
          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">1. Introducción y Aceptación</h2>
            <p>
              Bienvenido al Marketplace de Proyectos Freelance de FWD Talent, una iniciativa de la Fundación Forward Costa Rica. Este documento constituye un acuerdo legalmente vinculante entre usted (el "Usuario") y la Fundación Forward Costa Rica ("la Fundación"). Al utilizar esta plataforma, usted acepta en su totalidad estos Términos y Condiciones.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">2. Naturaleza del Servicio</h2>
            <p>
              Nuestra plataforma funciona exclusivamente como un espacio de intermediación tecnológica. Su propósito es conectar a egresados de la Fundación ("Juniors FWD") con empresas o clientes ("Empresas") que buscan talento para proyectos de corta duración.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">3. Registro y Elegibilidad</h2>
            <p>
              Para registrarse como Junior, es un requisito estricto ser egresado certificado de los programas de formación de la Fundación Forward Costa Rica. Las Empresas pueden registrarse tras un proceso de validación comercial. El uso de la plataforma está restringido a mayores de edad.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">4. Cuentas de Usuario y Seguridad</h2>
            <p>
              El Usuario es el único responsable de salvaguardar la confidencialidad de sus credenciales. Queda estrictamente prohibido compartir cuentas, transferirlas o crear perfiles falsos. Toda actividad realizada desde una cuenta se considerará responsabilidad de su titular.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">5. Rol de los Juniors FWD</h2>
            <p>
              Los Juniors utilizan la plataforma para acceder a sus primeras oportunidades profesionales remuneradas o pro-bono (según se especifique en cada proyecto), construir experiencia y ampliar su portafolio. Deben actuar siempre con profesionalismo, honestidad y diligencia.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">6. Rol de las Empresas</h2>
            <p>
              Las Empresas acceden a talento emergente a costos competitivos. Se comprometen a brindar un entorno de respeto, comunicación clara y retroalimentación constructiva, reconociendo que están trabajando con perfiles en etapa formativa o junior.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">7. Reglas de Publicación de Proyectos</h2>
            <p>
              Todo proyecto debe tener requerimientos claros, plazos definidos y expectativas realistas. No se permitirá la publicación de proyectos ilegales, ofensivos, discriminatorios, o que impliquen el desarrollo de software malicioso.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">8. Reglas de Postulación</h2>
            <p>
              Los Juniors deben postularse únicamente a proyectos para los cuales posean las habilidades requeridas y la disponibilidad de tiempo necesaria. El abandono injustificado de un proyecto impactará negativamente su reputación en la plataforma.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">9. Prohibición de Inteligencia Artificial en Postulaciones</h2>
            <div className="bg-warning/10 text-warning px-5 py-4 rounded-xl border border-warning/20">
              <p className="text-sm">
                Toda comunicación y carta de presentación debe ser de autoría humana. <strong>El uso exclusivo de Inteligencia Artificial (ChatGPT, Claude, etc.) para generar mensajes automatizados está prohibido</strong>. Valoramos la autenticidad sobre la perfección sintáctica generada por máquinas.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">10. Proceso de Selección y Adjudicación</h2>
            <p>
              La Empresa es la única responsable de evaluar y seleccionar al candidato idóneo. La Fundación ofrece herramientas de "matching", pero no garantiza la adjudicación, ni obliga a la Empresa a seleccionar a un Junior específico.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">11. Desarrollo y Ejecución de Proyectos</h2>
            <p>
              Una vez iniciado el proyecto, ambas partes acuerdan trabajar bajo metodologías ágiles o los estándares pactados. La Fundación no supervisa ni audita el código generado por los Juniors ni las directrices de las Empresas.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">12. Comunicación</h2>
            <p>
              Se insta a los Usuarios a mantener la comunicación preliminar dentro de la plataforma por seguridad y transparencia. La Fundación se reserva el derecho de auditar las comunicaciones dentro del ecosistema en caso de disputas reportadas.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">13. Pagos y Compensaciones</h2>
            <p>
              La plataforma <strong>no actúa como procesador de pagos</strong>. Todo acuerdo económico se negocia, factura y liquida externamente entre la Empresa y el Junior. La Fundación no cobra comisiones transaccionales por la adjudicación de proyectos.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">14. Relación Laboral</h2>
            <p>
              En ningún momento se establece una relación laboral (empleador-empleado) entre la Fundación y el Junior, ni inherentemente entre la Empresa y el Junior (a menos que firmen un contrato laboral formal fuera de la plataforma). La naturaleza predeterminada de los proyectos es <em>freelance</em> o servicios profesionales independientes.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">15. Propiedad Intelectual de los Entregables</h2>
            <p>
              Como norma general, una vez liquidado el pago acordado, los derechos patrimoniales sobre el código y el producto desarrollado se transfieren a la Empresa. Los derechos morales del autor son inalienables según la ley aplicable.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">16. Derechos de Portafolio</h2>
            <p>
              Salvo prohibición explícita vía NDA (Acuerdo de Confidencialidad), los Juniors conservan el derecho de mencionar el proyecto, describir la arquitectura y mostrar capturas de pantalla de la interfaz pública en sus portafolios profesionales con fines de promoción laboral.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">17. Confidencialidad y NDAs</h2>
            <p>
              Las Empresas pueden requerir la firma de un Acuerdo de Confidencialidad (NDA) antes de compartir detalles sensibles. Es responsabilidad del Junior leer, comprender y acatar las restricciones de cualquier contrato legal firmado externamente.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">18. Comportamiento y Código de Conducta</h2>
            <p>
              Tolerancia cero ante acoso, discriminación, extorsión, lenguaje abusivo o prácticas fraudulentas. Cualquier violación al código de conducta resultará en la expulsión inmediata del infractor del ecosistema de FWD Talent.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">19. Responsabilidad y Limitaciones (Disclaimer)</h2>
            <p>
              La Fundación provee la plataforma "tal cual" (as is) sin garantías implícitas. No seremos responsables por daños indirectos, lucro cesante, pérdida de datos o interrupciones de negocio derivados del uso de la plataforma o del resultado de los proyectos freelance.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">20. Privacidad y Tratamiento de Datos</h2>
            <p>
              Toda recolección y tratamiento de datos personales se rige por nuestra Política de Privacidad, alineada a las regulaciones nacionales pertinentes. La información se utiliza exclusivamente para fines de "matching" y operación de la plataforma.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">21. Resolución de Disputas</h2>
            <p>
              Las diferencias entre Empresa y Junior deben resolverse de mutuo acuerdo. La Fundación no ofrece servicios de mediación legal o arbitraje, y se exime de participar en cualquier litigio derivado de la ejecución de los proyectos.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-ink-strong mb-4">22. Modificaciones a los Términos</h2>
            <p>
              Nos reservamos el derecho de modificar estos Términos en cualquier momento. Cualquier actualización será notificada a través de la plataforma. Su uso continuado implica la aceptación de los nuevos términos.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
