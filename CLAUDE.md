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

### Game loop

`requestAnimationFrame`-driven `loop(ts)` accumulates `dt` into `dropAccum`; once it passes `dropInterval`, the piece drops one row or locks (`lockPiece` → `merge` + `clearLines` + `spawn`). `dropInterval` is recalculated on every line clear: `max(100, 1000 - (level-1)*90)`.

Scoring: `LINE_SCORES = [0,100,300,500,800]` × `level` on clear; hard drop = 2 pts/row dropped, soft drop = 1 pt/row.

Everything is redrawn from scratch each frame in `draw()` (grid → locked board → ghost piece at `globalAlpha 0.2` → current piece); there's no dirty-rect optimization.

### Tunable constants (top of `game.js`)

`COLS`, `ROWS`, `BLOCK`, `COLORS`, `LINE_SCORES`, initial `dropInterval`. If `COLS`/`ROWS`/`BLOCK` change, update the `#board` canvas `width`/`height` in `index.html` to match (`COLS*BLOCK` × `ROWS*BLOCK`).

## Conventions

- `'use strict'`, ES6+ (`const`/`let`, arrow functions, template literals), no semicolon-free style.
- README (`README.md`) is in Spanish and kept in sync with the file structure and control scheme — update it alongside `game.js` changes that affect controls, scoring, or tunables.
