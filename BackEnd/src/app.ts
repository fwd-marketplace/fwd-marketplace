import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import routes from "./routes";
import { requestLogger } from "./middlewares/requestLogger.middleware";
import { notFound, errorHandler } from "./middlewares/error.middleware";

export const app = express();

// Resuelve la IP real del cliente detrás de un proxy/balanceador (necesario para
// que el rate limiting funcione). Por defecto false; se activa con TRUST_PROXY en
// producción solo si el proxy es de confianza.
app.set("trust proxy", env.trustProxy);

// Cabeceras de seguridad. CSP desactivado (este API solo responde JSON, no HTML) y
// CORP en "cross-origin" porque el FrontEnd lo consume desde otro origen.
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// CORS: solo permite peticiones desde el FrontEnd (Next.js).
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  }),
);

// Parseo del body JSON de las peticiones.
app.use(express.json());

// Log de cada request (método, ruta, status, duración) con el logger estructurado.
app.use(requestLogger);

// Todas las rutas cuelgan de /api.
app.use("/api", routes);

// 404 + manejador central de errores (siempre al final).
app.use(notFound);
app.use(errorHandler);
