# Tetris

Implementación del clásico **Tetris** en JavaScript vanilla, usando HTML5 Canvas y CSS. Sin dependencias externas, sin frameworks, sin proceso de build: solo abrir y jugar.

![Tech](https://img.shields.io/badge/HTML5-Canvas-orange)
![Tech](https://img.shields.io/badge/CSS3-blueviolet)
![Tech](https://img.shields.io/badge/JavaScript-Vanilla-yellow)

---

## Tabla de contenidos

- [Tetris](#tetris)
  - [Tabla de contenidos](#tabla-de-contenidos)
  - [Qué hace el proyecto](#qué-hace-el-proyecto)
  - [Cómo ejecutar el juego](#cómo-ejecutar-el-juego)
    - [Opción 1: abrir el archivo directamente](#opción-1-abrir-el-archivo-directamente)
    - [Opción 2: servidor local (recomendado)](#opción-2-servidor-local-recomendado)
  - [Controles](#controles)
  - [Cómo funciona](#cómo-funciona)
    - [1. `index.html`](#1-indexhtml)
    - [2. `style.css`](#2-stylecss)
    - [3. `game.js`](#3-gamejs)
    - [Flujo del juego](#flujo-del-juego)
  - [Tecnologías](#tecnologías)
  - [Estructura del proyecto](#estructura-del-proyecto)
  - [Personalización](#personalización)
  - [Automatización](#automatización)
  - [Licencia](#licencia)

---

## Qué hace el proyecto

Es una versión jugable del Tetris clásico con todas las mecánicas que esperarías:

- Tablero de **10 × 20** celdas.
- Las **7 piezas estándar** (I, O, T, S, Z, J, L) con colores diferenciados.
- **Rotación** con _wall kicks_ básicos (pequeños desplazamientos para que la pieza pueda rotar pegada a la pared).
- **Soft drop** (bajada acelerada) y **hard drop** (caída instantánea).
- **Pieza fantasma** (_ghost piece_): muestra dónde aterrizará la pieza actual.
- **Vista previa** de la siguiente pieza.
- **Sistema de puntuación** clásico de Tetris (100 / 300 / 500 / 800 multiplicado por nivel).
- **Niveles** que aumentan cada 10 líneas y aceleran la caída.
- **Pausa** y **Game Over** con opción de reinicio.
- **Power-up bomba**: cada 5 líneas se abre una ventana en la que la siguiente pieza tiene 40 % de probabilidad de salir armada como bomba (se ve roja con un icono 💣 en su celda núcleo, tanto en la vista previa como en el tablero y su ghost). Al fijarse, destruye un área de 3×3 alrededor de esa celda, los bloques restantes caen por gravedad y las celdas destruidas suman puntos extra.
- **Power-up rayo**: cada 7 líneas se abre otra ventana, independiente de la de la bomba, con 20 % de probabilidad de que la siguiente pieza salga armada como rayo (se ve azul eléctrico con un icono ⚡ en su celda núcleo). Al fijarse, limpia por sorteo (50/50) toda la fila o toda la columna de esa celda con un destello blanco-azulado que se desvanece en ~220 ms: la fila cuenta como línea eliminada normal (puntúa y sube el marcador de `LINES`); la columna se vacía y las celdas destruidas suman puntos extra, igual que la bomba.
- **Power-up tinte**: cada 8 líneas se abre una tercera ventana, también independiente, con 20 % de probabilidad de que la siguiente pieza salga armada como tinte (se ve magenta con un icono 🎨 en su celda núcleo). Al fijarse, detecta el color con más celdas ocupadas en todo el tablero y las destruye todas de golpe (como una "bomba de color"); el resto cae por gravedad y las celdas destruidas suman puntos extra, igual que la bomba.
- **Power-up gravedad**: cada 6 líneas se abre una cuarta ventana, también independiente, con 20 % de probabilidad de que la siguiente pieza salga armada como gravedad (se ve verde azulado con un icono ⬇️ en su celda núcleo). Al fijarse compacta cada columna del tablero, haciendo caer cada bloque hasta la fila vacía más próxima y eliminando los huecos atrapados bajo salientes; si esa compactación completa alguna fila, se limpia y puntúa como una línea normal. La caída es visible: cada bloque que se mueve se anima deslizándose hasta su posición final en ~350 ms en vez de teletransportarse al instante.
- **Power-up congelar**: cada 9 líneas se abre una quinta ventana, también independiente, con 20 % de probabilidad de que la siguiente pieza salga armada como congelar (se ve celeste con un icono ❄️ en su celda núcleo). Al fijarse, pausa la caída automática durante 5 segundos: el tablero se tiñe de celeste con una cuenta regresiva en la parte superior, pero el jugador sigue pudiendo mover, rotar, soft-drop y hard-drop con normalidad. La cuenta se basa en el tiempo de juego (se pausa igual que todo lo demás con `P`), no en el reloj real.
- **Toggle de tema claro/oscuro**: modo oscuro por defecto, con un switch en el panel lateral que cambia a modo claro y recuerda la preferencia entre recargas (`localStorage`).
- **Toggle de idioma español/inglés**: switch en el panel lateral que traduce todos los labels de la interfaz (marcadores, controles, overlay de pausa/game over) y recuerda la preferencia entre recargas (`localStorage`).

---

## Cómo ejecutar el juego

No hay nada que instalar ni compilar. Tienes dos opciones:

### Opción 1: abrir el archivo directamente

```bash
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows
```

### Opción 2: servidor local (recomendado)

Cualquier servidor estático funciona. Algunos ejemplos:

```bash
# Con Python 3
python3 -m http.server 8000

# Con Node.js (npx)
npx serve .

# Con PHP
php -S localhost:8000
```

Después abre `http://localhost:8000` en el navegador.

---

## Controles

| Tecla     | Acción                            |
| --------- | --------------------------------- |
| `←` / `→` | Mover la pieza horizontalmente    |
| `↑` o `X` | Rotar la pieza en sentido horario |
| `↓`       | Soft drop (bajar más rápido)      |
| `Espacio` | Hard drop (caída instantánea)     |
| `P`       | Pausar / reanudar                 |

También hay dos switches en la parte superior del panel lateral, controlados con mouse/touch:

- **Tema claro/oscuro**.
- **Idioma español/inglés**: traduce en vivo todos los labels del panel (`SCORE`/`LINES`/`LEVEL`/`NEXT`/`CONTROLS`, la lista de controles) y los textos del overlay (`GAME OVER`, `PAUSA`, puntuación).

Ambas preferencias se guardan en `localStorage` (`theme` y `lang`) y se restauran al recargar la página.

---

## Cómo funciona

El juego se compone de tres archivos que cooperan:

### 1. `index.html`

Define la estructura visual:

- Un `<canvas id="board">` de **300 × 600** píxeles donde se renderiza el tablero.
- Un panel lateral con los switches de tema e idioma, `SCORE`, `LINES`, `LEVEL`, vista de la siguiente pieza y la lista de controles.
- Un overlay para los estados **PAUSA** y **GAME OVER**.

### 2. `style.css`

Aporta el aspecto visual con estética _retro arcade_: tipografía monoespaciada para los marcadores y _backdrop blur_ en los overlays. Los colores están definidos como variables CSS en `:root` (modo oscuro, por defecto) y sobrescritos en el bloque `body.light` (modo claro); `game.js` alterna la clase `light` en el `<body>` para cambiar de tema.

### 3. `game.js`

Contiene toda la lógica del juego. A grandes rasgos:

- **Modelo del tablero**: una matriz `ROWS × COLS` donde cada celda guarda `0` (vacía) o un índice de color (1–7) que identifica la pieza.
- **Piezas**: definidas como matrices cuadradas. Para rotar se calcula la transposición + reverso de filas (`rotateCW`).
- **Detección de colisiones** (`collide`): comprueba que ninguna celda de la pieza salga del tablero ni se solape con bloques ya fijados.
- **Wall kicks** (`tryRotate`): si la rotación choca, intenta desplazar la pieza ±1 y ±2 columnas antes de descartar el giro.
- **Game loop** (`loop`): basado en `requestAnimationFrame`, acumula el tiempo transcurrido y baja la pieza una fila cuando se supera `dropInterval`.
- **Limpieza de líneas** (`clearLines`): recorre el tablero de abajo hacia arriba; cada fila completa se elimina y se inserta una vacía en la cima.
- **Puntuación**: usa la tabla clásica `[0, 100, 300, 500, 800]` multiplicada por el nivel actual; el hard drop suma 2 puntos por celda recorrida y el soft drop 1 punto por fila.
- **Nivel y velocidad**: el nivel sube cada 10 líneas; la velocidad de caída se calcula como `max(100, 1000 − (level − 1) × 90)` milisegundos.
- **Ghost piece** (`ghostY`): proyecta la posición final de la pieza actual hacia abajo y la dibuja con `globalAlpha = 0.2`.
- **Idioma** (`I18N`, `applyLanguage`): diccionario con las traducciones `es`/`en` de todos los labels estáticos y del overlay; `applyLanguage(lang)` actualiza el DOM y persiste la preferencia en `localStorage`, igual que `applyTheme` hace con el tema.
- **Power-ups** (`bomb` / `lightning`): cada pieza puede llevar uno de los dos flags (`randomPiece()` los activa con probabilidad `BOMB_CHANCE` / `LIGHTNING_CHANCE` cuando `bombArmed` / `lightningArmed` está en `true`; nunca los dos a la vez, la bomba tiene prioridad si ambas ventanas coinciden). `registerLinesCleared()` es el único lugar que actualiza `lines`/`score`/`level`/`dropInterval` y arma las ventanas: pone `bombArmed = true` al cruzar un múltiplo de `BOMB_EVERY_LINES` y `lightningArmed = true` al cruzar un múltiplo de `LIGHTNING_EVERY_LINES`. `pieceCore(shape)` calcula la celda núcleo de cualquier pieza (la celda ocupada más cercana al centro del bounding box), así que la rotación no necesita ningún ajuste extra.
  - **Bomba**: `lockPiece()` llama a `detonate()`, que vacía el 3×3 alrededor del núcleo, suma `celdas_destruidas × 50 × nivel` y llama a `applyGravity()` para compactar cada columna.
  - **Rayo**: `lockPiece()` llama a `zap()`, que sortea 50/50 fila o columna del núcleo. `zapRow()` elimina la fila igual que una línea completa (pasa por `registerLinesCleared(1)`, así que puntúa y sube `LINES`/nivel como cualquier línea). `zapColumn()` vacía la columna entera y suma `celdas_destruidas × 50 × nivel` (sin gravedad: nada se desplaza lateralmente). Ambos llaman a `triggerFlash(type, index)`, que guarda `{type, index, start}` en el global `flash`; `draw()` lo pinta como un rectángulo semitransparente sobre la fila/columna que se va desvaneciendo durante `LIGHTNING_FLASH_MS` (basado en `performance.now()`, sin necesidad de un sistema de animación aparte).
  - **Tinte**: `lockPiece()` llama a `dye()`, que usa `mostFrequentColor()` (cuenta ocupación por color en todo el tablero, ignora `0`) para elegir el color a eliminar; si el tablero está vacío no hace nada. Destruye cada celda de ese color, suma `celdas_destruidas × 50 × nivel` y llama a `applyGravity()` (que compacta las 10 columnas completas, no solo las afectadas, ya que las celdas destruidas pueden estar repartidas por todo el tablero).
  - **Gravedad**: `lockPiece()` llama a `triggerGravityEffect()`, sin destruir ninguna celda ni sumar puntos por sí misma; solo reordena el tablero. Como `clearLines()` se ejecuta justo después dentro de `lockPiece()`, cualquier fila que la compactación complete se limpia y puntúa igual que una línea normal. `triggerGravityEffect()` primero calcula con `computeGravityMoves()` qué celda de cada columna va a moverse y a dónde (mismo algoritmo que `applyGravity()`, pero sin mutar el tablero, para poder registrar el origen antes de que desaparezca), luego llama a `applyGravity()` para dejar el tablero en su estado final al instante (la física/colisión siempre usa el estado real, sin retraso) y guarda esos movimientos en `gravityAnim` para animarlos. `draw()` oculta durante `GRAVITY_ANIM_MS` (350 ms) las celdas de destino que ya están en su posición final y en su lugar dibuja cada bloque interpolando entre su fila de origen y destino con un `ease-out` cuadrático, así el jugador ve caer los bloques en vez de verlos aparecer ya acomodados.
  - **Congelar**: `lockPiece()` fija `freezeRemaining = FREEZE_DURATION_MS` (5000 ms). En `loop()`, mientras `freezeRemaining > 0` se le resta `dt` en vez de acumularlo en `dropAccum`, así que la caída automática no avanza pero el resto del bucle (dibujo, controles de teclado) sigue funcionando con normalidad — al usar `dt` en vez de un timestamp absoluto, la cuenta también se detiene si el jugador pausa la partida con `P`. `draw()` pinta un tinte celeste semitransparente sobre el tablero y el texto `❄️ X.Xs` mientras `freezeRemaining` sea mayor que cero.

### Flujo del juego

```
init()
  ├─ createBoard()                  → matriz vacía
  ├─ next = randomPiece()
  ├─ spawn()                        → mueve next a current y genera nueva next
  └─ requestAnimationFrame(loop)
        ↓
   loop(timestamp)
     ├─ acumula dt
     ├─ si dt ≥ dropInterval → baja la pieza o llama a lockPiece()
     │     lockPiece()
     │       ├─ merge()
     │       ├─ si la pieza era bomba    → detonate()  → applyGravity()
     │       ├─ si la pieza era rayo     → zap()        → zapRow() o zapColumn()
     │       ├─ si la pieza era tinte    → dye()        → applyGravity()
     │       ├─ si la pieza era gravedad → triggerGravityEffect() → applyGravity() + gravityAnim
     │       ├─ si la pieza era congelar → freezeRemaining = 5000ms
     │       ├─ clearLines()             → puede armar la próxima bomba/rayo/tinte/gravedad/congelar
     │       └─ spawn()
     ├─ draw()  (grid + tablero + ghost + pieza actual)
     └─ requestAnimationFrame(loop)

   keydown → mover / rotar / soft-drop / hard-drop / pausa
```

Cuando una pieza recién generada ya colisiona al aparecer (`spawn`), se dispara `endGame()` y se muestra el overlay de **Game Over**.

---

## Tecnologías

- **HTML5** — marcado y dos elementos `<canvas>` (tablero y vista previa).
- **CSS3** — _flexbox_, variables de color, `backdrop-filter` y `box-shadow`.
- **JavaScript (ES6+) vanilla** — `const`/`let`, _arrow functions_, _spread operator_, `Array.from`, _template literals_…
- **Canvas 2D API** — para todo el renderizado del juego.
- **`requestAnimationFrame`** — para el bucle de juego sincronizado con el navegador.

**Sin dependencias.** No hay `package.json`, ni bundler, ni transpilador.

---

## Estructura del proyecto

```
03-tetris/
├── index.html          # Estructura del DOM y canvas
├── style.css           # Estilos del juego (dark theme)
├── game.js             # Toda la lógica del Tetris (~300 líneas)
├── CLAUDE.md           # Guía del repo para Claude Code
├── README.md
└── .github/
    ├── ISSUE_TRIAGE.md # Contrato de labels/diagnóstico para el triaje automático
    └── workflows/
        ├── claude.yml               # Responde a menciones @claude en issues/PRs
        ├── claude-code-review.yml   # Revisión automática de cada PR
        └── claude-issue-triage.yml  # Etiqueta y diagnostica issues nuevos/editados
```

---

## Personalización

Algunos parámetros fáciles de tunear en `game.js`:

| Constante      | Significado                              | Por defecto           |
| -------------- | ---------------------------------------- | --------------------- |
| `COLS`         | Columnas del tablero                     | `10`                  |
| `ROWS`         | Filas del tablero                        | `20`                  |
| `BLOCK`        | Tamaño en píxeles de cada celda          | `30`                  |
| `COLORS`       | Paleta de colores por tipo de pieza      | 7 colores             |
| `LINE_SCORES`  | Puntos por 1, 2, 3 o 4 líneas eliminadas | `[0,100,300,500,800]` |
| `dropInterval` | Velocidad inicial de caída en ms         | `1000`                |
| `BOMB_EVERY_LINES` | Cada cuántas líneas se abre la ventana de bomba | `5`         |
| `BOMB_CHANCE`  | Probabilidad de bomba por pieza dentro de la ventana | `0.4`        |
| `BOMB_CELL_SCORE` | Puntos por celda destruida por bomba o rayo-columna (× nivel) | `50`         |
| `LIGHTNING_EVERY_LINES` | Cada cuántas líneas se abre la ventana de rayo | `7`         |
| `LIGHTNING_CHANCE` | Probabilidad de rayo por pieza dentro de la ventana | `0.2`        |
| `LIGHTNING_FLASH_MS` | Duración del destello al limpiar fila/columna | `220`        |
| `TINT_EVERY_LINES` | Cada cuántas líneas se abre la ventana de tinte | `8`         |
| `TINT_CHANCE`  | Probabilidad de tinte por pieza dentro de la ventana | `0.2`        |
| `GRAVITY_EVERY_LINES` | Cada cuántas líneas se abre la ventana de gravedad | `6`         |
| `GRAVITY_CHANCE` | Probabilidad de gravedad por pieza dentro de la ventana | `0.2`        |
| `GRAVITY_ANIM_MS` | Duración de la animación de caída visible | `350`        |
| `FREEZE_EVERY_LINES` | Cada cuántas líneas se abre la ventana de congelar | `9`         |
| `FREEZE_CHANCE` | Probabilidad de congelar por pieza dentro de la ventana | `0.2`        |
| `FREEZE_DURATION_MS` | Duración de la pausa de caída automática | `5000`        |

> Si cambias `COLS`, `ROWS` o `BLOCK`, recuerda ajustar también `width` y `height` del `<canvas id="board">` en `index.html` para que coincida (`COLS × BLOCK` × `ROWS × BLOCK`).

---

## Automatización

El repo usa [`anthropics/claude-code-action`](https://github.com/anthropics/claude-code-action) en tres workflows de GitHub Actions:

| Workflow | Dispara con | Qué hace |
| --- | --- | --- |
| `claude.yml` | Comentario/issue/review que mencione `@claude` | Responde y ejecuta lo que se le pida |
| `claude-code-review.yml` | Cada PR abierto/actualizado | Revisión de código automática |
| `claude-issue-triage.yml` | Issue creado, editado o reabierto | Etiqueta y diagnostica el issue |

**Triaje de issues:** al abrir o editar un issue, Claude lo lee junto con el código
(`game.js`, `index.html`, `style.css`) y le asigna labels de un set cerrado —
tipo (`bug`/`enhancement`/`question`/`documentation`), área (`area:render`,
`area:pieces`, `area:scoring`, `area:controls`, `area:loop`, `area:ui`, `area:docs`),
severidad (`sev:low/medium/high`) y esfuerzo (`size:XS/S/M/L`) — y publica un
comentario con causa raíz, archivos a tocar, plan de solución paso a paso y criterios
de aceptación. Si el issue se edita, actualiza ese mismo comentario en vez de crear uno
nuevo. Reglas de etiquetado y la plantilla del diagnóstico viven en
[`.github/ISSUE_TRIAGE.md`](.github/ISSUE_TRIAGE.md).

---

## Licencia

Proyecto de uso libre con fines educativos y de práctica.
