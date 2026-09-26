# Convenciones de Git

Plantilla genérica del equipo. Edita este archivo (y `scripts/commit-config.json`) cuando quieras cambiar tipos, ejemplos o el flujo de ramas. El script `scripts/commit.ps1` lee la config JSON para armar el mensaje.

---

## Tipos de commit

| Prefijo | Uso |
|---------|-----|
| `Mejora /` | Nueva funcionalidad o mejora significativa |
| `Arreglo /` | Corrección de bug |
| `Docs /` | Cambios en documentación |
| `Estilo /` | Cambios de estilo (espacios, formato, etc.) |
| `Refactor /` | Refactorización sin cambiar funcionalidad |
| `Test /` | Agregar o corregir tests |
| `Actualización /` | Herramientas, configuración, dependencias |
| `Rendimiento /` | Mejoras de rendimiento |
| `Build /` | Sistema de build |
| `Seguridad /` | Actualizaciones de seguridad |
| `Temp /` | Subida temporal para guardar avances |

### Formato del título

```
<Tipo> / <descripción en imperativo>
```

Opcional con ámbito:

```
<Tipo>(ámbito): <descripción>
```

### Ejemplos

```
Mejora / agregar validación de email en registro de usuarios
Arreglo / corregir error en cálculo de estadísticas por parroquia
Docs / actualizar guía de instalación y configuración
Refactor / simplificar lógica de autenticación JWT
Test / agregar tests unitarios para servicio de casos
Actualización / actualizar dependencias de seguridad
Mejora(auth): implementar login con Google OAuth
Arreglo(ui): corregir alineación de botones en formulario móvil
Seguridad: actualizar librerías vulnerables
```

### Buenas prácticas

- Usa verbos en **imperativo** (agregar, corregir, actualizar)
- Limita el título a **~50 caracteres**
- En el cuerpo describe **qué** cambió y **por qué**
- Si cierra un issue: `Closes #123`
- Commits **atómicos** (un cambio lógico por commit)
- No uses `Co-authored-by` de agentes de IA en commits de producción

---

## Ramas (Git Flow)

### Principales

| Rama | Rol |
|------|-----|
| `main` | Producción (solo código estable) |
| `develop` | Integración de desarrollo |

### De trabajo

| Patrón | Origen | Merge a | Ejemplo |
|--------|--------|---------|---------|
| `feature/*` | `develop` | `develop` | `feature/login-google` |
| `bugfix/*` | `develop` | `develop` | `bugfix/error-validacion` |
| `hotfix/*` | `main` | `main` + `develop` | `hotfix/error-login` |
| `release/*` | `develop` | `main` (+ tag) | `release/v1.2.0` |

### Flujo rápido

```text
feature/bugfix  →  develop  →  release/*  →  main
hotfix          →  main  y  develop
```

---

## Cómo hacer un commit (script)

Desde la raíz del proyecto, en PowerShell:

```powershell
.\scripts\commit.ps1
```

El script:

1. Muestra cambios (`git status`)
2. Pregunta qué stagear
3. Ofrece el menú de tipos (desde `commit-config.json`)
4. Pide descripción, ámbito opcional y cuerpo
5. Previsualiza el mensaje y pide confirmación
6. Ejecuta `git commit` **sin** co-autor de agentes

Para solo ver el mensaje sin commitear:

```powershell
.\scripts\commit.ps1 -DryRun
```

---

## Cómo adaptar esta plantilla a otro proyecto

1. Copia `docs/CONVENCIONES.md` y `scripts/commit.ps1` + `scripts/commit-config.json`
2. Edita los tipos o ejemplos en el JSON
3. Ajusta las reglas de ramas en este Markdown si el repo no usa Git Flow completo
