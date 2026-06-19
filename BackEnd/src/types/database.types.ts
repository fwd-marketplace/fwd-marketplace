export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_logs: {
        Row: {
          duracion_ms: number | null
          fecha: string
          id: string
          id_usuario: string | null
          proveedor: string
          tipo: string
          tokens_input: number | null
          tokens_output: number | null
        }
        Insert: {
          duracion_ms?: number | null
          fecha?: string
          id?: string
          id_usuario?: string | null
          proveedor: string
          tipo: string
          tokens_input?: number | null
          tokens_output?: number | null
        }
        Update: {
          duracion_ms?: number | null
          fecha?: string
          id?: string
          id_usuario?: string | null
          proveedor?: string
          tipo?: string
          tokens_input?: number | null
          tokens_output?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_logs_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_propuesta_ejemplo: {
        Row: {
          fecha: string
          id: string
          id_area_negocio: string | null
          id_usuario: string
          propuesta: Json
          resumen_conversacion: string | null
        }
        Insert: {
          fecha?: string
          id?: string
          id_area_negocio?: string | null
          id_usuario: string
          propuesta: Json
          resumen_conversacion?: string | null
        }
        Update: {
          fecha?: string
          id?: string
          id_area_negocio?: string | null
          id_usuario?: string
          propuesta?: Json
          resumen_conversacion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_propuesta_ejemplo_id_area_negocio_fkey"
            columns: ["id_area_negocio"]
            isOneToOne: false
            referencedRelation: "area_negocio"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_propuesta_ejemplo_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      area_negocio: {
        Row: {
          activo: boolean
          descripcion: string | null
          id: string
          nombre: string
        }
        Insert: {
          activo?: boolean
          descripcion?: string | null
          id?: string
          nombre: string
        }
        Update: {
          activo?: boolean
          descripcion?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      conversacion_ia: {
        Row: {
          estado: string
          fecha: string
          historial: Json
          id: string
          id_empresario: string
          id_proyecto: string | null
        }
        Insert: {
          estado?: string
          fecha?: string
          historial?: Json
          id?: string
          id_empresario: string
          id_proyecto?: string | null
        }
        Update: {
          estado?: string
          fecha?: string
          historial?: Json
          id?: string
          id_empresario?: string
          id_proyecto?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversacion_ia_id_empresario_fkey"
            columns: ["id_empresario"]
            isOneToOne: false
            referencedRelation: "empresario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversacion_ia_id_proyecto_fkey"
            columns: ["id_proyecto"]
            isOneToOne: false
            referencedRelation: "proyecto"
            referencedColumns: ["id"]
          },
        ]
      }
      empresario: {
        Row: {
          apoyo_tecnico_necesario: string | null
          cantidad_empleados: string | null
          cedula_juridica: string | null
          contactos: string | null
          cultura: string | null
          descripcion: string | null
          direccion: string | null
          etapa: string | null
          horario: string | null
          id: string
          id_usuario: string
          mision: string | null
          modalidades: string | null
          nombre_comercial: string | null
          presupuesto: string | null
          sector: string | null
          tipo: string
          tipos_proyecto: string | null
          url_sitio_web: string | null
          valores: string | null
          vision: string | null
        }
        Insert: {
          apoyo_tecnico_necesario?: string | null
          cantidad_empleados?: string | null
          cedula_juridica?: string | null
          contactos?: string | null
          cultura?: string | null
          descripcion?: string | null
          direccion?: string | null
          etapa?: string | null
          horario?: string | null
          id?: string
          id_usuario: string
          mision?: string | null
          modalidades?: string | null
          nombre_comercial?: string | null
          presupuesto?: string | null
          sector?: string | null
          tipo: string
          tipos_proyecto?: string | null
          url_sitio_web?: string | null
          valores?: string | null
          vision?: string | null
        }
        Update: {
          apoyo_tecnico_necesario?: string | null
          cantidad_empleados?: string | null
          cedula_juridica?: string | null
          contactos?: string | null
          cultura?: string | null
          descripcion?: string | null
          direccion?: string | null
          etapa?: string | null
          horario?: string | null
          id?: string
          id_usuario?: string
          mision?: string | null
          modalidades?: string | null
          nombre_comercial?: string | null
          presupuesto?: string | null
          sector?: string | null
          tipo?: string
          tipos_proyecto?: string | null
          url_sitio_web?: string | null
          valores?: string | null
          vision?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "empresario_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      entregable: {
        Row: {
          fecha: string
          group_id: string
          id: string
          id_estado: string
          id_proyecto: string
          id_usuario: string
          tipo: string
          version: number
        }
        Insert: {
          fecha?: string
          group_id: string
          id?: string
          id_estado: string
          id_proyecto: string
          id_usuario: string
          tipo: string
          version?: number
        }
        Update: {
          fecha?: string
          group_id?: string
          id?: string
          id_estado?: string
          id_proyecto?: string
          id_usuario?: string
          tipo?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "entregable_id_estado_fkey"
            columns: ["id_estado"]
            isOneToOne: false
            referencedRelation: "estado_entregable"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entregable_id_proyecto_fkey"
            columns: ["id_proyecto"]
            isOneToOne: false
            referencedRelation: "proyecto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entregable_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      estado_entregable: {
        Row: {
          descripcion: string | null
          id: string
          nombre: string
        }
        Insert: {
          descripcion?: string | null
          id?: string
          nombre: string
        }
        Update: {
          descripcion?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      estado_oferta: {
        Row: {
          descripcion: string | null
          id: string
          nombre: string
        }
        Insert: {
          descripcion?: string | null
          id?: string
          nombre: string
        }
        Update: {
          descripcion?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      estado_proyecto: {
        Row: {
          descripcion: string | null
          es_final: boolean
          id: string
          nombre: string
          orden: number
        }
        Insert: {
          descripcion?: string | null
          es_final?: boolean
          id?: string
          nombre: string
          orden: number
        }
        Update: {
          descripcion?: string | null
          es_final?: boolean
          id?: string
          nombre?: string
          orden?: number
        }
        Relationships: []
      }
      estudiante: {
        Row: {
          descripcion: string | null
          disponibilidad: string | null
          especialidad: string | null
          estado_verificacion: string
          id: string
          id_usuario: string
          modalidad_preferida: string | null
          reputacion: number | null
          titulo_fwd: string | null
          url_avatar: string | null
          url_github: string | null
          url_linkedin: string | null
          url_portfolio: string | null
        }
        Insert: {
          descripcion?: string | null
          disponibilidad?: string | null
          especialidad?: string | null
          estado_verificacion?: string
          id?: string
          id_usuario: string
          modalidad_preferida?: string | null
          reputacion?: number | null
          titulo_fwd?: string | null
          url_avatar?: string | null
          url_github?: string | null
          url_linkedin?: string | null
          url_portfolio?: string | null
        }
        Update: {
          descripcion?: string | null
          disponibilidad?: string | null
          especialidad?: string | null
          estado_verificacion?: string
          id?: string
          id_usuario?: string
          modalidad_preferida?: string | null
          reputacion?: number | null
          titulo_fwd?: string | null
          url_avatar?: string | null
          url_github?: string
          url_linkedin?: string
          url_portfolio?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estudiante_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluacion: {
        Row: {
          comentario: string | null
          fecha: string
          id: string
          id_estudiante: string
          id_proyecto: string
          puntuacion: number
          replica: string | null
        }
        Insert: {
          comentario?: string | null
          fecha?: string
          id?: string
          id_estudiante: string
          id_proyecto: string
          puntuacion: number
          replica?: string | null
        }
        Update: {
          comentario?: string | null
          fecha?: string
          id?: string
          id_estudiante?: string
          id_proyecto?: string
          puntuacion?: number
          replica?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluacion_id_estudiante_fkey"
            columns: ["id_estudiante"]
            isOneToOne: false
            referencedRelation: "estudiante"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluacion_id_proyecto_fkey"
            columns: ["id_proyecto"]
            isOneToOne: true
            referencedRelation: "proyecto"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          id_empresario: string
          id_estudiante: string
          id_proyecto: string | null
          nota: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          id_empresario: string
          id_estudiante: string
          id_proyecto?: string | null
          nota?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          id_empresario?: string
          id_estudiante?: string
          id_proyecto?: string | null
          nota?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "favorites_id_empresario_fkey"
            columns: ["id_empresario"]
            isOneToOne: false
            referencedRelation: "empresario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_id_estudiante_fkey"
            columns: ["id_estudiante"]
            isOneToOne: false
            referencedRelation: "estudiante"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_id_proyecto_fkey"
            columns: ["id_proyecto"]
            isOneToOne: false
            referencedRelation: "proyecto"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          created_at: string
          id: string
          id_empresario: string | null
          id_entregable: string | null
          id_oferta: string | null
          id_usuario: string | null
          storage_path: string
          tamano: number
          tipo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          id_empresario?: string | null
          id_entregable?: string | null
          id_oferta?: string | null
          id_usuario?: string | null
          storage_path: string
          tamano: number
          tipo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          id_empresario?: string | null
          id_entregable?: string | null
          id_oferta?: string | null
          id_usuario?: string | null
          storage_path?: string
          tamano?: number
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_id_empresario_fkey"
            columns: ["id_empresario"]
            isOneToOne: false
            referencedRelation: "empresario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_id_entregable_fkey"
            columns: ["id_entregable"]
            isOneToOne: false
            referencedRelation: "entregable"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_id_oferta_fkey"
            columns: ["id_oferta"]
            isOneToOne: false
            referencedRelation: "oferta"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      historial_estado_proyecto: {
        Row: {
          fecha: string
          id: string
          id_estado_anterior: string | null
          id_estado_nuevo: string
          id_proyecto: string
          id_usuario: string
          motivo: string | null
        }
        Insert: {
          fecha?: string
          id?: string
          id_estado_anterior?: string | null
          id_estado_nuevo: string
          id_proyecto: string
          id_usuario: string
          motivo?: string | null
        }
        Update: {
          fecha?: string
          id?: string
          id_estado_anterior?: string | null
          id_estado_nuevo?: string
          id_proyecto?: string
          id_usuario?: string
          motivo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historial_estado_proyecto_id_estado_anterior_fkey"
            columns: ["id_estado_anterior"]
            isOneToOne: false
            referencedRelation: "estado_proyecto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historial_estado_proyecto_id_estado_nuevo_fkey"
            columns: ["id_estado_nuevo"]
            isOneToOne: false
            referencedRelation: "estado_proyecto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historial_estado_proyecto_id_proyecto_fkey"
            columns: ["id_proyecto"]
            isOneToOne: false
            referencedRelation: "proyecto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historial_estado_proyecto_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mensaje: {
        Row: {
          contenido: string
          es_publico: boolean
          fecha_envio: string
          id: string
          id_destinatario: string | null
          id_proyecto: string
          id_remitente: string
        }
        Insert: {
          contenido: string
          es_publico?: boolean
          fecha_envio?: string
          id?: string
          id_destinatario?: string | null
          id_proyecto: string
          id_remitente: string
        }
        Update: {
          contenido?: string
          es_publico?: boolean
          fecha_envio?: string
          id?: string
          id_destinatario?: string | null
          id_proyecto?: string
          id_remitente?: string
        }
        Relationships: [
          {
            foreignKeyName: "mensaje_id_destinatario_fkey"
            columns: ["id_destinatario"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensaje_id_proyecto_fkey"
            columns: ["id_proyecto"]
            isOneToOne: false
            referencedRelation: "proyecto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensaje_id_remitente_fkey"
            columns: ["id_remitente"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacion: {
        Row: {
          fecha: string
          id: string
          id_usuario: string
          leida: boolean
          mensaje: string
          tipo: string
        }
        Insert: {
          fecha?: string
          id?: string
          id_usuario: string
          leida?: boolean
          mensaje: string
          tipo: string
        }
        Update: {
          fecha?: string
          id?: string
          id_usuario?: string
          leida?: boolean
          mensaje?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacion_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      oferta: {
        Row: {
          calificacion: number | null
          comentario_calificacion: string | null
          fecha_envio: string
          id: string
          id_estado: string
          id_proyecto: string
          id_usuario: string
          propuesta: string
          prototipo_url: string | null
          replica_calificacion: string | null
          updated_at: string
        }
        Insert: {
          calificacion?: number | null
          comentario_calificacion?: string | null
          fecha_envio?: string
          id?: string
          id_estado: string
          id_proyecto: string
          id_usuario: string
          propuesta: string
          prototipo_url?: string | null
          replica_calificacion?: string | null
          updated_at?: string
        }
        Update: {
          calificacion?: number | null
          comentario_calificacion?: string | null
          fecha_envio?: string
          id?: string
          id_estado?: string
          id_proyecto?: string
          id_usuario?: string
          propuesta?: string
          prototipo_url?: string | null
          replica_calificacion?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "oferta_id_estado_fkey"
            columns: ["id_estado"]
            isOneToOne: false
            referencedRelation: "estado_oferta"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oferta_id_proyecto_fkey"
            columns: ["id_proyecto"]
            isOneToOne: false
            referencedRelation: "proyecto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oferta_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      portafolio_proyecto: {
        Row: {
          descripcion: string | null
          fecha: string | null
          id: string
          id_estudiante: string
          tecnologias: string | null
          titulo: string
          url_demo: string | null
          url_repositorio: string | null
          visibilidad: string
        }
        Insert: {
          descripcion?: string | null
          fecha?: string | null
          id?: string
          id_estudiante: string
          tecnologias?: string | null
          titulo: string
          url_demo?: string | null
          url_repositorio?: string | null
          visibilidad?: string
        }
        Update: {
          descripcion?: string | null
          fecha?: string | null
          id?: string
          id_estudiante?: string
          tecnologias?: string | null
          titulo?: string
          url_demo?: string | null
          url_repositorio?: string | null
          visibilidad?: string
        }
        Relationships: [
          {
            foreignKeyName: "portafolio_proyecto_id_estudiante_fkey"
            columns: ["id_estudiante"]
            isOneToOne: false
            referencedRelation: "estudiante"
            referencedColumns: ["id"]
          },
        ]
      }
      project_skills: {
        Row: {
          id_proyecto: string
          id_skill: string
        }
        Insert: {
          id_proyecto: string
          id_skill: string
        }
        Update: {
          id_proyecto?: string
          id_skill?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_skills_id_proyecto_fkey"
            columns: ["id_proyecto"]
            isOneToOne: false
            referencedRelation: "proyecto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_skills_id_skill_fkey"
            columns: ["id_skill"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      proyecto: {
        Row: {
          descripcion: string
          fecha_cierre: string | null
          fecha_publicacion: string | null
          id: string
          id_area_negocio: string
          id_empresario: string
          id_estado: string
          plazo_dias: number
          titulo: string
          usa_ia: boolean
        }
        Insert: {
          descripcion: string
          fecha_cierre?: string | null
          fecha_publicacion?: string | null
          id?: string
          id_area_negocio: string
          id_empresario: string
          id_estado: string
          plazo_dias: number
          titulo: string
          usa_ia?: boolean
        }
        Update: {
          descripcion?: string
          fecha_cierre?: string | null
          fecha_publicacion?: string | null
          id?: string
          id_area_negocio?: string
          id_empresario?: string
          id_estado?: string
          plazo_dias?: number
          titulo?: string
          usa_ia?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "proyecto_id_area_negocio_fkey"
            columns: ["id_area_negocio"]
            isOneToOne: false
            referencedRelation: "area_negocio"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proyecto_id_empresario_fkey"
            columns: ["id_empresario"]
            isOneToOne: false
            referencedRelation: "empresario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proyecto_id_estado_fkey"
            columns: ["id_estado"]
            isOneToOne: false
            referencedRelation: "estado_proyecto"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          descripcion: string | null
          id: string
          nombre: string
        }
        Insert: {
          descripcion?: string | null
          id?: string
          nombre: string
        }
        Update: {
          descripcion?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      roles_permisos: {
        Row: {
          id: string
          id_rol: string
          puede_acceder: boolean
          vista: string
        }
        Insert: {
          id?: string
          id_rol: string
          puede_acceder?: boolean
          vista: string
        }
        Update: {
          id?: string
          id_rol?: string
          puede_acceder?: boolean
          vista?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_permisos_id_rol_fkey"
            columns: ["id_rol"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          categoria: string | null
          id: string
          nombre: string
          tipo: string
        }
        Insert: {
          categoria?: string | null
          id?: string
          nombre: string
          tipo: string
        }
        Update: {
          categoria?: string | null
          id?: string
          nombre?: string
          tipo?: string
        }
        Relationships: []
      }
      student_skills: {
        Row: {
          id_estudiante: string
          id_skill: string
          nivel: string
        }
        Insert: {
          id_estudiante: string
          id_skill: string
          nivel?: string
        }
        Update: {
          id_estudiante?: string
          id_skill?: string
          nivel?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_skills_id_estudiante_fkey"
            columns: ["id_estudiante"]
            isOneToOne: false
            referencedRelation: "estudiante"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_skills_id_skill_fkey"
            columns: ["id_skill"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          apellido1: string | null
          apellido2: string | null
          cedula: string | null
          correo: string
          estado_cuenta: string
          fecha_registro: string
          id: string
          id_rol: string
          nombre: string
          preferencias_notificacion: Json | null
          updated_at: string
        }
        Insert: {
          apellido1?: string | null
          apellido2?: string | null
          cedula?: string | null
          correo: string
          estado_cuenta?: string
          fecha_registro?: string
          id: string
          id_rol: string
          nombre: string
          preferencias_notificacion?: Json | null
          updated_at?: string
        }
        Update: {
          apellido1?: string
          apellido2?: string | null
          cedula?: string
          correo?: string
          estado_cuenta?: string
          fecha_registro?: string
          id?: string
          id_rol?: string
          nombre?: string
          preferencias_notificacion?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_rol_fkey"
            columns: ["id_rol"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      crear_pending_login: {
        Args: {
          p_id_usuario: string
          p_codigo_hash: string
          p_refresh_token: string
          p_ttl_segundos: number
        }
        Returns: string
      }
      consumir_pending_login: {
        Args: {
          p_ticket: string
          p_codigo_hash: string
        }
        Returns: string | null
      }
      onboard_junior: {
        Args: {
          p_user_id: string
          p_correo: string
          p_nombre: string
          p_apellido1: string
          p_apellido2: string | null
          p_cedula: string
          p_especialidad: string
          p_modalidad: string
          p_disponibilidad: string
          p_url_github: string | null
          p_url_linkedin: string | null
          p_url_portfolio: string | null
          p_descripcion: string | null
          p_tech_stack: string[]
        }
        Returns: undefined
      }
      onboard_empresa: {
        Args: {
          p_user_id: string
          p_correo: string
          p_nombre_comercial: string
          p_sector: string
          p_descripcion: string
          p_cedula_juridica: string
          p_direccion: string
          p_tipos_proyecto: string
        }
        Returns: undefined
      }
      onboard_emprendedor: {
        Args: {
          p_user_id: string
          p_correo: string
          p_nombre_proyecto: string
          p_etapa: string
          p_apoyo_tecnico: string
          p_presupuesto: string
          p_descripcion: string | null
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
