"use client";

import { useState, FormEvent } from "react";

export default function Register() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Datos de registro enviados:", { email, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-6 font-sans">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-8 shadow-md border border-border">
        <h2 className="text-2xl font-bold text-ink-strong mb-4 text-center">Registro de Prueba</h2>
        
        <div className="mb-6 p-3 rounded-lg bg-warning text-warning-foreground text-sm flex items-start gap-2">
          <span className="font-bold">⚠️ Advertencia:</span>
          <span>Este es un formulario de prueba para verificar que los estilos del archivo globals.css cargan correctamente.</span>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com" 
              className="w-full rounded-lg border border-border-strong bg-white px-3 py-2 text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full rounded-lg border border-border-strong bg-white px-3 py-2 text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full rounded-lg bg-primary py-2 px-4 font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          >
            Registrarse
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-ink-muted">
          Comprobando estilos de <code className="bg-surface-sunken px-1 py-0.5 rounded text-magenta font-mono">globals.css</code>
        </p>
      </div>
    </div>
  );
}
