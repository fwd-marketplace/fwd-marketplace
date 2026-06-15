/**
 * Error con código HTTP. Lánzalo desde servicios/controladores
 * y el middleware de errores lo traducirá a una respuesta JSON.
 *
 *   throw new ApiError(404, "Usuario no encontrado");
 */
export class ApiError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
