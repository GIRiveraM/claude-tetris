# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Vanilla JS Tetris. HTML5 Canvas + CSS, zero dependencies, zero build step. No `package.json`, no bundler, no test suite.

## Running

Open `index.html` directly, or serve statically:

```bash
python3 -m http.server 8000
npx serve .
```

No lint/test/build commands exist in this repo.

## Architecture

Three files, one purpose each:

- `index.html` — DOM shell: `#board` canvas (300×600, i.e. `COLS*BLOCK` × `ROWS*BLOCK`), `#next-canvas` preview (120×120), HUD spans (`#score`/`#lines`/`#level`), and `#overlay` for pause/game-over.
- `style.css` — dark/retro theme, no logic-relevant classes beyond `.hidden` toggling the overlay.
- `game.js` — entire game logic, single file, no modules. Global mutable state (`board, current, next, score, lines, level, paused, gameOver, ...`) declared once at top and reset in `init()`.

### Core model

- Board: `ROWS × COLS` matrix, each cell `0` (empty) or `1–7` (color index into `COLORS`, matches piece type).
- Pieces: `PIECES[1..7]` square matrices. Rotation via `rotateCW` (transpose + reverse), not lookup tables.
- `collide(shape, ox, oy)` is the single source of truth for both movement and rotation legality.
- `tryRotate()` implements wall kicks by retrying `collide` at x offsets `[0, -1, 1, -2, 2]` before giving up.
- `spawn()` promotes `next` → `current`, generates new `next`; if the new `current` immediately collides, `endGame()` fires.
- Power-up pieces: `randomPiece()` can arm a piece as `bomb` (color `COLORS[8]`), `lightning` (color `COLORS[9]`), `tint` (color `COLORS[10]`), `gravity` (color `COLORS[11]`), or `freeze` (color `COLORS[12]`) — never more than one on the same piece; priority order when multiple windows are open is bomb > lightning > tint > gravity > freeze. None has a real `PIECES[n]` entry; the flag rides on a normal random piece and the color is render-only. `pieceCore(shape)` derives the "core" cell (nearest occupied cell to the shape's bounding-box center) for whichever power is armed — no extra state, so rotation just works.
  - Bomb: `bombArmed` is set in `registerLinesCleared()` whenever the running `lines` total crosses a multiple of `BOMB_EVERY_LINES`, then rolled at `BOMB_CHANCE` on the next `randomPiece()`. `lockPiece()` calls `detonate()` after `merge()`, which clears a 3×3 around the core, scores `destroyed * BOMB_CELL_SCORE * level`, then `applyGravity()` compacts each column.
  - Lightning: same window/roll pattern via `lightningArmed` / `LIGHTNING_EVERY_LINES` / `LIGHTNING_CHANCE`. `lockPiece()` calls `zap()`, which picks row or column 50/50 around the core: `zapRow()` splices out the row (counts as a real cleared line, so it flows through `registerLinesCleared(1)` — same score/level/window bookkeping as a natural line clear) and `zapColumn()` just empties the column and scores `destroyed * BOMB_CELL_SCORE * level` (no gravity needed, nothing shifts sideways). Both call `triggerFlash(type, index)`, which stores `{type, index, start}` on the global `flash`; `draw()` renders it as a fading translucent overlay over that row/column for `LIGHTNING_FLASH_MS`, timed off `performance.now()` each frame (no separate animation/tween system).
  - Tint: same window/roll pattern via `tintArmed` / `TINT_EVERY_LINES` / `TINT_CHANCE`. `lockPiece()` calls `dye()`, which is a "color bomb": `mostFrequentColor()` scans the whole board and picks the color (`1–7`) with the most occupied cells (`null` if the board is empty), every cell of that color is destroyed board-wide, scores `destroyed * BOMB_CELL_SCORE * level`, then `applyGravity()` compacts all columns.
  - Gravity: same window/roll pattern via `gravityArmed` / `GRAVITY_EVERY_LINES` / `GRAVITY_CHANCE`. `lockPiece()` calls `triggerGravityEffect()` — no destruction, no score of its own. Since `clearLines()` runs right after in `lockPiece()`, any row the compaction completes (e.g. a hole that was trapped under an overhang) clears and scores like a normal line. The board mutation is still instant (`applyGravity()`, so collision/physics never lag), but `triggerGravityEffect()` first runs `computeGravityMoves()` — same per-column algorithm as `applyGravity()` but read-only, recording each occupied cell's `{c, fromR, toR, color}` before it's overwritten — and stores the result as `gravityAnim = { moves, start }`. `draw()` hides the destination cells for `GRAVITY_ANIM_MS` (350ms) and instead renders each one at an eased (`1 - (1-p)²`) interpolated row between `fromR` and `toR`, so the fall is visible instead of an instant snap.
  - Freeze: same window/roll pattern via `freezeArmed` / `FREEZE_EVERY_LINES` / `FREEZE_CHANCE`. `lockPiece()` sets `freezeRemaining = FREEZE_DURATION_MS` (5000). Unlike the other four, this is a duration, not an instant effect: `loop(ts)` decrements `freezeRemaining` by `dt` instead of accumulating `dropAccum` while it's positive, so automatic falling pauses but player input (move/rotate/soft/hard drop) and rendering keep working. Using `dt` (not an absolute `performance.now()` deadline) means the countdown is naturally pause-safe — it only ticks while `loop()` is actually running, same as `dropAccum`. `draw()` shows a translucent ice-blue tint over the board plus a `❄️ X.Xs` countdown while `freezeRemaining > 0`.
  - `clearLines()` and `zapRow()` both funnel through `registerLinesCleared(cleared)`, which is the single place that updates `lines`, `score`, `level`, `dropInterval`, and arms all five power-up windows.

### Game loop

`requestAnimationFrame`-driven `loop(ts)` accumulates `dt` into `dropAccum`; once it passes `dropInterval`, the piece drops one row or locks (`lockPiece` → `merge` + `clearLines` + `spawn`). `dropInterval` is recalculated on every line clear: `max(100, 1000 - (level-1)*90)`.

Scoring: `LINE_SCORES = [0,100,300,500,800]` × `level` on clear; hard drop = 2 pts/row dropped, soft drop = 1 pt/row.

Everything is redrawn from scratch each frame in `draw()` (grid → locked board → ghost piece at `globalAlpha 0.2` → current piece); there's no dirty-rect optimization.

### Tunable constants (top of `game.js`)

`COLS`, `ROWS`, `BLOCK`, `COLORS`, `LINE_SCORES`, initial `dropInterval`, `BOMB_EVERY_LINES`, `BOMB_CHANCE`, `BOMB_CELL_SCORE`, `LIGHTNING_EVERY_LINES`, `LIGHTNING_CHANCE`, `LIGHTNING_FLASH_MS`, `TINT_EVERY_LINES`, `TINT_CHANCE`, `GRAVITY_EVERY_LINES`, `GRAVITY_CHANCE`, `GRAVITY_ANIM_MS`, `FREEZE_EVERY_LINES`, `FREEZE_CHANCE`, `FREEZE_DURATION_MS`. If `COLS`/`ROWS`/`BLOCK` change, update the `#board` canvas `width`/`height` in `index.html` to match (`COLS*BLOCK` × `ROWS*BLOCK`).

## Conventions

- `'use strict'`, ES6+ (`const`/`let`, arrow functions, template literals), no semicolon-free style.
- README (`README.md`) is in Spanish and kept in sync with the file structure and control scheme — update it alongside `game.js` changes that affect controls, scoring, or tunables.
