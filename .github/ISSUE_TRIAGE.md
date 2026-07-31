# Contrato de triaje automático de issues

Este documento define cómo `claude-issue-triage.yml` clasifica y diagnostica issues.
Editar aquí, no en el YAML, para cambiar criterios de etiquetado o el formato del
diagnóstico.

## Taxonomía de labels (set cerrado)

No inventar labels fuera de este set. Si nada encaja bien, usar el más cercano y
bajar el campo **Confianza** del diagnóstico a `baja`, explicando el porqué.

| Eje | Valores | Cardinalidad |
|---|---|---|
| Tipo | `bug`, `enhancement`, `question`, `documentation` | exactamente 1 |
| Área | `area:render`, `area:pieces`, `area:scoring`, `area:controls`, `area:loop`, `area:ui`, `area:docs` | 1–2 |
| Severidad | `sev:low`, `sev:medium`, `sev:high` | exactamente 1 |
| Esfuerzo | `size:XS`, `size:S`, `size:M`, `size:L` | exactamente 1 |
| Marcador | `triaged` | siempre |

Los labels de tipo (`bug`, `enhancement`, `question`, `documentation`) ya existen por
defecto en el repo — no recrear. Los de `area:*`, `sev:*`, `size:*` y `triaged` los
crea el workflow si faltan.

### Guía de severidad

- `sev:high`: rompe el juego (crashea, bloquea input, `endGame()` no dispara cuando debe).
- `sev:medium`: comportamiento incorrecto visible pero el juego sigue jugable (colores,
  puntuación mal calculada, rotación rara en un caso).
- `sev:low`: cosmético, edge case raro, o mejora menor.

### Guía de esfuerzo

- `size:XS`: cambio de una constante o una línea (ej. entrada de `COLORS`).
- `size:S`: una función, un archivo.
- `size:M`: varias funciones o coordinación entre `game.js`/`index.html`/`style.css`.
- `size:L`: cambia el modelo de datos o el loop principal.

## Mapa área → código

Usar esto para saber qué archivo/función abrir según el área:

- `area:render` → `draw()`, `drawBlock()` en `game.js` (dibujo de grid, board, ghost, pieza actual).
- `area:pieces` → `PIECES`, `COLORS`, `rotateCW`, `tryRotate`, `collide` en `game.js`.
- `area:scoring` → `LINE_SCORES`, `clearLines`, cálculo de score/level en `game.js`.
- `area:loop` → `loop()`, `dropAccum`, `dropInterval`, `lockPiece`, `spawn()` en `game.js`.
- `area:controls` → listener de `keydown` en `game.js`.
- `area:ui` → `index.html` (HUD, overlay, canvases) y `style.css`.
- `area:docs` → `README.md`, `CLAUDE.md`.

## Proceso

1. Leer el issue con `gh issue view <num> --json title,body,labels`.
2. Leer `CLAUDE.md` y el código relevante (`game.js`, `index.html`, `style.css`) según
   el mapa de arriba **antes** de concluir nada. No diagnosticar sin haber abierto el
   archivo señalado.
3. Aplicar labels con `gh issue edit <num> --add-label "..."` (uno por eje, más `triaged`).
4. Buscar comentario previo del bot:
   `gh api repos/<owner>/<repo>/issues/<num>/comments --jq '.[] | select(.body | contains("<!-- claude-triage -->")) | .id'`
   - Si existe: actualizar con `gh api --method PATCH repos/<owner>/<repo>/issues/comments/<id> -f body=@archivo`.
   - Si no existe: crear con `gh issue comment <num> --body-file archivo`.
5. No editar el título ni el cuerpo del issue.

## Plantilla del comentario de diagnóstico

El comentario **siempre** empieza con el marcador exacto `<!-- claude-triage -->` en la
primera línea (así el paso 4 lo puede volver a encontrar).

```
<!-- claude-triage -->
## 🔎 Diagnóstico automático

**Resumen:** <una frase de qué reporta el issue>

**Causa raíz probable:** <explicación> (`game.js:NN` → `nombreFuncion()`)

**Archivos a tocar:** `game.js`, ...

**Plan de solución:**
1. ...
2. ...

**Criterios de aceptación:**
- [ ] ...
- [ ] ...

**Esfuerzo:** size:S · **Riesgo de regresión:** bajo · **Confianza:** media

---
_Generado automáticamente por Claude — commit `<sha corto>`_
```
