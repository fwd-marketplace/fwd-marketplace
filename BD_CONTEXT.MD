{
    "enums": [
    ],
    "tablas": [
        {
            "tabla": "ai_logs",
            "unique": [
            ],
            "columnas": [
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id",
                    "default": "gen_random_uuid()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 1
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "tipo",
                    "default": null,
                    "max_len": 20,
                    "nullable": "NO",
                    "posicion": 2
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_usuario",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 3
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "proveedor",
                    "default": null,
                    "max_len": 20,
                    "nullable": "NO",
                    "posicion": 4
                },
                {
                    "udt": "int4",
                    "tipo": "integer",
                    "columna": "tokens_input",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 5
                },
                {
                    "udt": "int4",
                    "tipo": "integer",
                    "columna": "tokens_output",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 6
                },
                {
                    "udt": "int4",
                    "tipo": "integer",
                    "columna": "duracion_ms",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 7
                },
                {
                    "udt": "timestamptz",
                    "tipo": "timestamp with time zone",
                    "columna": "fecha",
                    "default": "now()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 8
                }
            ],
            "policies": [
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "is_admin()",
                    "nombre": "ai_logs_admin",
                    "operacion": "SELECT"
                }
            ],
            "primary_key": [
                "id"
            ],
            "foreign_keys": [
                {
                    "columna": "id_usuario",
                    "constraint": "ai_logs_id_usuario_fkey",
                    "referencia_tabla": "users",
                    "referencia_columna": "id"
                }
            ],
            "rls_activado": true,
            "check_constraints": [
                {
                    "clausula": "((proveedor)::text = ANY ((ARRAY['groq'::character varying, 'gemini'::character varying])::text[]))",
                    "constraint": "ai_logs_proveedor_check"
                },
                {
                    "clausula": "id IS NOT NULL",
                    "constraint": "2200_17959_1_not_null"
                },
                {
                    "clausula": "tipo IS NOT NULL",
                    "constraint": "2200_17959_2_not_null"
                },
                {
                    "clausula": "proveedor IS NOT NULL",
                    "constraint": "2200_17959_4_not_null"
                },
                {
                    "clausula": "fecha IS NOT NULL",
                    "constraint": "2200_17959_8_not_null"
                },
                {
                    "clausula": "((tipo)::text = ANY ((ARRAY['agente'::character varying, 'matching'::character varying, 'sugerencia'::character varying])::text[]))",
                    "constraint": "ai_logs_tipo_check"
                }
            ]
        },
        {
            "tabla": "area_negocio",
            "unique": [
                "area_negocio_nombre_key"
            ],
            "columnas": [
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id",
                    "default": "gen_random_uuid()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 1
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "nombre",
                    "default": null,
                    "max_len": 100,
                    "nullable": "NO",
                    "posicion": 2
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "descripcion",
                    "default": null,
                    "max_len": 255,
                    "nullable": "YES",
                    "posicion": 3
                },
                {
                    "udt": "bool",
                    "tipo": "boolean",
                    "columna": "activo",
                    "default": "true",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 4
                }
            ],
            "policies": [
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(auth.uid() IS NOT NULL)",
                    "nombre": "catalogo_lectura",
                    "operacion": "SELECT"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "is_admin()",
                    "nombre": "admin_catalogo",
                    "operacion": "ALL"
                }
            ],
            "primary_key": [
                "id"
            ],
            "foreign_keys": [
            ],
            "rls_activado": true,
            "check_constraints": [
                {
                    "clausula": "activo IS NOT NULL",
                    "constraint": "2200_17608_4_not_null"
                },
                {
                    "clausula": "id IS NOT NULL",
                    "constraint": "2200_17608_1_not_null"
                },
                {
                    "clausula": "nombre IS NOT NULL",
                    "constraint": "2200_17608_2_not_null"
                }
            ]
        },
        {
            "tabla": "conversacion_ia",
            "unique": [
            ],
            "columnas": [
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id",
                    "default": "gen_random_uuid()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 1
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_empresario",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 2
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_proyecto",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 3
                },
                {
                    "udt": "jsonb",
                    "tipo": "jsonb",
                    "columna": "historial",
                    "default": "'[]'::jsonb",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 4
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "estado",
                    "default": "'en_curso'::character varying",
                    "max_len": 20,
                    "nullable": "NO",
                    "posicion": 5
                },
                {
                    "udt": "timestamptz",
                    "tipo": "timestamp with time zone",
                    "columna": "fecha",
                    "default": "now()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 6
                }
            ],
            "policies": [
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(id_empresario IN ( SELECT empresario.id\n   FROM empresario\n  WHERE (empresario.id_usuario = auth.uid())))",
                    "nombre": "conv_ia_actualizar",
                    "operacion": "UPDATE"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "((id_empresario IN ( SELECT empresario.id\n   FROM empresario\n  WHERE (empresario.id_usuario = auth.uid()))) OR is_admin())",
                    "nombre": "conv_ia_ver",
                    "operacion": "SELECT"
                },
                {
                    "check": "(id_empresario IN ( SELECT empresario.id\n   FROM empresario\n  WHERE (empresario.id_usuario = auth.uid())))",
                    "roles": [
                        "public"
                    ],
                    "using": null,
                    "nombre": "conv_ia_crear",
                    "operacion": "INSERT"
                }
            ],
            "primary_key": [
                "id"
            ],
            "foreign_keys": [
                {
                    "columna": "id_proyecto",
                    "constraint": "conversacion_ia_id_proyecto_fkey",
                    "referencia_tabla": "proyecto",
                    "referencia_columna": "id"
                },
                {
                    "columna": "id_empresario",
                    "constraint": "conversacion_ia_id_empresario_fkey",
                    "referencia_tabla": "empresario",
                    "referencia_columna": "id"
                }
            ],
            "rls_activado": true,
            "check_constraints": [
                {
                    "clausula": "estado IS NOT NULL",
                    "constraint": "2200_17790_5_not_null"
                },
                {
                    "clausula": "historial IS NOT NULL",
                    "constraint": "2200_17790_4_not_null"
                },
                {
                    "clausula": "id_empresario IS NOT NULL",
                    "constraint": "2200_17790_2_not_null"
                },
                {
                    "clausula": "id IS NOT NULL",
                    "constraint": "2200_17790_1_not_null"
                },
                {
                    "clausula": "((estado)::text = ANY ((ARRAY['en_curso'::character varying, 'finalizada'::character varying])::text[]))",
                    "constraint": "conversacion_ia_estado_check"
                },
                {
                    "clausula": "fecha IS NOT NULL",
                    "constraint": "2200_17790_6_not_null"
                }
            ]
        },
        {
            "tabla": "empresario",
            "unique": [
                "empresario_id_usuario_key"
            ],
            "columnas": [
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id",
                    "default": "gen_random_uuid()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 1
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_usuario",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 2
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "tipo",
                    "default": null,
                    "max_len": 20,
                    "nullable": "NO",
                    "posicion": 3
                },
                {
                    "udt": "text",
                    "tipo": "text",
                    "columna": "sector",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 4
                },
                {
                    "udt": "text",
                    "tipo": "text",
                    "columna": "descripcion",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 5
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "nombre_comercial",
                    "default": null,
                    "max_len": 255,
                    "nullable": "YES",
                    "posicion": 6
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "cedula_juridica",
                    "default": null,
                    "max_len": 30,
                    "nullable": "YES",
                    "posicion": 7
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "url_sitio_web",
                    "default": null,
                    "max_len": 500,
                    "nullable": "YES",
                    "posicion": 8
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "etapa",
                    "default": null,
                    "max_len": 20,
                    "nullable": "YES",
                    "posicion": 9
                },
                {
                    "udt": "text",
                    "tipo": "text",
                    "columna": "apoyo_tecnico_necesario",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 10
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "presupuesto",
                    "default": null,
                    "max_len": 30,
                    "nullable": "YES",
                    "posicion": 11
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "tipos_proyecto",
                    "default": null,
                    "max_len": 500,
                    "nullable": "YES",
                    "posicion": 12
                },
                {
                    "udt": "text",
                    "tipo": "text",
                    "columna": "direccion",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 13
                },
                {
                    "udt": "text",
                    "tipo": "text",
                    "columna": "mision",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 14
                },
                {
                    "udt": "text",
                    "tipo": "text",
                    "columna": "vision",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 15
                },
                {
                    "udt": "text",
                    "tipo": "text",
                    "columna": "cultura",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 16
                },
                {
                    "udt": "text",
                    "tipo": "text",
                    "columna": "valores",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 17
                },
                {
                    "udt": "text",
                    "tipo": "text",
                    "columna": "contactos",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 18
                },
                {
                    "udt": "text",
                    "tipo": "text",
                    "columna": "cantidad_empleados",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 19
                }
            ],
            "policies": [
                {
                    "check": "(id_usuario = auth.uid())",
                    "roles": [
                        "public"
                    ],
                    "using": null,
                    "nombre": "empresario_crear_perfil",
                    "operacion": "INSERT"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(auth.uid() IS NOT NULL)",
                    "nombre": "empresario_ver_perfil",
                    "operacion": "SELECT"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(id_usuario = auth.uid())",
                    "nombre": "empresario_editar_perfil",
                    "operacion": "UPDATE"
                }
            ],
            "primary_key": [
                "id"
            ],
            "foreign_keys": [
                {
                    "columna": "id_usuario",
                    "constraint": "empresario_id_usuario_fkey",
                    "referencia_tabla": "users",
                    "referencia_columna": "id"
                }
            ],
            "rls_activado": true,
            "check_constraints": [
                {
                    "clausula": "id IS NOT NULL",
                    "constraint": "2200_17668_1_not_null"
                },
                {
                    "clausula": "((etapa)::text = ANY ((ARRAY['idea'::character varying, 'mvp'::character varying, 'validating'::character varying, 'scaling'::character varying])::text[]))",
                    "constraint": "empresario_etapa_check"
                },
                {
                    "clausula": "((presupuesto)::text = ANY ((ARRAY['under_500'::character varying, 'range_500_1000'::character varying, 'range_1000_2500'::character varying, 'flexible'::character varying])::text[]))",
                    "constraint": "empresario_presupuesto_check"
                },
                {
                    "clausula": "tipo IS NOT NULL",
                    "constraint": "2200_17668_3_not_null"
                },
                {
                    "clausula": "id_usuario IS NOT NULL",
                    "constraint": "2200_17668_2_not_null"
                },
                {
                    "clausula": "((tipo)::text = ANY ((ARRAY['empresa'::character varying, 'emprendedor'::character varying])::text[]))",
                    "constraint": "empresario_tipo_check"
                }
            ]
        },
        {
            "tabla": "entregable",
            "unique": [
            ],
            "columnas": [
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id",
                    "default": "gen_random_uuid()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 1
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_proyecto",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 2
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_usuario",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 3
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_estado",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 4
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "group_id",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 5
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "tipo",
                    "default": null,
                    "max_len": 10,
                    "nullable": "NO",
                    "posicion": 6
                },
                {
                    "udt": "int4",
                    "tipo": "integer",
                    "columna": "version",
                    "default": "1",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 7
                },
                {
                    "udt": "timestamptz",
                    "tipo": "timestamp with time zone",
                    "columna": "fecha",
                    "default": "now()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 8
                }
            ],
            "policies": [
                {
                    "check": "(id_usuario = auth.uid())",
                    "roles": [
                        "public"
                    ],
                    "using": null,
                    "nombre": "entregable_subir",
                    "operacion": "INSERT"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(id_usuario = auth.uid())",
                    "nombre": "entregable_ver_propio",
                    "operacion": "SELECT"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "((id_usuario = auth.uid()) OR (EXISTS ( SELECT 1\n   FROM (proyecto p\n     JOIN empresario e ON ((p.id_empresario = e.id)))\n  WHERE ((p.id = entregable.id_proyecto) AND (e.id_usuario = auth.uid())))))",
                    "nombre": "entregable_actualizar_estado",
                    "operacion": "UPDATE"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(EXISTS ( SELECT 1\n   FROM (proyecto p\n     JOIN empresario e ON ((p.id_empresario = e.id)))\n  WHERE ((p.id = entregable.id_proyecto) AND (e.id_usuario = auth.uid()))))",
                    "nombre": "entregable_ver_empresa",
                    "operacion": "SELECT"
                }
            ],
            "primary_key": [
                "id"
            ],
            "foreign_keys": [
                {
                    "columna": "id_proyecto",
                    "constraint": "entregable_id_proyecto_fkey",
                    "referencia_tabla": "proyecto",
                    "referencia_columna": "id"
                },
                {
                    "columna": "id_usuario",
                    "constraint": "entregable_id_usuario_fkey",
                    "referencia_tabla": "users",
                    "referencia_columna": "id"
                },
                {
                    "columna": "id_estado",
                    "constraint": "entregable_id_estado_fkey",
                    "referencia_tabla": "estado_entregable",
                    "referencia_columna": "id"
                }
            ],
            "rls_activado": true,
            "check_constraints": [
                {
                    "clausula": "id_usuario IS NOT NULL",
                    "constraint": "2200_17840_3_not_null"
                },
                {
                    "clausula": "((tipo)::text = ANY ((ARRAY['parcial'::character varying, 'final'::character varying])::text[]))",
                    "constraint": "entregable_tipo_check"
                },
                {
                    "clausula": "id IS NOT NULL",
                    "constraint": "2200_17840_1_not_null"
                },
                {
                    "clausula": "id_proyecto IS NOT NULL",
                    "constraint": "2200_17840_2_not_null"
                },
                {
                    "clausula": "tipo IS NOT NULL",
                    "constraint": "2200_17840_6_not_null"
                },
                {
                    "clausula": "version IS NOT NULL",
                    "constraint": "2200_17840_7_not_null"
                },
                {
                    "clausula": "id_estado IS NOT NULL",
                    "constraint": "2200_17840_4_not_null"
                },
                {
                    "clausula": "fecha IS NOT NULL",
                    "constraint": "2200_17840_8_not_null"
                },
                {
                    "clausula": "group_id IS NOT NULL",
                    "constraint": "2200_17840_5_not_null"
                }
            ]
        },
        {
            "tabla": "estado_entregable",
            "unique": [
                "estado_entregable_nombre_key"
            ],
            "columnas": [
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id",
                    "default": "gen_random_uuid()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 1
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "nombre",
                    "default": null,
                    "max_len": 50,
                    "nullable": "NO",
                    "posicion": 2
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "descripcion",
                    "default": null,
                    "max_len": 255,
                    "nullable": "YES",
                    "posicion": 3
                }
            ],
            "policies": [
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(auth.uid() IS NOT NULL)",
                    "nombre": "catalogo_lectura",
                    "operacion": "SELECT"
                }
            ],
            "primary_key": [
                "id"
            ],
            "foreign_keys": [
            ],
            "rls_activado": true,
            "check_constraints": [
                {
                    "clausula": "id IS NOT NULL",
                    "constraint": "2200_17578_1_not_null"
                },
                {
                    "clausula": "nombre IS NOT NULL",
                    "constraint": "2200_17578_2_not_null"
                }
            ]
        },
        {
            "tabla": "estado_oferta",
            "unique": [
                "estado_oferta_nombre_key"
            ],
            "columnas": [
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id",
                    "default": "gen_random_uuid()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 1
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "nombre",
                    "default": null,
                    "max_len": 50,
                    "nullable": "NO",
                    "posicion": 2
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "descripcion",
                    "default": null,
                    "max_len": 255,
                    "nullable": "YES",
                    "posicion": 3
                }
            ],
            "policies": [
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(auth.uid() IS NOT NULL)",
                    "nombre": "catalogo_lectura",
                    "operacion": "SELECT"
                }
            ],
            "primary_key": [
                "id"
            ],
            "foreign_keys": [
            ],
            "rls_activado": true,
            "check_constraints": [
                {
                    "clausula": "id IS NOT NULL",
                    "constraint": "2200_17570_1_not_null"
                },
                {
                    "clausula": "nombre IS NOT NULL",
                    "constraint": "2200_17570_2_not_null"
                }
            ]
        },
        {
            "tabla": "estado_proyecto",
            "unique": [
                "estado_proyecto_nombre_key"
            ],
            "columnas": [
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id",
                    "default": "gen_random_uuid()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 1
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "nombre",
                    "default": null,
                    "max_len": 50,
                    "nullable": "NO",
                    "posicion": 2
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "descripcion",
                    "default": null,
                    "max_len": 255,
                    "nullable": "YES",
                    "posicion": 3
                },
                {
                    "udt": "int4",
                    "tipo": "integer",
                    "columna": "orden",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 4
                },
                {
                    "udt": "bool",
                    "tipo": "boolean",
                    "columna": "es_final",
                    "default": "false",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 5
                }
            ],
            "policies": [
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(auth.uid() IS NOT NULL)",
                    "nombre": "catalogo_lectura",
                    "operacion": "SELECT"
                }
            ],
            "primary_key": [
                "id"
            ],
            "foreign_keys": [
            ],
            "rls_activado": true,
            "check_constraints": [
                {
                    "clausula": "es_final IS NOT NULL",
                    "constraint": "2200_17561_5_not_null"
                },
                {
                    "clausula": "id IS NOT NULL",
                    "constraint": "2200_17561_1_not_null"
                },
                {
                    "clausula": "nombre IS NOT NULL",
                    "constraint": "2200_17561_2_not_null"
                },
                {
                    "clausula": "orden IS NOT NULL",
                    "constraint": "2200_17561_4_not_null"
                }
            ]
        },
        {
            "tabla": "estudiante",
            "unique": [
                "estudiante_id_usuario_key"
            ],
            "columnas": [
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id",
                    "default": "gen_random_uuid()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 1
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_usuario",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 2
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "titulo_fwd",
                    "default": null,
                    "max_len": 100,
                    "nullable": "YES",
                    "posicion": 3
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "estado_verificacion",
                    "default": "'pendiente'::character varying",
                    "max_len": 20,
                    "nullable": "NO",
                    "posicion": 4
                },
                {
                    "udt": "numeric",
                    "tipo": "numeric",
                    "columna": "reputacion",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 5
                },
                {
                    "udt": "text",
                    "tipo": "text",
                    "columna": "descripcion",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 6
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "url_github",
                    "default": null,
                    "max_len": 500,
                    "nullable": "YES",
                    "posicion": 7
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "url_linkedin",
                    "default": null,
                    "max_len": 500,
                    "nullable": "YES",
                    "posicion": 8
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "url_portfolio",
                    "default": null,
                    "max_len": 500,
                    "nullable": "YES",
                    "posicion": 9
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "especialidad",
                    "default": null,
                    "max_len": 20,
                    "nullable": "YES",
                    "posicion": 10
                },
                {
                    "udt": "text",
                    "tipo": "text",
                    "columna": "modalidad_preferida",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 11
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "disponibilidad",
                    "default": null,
                    "max_len": 20,
                    "nullable": "YES",
                    "posicion": 12
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "url_avatar",
                    "default": null,
                    "max_len": 500,
                    "nullable": "YES",
                    "posicion": 13
                }
            ],
            "policies": [
                {
                    "check": "is_admin()",
                    "roles": [
                        "public"
                    ],
                    "using": "is_admin()",
                    "nombre": "estudiante_admin_verifica",
                    "operacion": "UPDATE"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "((id_usuario = auth.uid()) OR (((estado_verificacion)::text = 'verificado'::text) AND (current_app_role() = ANY (ARRAY['company'::text, 'admin'::text]))))",
                    "nombre": "estudiante_ver_perfil",
                    "operacion": "SELECT"
                },
                {
                    "check": "(id_usuario = auth.uid())",
                    "roles": [
                        "public"
                    ],
                    "using": null,
                    "nombre": "estudiante_crear_perfil",
                    "operacion": "INSERT"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(id_usuario = auth.uid())",
                    "nombre": "estudiante_editar_perfil",
                    "operacion": "UPDATE"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "is_applicant_to_my_project(id_usuario)",
                    "nombre": "estudiante_empresa_ve_postulantes",
                    "operacion": "SELECT"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "is_admin()",
                    "nombre": "estudiante_admin_ver",
                    "operacion": "SELECT"
                }
            ],
            "primary_key": [
                "id"
            ],
            "foreign_keys": [
                {
                    "columna": "id_usuario",
                    "constraint": "estudiante_id_usuario_fkey",
                    "referencia_tabla": "users",
                    "referencia_columna": "id"
                }
            ],
            "rls_activado": true,
            "check_constraints": [
                {
                    "clausula": "((especialidad)::text = ANY ((ARRAY['frontend'::character varying, 'backend'::character varying, 'fullstack'::character varying, 'ia'::character varying])::text[]))",
                    "constraint": "estudiante_especialidad_check"
                },
                {
                    "clausula": "id IS NOT NULL",
                    "constraint": "2200_17650_1_not_null"
                },
                {
                    "clausula": "id_usuario IS NOT NULL",
                    "constraint": "2200_17650_2_not_null"
                },
                {
                    "clausula": "estado_verificacion IS NOT NULL",
                    "constraint": "2200_17650_4_not_null"
                },
                {
                    "clausula": "((estado_verificacion)::text = ANY ((ARRAY['pendiente'::character varying, 'verificado'::character varying, 'rechazado'::character varying])::text[]))",
                    "constraint": "estudiante_estado_verificacion_check"
                },
                {
                    "clausula": "((reputacion >= 1.00) AND (reputacion <= 5.00))",
                    "constraint": "estudiante_reputacion_check"
                },
                {
                    "clausula": "((disponibilidad)::text = ANY ((ARRAY['immediate'::character varying, 'two_weeks'::character varying, 'one_month'::character varying, 'unavailable'::character varying])::text[]))",
                    "constraint": "estudiante_disponibilidad_check"
                }
            ]
        },
        {
            "tabla": "evaluacion",
            "unique": [
                "evaluacion_id_proyecto_key"
            ],
            "columnas": [
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id",
                    "default": "gen_random_uuid()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 1
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_proyecto",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 2
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_estudiante",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 3
                },
                {
                    "udt": "int4",
                    "tipo": "integer",
                    "columna": "puntuacion",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 4
                },
                {
                    "udt": "text",
                    "tipo": "text",
                    "columna": "comentario",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 5
                },
                {
                    "udt": "text",
                    "tipo": "text",
                    "columna": "replica",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 6
                },
                {
                    "udt": "timestamptz",
                    "tipo": "timestamp with time zone",
                    "columna": "fecha",
                    "default": "now()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 7
                }
            ],
            "policies": [
                {
                    "check": "(EXISTS ( SELECT 1\n   FROM (proyecto p\n     JOIN empresario e ON ((p.id_empresario = e.id)))\n  WHERE ((p.id = evaluacion.id_proyecto) AND (e.id_usuario = auth.uid()))))",
                    "roles": [
                        "public"
                    ],
                    "using": null,
                    "nombre": "evaluacion_crear_empresa",
                    "operacion": "INSERT"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "((id_estudiante IN ( SELECT estudiante.id\n   FROM estudiante\n  WHERE (estudiante.id_usuario = auth.uid()))) AND (replica IS NULL))",
                    "nombre": "evaluacion_replica_estudiante",
                    "operacion": "UPDATE"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "((id_estudiante IN ( SELECT estudiante.id\n   FROM estudiante\n  WHERE (estudiante.id_usuario = auth.uid()))) OR (EXISTS ( SELECT 1\n   FROM (proyecto p\n     JOIN empresario e ON ((p.id_empresario = e.id)))\n  WHERE ((p.id = evaluacion.id_proyecto) AND (e.id_usuario = auth.uid())))) OR is_admin())",
                    "nombre": "evaluacion_ver",
                    "operacion": "SELECT"
                }
            ],
            "primary_key": [
                "id"
            ],
            "foreign_keys": [
                {
                    "columna": "id_estudiante",
                    "constraint": "evaluacion_id_estudiante_fkey",
                    "referencia_tabla": "estudiante",
                    "referencia_columna": "id"
                },
                {
                    "columna": "id_proyecto",
                    "constraint": "evaluacion_id_proyecto_fkey",
                    "referencia_tabla": "proyecto",
                    "referencia_columna": "id"
                }
            ],
            "rls_activado": true,
            "check_constraints": [
                {
                    "clausula": "id IS NOT NULL",
                    "constraint": "2200_17864_1_not_null"
                },
                {
                    "clausula": "((puntuacion >= 1) AND (puntuacion <= 5))",
                    "constraint": "evaluacion_puntuacion_check"
                },
                {
                    "clausula": "fecha IS NOT NULL",
                    "constraint": "2200_17864_7_not_null"
                },
                {
                    "clausula": "puntuacion IS NOT NULL",
                    "constraint": "2200_17864_4_not_null"
                },
                {
                    "clausula": "id_estudiante IS NOT NULL",
                    "constraint": "2200_17864_3_not_null"
                },
                {
                    "clausula": "id_proyecto IS NOT NULL",
                    "constraint": "2200_17864_2_not_null"
                }
            ]
        },
        {
            "tabla": "favorites",
            "unique": [
                "favorites_id_empresario_id_estudiante_id_proyecto_key"
            ],
            "columnas": [
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id",
                    "default": "gen_random_uuid()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 1
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_empresario",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 2
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_estudiante",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 3
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_proyecto",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 4
                },
                {
                    "udt": "text",
                    "tipo": "text",
                    "columna": "nota",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 5
                },
                {
                    "udt": "timestamptz",
                    "tipo": "timestamp with time zone",
                    "columna": "created_at",
                    "default": "now()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 6
                }
            ],
            "policies": [
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(id_empresario IN ( SELECT empresario.id\n   FROM empresario\n  WHERE (empresario.id_usuario = auth.uid())))",
                    "nombre": "favorites_eliminar",
                    "operacion": "DELETE"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(id_empresario IN ( SELECT empresario.id\n   FROM empresario\n  WHERE (empresario.id_usuario = auth.uid())))",
                    "nombre": "favorites_ver",
                    "operacion": "SELECT"
                },
                {
                    "check": "(id_empresario IN ( SELECT empresario.id\n   FROM empresario\n  WHERE (empresario.id_usuario = auth.uid())))",
                    "roles": [
                        "public"
                    ],
                    "using": null,
                    "nombre": "favorites_agregar",
                    "operacion": "INSERT"
                }
            ],
            "primary_key": [
                "id"
            ],
            "foreign_keys": [
                {
                    "columna": "id_estudiante",
                    "constraint": "favorites_id_estudiante_fkey",
                    "referencia_tabla": "estudiante",
                    "referencia_columna": "id"
                },
                {
                    "columna": "id_proyecto",
                    "constraint": "favorites_id_proyecto_fkey",
                    "referencia_tabla": "proyecto",
                    "referencia_columna": "id"
                },
                {
                    "columna": "id_empresario",
                    "constraint": "favorites_id_empresario_fkey",
                    "referencia_tabla": "empresario",
                    "referencia_columna": "id"
                }
            ],
            "rls_activado": true,
            "check_constraints": [
                {
                    "clausula": "id_empresario IS NOT NULL",
                    "constraint": "2200_17975_2_not_null"
                },
                {
                    "clausula": "created_at IS NOT NULL",
                    "constraint": "2200_17975_6_not_null"
                },
                {
                    "clausula": "id_estudiante IS NOT NULL",
                    "constraint": "2200_17975_3_not_null"
                },
                {
                    "clausula": "id IS NOT NULL",
                    "constraint": "2200_17975_1_not_null"
                }
            ]
        },
        {
            "tabla": "files",
            "unique": [
            ],
            "columnas": [
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id",
                    "default": "gen_random_uuid()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 1
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_usuario",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 2
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_empresario",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 3
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_oferta",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 4
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_entregable",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 5
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "tipo",
                    "default": null,
                    "max_len": 20,
                    "nullable": "NO",
                    "posicion": 6
                },
                {
                    "udt": "int8",
                    "tipo": "bigint",
                    "columna": "tamano",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 7
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "storage_path",
                    "default": null,
                    "max_len": 500,
                    "nullable": "NO",
                    "posicion": 8
                },
                {
                    "udt": "timestamptz",
                    "tipo": "timestamp with time zone",
                    "columna": "created_at",
                    "default": "now()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 9
                },
                {
                    "udt": "timestamptz",
                    "tipo": "timestamp with time zone",
                    "columna": "updated_at",
                    "default": "now()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 10
                }
            ],
            "policies": [
                {
                    "check": "((((tipo)::text = 'avatar'::text) AND (id_usuario = auth.uid())) OR (((tipo)::text = 'logo'::text) AND (EXISTS ( SELECT 1\n   FROM empresario e\n  WHERE ((e.id = files.id_empresario) AND (e.id_usuario = auth.uid()))))) OR (((tipo)::text = ANY ((ARRAY['prototipo'::character varying, 'entregable'::character varying, 'cv'::character varying])::text[])) AND ((id_usuario = auth.uid()) OR (EXISTS ( SELECT 1\n   FROM oferta o\n  WHERE ((o.id = files.id_oferta) AND (o.id_usuario = auth.uid())))))))",
                    "roles": [
                        "public"
                    ],
                    "using": null,
                    "nombre": "files_insertar",
                    "operacion": "INSERT"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(((tipo)::text = 'entregable'::text) AND ((EXISTS ( SELECT 1\n   FROM entregable en\n  WHERE ((en.id = files.id_entregable) AND (en.id_usuario = auth.uid())))) OR (EXISTS ( SELECT 1\n   FROM ((entregable en\n     JOIN proyecto p ON ((en.id_proyecto = p.id)))\n     JOIN empresario e ON ((p.id_empresario = e.id)))\n  WHERE ((en.id = files.id_entregable) AND (e.id_usuario = auth.uid()))))))",
                    "nombre": "files_entregable",
                    "operacion": "SELECT"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(((tipo)::text = 'prototipo'::text) AND ((EXISTS ( SELECT 1\n   FROM oferta o\n  WHERE ((o.id = files.id_oferta) AND (o.id_usuario = auth.uid())))) OR (EXISTS ( SELECT 1\n   FROM ((oferta o\n     JOIN proyecto p ON ((o.id_proyecto = p.id)))\n     JOIN empresario e ON ((p.id_empresario = e.id)))\n  WHERE ((o.id = files.id_oferta) AND (e.id_usuario = auth.uid()))))))",
                    "nombre": "files_prototipo",
                    "operacion": "SELECT"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(((tipo)::text = 'logo'::text) AND (auth.uid() IS NOT NULL))",
                    "nombre": "files_logo_publico",
                    "operacion": "SELECT"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(((tipo)::text = 'logo'::text) AND (EXISTS ( SELECT 1\n   FROM empresario e\n  WHERE ((e.id = files.id_empresario) AND (e.id_usuario = auth.uid())))))",
                    "nombre": "files_logo_eliminar",
                    "operacion": "DELETE"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(((tipo)::text = 'avatar'::text) AND (id_usuario = auth.uid()))",
                    "nombre": "files_avatar",
                    "operacion": "SELECT"
                }
            ],
            "primary_key": [
                "id"
            ],
            "foreign_keys": [
                {
                    "columna": "id_empresario",
                    "constraint": "files_id_empresario_fkey",
                    "referencia_tabla": "empresario",
                    "referencia_columna": "id"
                },
                {
                    "columna": "id_entregable",
                    "constraint": "files_id_entregable_fkey",
                    "referencia_tabla": "entregable",
                    "referencia_columna": "id"
                },
                {
                    "columna": "id_oferta",
                    "constraint": "files_id_oferta_fkey",
                    "referencia_tabla": "oferta",
                    "referencia_columna": "id"
                },
                {
                    "columna": "id_usuario",
                    "constraint": "files_id_usuario_fkey",
                    "referencia_tabla": "users",
                    "referencia_columna": "id"
                }
            ],
            "rls_activado": true,
            "check_constraints": [
                {
                    "clausula": "created_at IS NOT NULL",
                    "constraint": "2200_17886_9_not_null"
                },
                {
                    "clausula": "id IS NOT NULL",
                    "constraint": "2200_17886_1_not_null"
                },
                {
                    "clausula": "tipo IS NOT NULL",
                    "constraint": "2200_17886_6_not_null"
                },
                {
                    "clausula": "tamano IS NOT NULL",
                    "constraint": "2200_17886_7_not_null"
                },
                {
                    "clausula": "storage_path IS NOT NULL",
                    "constraint": "2200_17886_8_not_null"
                },
                {
                    "clausula": "updated_at IS NOT NULL",
                    "constraint": "2200_17886_10_not_null"
                },
                {
                    "clausula": "((((((id_usuario IS NOT NULL))::integer + ((id_empresario IS NOT NULL))::integer) + ((id_oferta IS NOT NULL))::integer) + ((id_entregable IS NOT NULL))::integer) = 1)",
                    "constraint": "files_single_owner"
                },
                {
                    "clausula": "((tipo)::text = ANY ((ARRAY['avatar'::character varying, 'logo'::character varying, 'prototipo'::character varying, 'entregable'::character varying, 'cv'::character varying])::text[]))",
                    "constraint": "files_tipo_check"
                }
            ]
        },
        {
            "tabla": "historial_estado_proyecto",
            "unique": [
            ],
            "columnas": [
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id",
                    "default": "gen_random_uuid()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 1
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_proyecto",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 2
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_estado_anterior",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 3
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_estado_nuevo",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 4
                },
                {
                    "udt": "text",
                    "tipo": "text",
                    "columna": "motivo",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 5
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_usuario",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 6
                },
                {
                    "udt": "timestamptz",
                    "tipo": "timestamp with time zone",
                    "columna": "fecha",
                    "default": "now()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 7
                }
            ],
            "policies": [
                {
                    "check": "(id_usuario = auth.uid())",
                    "roles": [
                        "public"
                    ],
                    "using": null,
                    "nombre": "historial_insertar",
                    "operacion": "INSERT"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "((EXISTS ( SELECT 1\n   FROM (proyecto p\n     JOIN empresario e ON ((p.id_empresario = e.id)))\n  WHERE ((p.id = historial_estado_proyecto.id_proyecto) AND (e.id_usuario = auth.uid())))) OR (EXISTS ( SELECT 1\n   FROM (oferta o\n     JOIN estado_oferta eo ON ((o.id_estado = eo.id)))\n  WHERE ((o.id_proyecto = historial_estado_proyecto.id_proyecto) AND (o.id_usuario = auth.uid()) AND ((eo.nombre)::text = 'adjudicada'::text)))) OR is_admin())",
                    "nombre": "historial_ver",
                    "operacion": "SELECT"
                }
            ],
            "primary_key": [
                "id"
            ],
            "foreign_keys": [
                {
                    "columna": "id_estado_anterior",
                    "constraint": "historial_estado_proyecto_id_estado_anterior_fkey",
                    "referencia_tabla": "estado_proyecto",
                    "referencia_columna": "id"
                },
                {
                    "columna": "id_usuario",
                    "constraint": "historial_estado_proyecto_id_usuario_fkey",
                    "referencia_tabla": "users",
                    "referencia_columna": "id"
                },
                {
                    "columna": "id_proyecto",
                    "constraint": "historial_estado_proyecto_id_proyecto_fkey",
                    "referencia_tabla": "proyecto",
                    "referencia_columna": "id"
                },
                {
                    "columna": "id_estado_nuevo",
                    "constraint": "historial_estado_proyecto_id_estado_nuevo_fkey",
                    "referencia_tabla": "estado_proyecto",
                    "referencia_columna": "id"
                }
            ],
            "rls_activado": true,
            "check_constraints": [
                {
                    "clausula": "id_usuario IS NOT NULL",
                    "constraint": "2200_17761_6_not_null"
                },
                {
                    "clausula": "id_estado_nuevo IS NOT NULL",
                    "constraint": "2200_17761_4_not_null"
                },
                {
                    "clausula": "id_proyecto IS NOT NULL",
                    "constraint": "2200_17761_2_not_null"
                },
                {
                    "clausula": "id IS NOT NULL",
                    "constraint": "2200_17761_1_not_null"
                },
                {
                    "clausula": "fecha IS NOT NULL",
                    "constraint": "2200_17761_7_not_null"
                }
            ]
        },
        {
            "tabla": "mensaje",
            "unique": [
            ],
            "columnas": [
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id",
                    "default": "gen_random_uuid()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 1
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_proyecto",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 2
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_remitente",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 3
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_destinatario",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 4
                },
                {
                    "udt": "text",
                    "tipo": "text",
                    "columna": "contenido",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 5
                },
                {
                    "udt": "bool",
                    "tipo": "boolean",
                    "columna": "es_publico",
                    "default": "false",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 6
                },
                {
                    "udt": "timestamptz",
                    "tipo": "timestamp with time zone",
                    "columna": "fecha_envio",
                    "default": "now()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 7
                }
            ],
            "policies": [
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "((es_publico = false) AND ((id_remitente = auth.uid()) OR (id_destinatario = auth.uid())))",
                    "nombre": "mensaje_privado",
                    "operacion": "SELECT"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "((es_publico = true) AND (auth.uid() IS NOT NULL))",
                    "nombre": "mensaje_publico",
                    "operacion": "SELECT"
                },
                {
                    "check": "(id_remitente = auth.uid())",
                    "roles": [
                        "public"
                    ],
                    "using": null,
                    "nombre": "mensaje_enviar",
                    "operacion": "INSERT"
                }
            ],
            "primary_key": [
                "id"
            ],
            "foreign_keys": [
                {
                    "columna": "id_destinatario",
                    "constraint": "mensaje_id_destinatario_fkey",
                    "referencia_tabla": "users",
                    "referencia_columna": "id"
                },
                {
                    "columna": "id_proyecto",
                    "constraint": "mensaje_id_proyecto_fkey",
                    "referencia_tabla": "proyecto",
                    "referencia_columna": "id"
                },
                {
                    "columna": "id_remitente",
                    "constraint": "mensaje_id_remitente_fkey",
                    "referencia_tabla": "users",
                    "referencia_columna": "id"
                }
            ],
            "rls_activado": true,
            "check_constraints": [
                {
                    "clausula": "contenido IS NOT NULL",
                    "constraint": "2200_17918_5_not_null"
                },
                {
                    "clausula": "es_publico IS NOT NULL",
                    "constraint": "2200_17918_6_not_null"
                },
                {
                    "clausula": "fecha_envio IS NOT NULL",
                    "constraint": "2200_17918_7_not_null"
                },
                {
                    "clausula": "id IS NOT NULL",
                    "constraint": "2200_17918_1_not_null"
                },
                {
                    "clausula": "id_proyecto IS NOT NULL",
                    "constraint": "2200_17918_2_not_null"
                },
                {
                    "clausula": "id_remitente IS NOT NULL",
                    "constraint": "2200_17918_3_not_null"
                }
            ]
        },
        {
            "tabla": "notificacion",
            "unique": [
            ],
            "columnas": [
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id",
                    "default": "gen_random_uuid()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 1
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_usuario",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 2
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "tipo",
                    "default": null,
                    "max_len": 50,
                    "nullable": "NO",
                    "posicion": 3
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "mensaje",
                    "default": null,
                    "max_len": 500,
                    "nullable": "NO",
                    "posicion": 4
                },
                {
                    "udt": "bool",
                    "tipo": "boolean",
                    "columna": "leida",
                    "default": "false",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 5
                },
                {
                    "udt": "timestamptz",
                    "tipo": "timestamp with time zone",
                    "columna": "fecha",
                    "default": "now()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 6
                }
            ],
            "policies": [
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(id_usuario = auth.uid())",
                    "nombre": "notif_ver",
                    "operacion": "SELECT"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(id_usuario = auth.uid())",
                    "nombre": "notif_marcar_leida",
                    "operacion": "UPDATE"
                }
            ],
            "primary_key": [
                "id"
            ],
            "foreign_keys": [
                {
                    "columna": "id_usuario",
                    "constraint": "notificacion_id_usuario_fkey",
                    "referencia_tabla": "users",
                    "referencia_columna": "id"
                }
            ],
            "rls_activado": true,
            "check_constraints": [
                {
                    "clausula": "mensaje IS NOT NULL",
                    "constraint": "2200_17943_4_not_null"
                },
                {
                    "clausula": "leida IS NOT NULL",
                    "constraint": "2200_17943_5_not_null"
                },
                {
                    "clausula": "fecha IS NOT NULL",
                    "constraint": "2200_17943_6_not_null"
                },
                {
                    "clausula": "id IS NOT NULL",
                    "constraint": "2200_17943_1_not_null"
                },
                {
                    "clausula": "((tipo)::text = ANY ((ARRAY['adjudicacion'::character varying, 'vencimiento_plazo'::character varying, 'nuevo_mensaje'::character varying, 'entregable_subido'::character varying, 'cambio_estado'::character varying])::text[]))",
                    "constraint": "notificacion_tipo_check"
                },
                {
                    "clausula": "id_usuario IS NOT NULL",
                    "constraint": "2200_17943_2_not_null"
                },
                {
                    "clausula": "tipo IS NOT NULL",
                    "constraint": "2200_17943_3_not_null"
                }
            ]
        },
        {
            "tabla": "oferta",
            "unique": [
                "oferta_id_proyecto_id_usuario_key"
            ],
            "columnas": [
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id",
                    "default": "gen_random_uuid()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 1
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_proyecto",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 2
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_usuario",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 3
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_estado",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 4
                },
                {
                    "udt": "text",
                    "tipo": "text",
                    "columna": "propuesta",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 5
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "prototipo_url",
                    "default": null,
                    "max_len": 500,
                    "nullable": "YES",
                    "posicion": 6
                },
                {
                    "udt": "int4",
                    "tipo": "integer",
                    "columna": "calificacion",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 7
                },
                {
                    "udt": "text",
                    "tipo": "text",
                    "columna": "comentario_calificacion",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 8
                },
                {
                    "udt": "text",
                    "tipo": "text",
                    "columna": "replica_calificacion",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 9
                },
                {
                    "udt": "timestamptz",
                    "tipo": "timestamp with time zone",
                    "columna": "fecha_envio",
                    "default": "now()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 10
                },
                {
                    "udt": "timestamptz",
                    "tipo": "timestamp with time zone",
                    "columna": "updated_at",
                    "default": "now()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 11
                }
            ],
            "policies": [
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "is_admin()",
                    "nombre": "oferta_ver_admin",
                    "operacion": "SELECT"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(id_usuario = auth.uid())",
                    "nombre": "oferta_ver_propia",
                    "operacion": "SELECT"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(EXISTS ( SELECT 1\n   FROM (proyecto p\n     JOIN empresario e ON ((p.id_empresario = e.id)))\n  WHERE ((p.id = oferta.id_proyecto) AND (e.id_usuario = auth.uid()))))",
                    "nombre": "oferta_ver_empresa",
                    "operacion": "SELECT"
                },
                {
                    "check": "(id_usuario = auth.uid())",
                    "roles": [
                        "public"
                    ],
                    "using": null,
                    "nombre": "oferta_crear",
                    "operacion": "INSERT"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(EXISTS ( SELECT 1\n   FROM (proyecto p\n     JOIN empresario e ON ((p.id_empresario = e.id)))\n  WHERE ((p.id = oferta.id_proyecto) AND (e.id_usuario = auth.uid()))))",
                    "nombre": "oferta_calificar_empresa",
                    "operacion": "UPDATE"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "((id_usuario = auth.uid()) AND (replica_calificacion IS NULL))",
                    "nombre": "oferta_replica_estudiante",
                    "operacion": "UPDATE"
                }
            ],
            "primary_key": [
                "id"
            ],
            "foreign_keys": [
                {
                    "columna": "id_usuario",
                    "constraint": "oferta_id_usuario_fkey",
                    "referencia_tabla": "users",
                    "referencia_columna": "id"
                },
                {
                    "columna": "id_proyecto",
                    "constraint": "oferta_id_proyecto_fkey",
                    "referencia_tabla": "proyecto",
                    "referencia_columna": "id"
                },
                {
                    "columna": "id_estado",
                    "constraint": "oferta_id_estado_fkey",
                    "referencia_tabla": "estado_oferta",
                    "referencia_columna": "id"
                }
            ],
            "rls_activado": true,
            "check_constraints": [
                {
                    "clausula": "id_estado IS NOT NULL",
                    "constraint": "2200_17812_4_not_null"
                },
                {
                    "clausula": "propuesta IS NOT NULL",
                    "constraint": "2200_17812_5_not_null"
                },
                {
                    "clausula": "fecha_envio IS NOT NULL",
                    "constraint": "2200_17812_10_not_null"
                },
                {
                    "clausula": "updated_at IS NOT NULL",
                    "constraint": "2200_17812_11_not_null"
                },
                {
                    "clausula": "((calificacion >= 1) AND (calificacion <= 5))",
                    "constraint": "oferta_calificacion_check"
                },
                {
                    "clausula": "id_proyecto IS NOT NULL",
                    "constraint": "2200_17812_2_not_null"
                },
                {
                    "clausula": "id IS NOT NULL",
                    "constraint": "2200_17812_1_not_null"
                },
                {
                    "clausula": "id_usuario IS NOT NULL",
                    "constraint": "2200_17812_3_not_null"
                }
            ]
        },
        {
            "tabla": "pending_login",
            "unique": [
            ],
            "columnas": [
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "ticket",
                    "default": "gen_random_uuid()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 1
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_usuario",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 2
                },
                {
                    "udt": "text",
                    "tipo": "text",
                    "columna": "codigo_hash",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 3
                },
                {
                    "udt": "text",
                    "tipo": "text",
                    "columna": "refresh_token",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 4
                },
                {
                    "udt": "timestamptz",
                    "tipo": "timestamp with time zone",
                    "columna": "expira_en",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 5
                },
                {
                    "udt": "int4",
                    "tipo": "integer",
                    "columna": "intentos",
                    "default": "0",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 6
                },
                {
                    "udt": "timestamptz",
                    "tipo": "timestamp with time zone",
                    "columna": "creado_en",
                    "default": "now()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 7
                }
            ],
            "policies": [
            ],
            "primary_key": [
                "ticket"
            ],
            "foreign_keys": [
            ],
            "rls_activado": true,
            "check_constraints": [
                {
                    "clausula": "intentos IS NOT NULL",
                    "constraint": "2200_18545_6_not_null"
                },
                {
                    "clausula": "refresh_token IS NOT NULL",
                    "constraint": "2200_18545_4_not_null"
                },
                {
                    "clausula": "expira_en IS NOT NULL",
                    "constraint": "2200_18545_5_not_null"
                },
                {
                    "clausula": "creado_en IS NOT NULL",
                    "constraint": "2200_18545_7_not_null"
                },
                {
                    "clausula": "id_usuario IS NOT NULL",
                    "constraint": "2200_18545_2_not_null"
                },
                {
                    "clausula": "codigo_hash IS NOT NULL",
                    "constraint": "2200_18545_3_not_null"
                },
                {
                    "clausula": "ticket IS NOT NULL",
                    "constraint": "2200_18545_1_not_null"
                }
            ]
        },
        {
            "tabla": "portafolio_proyecto",
            "unique": [
            ],
            "columnas": [
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id",
                    "default": "gen_random_uuid()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 1
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_estudiante",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 2
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "titulo",
                    "default": null,
                    "max_len": 255,
                    "nullable": "NO",
                    "posicion": 3
                },
                {
                    "udt": "text",
                    "tipo": "text",
                    "columna": "descripcion",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 4
                },
                {
                    "udt": "text",
                    "tipo": "text",
                    "columna": "tecnologias",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 5
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "url_repositorio",
                    "default": null,
                    "max_len": 500,
                    "nullable": "YES",
                    "posicion": 6
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "url_demo",
                    "default": null,
                    "max_len": 500,
                    "nullable": "YES",
                    "posicion": 7
                },
                {
                    "udt": "date",
                    "tipo": "date",
                    "columna": "fecha",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 8
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "visibilidad",
                    "default": "'publico'::character varying",
                    "max_len": 20,
                    "nullable": "NO",
                    "posicion": 9
                }
            ],
            "policies": [
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(id_estudiante IN ( SELECT estudiante.id\n   FROM estudiante\n  WHERE (estudiante.id_usuario = auth.uid())))",
                    "nombre": "portafolio_gestionar",
                    "operacion": "ALL"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "((id_estudiante IN ( SELECT estudiante.id\n   FROM estudiante\n  WHERE (estudiante.id_usuario = auth.uid()))) OR ((visibilidad)::text = 'publico'::text) OR (((visibilidad)::text = 'solo_empresas'::text) AND (current_app_role() = ANY (ARRAY['company'::text, 'admin'::text]))))",
                    "nombre": "portafolio_visible",
                    "operacion": "SELECT"
                }
            ],
            "primary_key": [
                "id"
            ],
            "foreign_keys": [
                {
                    "columna": "id_estudiante",
                    "constraint": "portafolio_proyecto_id_estudiante_fkey",
                    "referencia_tabla": "estudiante",
                    "referencia_columna": "id"
                }
            ],
            "rls_activado": true,
            "check_constraints": [
                {
                    "clausula": "id_estudiante IS NOT NULL",
                    "constraint": "2200_17684_2_not_null"
                },
                {
                    "clausula": "((visibilidad)::text = ANY ((ARRAY['publico'::character varying, 'solo_empresas'::character varying])::text[]))",
                    "constraint": "portafolio_proyecto_visibilidad_check"
                },
                {
                    "clausula": "id IS NOT NULL",
                    "constraint": "2200_17684_1_not_null"
                },
                {
                    "clausula": "titulo IS NOT NULL",
                    "constraint": "2200_17684_3_not_null"
                },
                {
                    "clausula": "visibilidad IS NOT NULL",
                    "constraint": "2200_17684_9_not_null"
                }
            ]
        },
        {
            "tabla": "project_skills",
            "unique": [
            ],
            "columnas": [
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_proyecto",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 1
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_skill",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 2
                }
            ],
            "policies": [
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(auth.uid() IS NOT NULL)",
                    "nombre": "pskills_ver",
                    "operacion": "SELECT"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(EXISTS ( SELECT 1\n   FROM (proyecto p\n     JOIN empresario e ON ((p.id_empresario = e.id)))\n  WHERE ((p.id = project_skills.id_proyecto) AND (e.id_usuario = auth.uid()))))",
                    "nombre": "pskills_gestionar",
                    "operacion": "ALL"
                }
            ],
            "primary_key": [
                "id_proyecto",
                "id_skill"
            ],
            "foreign_keys": [
                {
                    "columna": "id_proyecto",
                    "constraint": "project_skills_id_proyecto_fkey",
                    "referencia_tabla": "proyecto",
                    "referencia_columna": "id"
                },
                {
                    "columna": "id_skill",
                    "constraint": "project_skills_id_skill_fkey",
                    "referencia_tabla": "skills",
                    "referencia_columna": "id"
                }
            ],
            "rls_activado": true,
            "check_constraints": [
                {
                    "clausula": "id_proyecto IS NOT NULL",
                    "constraint": "2200_17746_1_not_null"
                },
                {
                    "clausula": "id_skill IS NOT NULL",
                    "constraint": "2200_17746_2_not_null"
                }
            ]
        },
        {
            "tabla": "proyecto",
            "unique": [
            ],
            "columnas": [
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id",
                    "default": "gen_random_uuid()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 1
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_empresario",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 2
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_area_negocio",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 3
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_estado",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 4
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "titulo",
                    "default": null,
                    "max_len": 255,
                    "nullable": "NO",
                    "posicion": 5
                },
                {
                    "udt": "text",
                    "tipo": "text",
                    "columna": "descripcion",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 6
                },
                {
                    "udt": "bool",
                    "tipo": "boolean",
                    "columna": "usa_ia",
                    "default": "false",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 7
                },
                {
                    "udt": "int4",
                    "tipo": "integer",
                    "columna": "plazo_dias",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 8
                },
                {
                    "udt": "timestamptz",
                    "tipo": "timestamp with time zone",
                    "columna": "fecha_publicacion",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 9
                },
                {
                    "udt": "timestamptz",
                    "tipo": "timestamp with time zone",
                    "columna": "fecha_cierre",
                    "default": null,
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 10
                }
            ],
            "policies": [
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "is_admin()",
                    "nombre": "proyecto_admin_moderar",
                    "operacion": "UPDATE"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(EXISTS ( SELECT 1\n   FROM empresario e\n  WHERE ((e.id = proyecto.id_empresario) AND (e.id_usuario = auth.uid()))))",
                    "nombre": "proyecto_editar",
                    "operacion": "UPDATE"
                },
                {
                    "check": "(EXISTS ( SELECT 1\n   FROM empresario e\n  WHERE ((e.id = proyecto.id_empresario) AND (e.id_usuario = auth.uid()))))",
                    "roles": [
                        "public"
                    ],
                    "using": null,
                    "nombre": "proyecto_crear",
                    "operacion": "INSERT"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "((EXISTS ( SELECT 1\n   FROM estado_proyecto ep\n  WHERE ((ep.id = proyecto.id_estado) AND ((ep.nombre)::text <> 'borrador'::text)))) OR (EXISTS ( SELECT 1\n   FROM empresario e\n  WHERE ((e.id = proyecto.id_empresario) AND (e.id_usuario = auth.uid())))))",
                    "nombre": "proyecto_ver_publicados",
                    "operacion": "SELECT"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "is_admin()",
                    "nombre": "proyecto_admin_ver",
                    "operacion": "SELECT"
                }
            ],
            "primary_key": [
                "id"
            ],
            "foreign_keys": [
                {
                    "columna": "id_estado",
                    "constraint": "proyecto_id_estado_fkey",
                    "referencia_tabla": "estado_proyecto",
                    "referencia_columna": "id"
                },
                {
                    "columna": "id_area_negocio",
                    "constraint": "proyecto_id_area_negocio_fkey",
                    "referencia_tabla": "area_negocio",
                    "referencia_columna": "id"
                },
                {
                    "columna": "id_empresario",
                    "constraint": "proyecto_id_empresario_fkey",
                    "referencia_tabla": "empresario",
                    "referencia_columna": "id"
                }
            ],
            "rls_activado": true,
            "check_constraints": [
                {
                    "clausula": "id IS NOT NULL",
                    "constraint": "2200_17721_1_not_null"
                },
                {
                    "clausula": "((plazo_dias >= 5) AND (plazo_dias <= 15))",
                    "constraint": "proyecto_plazo_dias_check"
                },
                {
                    "clausula": "id_estado IS NOT NULL",
                    "constraint": "2200_17721_4_not_null"
                },
                {
                    "clausula": "id_empresario IS NOT NULL",
                    "constraint": "2200_17721_2_not_null"
                },
                {
                    "clausula": "titulo IS NOT NULL",
                    "constraint": "2200_17721_5_not_null"
                },
                {
                    "clausula": "id_area_negocio IS NOT NULL",
                    "constraint": "2200_17721_3_not_null"
                },
                {
                    "clausula": "plazo_dias IS NOT NULL",
                    "constraint": "2200_17721_8_not_null"
                },
                {
                    "clausula": "usa_ia IS NOT NULL",
                    "constraint": "2200_17721_7_not_null"
                },
                {
                    "clausula": "descripcion IS NOT NULL",
                    "constraint": "2200_17721_6_not_null"
                }
            ]
        },
        {
            "tabla": "roles",
            "unique": [
                "roles_nombre_key"
            ],
            "columnas": [
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id",
                    "default": "gen_random_uuid()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 1
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "nombre",
                    "default": null,
                    "max_len": 50,
                    "nullable": "NO",
                    "posicion": 2
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "descripcion",
                    "default": null,
                    "max_len": 255,
                    "nullable": "YES",
                    "posicion": 3
                }
            ],
            "policies": [
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(auth.uid() IS NOT NULL)",
                    "nombre": "catalogo_lectura",
                    "operacion": "SELECT"
                }
            ],
            "primary_key": [
                "id"
            ],
            "foreign_keys": [
            ],
            "rls_activado": true,
            "check_constraints": [
                {
                    "clausula": "id IS NOT NULL",
                    "constraint": "2200_17586_1_not_null"
                },
                {
                    "clausula": "nombre IS NOT NULL",
                    "constraint": "2200_17586_2_not_null"
                }
            ]
        },
        {
            "tabla": "roles_permisos",
            "unique": [
                "roles_permisos_id_rol_vista_key"
            ],
            "columnas": [
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id",
                    "default": "gen_random_uuid()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 1
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_rol",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 2
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "vista",
                    "default": null,
                    "max_len": 100,
                    "nullable": "NO",
                    "posicion": 3
                },
                {
                    "udt": "bool",
                    "tipo": "boolean",
                    "columna": "puede_acceder",
                    "default": "true",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 4
                }
            ],
            "policies": [
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(auth.uid() IS NOT NULL)",
                    "nombre": "catalogo_lectura",
                    "operacion": "SELECT"
                }
            ],
            "primary_key": [
                "id"
            ],
            "foreign_keys": [
                {
                    "columna": "id_rol",
                    "constraint": "roles_permisos_id_rol_fkey",
                    "referencia_tabla": "roles",
                    "referencia_columna": "id"
                }
            ],
            "rls_activado": true,
            "check_constraints": [
                {
                    "clausula": "id_rol IS NOT NULL",
                    "constraint": "2200_17594_2_not_null"
                },
                {
                    "clausula": "puede_acceder IS NOT NULL",
                    "constraint": "2200_17594_4_not_null"
                },
                {
                    "clausula": "id IS NOT NULL",
                    "constraint": "2200_17594_1_not_null"
                },
                {
                    "clausula": "vista IS NOT NULL",
                    "constraint": "2200_17594_3_not_null"
                }
            ]
        },
        {
            "tabla": "skills",
            "unique": [
            ],
            "columnas": [
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id",
                    "default": "gen_random_uuid()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 1
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "nombre",
                    "default": null,
                    "max_len": 100,
                    "nullable": "NO",
                    "posicion": 2
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "tipo",
                    "default": null,
                    "max_len": 20,
                    "nullable": "NO",
                    "posicion": 3
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "categoria",
                    "default": null,
                    "max_len": 100,
                    "nullable": "YES",
                    "posicion": 4
                }
            ],
            "policies": [
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "is_admin()",
                    "nombre": "admin_catalogo",
                    "operacion": "ALL"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(auth.uid() IS NOT NULL)",
                    "nombre": "catalogo_lectura",
                    "operacion": "SELECT"
                }
            ],
            "primary_key": [
                "id"
            ],
            "foreign_keys": [
            ],
            "rls_activado": true,
            "check_constraints": [
                {
                    "clausula": "tipo IS NOT NULL",
                    "constraint": "2200_17617_3_not_null"
                },
                {
                    "clausula": "id IS NOT NULL",
                    "constraint": "2200_17617_1_not_null"
                },
                {
                    "clausula": "((tipo)::text = ANY ((ARRAY['habilidad'::character varying, 'tecnologia'::character varying])::text[]))",
                    "constraint": "skills_tipo_check"
                },
                {
                    "clausula": "nombre IS NOT NULL",
                    "constraint": "2200_17617_2_not_null"
                }
            ]
        },
        {
            "tabla": "student_skills",
            "unique": [
            ],
            "columnas": [
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_estudiante",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 1
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_skill",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 2
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "nivel",
                    "default": "'intermedio'::character varying",
                    "max_len": 20,
                    "nullable": "NO",
                    "posicion": 3
                }
            ],
            "policies": [
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(id_estudiante IN ( SELECT estudiante.id\n   FROM estudiante\n  WHERE (estudiante.id_usuario = auth.uid())))",
                    "nombre": "skills_gestionar",
                    "operacion": "ALL"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(auth.uid() IS NOT NULL)",
                    "nombre": "skills_ver",
                    "operacion": "SELECT"
                }
            ],
            "primary_key": [
                "id_estudiante",
                "id_skill"
            ],
            "foreign_keys": [
                {
                    "columna": "id_estudiante",
                    "constraint": "student_skills_id_estudiante_fkey",
                    "referencia_tabla": "estudiante",
                    "referencia_columna": "id"
                },
                {
                    "columna": "id_skill",
                    "constraint": "student_skills_id_skill_fkey",
                    "referencia_tabla": "skills",
                    "referencia_columna": "id"
                }
            ],
            "rls_activado": true,
            "check_constraints": [
                {
                    "clausula": "nivel IS NOT NULL",
                    "constraint": "2200_17699_3_not_null"
                },
                {
                    "clausula": "id_skill IS NOT NULL",
                    "constraint": "2200_17699_2_not_null"
                },
                {
                    "clausula": "id_estudiante IS NOT NULL",
                    "constraint": "2200_17699_1_not_null"
                },
                {
                    "clausula": "((nivel)::text = ANY ((ARRAY['basico'::character varying, 'intermedio'::character varying, 'avanzado'::character varying])::text[]))",
                    "constraint": "student_skills_nivel_check"
                }
            ]
        },
        {
            "tabla": "users",
            "unique": [
                "users_cedula_key",
                "users_correo_key"
            ],
            "columnas": [
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 1
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "nombre",
                    "default": null,
                    "max_len": 100,
                    "nullable": "NO",
                    "posicion": 2
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "apellido1",
                    "default": null,
                    "max_len": 100,
                    "nullable": "YES",
                    "posicion": 3
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "apellido2",
                    "default": null,
                    "max_len": 100,
                    "nullable": "YES",
                    "posicion": 4
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "cedula",
                    "default": null,
                    "max_len": 20,
                    "nullable": "YES",
                    "posicion": 5
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "correo",
                    "default": null,
                    "max_len": 255,
                    "nullable": "NO",
                    "posicion": 6
                },
                {
                    "udt": "uuid",
                    "tipo": "uuid",
                    "columna": "id_rol",
                    "default": null,
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 7
                },
                {
                    "udt": "jsonb",
                    "tipo": "jsonb",
                    "columna": "preferencias_notificacion",
                    "default": "'{\"adjudicacion\": true, \"cambio_estado\": true, \"nuevo_mensaje\": true, \"entregable_subido\": true, \"vencimiento_plazo\": true}'::jsonb",
                    "max_len": null,
                    "nullable": "YES",
                    "posicion": 8
                },
                {
                    "udt": "varchar",
                    "tipo": "character varying",
                    "columna": "estado_cuenta",
                    "default": "'pendiente'::character varying",
                    "max_len": 20,
                    "nullable": "NO",
                    "posicion": 9
                },
                {
                    "udt": "timestamptz",
                    "tipo": "timestamp with time zone",
                    "columna": "fecha_registro",
                    "default": "now()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 10
                },
                {
                    "udt": "timestamptz",
                    "tipo": "timestamp with time zone",
                    "columna": "updated_at",
                    "default": "now()",
                    "max_len": null,
                    "nullable": "NO",
                    "posicion": 11
                }
            ],
            "policies": [
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(id = auth.uid())",
                    "nombre": "users_editar_propio",
                    "operacion": "UPDATE"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "is_admin()",
                    "nombre": "users_admin_ver_todos",
                    "operacion": "SELECT"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "is_applicant_to_my_project(id)",
                    "nombre": "users_empresa_ve_postulantes",
                    "operacion": "SELECT"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "(id = auth.uid())",
                    "nombre": "users_ver_propio",
                    "operacion": "SELECT"
                },
                {
                    "check": "(id = auth.uid())",
                    "roles": [
                        "public"
                    ],
                    "using": null,
                    "nombre": "users_crear_propio",
                    "operacion": "INSERT"
                },
                {
                    "check": null,
                    "roles": [
                        "public"
                    ],
                    "using": "is_admin()",
                    "nombre": "users_admin_editar_todos",
                    "operacion": "UPDATE"
                }
            ],
            "primary_key": [
                "id"
            ],
            "foreign_keys": [
                {
                    "columna": "id_rol",
                    "constraint": "users_id_rol_fkey",
                    "referencia_tabla": "roles",
                    "referencia_columna": "id"
                }
            ],
            "rls_activado": true,
            "check_constraints": [
                {
                    "clausula": "updated_at IS NOT NULL",
                    "constraint": "2200_17624_11_not_null"
                },
                {
                    "clausula": "id IS NOT NULL",
                    "constraint": "2200_17624_1_not_null"
                },
                {
                    "clausula": "nombre IS NOT NULL",
                    "constraint": "2200_17624_2_not_null"
                },
                {
                    "clausula": "correo IS NOT NULL",
                    "constraint": "2200_17624_6_not_null"
                },
                {
                    "clausula": "id_rol IS NOT NULL",
                    "constraint": "2200_17624_7_not_null"
                },
                {
                    "clausula": "estado_cuenta IS NOT NULL",
                    "constraint": "2200_17624_9_not_null"
                },
                {
                    "clausula": "fecha_registro IS NOT NULL",
                    "constraint": "2200_17624_10_not_null"
                },
                {
                    "clausula": "((estado_cuenta)::text = ANY ((ARRAY['activa'::character varying, 'pendiente'::character varying, 'suspendida'::character varying, 'rechazada'::character varying])::text[]))",
                    "constraint": "users_estado_cuenta_check"
                }
            ]
        }
    ]
}