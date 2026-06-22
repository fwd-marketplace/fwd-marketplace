import { z } from "zod";

/** Roles válidos (coinciden con la tabla `roles` y con `ApiRoleName` del FrontEnd). */
export const USER_ROLE_VALUES = ["student", "company", "admin"] as const;

/** Estados de cuenta válidos (coinciden con el CHECK de `users.estado_cuenta`). */
export const ACCOUNT_STATE_VALUES = ["activa", "pendiente", "suspendida", "rechazada"] as const;

const MIN_PASSWORD_LENGTH = 8;
const MAX_NAME_LENGTH = 100;

/**
 * Alta de usuario por un admin: crea la cuenta base (Auth + fila `users`) y el rol.
 * El perfil completo (estudiante/empresario) lo llena luego el propio usuario en
 * el onboarding, así que aquí solo se piden los datos mínimos de la cuenta.
 */
export const CreateUserSchema = z.object({
  correo: z.string().email("El correo no es válido"),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`),
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(MAX_NAME_LENGTH),
  apellido1: z.string().trim().max(MAX_NAME_LENGTH).optional(),
  rol: z.enum(USER_ROLE_VALUES),
});
export type CreateUserInput = z.infer<typeof CreateUserSchema>;

/** Edición de un usuario por un admin. Todos los campos opcionales; al menos uno. */
export const UpdateUserSchema = z
  .object({
    nombre: z.string().trim().min(1).max(MAX_NAME_LENGTH).optional(),
    apellido1: z.string().trim().max(MAX_NAME_LENGTH).optional(),
    apellido2: z.string().trim().max(MAX_NAME_LENGTH).nullable().optional(),
    correo: z.string().email("El correo no es válido").optional(),
    rol: z.enum(USER_ROLE_VALUES).optional(),
    estado_cuenta: z.enum(ACCOUNT_STATE_VALUES).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "No hay cambios que aplicar",
  });
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
