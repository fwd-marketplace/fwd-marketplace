/**
 * Tipos de la base de datos de Supabase.
 *
 * La BD se define DIRECTAMENTE en Supabase, así que estos tipos NO se escriben
 * a mano: se generan desde el esquema en cuanto tengas tablas.
 *
 *   npx supabase gen types typescript --project-id <TU_PROJECT_ID> > src/types/database.types.ts
 *
 * Mientras tanto, dejamos un esquema vacío (solo usamos Supabase Auth, que no
 * pasa por estos tipos). Al generar el archivo real, este placeholder se reemplaza.
 */
export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
