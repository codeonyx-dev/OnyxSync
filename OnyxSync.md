# OnyxSync

Planificador de tareas y calendario con interfaz oscura. Organiza tareas en carpetas jerárquicas, arrastra y suelta, filtros avanzados y eventos en línea de tiempo.

---

## Requisitos

- **Node.js** 18 o superior
- **npm** 9+

---

## Inicio rápido

```bash
# Clonar o descargar el proyecto
cd onyxSycn

# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev
```

Abre la URL que muestra Vite (por defecto `http://localhost:5173`).

### Otros comandos

| Comando           | Descripción                          |
|-------------------|--------------------------------------|
| `npm run dev`     | Desarrollo con recarga en caliente   |
| `npm run build`   | Compila TypeScript + build producción |
| `npm run preview` | Previsualiza el build de producción  |

---

## Stack tecnológico

| Tecnología        | Uso                                      |
|-------------------|------------------------------------------|
| React 19          | UI                                       |
| Vite 6            | Bundler y dev server                     |
| Tailwind CSS 4    | Estilos                                  |
| TypeScript        | Tipado (parcial)                         |
| @dnd-kit          | Arrastrar y soltar tareas                |
| lucide-react      | Iconos                                   |

---

## Estructura del proyecto

```
onyxSycn/
├── index.html              # Punto de entrada HTML
├── onyx_planner.tsx        # Reexporta App (compatibilidad)
├── OnyxSync.md             # Esta documentación
├── package.json
│
└── src/
    ├── main.tsx            # Monta React en #root
    ├── App.tsx             # Orquestador: estado global, handlers, modales
    ├── index.css           # Estilos globales y scrollbars
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.tsx      # Cabecera con logo OnyxSync
    │   │   └── TabBar.tsx      # Pestañas Mis Tareas / Calendario
    │   └── shared/
    │       ├── ConfirmDialog.tsx
    │       └── UndoToast.tsx
    │
    ├── modules/
    │   ├── mistareas/          # Módulo Mis Tareas
    │   │   ├── MisTareasPanel.tsx   # Panel principal (sidebar, listas, DnD)
    │   │   ├── TareaCard.tsx        # Tarjeta de tarea sortable
    │   │   ├── TaskFiltersBar.tsx   # Panel de filtros colapsable
    │   │   ├── TaskModals.tsx       # Modales crear/editar/ver tarea y carpetas
    │   │   ├── FolderPicker.tsx
    │   │   ├── FolderDropTarget.tsx
    │   │   ├── AttachmentList.tsx
    │   │   ├── dnd.ts               # IDs y detección de colisiones DnD
    │   │   └── folderUtils.ts       # Árbol de carpetas y contadores
    │   │
    │   └── calendario/         # Módulo Calendario
    │       ├── CalendarioPanel.tsx  # Línea de tiempo de eventos
    │       └── ActivityModals.tsx   # Modales de eventos
    │
    └── shared/                 # Código compartido entre módulos
        ├── constants.ts        # Colores carpetas, constantes de tareas
        ├── taskUtils.ts        # Fechas, recurrencia, ordenación
        ├── dateUtils.ts        # Formateo y calendario
        ├── fileUtils.ts        # Adjuntos (base64)
        └── ui/                 # Pickers reutilizables
            ├── CalendarPicker.tsx
            ├── TimePicker.tsx
            ├── DateTimeFields.tsx
            ├── RecurrencePicker.tsx
            └── DropdownSelect.tsx
```

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│  App.tsx                                                │
│  · Estado: tareas, carpetas, actividades, modales       │
│  · Filtros, drag & drop handlers, atajos de teclado     │
└────────────┬───────────────────────────────┬────────────┘
             │                               │
    ┌────────▼────────┐             ┌────────▼────────┐
    │  MisTareasPanel │             │ CalendarioPanel │
    │  + TaskModals   │             │ + ActivityModals│
    └────────┬────────┘             └─────────────────┘
             │
    ┌────────▼────────────────────────┐
    │  shared/ (utils + UI pickers)   │
    └─────────────────────────────────┘
```

- **`App.tsx`** concentra el estado y la lógica de negocio; los módulos reciben props y callbacks.
- **`modules/mistareas`** y **`modules/calendario`** son independientes en UI; comparten utilidades en `shared/`.
- **`components/layout`** solo contiene navegación visual (navbar y tabs).

---

## Funcionalidades principales

### Mis Tareas
- Carpetas y subcarpetas con colores
- Contador de tareas que incluye subcarpetas
- Arrastrar desde el grip (⋮⋮) para reordenar o mover a carpeta
- Búsqueda, filtros por plazo y propiedades (incl. carpetas vacías)
- Subtareas, adjuntos, recurrencia, fechas de vencimiento
- Atajos: `N` nueva tarea, `/` buscar, `Esc` cerrar

### Calendario
- Línea de tiempo de eventos
- Crear, editar y ver detalles
- Convertir tarea en evento desde Mis Tareas

---

## Flujo de datos

| Dato          | Dónde vive   | Persistencia      |
|---------------|--------------|-------------------|
| Tareas        | `App` state  | En memoria (RAM)  |
| Carpetas      | `App` state  | En memoria (RAM)  |
| Actividades   | `App` state  | En memoria (RAM)  |

> Los datos se pierden al recargar la página. La persistencia en `localStorage` o backend está pendiente.

---

## Atajos de teclado

| Tecla | Acción (pestaña Mis Tareas) |
|-------|-----------------------------|
| `N`   | Nueva tarea                 |
| `/`   | Enfocar búsqueda            |
| `Esc` | Cerrar modal / drawer       |

---

## Subir a Gist

1. Crea un gist en [gist.github.com](https://gist.github.com)
2. Nombre del archivo: **`OnyxSync.md`**
3. Pega el contenido de este archivo
4. Descripción sugerida: *Documentación OnyxSync — planificador React + Vite*

Para subir desde terminal (con [GitHub CLI](https://cli.github.com/) instalado):

```bash
gh gist create OnyxSync.md --public --desc "OnyxSync — documentación del proyecto"
```

---

## Próximos pasos sugeridos

- [ ] Persistencia en `localStorage`
- [ ] Vista calendario mensual / Sectograph
- [ ] Build TypeScript sin errores (`npm run build`)
- [ ] Empaquetado móvil (Capacitor / PWA)

---

*OnyxSync v1.0.0*
