import { z } from "zod";

/** Tipos de empresario válidos (coinciden con el CHECK de `empresario.tipo`). */
export const COMPANY_TYPE_VALUES = ["empresa", "emprendedor"] as const;

const MIN_PASSWORD_LENGTH = 8;
const MAX_NAME_LENGTH = 100;
const MAX_COMMERCIAL_NAME_LENGTH = 150;

/**
 * Alta de empresa por un admin: crea la cuenta base (Auth + `users` con rol company)
 * y un perfil `empresario` mínimo (tipo + nombre comercial) para que aparezca de una
 * en el listado y se pueda editar. El resto del perfil lo completa la empresa luego.
 */
export const CreateCompanySchema = z.object({
  correo: z.string().email("El correo no es válido"),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`),
  nombre: z.string().trim().min(1, "El nombre de contacto es obligatorio").max(MAX_NAME_LENGTH),
  apellido1: z.string().trim().max(MAX_NAME_LENGTH).optional(),
  tipo: z.enum(COMPANY_TYPE_VALUES),
  nombre_comercial: z.string().trim().min(1, "El nombre comercial es obligatorio").max(MAX_COMMERCIAL_NAME_LENGTH),
  sector: z.string().trim().max(MAX_COMMERCIAL_NAME_LENGTH).optional(),
});
export type CreateCompanyInput = z.infer<typeof CreateCompanySchema>;

/** Edición del perfil `empresario` por un admin. Todos opcionales; al menos uno. */
export const UpdateCompanySchema = z
  .object({
    tipo: z.enum(COMPANY_TYPE_VALUES).optional(),
    nombre_comercial: z.string().trim().min(1).max(MAX_COMMERCIAL_NAME_LENGTH).optional(),
    sector: z.string().trim().max(MAX_COMMERCIAL_NAME_LENGTH).optional(),
    etapa: z.string().trim().max(MAX_COMMERCIAL_NAME_LENGTH).optional(),
    descripcion: z.string().trim().optional(),
    direccion: z.string().trim().optional(),
    url_sitio_web: z.string().trim().max(MAX_COMMERCIAL_NAME_LENGTH * 3).optional(),
    cantidad_empleados: z.string().trim().max(MAX_COMMERCIAL_NAME_LENGTH).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "No hay cambios que aplicar",
  });
export type UpdateCompanyInput = z.infer<typeof UpdateCompanySchema>;
