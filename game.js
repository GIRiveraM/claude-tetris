'use strict';

const COLS = 10;
const ROWS = 20;
const BLOCK = 30;

const COLORS = [
  null,
  '#4dd0e1', // I - cyan
  '#ffd54f', // O - yellow
  '#ba68c8', // T - purple
  '#81c784', // S - green
  '#e57373', // Z - red
  '#90caf9', // J - pale blue
  '#ffb74d', // L - orange
  '#c62828', // BOMB - dark red (render-only, no PIECES[8])
  '#29b6f6', // LIGHTNING - electric blue (render-only, no PIECES[9])
  '#ec407a', // TINT - magenta (render-only, no PIECES[10])
  '#26a69a', // GRAVITY - teal (render-only, no PIECES[11])
  '#4fc3f7', // FREEZE - ice blue (render-only, no PIECES[12])
  '#cddc39', // PLUS pentomino - lime
  '#8d6e63', // U pentomino - brown
  '#5c6bc0', // Y pentomino - indigo
  '#fafafa', // SINGLE - casi blanco (recompensa)
  '#37474f', // HOLLOW - gris azulado oscuro (reto)
  '#616161', // GARBAGE - gris (modo desafío, reto 2)
  '#795548', // PRESET - marrón (modo desafío, reto 3)
];

const BOMB_EVERY_LINES = 5;    // cada cuántas líneas se abre la ventana de bomba
const BOMB_CHANCE = 0.4;       // probabilidad por spawn dentro de la ventana
const BOMB_CELL_SCORE = 50;    // puntos por celda destruida (× level)

const LIGHTNING_EVERY_LINES = 7; // cada cuántas líneas se abre la ventana de rayo
const LIGHTNING_CHANCE = 0.2;    // probabilidad por spawn dentro de la ventana
const LIGHTNING_FLASH_MS = 220;  // duración del destello al limpiar fila/columna

const TINT_EVERY_LINES = 8;    // cada cuántas líneas se abre la ventana de tinte
const TINT_CHANCE = 0.2;       // probabilidad por spawn dentro de la ventana

const GRAVITY_EVERY_LINES = 6; // cada cuántas líneas se abre la ventana de gravedad
const GRAVITY_CHANCE = 0.2;    // probabilidad por spawn dentro de la ventana
const GRAVITY_ANIM_MS = 350;   // duración de la animación de caída visible

const FREEZE_EVERY_LINES = 9;  // cada cuántas líneas se abre la ventana de congelar
const FREEZE_CHANCE = 0.2;     // probabilidad por spawn dentro de la ventana
const FREEZE_DURATION_MS = 5000; // duración de la pausa de caída automática

const PENTOMINO_EVERY_LINES = 4; // cada cuántas líneas se abre la ventana de pentominós (+/U/Y)
const PENTOMINO_CHANCE = 0.25;   // probabilidad por spawn dentro de la ventana

const HOLLOW_EVERY_LINES = 12; // cada cuántas líneas se abre la ventana de la pieza hueca 3×3
const HOLLOW_CHANCE = 0.15;    // probabilidad por spawn dentro de la ventana

const T_SPIN_SCORES = [100, 200, 400, 600]; // por líneas limpiadas junto al T-spin (0-3), × nivel
const B2B_MULTIPLIER = 1.5;
const PERFECT_CLEAR_BONUS = 3000; // × nivel
const TOAST_MS = 900;             // duración del texto flotante

// ---- Modo desafío ----
const GARBAGE_COLOR = 18;
const PRESET_COLOR = 19;
const GARBAGE_INTERVAL_MS = 10000;  // reto 2: cada cuánto sube una fila de basura
const PRESET_ROWS = 6;              // reto 3: filas pre-colocadas al inicio
const PRESET_HOLES = 3;             // huecos por fila pre-colocada
const INVISIBLE_REVEAL_MS = 400;    // reto 4: destello al fijar antes de desaparecer

const CHALLENGES = [
  { key: 'c1', goal: { type: 'lines', target: 40 }, timeLimit: 120000, mods: {} },
  { key: 'c2', goal: { type: 'survive', target: 60000 }, timeLimit: null, mods: { garbage: true } },
  { key: 'c3', goal: { type: 'preset' }, timeLimit: null, mods: { preset: true } },
  { key: 'c4', goal: { type: 'lines', target: 10 }, timeLimit: null, mods: { invisible: true } },
  { key: 'c5', goal: { type: 'lines', target: 15 }, timeLimit: null, mods: { reverseRotate: true } },
];

const PIECES = [
  null,
  [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], // I
  [[2,2],[2,2]],                               // O
  [[0,3,0],[3,3,3],[0,0,0]],                  // T
  [[0,4,4],[4,4,0],[0,0,0]],                  // S
  [[5,5,0],[0,5,5],[0,0,0]],                  // Z
  [[6,0,0],[6,6,6],[0,0,0]],                  // J
  [[0,0,7],[7,7,7],[0,0,0]],                  // L
];

// Piezas no estándar, con forma propia (no participan en el roll 1-7 normal).
const SPECIAL_PIECES = {
  plus:   [[0,13,0],[13,13,13],[0,13,0]],  // pentominó +
  u:      [[14,0,14],[14,14,14]],          // pentominó U
  y:      [[0,15],[15,15],[0,15],[0,15]],  // pentominó Y
  single: [[16]],                          // 1×1, recompensa tras un Tetris
  hollow: [[17,17,17],[17,0,17],[17,17,17]], // 3×3 hueca, reto
};

const LINE_SCORES = [0, 100, 300, 500, 800];

const I18N = {
  es: {
    theme: 'TEMA',
    lang: 'IDIOMA',
    score: 'PUNTUACIÓN',
    lines: 'LÍNEAS',
    level: 'NIVEL',
    next: 'SIGUIENTE',
    controls: 'CONTROLES',
    ctrlMove: 'mover',
    ctrlRotate: 'rotar',
    ctrlSoftDrop: 'bajar',
    ctrlHardDrop: 'caída',
    ctrlPause: 'pausa',
    gameOver: 'GAME OVER',
    pause: 'PAUSA',
    scoreLabel: 'Puntuación',
    restart: 'Reiniciar',
    themeAriaLabel: 'Cambiar entre modo oscuro y claro',
    langAriaLabel: 'Cambiar idioma entre español e inglés',
    mode: 'MODO',
    modeAriaLabel: 'Cambiar entre modo clásico y modo desafío',
    challenge: 'RETO',
    challengeWon: 'RETO SUPERADO',
    challengeFailed: 'RETO FALLIDO',
    campaignWon: '¡DESAFÍO COMPLETADO!',
    nextChallenge: 'Siguiente',
    retry: 'Reintentar',
    linesUnit: 'líneas',
    secondsUnit: 's',
    presetUnit: 'celdas',
    c1Name: 'Reto 1: Limpieza rápida',
    c2Name: 'Reto 2: Basura',
    c3Name: 'Reto 3: Bloques fijos',
    c4Name: 'Reto 4: Invisible',
    c5Name: 'Reto 5: Rotación inversa',
  },
  en: {
    theme: 'THEME',
    lang: 'LANGUAGE',
    score: 'SCORE',
    lines: 'LINES',
    level: 'LEVEL',
    next: 'NEXT',
    controls: 'CONTROLS',
    ctrlMove: 'move',
    ctrlRotate: 'rotate',
    ctrlSoftDrop: 'drop',
    ctrlHardDrop: 'hard drop',
    ctrlPause: 'pause',
    gameOver: 'GAME OVER',
    pause: 'PAUSED',
    scoreLabel: 'Score',
    restart: 'Restart',
    themeAriaLabel: 'Toggle dark and light mode',
    langAriaLabel: 'Switch language between Spanish and English',
    mode: 'MODE',
    modeAriaLabel: 'Switch between classic mode and challenge mode',
    challenge: 'CHALLENGE',
    challengeWon: 'CHALLENGE CLEARED',
    challengeFailed: 'CHALLENGE FAILED',
    campaignWon: 'CAMPAIGN COMPLETE!',
    nextChallenge: 'Next',
    retry: 'Retry',
    linesUnit: 'lines',
    secondsUnit: 's',
    presetUnit: 'cells',
    c1Name: 'Challenge 1: Speed Clear',
    c2Name: 'Challenge 2: Garbage',
    c3Name: 'Challenge 3: Fixed Blocks',
    c4Name: 'Challenge 4: Invisible',
    c5Name: 'Challenge 5: Reverse Rotation',
  },
};

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-canvas');
const nextCtx = nextCanvas.getContext('2d');
const scoreEl = document.getElementById('score');
const linesEl = document.getElementById('lines');
const levelEl = document.getElementById('level');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayScore = document.getElementById('overlay-score');
const restartBtn = document.getElementById('restart-btn');
const themeToggle = document.getElementById('theme-toggle');
const langToggle = document.getElementById('lang-toggle');
const labelThemeEl = document.getElementById('label-theme');
const labelLangEl = document.getElementById('label-lang');
const labelScoreEl = document.getElementById('label-score');
const labelLinesEl = document.getElementById('label-lines');
const labelLevelEl = document.getElementById('label-level');
const labelNextEl = document.getElementById('label-next');
const labelControlsEl = document.getElementById('label-controls');
const ctrlMoveEl = document.getElementById('ctrl-move');
const ctrlRotateEl = document.getElementById('ctrl-rotate');
const ctrlSoftDropEl = document.getElementById('ctrl-softdrop');
const ctrlHardDropEl = document.getElementById('ctrl-harddrop');
const ctrlPauseEl = document.getElementById('ctrl-pause');
const modeToggle = document.getElementById('mode-toggle');
const labelModeEl = document.getElementById('label-mode');
const challengeBox = document.getElementById('challenge-box');
const labelChallengeEl = document.getElementById('label-challenge');
const challengeNameEl = document.getElementById('challenge-name');
const challengeGoalEl = document.getElementById('challenge-goal');
const challengeTimerEl = document.getElementById('challenge-timer');

let board, current, next, score, lines, level, paused, gameOver, lastTime, dropAccum, dropInterval, animId, currentLang, bombArmed, lightningArmed, tintArmed, gravityArmed, freezeArmed, freezeRemaining, flash, gravityAnim, pentominoArmed, hollowArmed, forcedSingle, combo, b2bActive, lastActionWasRotate, toast, audioCtx;
let challengeMode, challengeIndex, challengeState, challengeLinesStart, challengeElapsed, garbageAccum, revealUntil, overlayAction;

function mods() {
  return challengeMode && challengeState === 'running' ? CHALLENGES[challengeIndex].mods : {};
}

function createBoard() {
  return Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
}

function fillPresetRows() {
  for (let r = ROWS - PRESET_ROWS; r < ROWS; r++) {
    board[r].fill(PRESET_COLOR);
    const holes = new Set();
    while (holes.size < PRESET_HOLES) holes.add(Math.floor(Math.random() * COLS));
    for (const c of holes) board[r][c] = 0;
  }
}

function pushGarbage() {
  if (board[0].some(v => v !== 0)) { failChallenge(); return; }
  board.shift();
  const row = new Array(COLS).fill(GARBAGE_COLOR);
  row[Math.floor(Math.random() * COLS)] = 0;
  board.push(row);
  current.y--;
  if (collide(current.shape, current.x, current.y)) failChallenge();
}

function boundingBox(shape) {
  let minR = shape.length, maxR = -1, minC = shape[0].length, maxC = -1;
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[r].length; c++)
      if (shape[r][c]) {
        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
        if (c < minC) minC = c;
        if (c > maxC) maxC = c;
      }
  return { minR, maxR, minC, maxC };
}

function pieceCore(shape) {
  const { minR, maxR, minC, maxC } = boundingBox(shape);
  const centerR = (minR + maxR) / 2;
  const centerC = (minC + maxC) / 2;
  let best = null, bestDist = Infinity;
  for (let r = minR; r <= maxR; r++)
    for (let c = minC; c <= maxC; c++)
      if (shape[r][c]) {
        const dist = (r - centerR) ** 2 + (c - centerC) ** 2;
        if (dist < bestDist) { bestDist = dist; best = { r, c }; }
      }
  return best;
}

function checkTSpin() {
  if (current.type !== 3 || !lastActionWasRotate) return false;
  let occupied = 0;
  for (const [dr, dc] of [[0, 0], [0, 2], [2, 0], [2, 2]]) {
    const r = current.y + dr, c = current.x + dc;
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c]) occupied++;
  }
  return occupied >= 3;
}

function randomSpecialShape(key) {
  const shape = SPECIAL_PIECES[key].map(row => [...row]);
  return {
    type: key, shape,
    bomb: false, lightning: false, tint: false, gravity: false, freeze: false,
    x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2), y: 0,
  };
}

function randomPiece() {
  if (forcedSingle) {
    forcedSingle = false;
    return randomSpecialShape('single');
  }
  const type = Math.floor(Math.random() * 7) + 1;
  const shape = PIECES[type].map(row => [...row]);
  let bomb = false, lightning = false, tint = false, gravity = false, freeze = false;
  if (bombArmed && Math.random() < BOMB_CHANCE) {
    bomb = true;
    bombArmed = false;
  } else if (lightningArmed && Math.random() < LIGHTNING_CHANCE) {
    lightning = true;
    lightningArmed = false;
  } else if (tintArmed && Math.random() < TINT_CHANCE) {
    tint = true;
    tintArmed = false;
  } else if (gravityArmed && Math.random() < GRAVITY_CHANCE) {
    gravity = true;
    gravityArmed = false;
  } else if (freezeArmed && Math.random() < FREEZE_CHANCE) {
    freeze = true;
    freezeArmed = false;
  } else if (pentominoArmed && Math.random() < PENTOMINO_CHANCE) {
    pentominoArmed = false;
    return randomSpecialShape(['plus', 'u', 'y'][Math.floor(Math.random() * 3)]);
  } else if (hollowArmed && Math.random() < HOLLOW_CHANCE) {
    hollowArmed = false;
    return randomSpecialShape('hollow');
  }
  return { type, shape, bomb, lightning, tint, gravity, freeze, x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2), y: 0 };
}

function collide(shape, ox, oy) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nx = ox + c;
      const ny = oy + r;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  }
  return false;
}

function rotateCW(shape) {
  const rows = shape.length, cols = shape[0].length;
  const result = Array.from({ length: cols }, () => new Array(rows).fill(0));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      result[c][rows - 1 - r] = shape[r][c];
  return result;
}

function rotateCCW(shape) {
  const rows = shape.length, cols = shape[0].length;
  const result = Array.from({ length: cols }, () => new Array(rows).fill(0));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      result[cols - 1 - c][r] = shape[r][c];
  return result;
}

function tryRotate() {
  const rotated = mods().reverseRotate ? rotateCCW(current.shape) : rotateCW(current.shape);
  const kicks = [0, -1, 1, -2, 2];
  for (const kick of kicks) {
    if (!collide(rotated, current.x + kick, current.y)) {
      current.shape = rotated;
      current.x += kick;
      lastActionWasRotate = true;
      return;
    }
  }
}

function merge() {
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      if (current.shape[r][c]) {
        const ny = current.y + r;
        if (ny >= 0) board[ny][current.x + c] = current.shape[r][c]; // filas por encima del tablero (basura empujando) se descartan
      }
}

function registerLinesCleared(cleared, lineScore = (LINE_SCORES[cleared] || 0) * level) {
  const prevLines = lines;
  lines += cleared;
  if (Math.floor(lines / BOMB_EVERY_LINES) > Math.floor(prevLines / BOMB_EVERY_LINES)) {
    bombArmed = true;
  }
  if (Math.floor(lines / LIGHTNING_EVERY_LINES) > Math.floor(prevLines / LIGHTNING_EVERY_LINES)) {
    lightningArmed = true;
  }
  if (Math.floor(lines / TINT_EVERY_LINES) > Math.floor(prevLines / TINT_EVERY_LINES)) {
    tintArmed = true;
  }
  if (Math.floor(lines / GRAVITY_EVERY_LINES) > Math.floor(prevLines / GRAVITY_EVERY_LINES)) {
    gravityArmed = true;
  }
  if (Math.floor(lines / FREEZE_EVERY_LINES) > Math.floor(prevLines / FREEZE_EVERY_LINES)) {
    freezeArmed = true;
  }
  if (Math.floor(lines / PENTOMINO_EVERY_LINES) > Math.floor(prevLines / PENTOMINO_EVERY_LINES)) {
    pentominoArmed = true;
  }
  if (Math.floor(lines / HOLLOW_EVERY_LINES) > Math.floor(prevLines / HOLLOW_EVERY_LINES)) {
    hollowArmed = true;
  }
  if (cleared === 4) forcedSingle = true;
  score += lineScore;
  level = Math.floor(lines / 10) + 1;
  dropInterval = Math.max(100, 1000 - (level - 1) * 90);
  updateHUD();
}

function clearLines(tspin) {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(v => v !== 0)) {
      board.splice(r, 1);
      board.unshift(new Array(COLS).fill(0));
      cleared++;
      r++;
    }
  }

  if (cleared === 0) {
    combo = 0;
    b2bActive = false;
    if (tspin) {
      score += T_SPIN_SCORES[0] * level;
      updateHUD();
      showToast('T-SPIN');
      playSfx('tspin');
    }
    return;
  }

  combo++;
  let lineScore = (tspin ? T_SPIN_SCORES[cleared] : LINE_SCORES[cleared]) * level * combo;

  const isTetris = cleared === 4;
  let b2bTriggered = false;
  if (isTetris) {
    if (b2bActive) { lineScore = Math.round(lineScore * B2B_MULTIPLIER); b2bTriggered = true; }
    b2bActive = true;
  } else {
    b2bActive = false;
  }

  registerLinesCleared(cleared, lineScore);

  const perfect = board.every(row => row.every(v => v === 0));
  if (perfect) {
    score += PERFECT_CLEAR_BONUS * level;
    updateHUD();
  }

  const tags = [];
  if (tspin) tags.push(`T-SPIN x${cleared}`);
  if (b2bTriggered) tags.push('BACK-TO-BACK');
  if (combo >= 2) tags.push(`COMBO x${combo}`);
  if (perfect) tags.push('PERFECT CLEAR!');
  if (tags.length) {
    showToast(tags.join(' '));
    playSfx(perfect ? 'perfect' : tspin ? 'tspin' : b2bTriggered ? 'b2b' : 'combo', combo);
  }
}

function detonate(cx, cy) {
  let destroyed = 0;
  for (let r = cy - 1; r <= cy + 1; r++)
    for (let c = cx - 1; c <= cx + 1; c++) {
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) continue;
      if (board[r][c]) { board[r][c] = 0; destroyed++; }
    }
  if (destroyed) {
    score += destroyed * BOMB_CELL_SCORE * level;
    applyGravity();
  }
}

function mostFrequentColor() {
  const counts = new Array(8).fill(0);
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      const v = board[r][c];
      if (v) counts[v]++;
    }
  let best = 0, bestCount = 0;
  for (let v = 1; v <= 7; v++)
    if (counts[v] > bestCount) { bestCount = counts[v]; best = v; }
  return bestCount ? best : null;
}

function dye() {
  const target = mostFrequentColor();
  if (!target) return;
  let destroyed = 0;
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (board[r][c] === target) { board[r][c] = 0; destroyed++; }
  if (destroyed) {
    score += destroyed * BOMB_CELL_SCORE * level;
    applyGravity();
  }
}

function triggerFlash(type, index) {
  flash = { type, index, start: performance.now() };
}

function showToast(text) {
  toast = { text, start: performance.now() };
}

function ensureAudio() {
  if (audioCtx === undefined) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch { audioCtx = null; }
  }
  return audioCtx;
}

const SFX_FREQ = { combo: 440, tspin: 660, b2b: 550, perfect: 880 };

function playSfx(type, comboLevel) {
  const ctx = ensureAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = (SFX_FREQ[type] || 440) + (comboLevel ? comboLevel * 40 : 0);
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

function zapRow(r) {
  if (r < 0 || r >= ROWS) return;
  board.splice(r, 1);
  board.unshift(new Array(COLS).fill(0));
  triggerFlash('row', r);
  registerLinesCleared(1);
}

function zapColumn(c) {
  if (c < 0 || c >= COLS) return;
  let destroyed = 0;
  for (let r = 0; r < ROWS; r++) {
    if (board[r][c]) { board[r][c] = 0; destroyed++; }
  }
  triggerFlash('col', c);
  if (destroyed) score += destroyed * BOMB_CELL_SCORE * level;
}

function zap(cx, cy) {
  if (Math.random() < 0.5) zapRow(cy);
  else zapColumn(cx);
}

function applyGravity() {
  for (let c = 0; c < COLS; c++) {
    let write = ROWS - 1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!board[r][c]) continue;
      board[write][c] = board[r][c];
      if (write !== r) board[r][c] = 0;
      write--;
    }
  }
}

function computeGravityMoves() {
  const moves = [];
  for (let c = 0; c < COLS; c++) {
    let write = ROWS - 1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!board[r][c]) continue;
      if (write !== r) moves.push({ c, fromR: r, toR: write, color: board[r][c] });
      write--;
    }
  }
  return moves;
}

function triggerGravityEffect() {
  const moves = computeGravityMoves();
  applyGravity();
  if (moves.length) gravityAnim = { moves, start: performance.now() };
}

function ghostY() {
  let gy = current.y;
  while (!collide(current.shape, current.x, gy + 1)) gy++;
  return gy;
}

function hardDrop() {
  const gy = ghostY();
  score += (gy - current.y) * 2;
  current.y = gy;
  lockPiece();
}

function softDrop() {
  if (!collide(current.shape, current.x, current.y + 1)) {
    current.y++;
    score += 1;
    updateHUD();
  } else {
    lockPiece();
  }
}

function lockPiece() {
  if (gameOver || (challengeMode && challengeState !== 'running')) return;
  const bomb = current.bomb;
  const lightning = current.lightning;
  const tint = current.tint;
  const gravity = current.gravity;
  const freeze = current.freeze;
  const tspin = checkTSpin();
  const core = (bomb || lightning || tint || gravity || freeze) ? pieceCore(current.shape) : null;
  merge();
  if (bomb) detonate(current.x + core.c, current.y + core.r);
  if (lightning) zap(current.x + core.c, current.y + core.r);
  if (tint) dye();
  if (gravity) triggerGravityEffect();
  if (freeze) freezeRemaining = FREEZE_DURATION_MS;
  if (mods().invisible) revealUntil = performance.now() + INVISIBLE_REVEAL_MS;
  clearLines(tspin);
  spawn();
  updateHUD();
}

function spawn() {
  current = next;
  next = randomPiece();
  lastActionWasRotate = false;
  if (collide(current.shape, current.x, current.y)) {
    endGame();
  }
  drawNext();
}

function updateHUD() {
  scoreEl.textContent = score.toLocaleString();
  linesEl.textContent = lines;
  levelEl.textContent = level;
}

function drawBlock(context, x, y, colorIndex, size, alpha) {
  if (!colorIndex) return;
  const color = COLORS[colorIndex];
  context.globalAlpha = alpha ?? 1;
  context.fillStyle = color;
  context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
  // highlight
  context.fillStyle = 'rgba(255,255,255,0.12)';
  context.fillRect(x * size + 1, y * size + 1, size - 2, 4);
  context.globalAlpha = 1;
}

function drawPowerIcon(context, x, y, size, icon, alpha) {
  context.globalAlpha = alpha ?? 1;
  context.font = `${Math.floor(size * 0.7)}px serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(icon, x * size + size / 2, y * size + size / 2 + 1);
  context.globalAlpha = 1;
}

function drawGrid() {
  ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--grid-color').trim();
  ctx.lineWidth = 0.5;
  for (let c = 1; c < COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * BLOCK, 0);
    ctx.lineTo(c * BLOCK, ROWS * BLOCK);
    ctx.stroke();
  }
  for (let r = 1; r < ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * BLOCK);
    ctx.lineTo(COLS * BLOCK, r * BLOCK);
    ctx.stroke();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  // animación de caída por gravedad
  let gravitySkip = null;
  if (gravityAnim) {
    const elapsed = performance.now() - gravityAnim.start;
    if (elapsed >= GRAVITY_ANIM_MS) {
      gravityAnim = null;
    } else {
      gravitySkip = new Set(gravityAnim.moves.map(m => `${m.toR},${m.c}`));
    }
  }

  // board
  const hideBoard = mods().invisible && performance.now() > revealUntil;
  if (!hideBoard)
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        if (gravitySkip && gravitySkip.has(`${r},${c}`)) continue;
        drawBlock(ctx, c, r, board[r][c], BLOCK);
      }

  if (gravitySkip) {
    const progress = (performance.now() - gravityAnim.start) / GRAVITY_ANIM_MS;
    const eased = 1 - Math.pow(1 - progress, 2);
    for (const m of gravityAnim.moves) {
      const y = m.fromR + (m.toR - m.fromR) * eased;
      drawBlock(ctx, m.c, y, m.color, BLOCK);
    }
  }

  // destello del rayo
  if (flash) {
    const elapsed = performance.now() - flash.start;
    if (elapsed < LIGHTNING_FLASH_MS) {
      ctx.globalAlpha = (1 - elapsed / LIGHTNING_FLASH_MS) * 0.85;
      ctx.fillStyle = '#e1f5fe';
      if (flash.type === 'row') {
        ctx.fillRect(0, flash.index * BLOCK, COLS * BLOCK, BLOCK);
      } else {
        ctx.fillRect(flash.index * BLOCK, 0, BLOCK, ROWS * BLOCK);
      }
      ctx.globalAlpha = 1;
    } else {
      flash = null;
    }
  }

  // congelado activo
  if (freezeRemaining) {
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#4fc3f7';
    ctx.fillRect(0, 0, COLS * BLOCK, ROWS * BLOCK);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#e1f5fe';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`❄️ ${(freezeRemaining / 1000).toFixed(1)}s`, (COLS * BLOCK) / 2, 6);
  }

  // ghost
  const gy = ghostY();
  const powerColor = current.bomb ? 8 : current.lightning ? 9 : current.tint ? 10 : current.gravity ? 11 : current.freeze ? 12 : null;
  const powerIcon = current.bomb ? '💣' : current.lightning ? '⚡' : current.tint ? '🎨' : current.gravity ? '⬇️' : current.freeze ? '❄️' : null;
  const core = powerColor ? pieceCore(current.shape) : null;
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      if (current.shape[r][c]) {
        drawBlock(ctx, current.x + c, gy + r, powerColor ?? current.shape[r][c], BLOCK, 0.2);
        if (core && r === core.r && c === core.c) drawPowerIcon(ctx, current.x + c, gy + r, BLOCK, powerIcon, 0.2);
      }

  // current piece
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++) {
      if (!current.shape[r][c]) continue;
      drawBlock(ctx, current.x + c, current.y + r, powerColor ?? current.shape[r][c], BLOCK);
      if (core && r === core.r && c === core.c) drawPowerIcon(ctx, current.x + c, current.y + r, BLOCK, powerIcon);
    }

  // toast de combo/T-spin/B2B/Perfect Clear
  if (toast) {
    const elapsed = performance.now() - toast.start;
    if (elapsed >= TOAST_MS) {
      toast = null;
    } else {
      const alpha = 1 - elapsed / TOAST_MS;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, ROWS * BLOCK / 2 - 20, COLS * BLOCK, 40);
      ctx.fillStyle = '#fff176';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(toast.text, COLS * BLOCK / 2, ROWS * BLOCK / 2);
      ctx.globalAlpha = 1;
    }
  }
}

function drawNext() {
  const NB = 30;
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  const shape = next.shape;
  const { minR, maxR, minC, maxC } = boundingBox(shape);
  const width = maxC - minC + 1;
  const height = maxR - minR + 1;
  const offXpx = (nextCanvas.width - width * NB) / 2 - minC * NB;
  const offYpx = (nextCanvas.height - height * NB) / 2 - minR * NB;
  const powerColor = next.bomb ? 8 : next.lightning ? 9 : next.tint ? 10 : next.gravity ? 11 : next.freeze ? 12 : null;
  const powerIcon = next.bomb ? '💣' : next.lightning ? '⚡' : next.tint ? '🎨' : next.gravity ? '⬇️' : next.freeze ? '❄️' : null;
  const core = powerColor ? pieceCore(shape) : null;
  nextCtx.save();
  nextCtx.translate(offXpx, offYpx);
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      drawBlock(nextCtx, c, r, powerColor ?? shape[r][c], NB);
      if (core && r === core.r && c === core.c) drawPowerIcon(nextCtx, c, r, NB, powerIcon);
    }
  nextCtx.restore();
}

function endGame() {
  if (gameOver) return;
  if (challengeMode && challengeState === 'running') { failChallenge(); return; }
  gameOver = true;
  cancelAnimationFrame(animId);
  const t = I18N[currentLang];
  overlayAction = null;
  overlayTitle.textContent = t.gameOver;
  overlayScore.textContent = `${t.scoreLabel}: ${score.toLocaleString()}`;
  restartBtn.textContent = t.restart;
  overlay.classList.remove('hidden');
}

function togglePause() {
  if (gameOver || (challengeMode && challengeState !== 'running')) return;
  paused = !paused;
  if (!paused) {
    lastTime = performance.now();
    loop(lastTime);
  } else {
    cancelAnimationFrame(animId);
    const t = I18N[currentLang];
    overlayAction = null;
    overlayTitle.textContent = t.pause;
    overlayScore.textContent = '';
    restartBtn.textContent = t.restart;
    overlay.classList.remove('hidden');
  }
}

function loop(ts) {
  if (paused || gameOver) return;
  const dt = ts - lastTime;
  lastTime = ts;
  if (freezeRemaining > 0) {
    freezeRemaining = Math.max(0, freezeRemaining - dt);
  } else {
    dropAccum += dt;
    if (dropAccum >= dropInterval) {
      dropAccum = 0;
      if (!collide(current.shape, current.x, current.y + 1)) {
        current.y++;
      } else {
        lockPiece();
      }
    }
    if (challengeMode && challengeState === 'running') {
      challengeElapsed += dt;
      if (mods().garbage) {
        garbageAccum += dt;
        if (garbageAccum >= GARBAGE_INTERVAL_MS) { garbageAccum = 0; pushGarbage(); }
      }
      updateChallengeHUD();
      checkChallengeGoal();
    }
  }
  draw();
  if (gameOver || (challengeMode && challengeState !== 'running')) return;
  animId = requestAnimationFrame(loop);
}

function resetRound(keepProgress) {
  board = createBoard();
  if (!keepProgress) {
    score = 0;
    lines = 0;
    level = 1;
    dropInterval = 1000;
  }
  paused = false;
  gameOver = false;
  bombArmed = false;
  lightningArmed = false;
  tintArmed = false;
  gravityArmed = false;
  freezeArmed = false;
  freezeRemaining = 0;
  pentominoArmed = false;
  hollowArmed = false;
  forcedSingle = false;
  combo = 0;
  b2bActive = false;
  lastActionWasRotate = false;
  toast = null;
  flash = null;
  gravityAnim = null;
  dropAccum = 0;
  lastTime = performance.now();
  next = randomPiece();
  spawn();
  updateHUD();
  updateChallengeHUD();
  overlay.classList.add('hidden');
  cancelAnimationFrame(animId);
  animId = requestAnimationFrame(loop);
}

function init() {
  challengeMode = false;
  resetRound(false);
}

function startChallenge(index, keepProgress) {
  challengeMode = true;
  challengeIndex = index;
  challengeState = 'running';
  resetRound(keepProgress);
  challengeLinesStart = lines;
  challengeElapsed = 0;
  garbageAccum = 0;
  revealUntil = 0;
  if (CHALLENGES[index].mods.preset) fillPresetRows();
  updateChallengeHUD();
}

function restartGame() {
  if (challengeMode) startChallenge(0, false);
  else init();
}

function checkChallengeGoal() {
  if (challengeState !== 'running') return;
  const ch = CHALLENGES[challengeIndex];
  const g = ch.goal;
  const done = g.type === 'lines' ? lines - challengeLinesStart >= g.target
             : g.type === 'survive' ? challengeElapsed >= g.target
             : board.every(row => row.every(v => v !== PRESET_COLOR));
  if (done) { winChallenge(); return; }
  if (ch.timeLimit && challengeElapsed >= ch.timeLimit) failChallenge();
}

function winChallenge() {
  if (challengeState !== 'running') return;
  challengeState = 'won';
  cancelAnimationFrame(animId);
  const t = I18N[currentLang];
  const isLast = challengeIndex === CHALLENGES.length - 1;
  overlayTitle.textContent = isLast ? t.campaignWon : t.challengeWon;
  overlayScore.textContent = `${t.scoreLabel}: ${score.toLocaleString()}`;
  restartBtn.textContent = isLast ? t.restart : t.nextChallenge;
  overlayAction = isLast ? () => startChallenge(0, false) : () => startChallenge(challengeIndex + 1, true);
  overlay.classList.remove('hidden');
}

function failChallenge() {
  if (challengeState !== 'running') return;
  challengeState = 'failed';
  cancelAnimationFrame(animId);
  const t = I18N[currentLang];
  overlayTitle.textContent = t.challengeFailed;
  overlayScore.textContent = `${t.scoreLabel}: ${score.toLocaleString()}`;
  restartBtn.textContent = t.retry;
  overlayAction = () => startChallenge(challengeIndex, true);
  overlay.classList.remove('hidden');
}

function updateChallengeHUD() {
  if (!challengeMode) { challengeBox.classList.add('hidden'); return; }
  challengeBox.classList.remove('hidden');
  const t = I18N[currentLang];
  const ch = CHALLENGES[challengeIndex];
  challengeNameEl.textContent = t[`${ch.key}Name`];
  const g = ch.goal;
  if (g.type === 'lines') {
    const done = Math.max(0, Math.min(lines - challengeLinesStart, g.target));
    challengeGoalEl.textContent = `${done} / ${g.target} ${t.linesUnit}`;
  } else if (g.type === 'survive') {
    const remain = Math.max(0, g.target - challengeElapsed);
    challengeGoalEl.textContent = `${Math.ceil(remain / 1000)} ${t.secondsUnit}`;
  } else {
    const remaining = board.reduce((acc, row) => acc + row.filter(v => v === PRESET_COLOR).length, 0);
    challengeGoalEl.textContent = `${remaining} ${t.presetUnit}`;
  }
  if (ch.timeLimit) {
    const remain = Math.max(0, ch.timeLimit - challengeElapsed);
    const s = Math.ceil(remain / 1000);
    challengeTimerEl.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  } else {
    challengeTimerEl.textContent = '';
  }
}

document.addEventListener('keydown', e => {
  if (e.code === 'KeyP') { togglePause(); return; }
  if (paused || gameOver || (challengeMode && challengeState !== 'running')) return;
  switch (e.code) {
    case 'ArrowLeft':
      if (!collide(current.shape, current.x - 1, current.y)) { current.x--; lastActionWasRotate = false; }
      break;
    case 'ArrowRight':
      if (!collide(current.shape, current.x + 1, current.y)) { current.x++; lastActionWasRotate = false; }
      break;
    case 'ArrowDown':
      softDrop();
      break;
    case 'ArrowUp':
    case 'KeyX':
      tryRotate();
      break;
    case 'Space':
      e.preventDefault();
      hardDrop();
      break;
  }
  updateHUD();
});

restartBtn.addEventListener('click', () => (overlayAction || restartGame)());

function applyTheme(theme) {
  document.body.classList.toggle('light', theme === 'light');
  themeToggle.checked = theme === 'light';
}

themeToggle.addEventListener('change', () => {
  const theme = themeToggle.checked ? 'light' : 'dark';
  localStorage.setItem('theme', theme);
  applyTheme(theme);
});

applyTheme(localStorage.getItem('theme') || 'dark');

function applyLanguage(lang) {
  currentLang = lang;
  const t = I18N[lang];
  document.documentElement.lang = lang;
  labelThemeEl.textContent = t.theme;
  labelLangEl.textContent = t.lang;
  labelScoreEl.textContent = t.score;
  labelLinesEl.textContent = t.lines;
  labelLevelEl.textContent = t.level;
  labelNextEl.textContent = t.next;
  labelControlsEl.textContent = t.controls;
  ctrlMoveEl.textContent = t.ctrlMove;
  ctrlRotateEl.textContent = t.ctrlRotate;
  ctrlSoftDropEl.textContent = t.ctrlSoftDrop;
  ctrlHardDropEl.textContent = t.ctrlHardDrop;
  ctrlPauseEl.textContent = t.ctrlPause;
  themeToggle.setAttribute('aria-label', t.themeAriaLabel);
  langToggle.setAttribute('aria-label', t.langAriaLabel);
  langToggle.checked = lang === 'en';
  labelModeEl.textContent = t.mode;
  modeToggle.setAttribute('aria-label', t.modeAriaLabel);
  labelChallengeEl.textContent = t.challenge;

  if (gameOver) {
    overlayTitle.textContent = t.gameOver;
    overlayScore.textContent = `${t.scoreLabel}: ${score.toLocaleString()}`;
    restartBtn.textContent = t.restart;
  } else if (paused) {
    overlayTitle.textContent = t.pause;
    restartBtn.textContent = t.restart;
  } else if (challengeMode && challengeState === 'won') {
    const isLast = challengeIndex === CHALLENGES.length - 1;
    overlayTitle.textContent = isLast ? t.campaignWon : t.challengeWon;
    overlayScore.textContent = `${t.scoreLabel}: ${score.toLocaleString()}`;
    restartBtn.textContent = isLast ? t.restart : t.nextChallenge;
  } else if (challengeMode && challengeState === 'failed') {
    overlayTitle.textContent = t.challengeFailed;
    overlayScore.textContent = `${t.scoreLabel}: ${score.toLocaleString()}`;
    restartBtn.textContent = t.retry;
  } else {
    restartBtn.textContent = t.restart;
  }
  updateChallengeHUD();
}

langToggle.addEventListener('change', () => {
  const lang = langToggle.checked ? 'en' : 'es';
  localStorage.setItem('lang', lang);
  applyLanguage(lang);
});

applyLanguage(localStorage.getItem('lang') || 'es');

function applyMode(mode) {
  challengeMode = mode === 'challenge';
  modeToggle.checked = challengeMode;
  if (challengeMode) startChallenge(0, false);
  else init();
}

modeToggle.addEventListener('change', () => {
  const mode = modeToggle.checked ? 'challenge' : 'classic';
  localStorage.setItem('mode', mode);
  applyMode(mode);
});

applyMode(localStorage.getItem('mode') || 'classic');
