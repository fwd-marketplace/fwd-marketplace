/**
 * Logger mínimo y estructurado. Centraliza la salida del servidor para no usar
 * `console.*` suelto en el código (ver CLAUDE.md §5). Emite una línea JSON por
 * evento (nivel + timestamp + mensaje + meta opcional), fácil de parsear por el
 * agregador de logs del hosting. `info`/`warn` van a stdout; `error` va a stderr.
 */
type LogLevel = "info" | "warn" | "error";

function emit(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  const entry = {
    level,
    time: new Date().toISOString(),
    message,
    ...(meta ? { meta } : {}),
  };
  const line = `${JSON.stringify(entry)}\n`;
  if (level === "error") {
    process.stderr.write(line);
  } else {
    process.stdout.write(line);
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>): void => emit("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>): void => emit("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>): void => emit("error", message, meta),
};