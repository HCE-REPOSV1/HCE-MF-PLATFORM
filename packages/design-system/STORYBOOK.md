# Storybook — @jarvis/design-system

Catálogo visual interactivo de todos los componentes del Design System de Jarvis. Permite explorar, probar y documentar cada componente de forma aislada, sin necesidad de levantar la aplicación principal.

---

## Levantar Storybook

Desde la raíz del monorepo:

```bash
npm run storybook
```

Se abre en: **http://localhost:6006**

> Storybook corre de forma completamente independiente. No requiere que `npm start` ni ningún microfrontend esté activo.

---

## Estructura de archivos

```
packages/design-system/
├── .storybook/
│   ├── main.ts          # Configuración principal (framework, addons, alias)
│   └── preview.tsx      # Decoradores globales (DSProvider + tokens base)
│
├── stories/
│   ├── atoms/           # Stories de átomos
│   ├── molecules/       # Stories de moléculas
│   └── organisms/       # Stories de organismos
│
├── atoms/               # Componentes fuente
├── molecules/
└── organisms/
```

---

## Componentes documentados

### Atoms

| Componente | Descripción | Stories |
|---|---|---|
| **Button** | Botón principal con variantes de color y estado | Default, Outlined, Disabled, FullWidth |
| **TextInput** | Campo de texto con label e ícono | Default, WithIcon |
| **SelectField** | Selector con opciones | Default |
| **PriorityBadge** | Badge de prioridad clínica (1–5 + none) | P1 Crítico ... P5 Sin Triage |
| **Badge** | Badge numérico MUI | Default, HighCount |
| **Chip** | Etiqueta pequeña outlined | Default, LongLabel |
| **Card** | Contenedor tarjeta MUI | Default |
| **AttentionCode** | Código alfanumérico monoespaciado | Default, Short |
| **BoxBadge** | Pill de estado de sala/box | Active, Urgent, Waiting, TP |
| **Icons** | Galería de los 23 íconos del sistema | Gallery |

### Molecules

| Componente | Descripción | Stories |
|---|---|---|
| **PasswordInput** | TextInput con toggle mostrar/ocultar contraseña | Default, Visible |
| **IconButton** | Botón icon-only genérico | Default, Small, Disabled |
| **InfoButton** | Botón circular azul para ver detalle de paciente | Default, Disabled |
| **ActionIconButton** | Botón icon-only para barras de acción (con tooltip) | Default, Print, Disabled |
| **ActionBar** | Barra de acciones rápidas (filtrar, usuario, refresh, imprimir) | Default |
| **ClinicalStatusIcon** | Ícono de estado clínico (Lab, Img, etc.) | Alert, Ok, Urgent, Empty |
| **BedsAvailabilityTab** | Tab lateral fija para abrir panel de camas | Default, Active |
| **EmergencyHeader** | Header azul marino del módulo de emergencia | Default, SinChips |
| **EmergencyPagination** | Paginación con contador de pacientes y navegación | Default, PocasPaginas |
| **PatientRow** | Fila completa de paciente en la tabla de emergencia | Normal, Alternado, Prioridad1, Seleccionado, SinBox |

### Organisms

| Componente | Descripción | Stories |
|---|---|---|
| **Header** | Header principal con logo, notificaciones y menú de usuario | Default |
| **Footer** | Pie de página con copyright | Default |
| **SidebarMenu** | Menú lateral con ítem activo por ruta | Default, Collapsed |
| **SideNav** | Contenedor del sidebar con botón colapsar | Expanded, Collapsed, Mobile |
| **BedAvailabilityDrawer** | Panel lateral de disponibilidad de boxes y pacientes | Default |
| **DataTable** | Tabla genérica con columnas configurables | Default, Empty |
| **Pagination** | Paginación MUI estándar | Default, MuchasPaginas |
| **PatientTable** | Tabla completa de pacientes con header sticky | Default, Vacia |

---

## Agregar un componente nuevo

### 1. Crear el componente en su carpeta correspondiente

```
packages/design-system/atoms/MiComponente/MiComponente.tsx
```

### 2. Crear el archivo de story

```
packages/design-system/stories/atoms/MiComponente.stories.tsx
```

### 3. Usar esta plantilla base

```tsx
import type { Meta, StoryObj } from "@storybook/react"
import { MiComponente } from "../../atoms/MiComponente/MiComponente"

const meta: Meta<typeof MiComponente> = {
  title:     "Atoms/MiComponente",  // define la ubicación en el sidebar
  component: MiComponente,
  tags:      ["autodocs"],          // activa la pestaña Docs automáticamente
}
export default meta
type Story = StoryObj<typeof MiComponente>

export const Default: Story = {
  args: {
    // props del componente con valores de ejemplo
  },
}

export const OtraVariante: Story = {
  args: {
    // props diferentes para mostrar otro estado
  },
}
```

Storybook detecta el archivo automáticamente — no hay que registrarlo en ningún otro lugar.

---

## Casos especiales

### Componente que usa routing (`useLocation`, `Link`, `NavLink`)

Agrega `MemoryRouter` como decorator en la propia story:

```tsx
import { MemoryRouter } from "react-router-dom"

const meta: Meta<typeof MiComponente> = {
  ...
  decorators: [(Story) => (
    <MemoryRouter initialEntries={["/ruta-inicial"]}>
      <Story />
    </MemoryRouter>
  )],
}
```

> No agregues `MemoryRouter` en `preview.tsx` — ya está quitado para evitar el error "You cannot render a Router inside another Router".

### Componente que usa tokens de emergencia

```tsx
import { injectEmergencyTokens } from "../../tokens/emergency.tokens"

injectEmergencyTokens()  // llamar una vez, fuera del componente
```

### Componente con estado interno (useState)

Crea una función wrapper dentro del archivo de story:

```tsx
function MiComponenteDemo() {
  const [valor, setValor] = useState("")
  return <MiComponente value={valor} onChange={setValor} />
}

export const Interactivo: StoryObj = {
  render: () => <MiComponenteDemo />,
}
```

### Componente que necesita ancho completo

```tsx
const meta: Meta<typeof MiComponente> = {
  ...
  parameters: { layout: "fullscreen" },
}
```

---

## Convenciones de títulos

| Nivel | Prefijo en `title` | Ejemplo |
|---|---|---|
| Átomo | `"Atoms/..."` | `"Atoms/Button"` |
| Molécula | `"Molecules/..."` | `"Molecules/PasswordInput"` |
| Organismo | `"Organisms/..."` | `"Organisms/Header"` |

---

## Tecnologías

- **Storybook 8** con framework `@storybook/react-vite`
- **Vite 6** (requerido por compatibilidad con Storybook 8)
- **Addons**: `@storybook/addon-essentials`, `@storybook/addon-interactions`
