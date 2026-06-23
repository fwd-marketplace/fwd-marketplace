import { z } from "zod";

/** Edición de la configuración global. Todos los flags opcionales; al menos uno. */
export const UpdateSettingsSchema = z
  .object({
    allow_signups: z.boolean().optional(),
    allow_companies: z.boolean().optional(),
    allow_applications: z.boolean().optional(),
    enable_matching: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "No hay cambios que aplicar",
  });
export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;
