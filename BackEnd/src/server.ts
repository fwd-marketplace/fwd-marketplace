import { app } from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.log(`🚀 BackEnd escuchando en http://localhost:${env.port}`);
  console.log(`   CORS permitido para: ${env.frontendUrl}`);
});
