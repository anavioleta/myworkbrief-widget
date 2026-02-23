# My Work Brief — Figma Widget

Task Card widget para Figma y FigJam. Implementa el diseño del plugin-images (UI/UX/CRO) con header por tipo, metadata, botones de acción y footer con designer + status.

## Requisitos

- [Node.js](https://nodejs.org/) >= 18
- [Figma Desktop](https://www.figma.com/downloads/)

## Instalación y build

```bash
npm install
npm run build
```

El build genera `dist/code.js`. Para desarrollo con recarga automática:

```bash
npm run watch
```

## Cargar el widget en Figma

1. Abre **Figma Desktop**.
2. Menú (☰) → **Widgets** → **Development** → **Import widget from manifest…**
3. Selecciona el `manifest.json` de este proyecto.
4. El widget **My Work Brief** aparecerá. Arrástralo al canvas.

## Uso

### Property menu (solo desde el menú, sin controles en el canvas)

- **Theme**: Light / Dark (Slate Premium).
- **Task Type**: UI / UX / CRO.
- **Status**: Paused / In progress / Archived / Shipped.
- **Incluir en Tizona**: Sí / No.
- **Edit mode**: ON/OFF.

### Modo visualización

- Header por tipo (UI/UX/CRO) con colores fijos.
- Title (34px) y description.
- Metadata: fecha, product manager, Tizona, botón Jira, botón prototipo.
- Footer: Designer block (avatar + rol + nombre) y Status pill.

### Modo edición

Cuando `editMode` está ON, se muestran inputs para editar título, descripción, fecha, product manager, includeInTizona, jiraUrl, fileUrl, designerName, designerRole.

## Estructura

```
manifest.json
package.json
widget-src/
  code.tsx        → Código fuente del widget
  tsconfig.json
dist/
  code.js         → Build compilado
```
