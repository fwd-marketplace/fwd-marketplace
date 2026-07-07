/**
 * Error con código HTTP. Lánzalo desde servicios/controladores
 * y el middleware de errores lo traducirá a una respuesta JSON.
 *
 *   throw new ApiError(404, "Usuario no encontrado");
 *   throw new ApiError(409, "Ya existe una cuenta con esa cédula", "CEDULA_TAKEN");
 *
 * El tercer parámetro `code` es un identificador estable (SCREAMING_SNAKE_CASE) que
 * el FrontEnd mapea a texto localizado (es/en). El `message` queda como fallback
 * legible para clientes que no conozcan el código. Solo se expone en respuestas 4xx.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;

  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    this.statusCode = statusCode;
    if (code !== undefined) this.code = code;
    this.name = "ApiError";
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
