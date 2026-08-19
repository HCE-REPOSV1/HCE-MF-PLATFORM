# jarvis-mf-platform

![react](https://img.shields.io/badge/react-18-blue?logo=react)
![vite](https://img.shields.io/badge/vite-7-purple?logo=vite)
![typescript](https://img.shields.io/badge/typescript-5-blue?logo=typescript)
![module federation](https://img.shields.io/badge/module--federation-microfrontend-orange)
![design system](https://img.shields.io/badge/design--system-%40hce%2Fdesign--system-blue)
![architecture](https://img.shields.io/badge/architecture-microfrontend-success)
![monorepo](https://img.shields.io/badge/monorepo-npm--workspaces-blue)
![license](https://img.shields.io/badge/license-MIT-lightgrey)

---

## Descripción

**Jarvis MF Platform** es la plataforma frontend de HCE (Historia Clínica Electrónica),
construida con **React, Vite y Module Federation** sobre una arquitectura de
**Microfrontends**. Un **Shell central** (`mf-shell`) orquesta en runtime 10
microfrontends remotos, todos consumiendo un **Design System compartido**
(`@hce/design-system`, repo separado, publicado vía Verdaccio).

---

## Estructura del repositorio

```
jarvis-mf-platform
├── apps
│   ├── mf-shell          # Orquestador — login, sesión, routing, layout
│   ├── mf-auth           # Pantalla de login
│   ├── mf-home           # Dashboard / accesos rápidos
│   ├── mf-emergency      # Monitor de Emergencia
│   ├── mf-hospital       # Hospitalización
│   ├── mf-ambulatorio    # Citas y consultorios
│   ├── mf-auditoria      # Reportes y trazabilidad
│   ├── mf-header         # Cabecera (avatar, sede, logout)
│   ├── mf-sidebar        # Menú lateral
│   ├── mf-footer         # Pie de página
│   └── mf-triage         # Triaje (consumido dentro de mf-emergency)
├── docker
│   └── nginx-entrypoint.sh   # Genera config nginx (SSL opcional) al arrancar cada imagen
├── docker-compose.yml         # Build con Vault — build-args vía ${VAR}
├── docker-compose.dev.yml     # Build sin Vault — build-args hardcodeados
├── package.json                # Workspaces npm + scripts raíz
└── README.md
```

`@hce/design-system` **no vive en este repo** — es un paquete externo (repo
`HCE-design-system`) publicado en un registry Verdaccio interno y consumido como
cualquier dependencia npm.

---

## Microfrontends

| App | Puerto dev/preview | Expone (Module Federation) | Consume de `shell` | Dockerfile |
|---|---|---|---|---|
| `mf-shell` | 10500 | `UserContext`, `AuthService`, `ApiClient` | — (es el host) | ✅ |
| `mf-auth` | 10501 | `Login` | `AuthService` (login sin tocar el gateway) | ✅ |
| `mf-home` | 10502 | `Home` | `UserContext` (permisos) | ✅ |
| `mf-emergency` | 10503 | `Emergency`, `menuConfig` | — (también consume `triage`) | ✅ |
| `mf-hospital` | 10504 | `Hospital`, `menuConfig` | — | ✅ |
| `mf-ambulatorio` | 10505 | `Ambulatorio`, `menuConfig` | — | ✅ |
| `mf-auditoria` | 10506 | `Auditoria`, `menuConfig` | — | ✅ |
| `mf-header` | 10507 | `Header`, `menuConfig` | `UserContext`, `ApiClient` (nombre/foto del practitioner) | ✅ |
| `mf-sidebar` | 10508 | `Sidebar` | — (recibe opciones por props) | ✅ |
| `mf-footer` | 10509 | `Footer` | — | ✅ |
| `mf-triage` | 10510 | `Triage` | — (lo consume `mf-emergency`) | ✅ |

### Rutas que sirve `mf-shell`

| Ruta | Remote | Protegida |
|---|---|---|
| `/` | `auth/Login` | No (redirige a `/home` si ya hay sesión) |
| `/home` | `home/Home` | Sí |
| `/emergencia/*` | `emergency/Emergency` | Sí |
| `/hospital/*` | `hospital/Hospital` | Sí |
| `/ambulatorio/*` | `ambulatorio/Ambulatorio` | Sí |
| `/auditoria/*` | `auditoria/Auditoria` | Sí |

`mf-header`, `mf-sidebar` y `mf-footer` no son rutas — `Layout.tsx` los renderiza
siempre alrededor del `<Outlet />` en las rutas protegidas.

---

## Autenticación y sesión

La autenticación está **centralizada en `mf-shell`** — ningún otro microfrontend
guarda tokens, llama al login, o conoce la URL del API Gateway salvo `mf-header`
(que necesita resolver el practitioner).

```
mf-auth (Login.tsx)
   │  import { login } from "shell/AuthService"
   ▼
mf-shell (auth.service.ts) ── POST /auth/login ──▶ API Gateway
   │
   ▼ Set-Cookie: access_token, refresh_token (httpOnly)
   │
mf-shell (UserContext.tsx) ── GET /auth/me, /auth/accesos
   │  apiFetch() — ver api.service.ts
   ▼
useUser() → { user, permisos, opciones, sede, hasPermission, logout }
   │
   ├─ mf-home          import { useUser } from "shell/UserContext"
   ├─ mf-header        import { useUser } from "shell/UserContext" (+ ApiClient)
   └─ mf-header/mf-sidebar (via props desde Layout.tsx)
```

**Refresh automático (`apps/mf-shell/src/services/api.service.ts`)** — `apiFetch()`
envuelve `fetch` con `credentials: "include"`. Si una llamada protegida responde
`401`:
1. Dispara `POST /auth/refresh` (la cookie `refresh_token` va sola).
2. **Lock compartido** — varios `401` en paralelo solo disparan un refresh.
3. Si funciona, reintenta la request original una vez.
4. Si también falla, el backend ya limpió ambas cookies — se emite el evento
   global `hce:session-expired` (cualquier mf puede escucharlo) y se lanza
   `SessionExpiredError`. `mf-shell` lo escucha y limpia la sesión local.

`mf-header` usa este mismo `apiFetch` (vía `shell/ApiClient`) para sus propias
llamadas protegidas (datos y foto del practitioner) — ningún microfrontend hace
`fetch` crudo a un endpoint protegido.

---

## Variables de entorno y Vault

Cada app tiene su propio `.env` (ver `.env.example` en cada `apps/<nombre>`).
Todas requieren `VITE_REMOTE_SHELL`; `mf-shell` y `mf-header` además requieren
las URLs del API Gateway (`VITE_APIGW_CNL_CROSS` / `VITE_APIGW_CNL_WEB_EMERGENCY`).

En producción estas URLs **no se hardcodean** — viven en HashiCorp Vault
(proyecto `kv-hce-platform-dev`, paths `secret/hce/mf/<app>`) y se inyectan como
build-args al momento de compilar. Ver la sección **Producción (Docker)** abajo.

### Recargar un solo remote tras cambiar su `.env`

Vite "hornea" las variables `import.meta.env.VITE_*` en el bundle al momento del
build/arranque — no se recargan en caliente. Si editaste el `.env` de un remote
(por ejemplo `mf-triage`) mientras la plataforma corre vía `npm start`
(build + `vite preview`), no hace falta reiniciar todo — alcanza con reconstruir
y volver a servir ese workspace puntual:

```bash
npm run build -w apps/mf-triage -- --mode development
npm --workspace apps/mf-triage run preview
```

Reemplazá `apps/mf-triage` por el workspace que corresponda (`apps/mf-header`,
`apps/mf-shell`, etc.). Si el puerto del remote sigue ocupado por el proceso
viejo (todos corren bajo un mismo `concurrently` en `npm start`), liberalo antes
(Windows/PowerShell, usando el puerto del remote — ver tabla de **Microfrontends**
arriba):

```powershell
Get-NetTCPConnection -LocalPort 10510 -State Listen | Select -Expand OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

Después, hacé un hard refresh (`Ctrl+Shift+R`) en el navegador para que Module
Federation no sirva el `remoteEntry.js` viejo cacheado.

---

## Tecnologías

| Tecnología | Uso |
|---|---|
| React 18 | Framework UI |
| Vite 7 | Build tool |
| TypeScript | Tipado estático |
| `@originjs/vite-plugin-federation` | Module Federation |
| Material UI / Emotion | Componentes visuales y CSS-in-JS |
| `@hce/design-system` | Design system compartido (repo externo) |
| npm workspaces | Monorepo |
| concurrently | Ejecución paralela de procesos |
| nginx | Server de cada imagen Docker en producción |
| HashiCorp Vault | Gestión de secretos / URLs de producción (`kv-hce-platform-dev`) |

---

## Instalación

> **Requisito:** Verdaccio activo y accesible con `@hce/design-system` y
> `@hce/i18n-core` publicados antes de ejecutar `npm install` — este repo no
> tiene Verdaccio propio, corre en el repo hermano
> [`hce-verdaccio-registry`](../hce-verdaccio-registry). El `.npmrc`
> commiteado en la raíz apunta al Verdaccio **compartido del equipo**
> (`@hce:registry=http://192.168.42.44:10100`), así que un `npm install`
> normal ya resuelve contra ese servidor sin configuración extra — no hace
> falta tener Verdaccio corriendo en tu propia máquina para esto.
>
> Para probar contra un Verdaccio **local** propio en cambio (por ejemplo
> para validar una versión de `@hce/design-system` que aún no publicaste al
> compartido), editar `.npmrc` apuntando a `http://localhost:10100` — **sin
> commitear ese cambio**, ver [`hce-verdaccio-registry`](../hce-verdaccio-registry)
> para levantarlo.

```bash
git clone <repo-url> jarvis-mf-platform
cd jarvis-mf-platform
npm install   # instala todas las apps y packages del monorepo
```

---

## Gestión de dependencias (npm workspaces)

Cada microfrontend (`apps/mf-*`) es un workspace independiente y el Dockerfile
de cada uno instala con `npm install --install-strategy=nested` — **no hostea**
dependencias entre workspaces hermanos. Eso significa dos reglas:

1. **Toda librería que un microfrontend importa debe estar declarada en SU
   PROPIO `package.json`** (`dependencies` o `devDependencies`), aunque ya
   esté declarada en el `package.json` raíz o en otro workspace. Si falta,
   el build local puede funcionar por casualidad (Node resuelve subiendo
   directorios hasta encontrar el paquete en `node_modules` de la raíz), pero
   el build de Docker de ese microfrontend puntual puede fallar con
   `Cannot find module` — así se rompió `mf-header` con `react-router-dom`.
2. **El `package.json` raíz mantiene el inventario completo** de todas las
   librerías usadas en cualquier microfrontend del monorepo, no solo las que
   usa el propio root.

Para detectar y corregir automáticamente versiones desincronizadas de una
misma librería entre workspaces, se usa [`syncpack`](https://www.npmjs.com/package/syncpack):

```bash
npm run deps:check   # lista mismatches de versión entre workspaces
npm run deps:fix      # los corrige automáticamente
```

> Requiere que `syncpack` esté instalado (`npm install` en la raíz) — como es
> paquete público, no depende de que Verdaccio esté levantado, salvo que el
> install completo del monorepo también intente resolver `@hce/design-system`
> (scope privado), en cuyo caso Verdaccio sí debe estar accesible.

---

## Levantar la plataforma

### Desarrollo local (sin Docker)

```bash
npm start
```

Esto ejecuta en orden:
1. `clean` — borra `dist/` de todas las apps
2. `build:remotes` — compila los 10 microfrontends remotos
3. `build:shell` — compila el shell
4. `preview:remotes` + `dev:shell` en paralelo

Luego abrir:

| URL | Descripción |
|---|---|
| http://localhost:10500 | Shell (login) |
| http://localhost:10500/home | Dashboard |
| http://localhost:10500/emergencia | Monitor de Emergencia |

> **Nota importante:** Module Federation con `@originjs/vite-plugin-federation` v1.x
> requiere que los remotos estén **compilados y servidos vía `preview`** — `dev`
> no genera `remoteEntry.js`. Por eso `npm start` usa `build` + `preview` para los
> remotos, y solo el shell corre en modo `dev`.

#### Opción 2 — mismo resultado, en dos terminales

```bash
# Terminal 1
npm run build:remotes
npm run preview:remotes

# Terminal 2
npm run dev:shell
```

#### Opción 3 — un solo microfrontend aislado

```bash
cd apps/mf-emergency
npm run build && npm run preview   # http://localhost:10503

# o en modo dev standalone (sin shell, para iterar rápido en la UI)
npm run dev
```

#### Actualizar un solo microfrontend sin reiniciar todo

El shell resuelve los remotos en runtime buscando `remoteEntry.js` — basta con
reconstruir y re-servir el módulo modificado:

```bash
npm run build -w apps/mf-emergency && npm run preview -w apps/mf-emergency
```

El shell toma el cambio en el siguiente reload del navegador.

> **⚠️ `npm link` y Docker no son compatibles.** Si tenés `npm link @hce/design-system`
> activo, el build de Docker fallará porque el symlink apunta fuera del contexto de
> build. Antes de `docker compose build`:
> ```bash
> npm unlink @hce/design-system && npm install
> ```

---

### Producción (Docker)

> **Requisito:** Verdaccio accesible (con `@hce/design-system` y
> `@hce/i18n-core` publicados) al momento del build — no en runtime, una vez
> construidas las imágenes Verdaccio puede detenerse sin afectar los
> contenedores. Este repo no tiene Verdaccio propio, corre en el repo hermano
> [`hce-verdaccio-registry`](../hce-verdaccio-registry).
>
> El build-arg `VERDACCIO_URL` de cada servicio en `docker-compose.dev.yml`
> ya viene **hardcodeado a `http://192.168.42.44:10100`** (el Verdaccio
> compartido del equipo) — por eso corriendo `docker-compose.dev.yml` tal
> cual, tanto en tu máquina como en el servidor de pruebas, el build ya
> resuelve contra el mismo registry compartido sin nada que levantar en
> local. Si necesitás construir contra un Verdaccio **local** propio en
> cambio, pasar el override explícito:
> ```bash
> docker compose -f docker-compose.dev.yml build --build-arg VERDACCIO_URL=http://host.docker.internal:10100 mf-shell
> ```
> (Levantar antes ese Verdaccio local desde
> [`hce-verdaccio-registry`](../hce-verdaccio-registry) — `docker compose up -d`.)

Cada microfrontend tiene su propio `Dockerfile` y genera una imagen nginx
independiente, desplegable de forma aislada. No hay red Docker interna entre
microfrontends — la integración ocurre en el browser, que carga cada
`remoteEntry.js` desde su puerto/dominio.

#### Dos archivos compose — con Vault o sin Vault

| Archivo | Build-args | Necesita Vault | Cuándo usarlo |
|---|---|---|---|
| `docker-compose.dev.yml` | Hardcodeados en el archivo | No | Build/deploy rápido en local |
| `docker-compose.yml` | `${VAR}` — se leen del entorno | Sí | Flujo normal — Vault es la única fuente de verdad para las URLs |

**Sin Vault** — los valores (gateway, remotes) están hardcodeados en el archivo:

```bash
docker compose -f docker-compose.dev.yml down
bash scripts/build-mf-batched.sh
```

> **⚠️ No construyas las 11 imágenes en paralelo en un servidor con poco
> margen de disco.** `docker compose build` (o `up -d --build`) sin
> restricción lanza los 11 `npm install` al mismo tiempo — cada uno escribe
> `node_modules` completo (varios cientos de MB, `@mui/icons-material` en
> particular son miles de archivos chicos), y el pico de escritura
> simultánea puede agotar el espacio real del disco aunque el total del
> repo entre holgado. Se manifiesta como `ENOSPC` / `no space left on
> device` a mitad de un `npm install`, y **no se arregla moviendo el
> `data-root` de Docker a otro disco** — el problema es el pico de
> concurrencia, no la ubicación.

`scripts/build-mf-batched.sh` automatiza el patrón probado en el servidor
de dev (2 imágenes a la vez — 4 en simultáneo vuelve a fallar aunque cada
imagen ya instale solo sus propias dependencias): lee los servicios
directo de `docker-compose.dev.yml` (así que no queda desactualizado si
se agrega un microfrontend nuevo), los construye en tandas de 2, y al
final corre `up -d` sin `--build` (las imágenes ya existen, evita que
`up -d --build` intente construir en paralelo lo que falte).

```bash
bash scripts/build-mf-batched.sh                # tandas de 2 (default)
bash scripts/build-mf-batched.sh --jobs 1        # de a una, si 2 sigue fallando
bash scripts/build-mf-batched.sh --no-cache      # fuerza rebuild completo
bash scripts/build-mf-batched.sh --jobs 1 --no-cache
```

> Si una tanda de 2 sigue fallando, usar `--jobs 1`. También ayuda correr
> `docker builder prune -af` antes de reintentar (libera caché de build
> reclamable, no requiere permisos de sistema) y, si el servidor tiene una
> partición separada llenándose con archivos ya borrados pero aún
> retenidos por un proceso vivo, pedirle a alguien con `sudo` que corra
> `lsof +L1` y reinicie el proceso dueño — eso sí requiere acceso de root
> y está fuera del alcance de este repo.

**Con Vault (recomendado)** — `docker-compose.yml` no funciona ejecutado solo:
sus `build.args` son `${VAR}`, sin esas variables exportadas el build queda con
valores vacíos. Se levanta desde el proyecto `kv-hce-platform-dev`, que lee los
11 paths `hce/mf/*` de Vault, exporta cada variable y recién ahí corre el build:

```bash
cd /proyectos/kv-hce-platform-dev   # o donde tengas ese proyecto
bash scripts/deploy-mf.sh
bash scripts/deploy-mf.sh --no-cache   # fuerza rebuild completo
```

Si cambia una URL de producción, se edita en Vault (`vault kv patch ...` o
`secrets.sh` + `bash scripts/init.sh`) y se vuelve a correr `deploy-mf.sh` — no
hay que tocar nada en este repo.

> Los comandos de las secciones siguientes (`build`, `logs`, `rm`, etc.) usan
> `docker compose` sin `-f` por brevedad — agregar `-f docker-compose.dev.yml`
> si se está en modo sin Vault.

#### Actualizar un solo microfrontend

```bash
docker compose build mf-emergency
docker compose up -d mf-emergency

# varios a la vez
docker compose build mf-emergency mf-home
docker compose up -d mf-emergency mf-home
```

##### Con `docker-compose.dev.yml` (sin Vault)

Mismo comando, agregando `-f docker-compose.dev.yml`. `up -d --build` hace
`build` + `up` en un solo paso — sirve igual para actualizar un solo servicio:

```bash
docker compose -f docker-compose.dev.yml up -d --build mf-emergency

# varios a la vez (recordar el límite de disco — ver advertencia de ENOSPC arriba,
# no hacer esto con más de 2 microfrontends a la vez en el servidor de dev)
docker compose -f docker-compose.dev.yml up -d --build mf-emergency mf-home
```

> **⚠️ `--build` es obligatorio, no opcional, cuando cambia algo que se resuelve
> en build-time** (un build-arg en `docker-compose.dev.yml`, un `ARG` del
> `Dockerfile`, o cualquier `VITE_*` — Vite los hornea en el bundle al compilar,
> no en runtime). Un simple `docker compose -f docker-compose.dev.yml up -d
> mf-emergency` sin `--build`, o un `restart`, **no vuelven a leer esos
> valores** — reutilizan la imagen ya construida tal cual, aunque el
> `docker-compose.dev.yml` haya cambiado. Si un `ARG` nuevo no aparece en el
> bundle final después de reconstruir, revisar primero que el `Dockerfile`
> del microfrontend declare ese mismo `ARG` (con el mismo nombre exacto que
> usa `build.args` en el compose) y lo pase al `RUN npm run build` — un
> build-arg que el compose pasa pero el `Dockerfile` no declara se descarta
> en silencio y Vite cae al valor del `.env` local (normalmente apuntando a
> `localhost`), no al valor de producción.

#### Detener un solo microfrontend

`docker compose down` no acepta un servicio individual — usar `stop` + `rm`:

```bash
docker compose rm -f -s mf-emergency   # -s detiene antes de remover, -f sin confirmar
docker compose up -d mf-emergency      # volver a levantarlo sin reconstruir
```

#### Ver estado de los servicios

```bash
docker compose ps
docker compose logs -f mf-emergency
docker compose logs -f mf-emergency mf-home
```

#### Consumir un remote desde otro proyecto

```ts
// vite.config.ts de un shell externo
federation({
  remotes: {
    emergency: "https://servicios.dev.sanfelipe.com:20503/assets/remoteEntry.js",
  }
})
```

El browser descarga el componente en runtime directamente desde ese servidor —
el shell externo no necesita el código fuente ni estar en la misma red Docker.

---

## Mapa de puertos

| Microfrontend | Dev/Preview | Docker HTTP | Docker HTTPS |
|---|---|---|---|
| mf-shell | 10500 | 10500 | 20500 |
| mf-auth | 10501 | 10501 | 20501 |
| mf-home | 10502 | 10502 | 20502 |
| mf-emergency | 10503 | 10503 | 20503 |
| mf-hospital | 10504 | 10504 | 20504 |
| mf-ambulatorio | 10505 | 10505 | 20505 |
| mf-auditoria | 10506 | 10506 | 20506 |
| mf-header | 10507 | 10507 | 20507 |
| mf-sidebar | 10508 | 10508 | 20508 |
| mf-footer | 10509 | 10509 | 20509 |
| mf-triage | 10510 | 10510 | 20510 |

---

## Scripts disponibles en la raíz

| Script | Descripción |
|---|---|
| `npm start` | `clean` + `build:remotes` + `build:shell` + `preview:remotes` + `dev:shell` |
| `npm run build:remotes` | Compila los 10 microfrontends remotos |
| `npm run build:shell` | Compila el shell |
| `npm run preview:remotes` | Sirve los 10 remotos compilados, en paralelo |
| `npm run preview:shell` | Sirve el shell compilado |
| `npm run dev:shell` | Levanta el shell en modo dev |
| `npm run clean` | Borra `dist/` de todas las apps |
| `npm run storybook` | Storybook del design system (si está linkeado como workspace local) |
| `npm run deps:check` | Lista mismatches de versión entre workspaces (`syncpack`) |
| `npm run deps:fix` | Corrige automáticamente esos mismatches |

---

## Principios arquitectónicos aplicados

| Principio | Aplicación |
|---|---|
| Desacoplamiento | Cada microfrontend es una app independiente, con su propio build y deploy |
| Reutilización | El Design System centraliza componentes UI |
| Auth centralizado | Login, sesión y refresh viven solo en `mf-shell`, expuestos vía Module Federation |
| Endpoints por dominio | Cada mf que necesita su propia API tiene su `config/endpoints.ts` (ej. `mf-header` para el practitioner) — no todo vive en el shell |
| Composición dinámica | Module Federation integra las apps en runtime, sin rebuild del shell |
| Config externa | Las URLs de producción viven en Vault, no en el código ni en `.env` commiteados |

---

## Mejoras futuras

- Dynamic Module Federation (registry de remotes en runtime)
- Shared State Management entre microfrontends
- Observabilidad frontend (logs/métricas centralizadas)
- CI/CD por microfrontend

---

## Autor

**Author:** Fabrizzio Renzo Pinedo Espinoza
**Project:** MF Platform

