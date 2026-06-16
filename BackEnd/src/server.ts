import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";

app.listen(env.port, () => {
  logger.info("BackEnd escuchando", {
    url: `http://localhost:${env.port}`,
    corsOrigin: env.frontendUrl,
  });
});