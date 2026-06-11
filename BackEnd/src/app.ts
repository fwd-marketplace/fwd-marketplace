import express from "express";
import cors from "cors";
import { env } from "./config/env";
import routes from "./routes";
import { notFound, errorHandler } from "./middlewares/error.middleware";

export const app = express();

// CORS: solo permite peticiones desde el FrontEnd (Next.js).
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  }),
);

// Parseo del body JSON de las peticiones.
app.use(express.json());

// Todas las rutas cuelgan de /api.
app.use("/api", routes);

// 404 + manejador central de errores (siempre al final).
app.use(notFound);
app.use(errorHandler);
