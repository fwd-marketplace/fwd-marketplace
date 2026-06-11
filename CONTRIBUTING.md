# Guía para contribuir — FWD Marketplace

> Guía práctica para el equipo: cómo dejar tu entorno listo, cómo hacer commits con el
> formato correcto y cómo subir tus cambios (push) sin problemas.
> Las **reglas completas** del proyecto están en `CLAUDE.md` y `AGENTS.md`. Esto es el "cómo".

---

## 1. Setup inicial (una sola vez por computadora)

### 1.1 Requisitos
- **Node.js 20 LTS o superior** y **npm**.
- **Git** instalado.
- Ser **colaborador** del repo en GitHub (ya lo son todos).

### 1.2 Clonar el repo
```bash
git clone https://github.com/mjchaverri/Marketplace-de-proyectos-freelance-para-juniors.git
cd Marketplace-de-proyectos-freelance-para-juniors
```

### 1.3 Configurar tu identidad de git  (importante para que tus commits cuenten)
Esto **no es necesario para que el push funcione**, pero **sí** para que tus commits queden
atribuidos a vos en GitHub (es lo que se evalúa de la participación del equipo).

```bash
git config user.name "Tu Nombre"
git config user.email "el-email-de-tu-cuenta-de-GitHub"
```

> El **email debe ser el de tu cuenta de GitHub** (GitHub → Settings → Emails). Si no coincide,
> tus commits aparecen sin tu avatar ni enlace a tu perfil, aunque seas colaborador.

Verificá lo que tenés configurado:
```bash
git config user.name
git config user.email
```

### 1.4 Instalar dependencias
La instalación de la **raíz** es la que **activa los hooks** que validan los commits. Es obligatoria.

```bash
npm install            # raíz: activa husky + commitlint (validación de commits)
npm run install:all    # atajo: instala raíz + FrontEnd + BackEnd
```

O por separado si preferís:
```bash
npm install                 # raíz
npm --prefix FrontEnd install
npm --prefix BackEnd install
```

> Si NO corrés `npm install` en la raíz, tus commits no se validan en tu compu. Hacelo una vez.

---

## 2. Flujo de trabajo del día a día

### 2.1 Actualizá y creá tu rama
```bash
git checkout dev            # o la rama de integración que use el equipo
git pull                    # traé lo último
git checkout -b feat/lo-que-vas-a-hacer
```
Trabajá siempre en tu propia rama, no directo sobre `dev` ni `main`.

### 2.2 Programá tu cambio
…

### 2.3 ANTES de commitear: revisá que todo pase (Definition of Done)
```bash
# si tocaste el FrontEnd:
cd FrontEnd && npm run lint && npm run test

# si tocaste el BackEnd:
cd BackEnd && npm run typecheck
```
Además: sin textos ni colores quemados, sin emojis, probado en mobile (375 px). Ver `CLAUDE.md` §0.

### 2.4 Agregá tus cambios
```bash
git add .
```

### 2.5 Commiteá  (elegí UNA de las dos formas)

**Opción A — Guiada (recomendada, no hay que memorizar el formato):**
```bash
npm run commit
```
Te hace preguntas (tipo, alcance, descripción) y arma el mensaje correcto solo.

**Opción B — Manual:**
```bash
git commit -m "feat(frontend): descripción corta"
```

### 2.6 Subí tu rama (push)
```bash
git push -u origin feat/lo-que-vas-a-hacer
```
La primera vez puede pedirte autenticación: usá tu **token de acceso personal** de GitHub
(HTTPS) o tu **llave SSH**. Después queda guardado.

### 2.7 Abrí el Pull Request
En GitHub: **Pull requests → New** → base `dev`, compare tu rama. Pedí review a un compañero.

---

## 3. Formato de los commits (obligatorio)

```
tipo(alcance): descripción corta en minúscula
```

- **tipo** (obligatorio):

  | Tipo | Cuándo se usa |
  | --- | --- |
  | `feat` | nueva funcionalidad |
  | `fix` | corrección de un bug |
  | `docs` | documentación (README, guías) |
  | `style` | formato/estilo, sin cambiar lógica |
  | `refactor` | reordenar código sin cambiar comportamiento |
  | `test` | agregar o ajustar tests |
  | `chore` | configuración, dependencias, tareas varias |

- **alcance** (opcional pero recomendado): `frontend`, `backend`, o la feature (`auth`, `marketplace`…).
- **descripción**: corta, en imperativo ("agrega", no "agregué"), sin punto final, **sin emojis**.

Ejemplos válidos:
```
feat(frontend): listado de proyectos con filtros por stack
fix(backend): validar email antes de llamar a Supabase
docs: actualizar la guía de contribución
chore(backend): agregar script de build
```

---

## 4. ¿Qué pasa si me equivoco en el commit?

El commit se **rechaza** y verás un error. **No se pierde nada**: tus archivos siguen en *staging*,
solo repetís el commit con el mensaje corregido (o usá `npm run commit` para no fallar).

Ejemplo de rechazo:
```
✖   subject may not be empty [subject-empty]
✖   type may not be empty [type-empty]
husky - commit-msg script failed (code 1)
```

> No uses `git commit --no-verify`: eso se salta la validación y rompe la regla del equipo.

---

## 5. Resumen rápido (chuleta)

| Necesito… | Comando |
| --- | --- |
| Activar la validación (1 vez) | `npm install` en la raíz |
| Configurar quién soy (1 vez) | `git config user.name` / `user.email` (email de GitHub) |
| Traer lo último | `git pull` |
| Nueva rama | `git checkout -b feat/...` |
| Commit guiado | `git add .` + `npm run commit` |
| Commit manual | `git commit -m "feat(scope): ..."` |
| Subir | `git push -u origin <tu-rama>` |

### Para que el push funcione necesitás SOLO dos cosas:
1. Ser **colaborador** del repo. ✅ (ya lo son)
2. Tener tus **credenciales** de GitHub en la compu (token HTTPS o SSH).

La identidad de git (`user.name`/`user.email`) **no** condiciona el push: sirve para que tus
commits queden a tu nombre.

---

_Dudas sobre las reglas del proyecto: ver `CLAUDE.md` y `AGENTS.md` en la raíz del repo._
