import type { Request, Response } from "express";
import { parseBody } from "../utils/parseBody";
import { VerificarEgresadoSchema } from "../validations/egresado";
import { verificarEgresado } from "../services/egresado.service";

/**
 * POST /api/egresados/verificar
 * Cotejo previo al registro: recibe una cédula y responde si corresponde a un egresado
 * FWD. El FrontEnd lo usa para confirmar la elegibilidad antes de completar el onboarding
 * (y precargar nombre/título). No expone la lista de egresados, solo el resultado puntual.
 */
export async function verificarEgresadoController(req: Request, res: Response) {
  const { cedula } = parseBody(VerificarEgresadoSchema, req.body);
  const match = await verificarEgresado(cedula);

  if (!match.elegible) {
    res.status(200).json({ elegible: false });
    return;
  }

  res.status(200).json({
    elegible: true,
    nombre: match.nombre,
    titulo: match.titulo,
    fecha_egreso: match.fechaEgreso,
  });
}
