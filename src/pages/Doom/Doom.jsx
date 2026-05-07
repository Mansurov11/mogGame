import { useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────
// WORD TO COLLECT
// ─────────────────────────────────────────────────────────────
const TARGET_WORD = "DOOM";

const LETTER_TYPES = TARGET_WORD.split("").map((letter, i) => ({
  id: i,
  char: letter,
  color: [
    "#ff3333",
    "#ffaa00",
    "#00ff66",
    "#33aaff",
    "#ff44ff",
  ][i % 5],
}));

// ─────────────────────────────────────────────────────────────
// MAP
// ─────────────────────────────────────────────────────────────
const MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,2,0,0,2,2,0,0,0,0,0,0,2,0,0,0,0,0,0,1],
  [1,2,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,1],
  [1,0,0,2,0,0,0,0,0,2,0,0,0,0,0,0,2,0,0,0,1],
  [1,0,0,2,0,0,0,0,0,2,0,0,0,0,0,0,2,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,2,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,1],
  [1,0,0,0,2,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,2,0,0,0,0,0,2,2,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,2,0,0,0,1],
  [1,0,1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const MH = MAP.length;
const MW = MAP[0].length;

// ─────────────────────────────────────────────────────────────
// SPAWN POSITIONS
// ─────────────────────────────────────────────────────────────
const SPAWN_POS = [
  [3.5,3.5],
  [7.5,8.5],
  [14.5,9.5],
  [17.5,12.5],
];

// ─────────────────────────────────────────────────────────────
// LETTER SPAWNER
// ─────────────────────────────────────────────────────────────
function spawnLetters() {
  return SPAWN_POS.map((pos, i) => {
    const t = LETTER_TYPES[i];

    return {
      id: i,
      x: pos[0],
      y: pos[1],
      alive: true,
      anim: i * 0.5,
      char: t.char,
      color: t.color,
    };
  });
}

// ─────────────────────────────────────────────────────────────
// TEXTURES
// ─────────────────────────────────────────────────────────────
function makeTextures() {
  const sz = 64;

  const wall = new Uint8Array(sz * sz * 3);
  const floor = new Uint8Array(sz * sz * 3);
  const ceil = new Uint8Array(sz * sz * 3);

  for (let y = 0; y < sz; y++) {
    for (let x = 0; x < sz; x++) {
      const i = (y * sz + x) * 3;

      const noise =
        (Math.sin(x * 0.7 + y * 0.3) * 16 +
          Math.cos(x * 0.4 - y * 0.5) * 12) |
        0;

      wall[i] = 90 + noise;
      wall[i + 1] = 30 + noise;
      wall[i + 2] = 30 + noise;

      floor[i] = 30 + noise;
      floor[i + 1] = 25 + noise;
      floor[i + 2] = 20 + noise;

      ceil[i] = 10;
      ceil[i + 1] = 10;
      ceil[i + 2] = 15;
    }
  }

  return { wall, floor, ceil, sz };
}

const TEX = makeTextures();

function texSample(tex, u, v, sz) {
  const tx = ((u * sz) | 0) % sz;
  const ty = ((v * sz) | 0) % sz;

  const i = (ty * sz + tx) * 3;

  return [tex[i], tex[i + 1], tex[i + 2]];
}

function toARGB(r, g, b) {
  return (255 << 24) | (b << 16) | (g << 8) | r;
}

function castRay(px, py, ang) {
  const cos = Math.cos(ang);
  const sin = Math.sin(ang);

  let t = 0.02;

  for (let i = 0; i < 800; i++) {
    const tx = px + cos * t;
    const ty = py + sin * t;

    const mx = tx | 0;
    const my = ty | 0;

    if (mx < 0 || my < 0 || mx >= MW || my >= MH)
      return { d: 30, hit: 0 };

    const cell = MAP[my][mx];

    if (cell) {
      const tc =
        Math.abs(cos) > Math.abs(sin)
          ? ty - Math.floor(ty)
          : tx - Math.floor(tx);

      return {
        d: t,
        hit: cell,
        tc,
        vert: Math.abs(cos) > Math.abs(sin),
      };
    }

    t += 0.04;
  }

  return { d: 30, hit: 0 };
}

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────
export default function DoomLetters() {
  const GW = 640;
  const GH = 360;
  const HH = GH >> 1;

  const FOV = Math.PI / 3;
  const RAYS = 240;
  const RSTEP = FOV / RAYS;

  const MSPD = 0.065;
  const RSPD = 0.045;

  const gcRef = useRef(null);
  const rafRef = useRef(null);

  const stateRef = useRef(null);

  const lastTRef = useRef(0);

  const imgdRef = useRef(null);
  const px32Ref = useRef(null);

  // ─────────────────────────────────────────────────────────
  // START GAME
  // ─────────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    stateRef.current = {
      px: 1.5,
      py: 1.5,
      angle: 0,

      letters: spawnLetters(),

      collectedWord: "",

      score: 0,

      msg: "",
      msgT: 0,

      keys: {},

      zbuf: new Float32Array(RAYS),
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    lastTRef.current = performance.now();

    rafRef.current = requestAnimationFrame(loop);
  }, []);

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  function render() {
    const s = stateRef.current;
    if (!s) return;

    const canvas = gcRef.current;
    const ctx = canvas.getContext("2d");

    if (!imgdRef.current) {
      imgdRef.current = ctx.createImageData(GW, GH);
      px32Ref.current = new Uint32Array(
        imgdRef.current.data.buffer
      );
    }

    const imgd = imgdRef.current;
    const px32 = px32Ref.current;

    const zbuf = s.zbuf;

    // FLOOR / CEIL
    for (let y = 0; y < GH; y++) {
      const isFloor = y > HH;

      const yd = isFloor ? y - HH : HH - y;

      if (!yd) continue;

      const rowDist = HH / yd;

      const floorX =
        s.px + Math.cos(s.angle - FOV / 2) * rowDist;

      const floorY =
        s.py + Math.sin(s.angle - FOV / 2) * rowDist;

      const xStep =
        (Math.cos(s.angle + FOV / 2) -
          Math.cos(s.angle - FOV / 2)) *
        rowDist /
        GW;

      const yStep =
        (Math.sin(s.angle + FOV / 2) -
          Math.sin(s.angle - FOV / 2)) *
        rowDist /
        GW;

      const shade = Math.max(
        0,
        Math.min(1, 1 - rowDist / 10)
      );

      for (let x = 0; x < GW; x++) {
        const tu =
          floorX + xStep * x - Math.floor(floorX + xStep * x);

        const tv =
          floorY + yStep * x - Math.floor(floorY + yStep * x);

        const tex = isFloor ? TEX.floor : TEX.ceil;

        const [r, g, b] = texSample(
          tex,
          tu,
          tv,
          TEX.sz
        );

        px32[y * GW + x] = toARGB(
          (r * shade) | 0,
          (g * shade) | 0,
          (b * shade) | 0
        );
      }
    }

    // WALLS
    for (let ray = 0; ray < RAYS; ray++) {
      const ang = s.angle - FOV / 2 + ray * RSTEP;

      const { d, hit, tc, vert } = castRay(
        s.px,
        s.py,
        ang
      );

      const corr = d * Math.cos(ang - s.angle);

      zbuf[ray] = corr;

      if (!hit) continue;

      const wh = Math.min(GH * 2, GH / corr);

      const top = Math.max(0, (HH - wh / 2) | 0);
      const bot = Math.min(GH, (HH + wh / 2) | 0);

      const shade =
        Math.max(0, 1 - corr / 20) * (vert ? 0.65 : 1);

      const colW = GW / RAYS;

      const x0 = (ray * colW) | 0;
      const x1 = ((ray + 1) * colW) | 0;

      for (let x = x0; x < x1; x++) {
        const tu =
          tc + ((x - x0) / (x1 - x0)) * 0.01;

        for (let y = top; y < bot; y++) {
          const tv = (y - top) / (bot - top);

          const [r, g, b] = texSample(
            TEX.wall,
            tu,
            tv,
            TEX.sz
          );

          px32[y * GW + x] = toARGB(
            (r * shade) | 0,
            (g * shade) | 0,
            (b * shade) | 0
          );
        }
      }
    }

    ctx.putImageData(imgd, 0, 0);

    // LETTERS
    const sprites = s.letters
      .filter((l) => l.alive)
      .map((l) => {
        const dx = l.x - s.px;
        const dy = l.y - s.py;

        return {
          ...l,
          dist: Math.sqrt(dx * dx + dy * dy),
        };
      })
      .sort((a, b) => b.dist - a.dist);

    ctx.save();

    for (const sp of sprites) {
      const dx = sp.x - s.px;
      const dy = sp.y - s.py;

      const spAng =
        Math.atan2(dy, dx) - s.angle;

      const norm = Math.atan2(
        Math.sin(spAng),
        Math.cos(spAng)
      );

      if (Math.abs(norm) > FOV * 0.72) continue;

      const d = sp.dist;

      const size = GH / d * 0.35;

      const screenX =
        (norm / FOV + 0.5) * GW;

      const bob = Math.sin(sp.anim * 3) * 10;

      ctx.font = `bold ${size}px Arial`;

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillStyle = sp.color;
      ctx.shadowColor = sp.color;
      ctx.shadowBlur = 30;

      ctx.fillText(
        sp.char,
        screenX,
        HH + bob
      );
    }

    ctx.restore();

    // CROSSHAIR
    ctx.strokeStyle = "#ffffffaa";

    ctx.beginPath();
    ctx.moveTo(GW / 2 - 10, HH);
    ctx.lineTo(GW / 2 + 10, HH);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(GW / 2, HH - 10);
    ctx.lineTo(GW / 2, HH + 10);
    ctx.stroke();

    // HUD
    ctx.fillStyle = "#ffffff";

    ctx.font = "20px monospace";

    ctx.fillText(`WORD: ${s.collectedWord}`, 20, 30);

    ctx.fillText(`TARGET: ${TARGET_WORD}`, 20, 60);

    ctx.fillText(`SCORE: ${s.score}`, 20, 90);

    if (s.msgT > 0) {
      ctx.fillStyle = "#ff4444";

      ctx.font = "28px monospace";

      ctx.fillText(
        s.msg,
        GW / 2 - 100,
        40
      );
    }

    if (s.collectedWord === TARGET_WORD) {
      ctx.fillStyle = "#00ff66";

      ctx.font = "48px monospace";

      ctx.fillText(
        "WORD COMPLETE!",
        GW / 2 - 180,
        HH
      );
    }
  }

  // ─────────────────────────────────────────────────────────
  // LOOP
  // ─────────────────────────────────────────────────────────
  function loop(t) {
    const s = stateRef.current;

    const dt = Math.min(
      (t - lastTRef.current) / 16,
      4
    );

    lastTRef.current = t;

    const k = s.keys;

    if (k["ArrowLeft"] || k["a"])
      s.angle -= RSPD * dt;

    if (k["ArrowRight"] || k["d"])
      s.angle += RSPD * dt;

    let nx = s.px;
    let ny = s.py;

    const cos = Math.cos(s.angle);
    const sin = Math.sin(s.angle);

    if (k["ArrowUp"] || k["w"]) {
      nx += cos * MSPD * dt;
      ny += sin * MSPD * dt;
    }

    if (k["ArrowDown"] || k["s"]) {
      nx -= cos * MSPD * dt;
      ny -= sin * MSPD * dt;
    }

    if (MAP[ny | 0][s.px | 0] === 0)
      s.py = ny;

    if (MAP[s.py | 0][nx | 0] === 0)
      s.px = nx;

    // LETTER COLLECTION
    for (const l of s.letters) {
      if (!l.alive) continue;

      l.anim += 0.04 * dt;

      const dx = l.x - s.px;
      const dy = l.y - s.py;

      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 0.8) {
        l.alive = false;

        s.collectedWord += l.char;

        s.score += 100;

        s.msg = `Collected ${l.char}`;
        s.msgT = 50;
      }
    }

    if (s.msgT > 0) s.msgT -= dt;

    render();

    rafRef.current = requestAnimationFrame(loop);
  }

  // ─────────────────────────────────────────────────────────
  // EFFECTS
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e) => {
      if (stateRef.current?.keys)
        stateRef.current.keys[e.key] = true;
    };

    const onKeyUp = (e) => {
      if (stateRef.current?.keys)
        stateRef.current.keys[e.key] = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    startGame();

    return () => {
      window.removeEventListener(
        "keydown",
        onKeyDown
      );

      window.removeEventListener(
        "keyup",
        onKeyUp
      );

      if (rafRef.current)
        cancelAnimationFrame(rafRef.current);
    };
  }, [startGame]);

  // ─────────────────────────────────────────────────────────
  // JSX
  // ─────────────────────────────────────────────────────────
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: "#000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <canvas
        ref={gcRef}
        width={GW}
        height={GH}
        style={{
          imageRendering: "pixelated",
          border: "3px solid #660000",
        }}
      />
    </div>
  );
}