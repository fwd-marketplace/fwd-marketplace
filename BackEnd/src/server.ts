import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";

app.listen(env.port, () => {
  logger.info("BackEnd escuchando", {
    url: `http://localhost:${env.port}`,
    corsOrigin: env.frontendUrl,
  });
  const serviceKeyStatus = env.supabaseServiceKey
    ? `OK (${env.supabaseServiceKey.slice(0, 20)}...)`
    : "FALTA — notificaciones usaran clave anon (RLS bloqueara INSERT)";
  logger.info(`SUPABASE_SERVICE_KEY: ${serviceKeyStatus}`);
});