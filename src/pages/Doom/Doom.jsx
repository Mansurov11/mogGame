import { useEffect, useRef, useCallback, useState } from "react";

// ─── Main component ───────────────────────────────────────────────────────────
function DoomGame() {
  // ─── Word list — each round picks the next ────────────────────────────────────
  const WORD_LIST = [
    "DOOM",
    "CREATE",
    "CRACK  ",
    "IMPACT",
    "ENEMY",
    "FEAR",
    "DARK",
    "EVIL",
    "BUNDLE",
    "CONQUEST",
  ];

  // ─── Zombie types ─────────────────────────────────────────────────────────────
  const ZOMBIE_TYPES = [
    {
      name: "Zombie",
      hp: 80,
      speed: 0.01,
      size: 1.0,
      skinR: 140,
      skinG: 170,
      skinB: 110,
      shirtR: 55,
      shirtG: 70,
      shirtB: 35,
      eyeR: 255,
      eyeG: 60,
      eyeB: 20,
    },
    {
      name: "Bloater",
      hp: 220,
      speed: 0.004,
      size: 1.35,
      skinR: 180,
      skinG: 155,
      skinB: 100,
      shirtR: 90,
      shirtG: 50,
      shirtB: 15,
      eyeR: 255,
      eyeG: 120,
      eyeB: 0,
    },
    {
      name: "Runner",
      hp: 50,
      speed: 0.02,
      size: 0.82,
      skinR: 130,
      skinG: 175,
      skinB: 110,
      shirtR: 190,
      shirtG: 35,
      shirtB: 35,
      eyeR: 255,
      eyeG: 255,
      eyeB: 0,
    },
    {
      name: "Charred",
      hp: 130,
      speed: 0.007,
      size: 1.0,
      skinR: 55,
      skinG: 45,
      skinB: 35,
      shirtR: 28,
      shirtG: 25,
      shirtB: 22,
      eyeR: 255,
      eyeG: 140,
      eyeB: 0,
    },
    {
      name: "Soldier",
      hp: 160,
      speed: 0.009,
      size: 1.1,
      skinR: 155,
      skinG: 185,
      skinB: 130,
      shirtR: 45,
      shirtG: 75,
      shirtB: 35,
      eyeR: 200,
      eyeG: 50,
      eyeB: 255,
    },
  ];

  // ─── Letter colors ────────────────────────────────────────────────────────────
  const LETTER_COLORS = [
    "#ff3333",
    "#ffaa00",
    "#00ff88",
    "#33aaff",
    "#ff44ff",
    "#ffff00",
    "#ff6600",
    "#00ffff",
  ];

  // ─── Map ──────────────────────────────────────────────────────────────────────
  const MAP = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 2, 2, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1],
    [1, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1],
    [1, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];
  const MH = MAP.length,
    MW = MAP[0].length;

  // ─── Spawn pools ──────────────────────────────────────────────────────────────
  const ZOMBIE_SPAWNS = [
    [3.5, 3.5],
    [6.5, 3.5],
    [8.5, 5.5],
    [14.5, 9.5],
    [4.5, 12.5],
    [12.5, 15.5],
    [7.5, 8.5],
    [16.5, 3.5],
    [10.5, 13.5],
    [2.5, 8.5],
    [17.5, 12.5],
    [6.5, 15.5],
    [11.5, 7.5],
    [15.5, 13.5],
    [3.5, 16.5],
    [9.5, 11.5],
    [17.5, 7.5],
    [13.5, 17.5],
    [7.5, 17.5],
    [19.5, 5.5],
  ];

  // Letter positions — spread around map, away from player start
  const LETTER_POSITIONS = [
    [5.5, 4.5],
    [12.5, 2.5],
    [18.5, 8.5],
    [10.5, 8.5],
    [3.5, 10.5],
    [16.5, 11.5],
    [8.5, 14.5],
    [14.5, 16.5],
    [6.5, 17.5],
    [18.5, 16.5],
    [5.5, 4.5],
    [12.5, 2.5],
    [18.5, 8.5],
    [10.5, 8.5],
    [3.5, 10.5],
    [16.5, 11.5],
    [8.5, 14.5],
    [14.5, 16.5],
    [6.5, 17.5],
  ];

  // ─── Textures ─────────────────────────────────────────────────────────────────
  function makeTextures() {
    const sz = 84;
    const wall1 = new Uint8Array(sz * sz * 3),
      wall2 = new Uint8Array(sz * sz * 3);
    const floor = new Uint8Array(sz * sz * 3),
      ceil = new Uint8Array(sz * sz * 3);
    for (let y = 0; y < sz; y++)
      for (let x = 0; x < sz; x++) {
        const i = (y * sz + x) * 3;
        const noise =
          (Math.sin(x * 0.9 + y * 0.3) * 18 +
            Math.cos(x * 0.4 - y * 0.7) * 12) |
          0;
        const mortar = x % 16 < 1 || y % 16 < 1 ? -40 : 0,
          base = 80 + noise + mortar;
        wall1[i] = Math.max(0, Math.min(255, base));
        wall1[i + 1] = Math.max(0, Math.min(255, (base * 0.4) | 0));
        wall1[i + 2] = Math.max(0, Math.min(255, (base * 0.3) | 0));
        const bx = x % 16,
          by = y % 8,
          brick = by < 1 || bx < 1 ? -50 : 0;
        const r2 = 140 + ((Math.sin(x * 1.1) * 10 + Math.cos(y * 0.8) * 8) | 0);
        wall2[i] = Math.max(0, Math.min(255, r2 + brick));
        wall2[i + 1] = Math.max(0, Math.min(255, ((r2 * 0.35) | 0) + brick));
        wall2[i + 2] = Math.max(0, Math.min(255, ((r2 * 0.2) | 0) + brick));
        const fn = (Math.sin(x * 0.5) * 8 + Math.cos(y * 0.5) * 8) | 0;
        floor[i] = 30 + fn;
        floor[i + 1] = 25 + fn;
        floor[i + 2] = 20 + fn;
        ceil[i] = 15;
        ceil[i + 1] = 15;
        ceil[i + 2] = 18;
      }
    return { wall1, wall2, floor, ceil, sz };
  }
  const TEX = makeTextures();

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  function hasLOS(x1, y1, x2, y2) {
    const dx = x2 - x1,
      dy = y2 - y1,
      steps = Math.ceil(Math.sqrt(dx * dx + dy * dy) * 10);
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      if (MAP[(y1 + dy * t) | 0][(x1 + dx * t) | 0] !== 0) return false;
    }
    return true;
  }

  function castRay(px, py, ang) {
    const cos = Math.cos(ang),
      sin = Math.sin(ang);
    let t = 0.02;
    for (let i = 0; i < 750; i++) {
      const tx = px + cos * t,
        ty = py + sin * t,
        mx = tx | 0,
        my = ty | 0;
      if (mx < 0 || my < 0 || mx >= MW || my >= MH) return { d: 30, hit: 0 };
      const cell = MAP[my][mx];
      if (cell) {
        const tc =
          Math.abs(cos) > Math.abs(sin)
            ? ty - Math.floor(ty)
            : tx - Math.floor(tx);
        return { d: t, hit: cell, tc, vert: Math.abs(cos) > Math.abs(sin) };
      }
      t += 0.04;
    }
    return { d: 30, hit: 0 };
  }

  function texSample(tex, u, v, sz) {
    const tx = ((u * sz) | (0 + sz)) % sz,
      ty = ((v * sz) | (0 + sz)) % sz,
      i = (ty * sz + tx) * 3;
    return [tex[i], tex[i + 1], tex[i + 2]];
  }
  function toARGB(r, g, b) {
    return (255 << 24) | (b << 16) | (g << 8) | r;
  }

  // ─── Zombie renderer ──────────────────────────────────────────────────────────
  function drawZombiePixels(sp, x0, x1, y0, y1, zbuf, RAYS, GW, GH, px32) {
    const t = ZOMBIE_TYPES[sp.type],
      d = sp.dist;
    const sh = Math.max(0.08, 1 - d / 14),
      hpPct = sp.hp / sp.maxHp;
    const sprW = x1 - x0 || 1,
      sprH = y1 - y0 || 1;
    const bob = Math.sin(sp.anim * 2.8) * (sp.type === 2 ? 5 : 2.5);
    const armSwing = Math.sin(sp.anim * 2.2) * 0.38;
    const staggerOff = Math.sin(sp.stagger * 9) * 0.05;
    for (let x = x0; x < x1; x++) {
      const ray = Math.floor((x / GW) * RAYS);
      if (ray < 0 || ray >= RAYS || d >= zbuf[ray]) continue;
      const u = (x - x0) / sprW + staggerOff;
      if (u < 0 || u > 1) continue;
      for (let y = y0; y < y1; y++) {
        const v = (y - y0 + bob) / sprH;
        if (v < 0 || v > 1) continue;
        const cx = u - 0.5,
          cy = v - 0.5;
        let r = 0,
          g = 0,
          b = 0,
          draw = false;
        const headScale = sp.type === 1 ? 1.25 : 1.0;
        const hcx = cx,
          hcy = cy + 0.26,
          headR = 0.14 * headScale;
        const headDist = Math.sqrt(hcx * hcx + hcy * hcy * 1.4);
        if (headDist < headR) {
          draw = true;
          const localU = (hcx / headR + 1) / 2,
            localV = (hcy / (headR / 1.4) + 1) / 2;
          const skinNoise =
            (Math.sin(localU * 22 + sp.id * 1.7) * 7 +
              Math.cos(localV * 18 + sp.id) * 5) |
            0;
          const decay =
            (Math.sin(localU * 8 + sp.id * 2.1) * 0.5 + 0.5) *
            (Math.cos(localV * 11) * 0.5 + 0.5);
          const le = Math.sqrt(
            (hcx + headR * 0.38) ** 2 + (hcy + headR * 0.05) ** 2,
          );
          const re = Math.sqrt(
            (hcx - headR * 0.38) ** 2 + (hcy + headR * 0.05) ** 2,
          );
          const eyeRad = headR * 0.17,
            pulse = 0.85 + Math.sin(sp.anim * 3 + sp.id) * 0.15;
          if (le < eyeRad || re < eyeRad) {
            r = (t.eyeR * pulse) | 0;
            g = (t.eyeG * pulse) | 0;
            b = (t.eyeB * pulse) | 0;
          } else if (le < eyeRad * 1.5 || re < eyeRad * 1.5) {
            r = 8;
            g = 5;
            b = 5;
          } else if (sp.type === 4 && hcy < -headR * 0.35) {
            r = 45;
            g = 70;
            b = 38;
          } else if (decay < 0.22) {
            r = (t.skinR * 0.38 + skinNoise) | 0;
            g = (t.skinG * 0.28 + skinNoise) | 0;
            b = (t.skinB * 0.18) | 0;
          } else {
            r = (t.skinR + skinNoise) | 0;
            g = (t.skinG + skinNoise) | 0;
            b = (t.skinB + skinNoise) | 0;
          }
          if (
            hcy > headR * 0.12 &&
            hcy < headR * 0.38 &&
            Math.abs(hcx) < headR * 0.55
          ) {
            r = 180;
            g = 18;
            b = 12;
          }
          if (hpPct < 0.4 && localU > 0.55 && localV < 0.4) {
            r = 220;
            g = 210;
            b = 185;
          }
        } else if (Math.abs(cx) < 0.038 && cy > -0.155 && cy < -0.09) {
          draw = true;
          r = (t.skinR * 0.72) | 0;
          g = (t.skinG * 0.72) | 0;
          b = (t.skinB * 0.72) | 0;
        } else if (
          Math.abs(cx) < (sp.type === 1 ? 0.3 : 0.22) &&
          cy > -0.09 &&
          cy < 0.23
        ) {
          draw = true;
          const bodyNoise =
            (Math.sin(cx * 32 + sp.id) * 4 + Math.cos(cy * 28) * 3) | 0;
          const tear = Math.sin(cx * 22 + sp.id * 1.3) * 0.5 + 0.5 > 0.88;
          const wound =
            Math.sin(cx * 14 + sp.id * 2.7) * Math.cos(cy * 10 + sp.id) > 0.68;
          if (wound && hpPct < 0.75) {
            r = 165;
            g = 18;
            b = 10;
          } else if (tear) {
            r = (t.skinR + bodyNoise) | 0;
            g = (t.skinG + bodyNoise) | 0;
            b = (t.skinB + bodyNoise) | 0;
          } else {
            r = (t.shirtR + bodyNoise) | 0;
            g = (t.shirtG + bodyNoise) | 0;
            b = (t.shirtB + bodyNoise) | 0;
          }
          if (hpPct < 0.5 && Math.abs(cx) < 0.06 && cy > 0.05 && cy < 0.22) {
            r = Math.min(255, r + 90);
            g = Math.max(0, g - 30);
            b = Math.max(0, b - 30);
          }
        } else if (cy > -0.04 && cy < 0.14) {
          const lax = cx + 0.28 + armSwing * 0.55,
            lay = cy - 0.04;
          const rax = cx - 0.28 - armSwing * 0.55,
            ray2 = cy - 0.04;
          if (
            Math.sqrt(lax * lax * 5 + lay * lay) < 0.12 ||
            Math.sqrt(rax * rax * 5 + ray2 * ray2) < 0.12
          ) {
            draw = true;
            r = (t.skinR * 0.82) | 0;
            g = (t.skinG * 0.82) | 0;
            b = (t.skinB * 0.82) | 0;
          }
          const lhx = cx + 0.42 + armSwing * 0.9,
            lhy = cy,
            rhx = cx - 0.42 - armSwing * 0.9,
            rhy = cy;
          if (
            Math.sqrt(lhx * lhx * 3.5 + lhy * lhy) < 0.1 ||
            Math.sqrt(rhx * rhx * 3.5 + rhy * rhy) < 0.1
          ) {
            draw = true;
            r = (t.skinR * 0.68) | 0;
            g = (t.skinG * 0.68) | 0;
            b = (t.skinB * 0.68) | 0;
          }
        } else if (cy > 0.23 && cy < 0.46) {
          const legSep = 0.09,
            lleg = Math.abs(cx + legSep) < 0.085,
            rleg = Math.abs(cx - legSep) < 0.085;
          const legBob =
            sp.type === 2
              ? Math.sin(sp.anim * 3 + (lleg ? 0 : Math.PI)) * 0.04
              : 0;
          if ((lleg || rleg) && cy + legBob > 0.23 && cy + legBob < 0.46) {
            draw = true;
            const pNoise = (Math.sin(cx * 28 + sp.id) * 3) | 0;
            r = (t.shirtR * 0.62 + pNoise) | 0;
            g = (t.shirtG * 0.62 + pNoise) | 0;
            b = (t.shirtB * 0.62 + pNoise) | 0;
          }
        } else if (cy > 0.44 && cy < 0.5 && Math.abs(cx) < 0.17) {
          draw = true;
          r = 38;
          g = 28;
          b = 18;
        }
        if (draw) {
          if (hpPct < 0.3) {
            r = Math.min(255, r + 55);
            g = Math.max(0, g - 18);
          }
          px32[y * GW + x] = toARGB((r * sh) | 0, (g * sh) | 0, (b * sh) | 0);
        }
      }
    }
  }

  // ─── Spawn helpers ────────────────────────────────────────────────────────────
  function spawnEnemies() {
    return ZOMBIE_SPAWNS.map((pos, i) => {
      const t = ZOMBIE_TYPES[i % ZOMBIE_TYPES.length];
      return {
        id: i,
        x: pos[0],
        y: pos[1],
        hp: t.hp,
        maxHp: t.hp,
        alive: true,
        anim: i * 0.63,
        stagger: 0,
        type: i % ZOMBIE_TYPES.length,
      };
    });
  }

  function spawnLetters(word) {
    return word.split("").map((char, i) => ({
      id: i,
      char,
      x: LETTER_POSITIONS[i % LETTER_POSITIONS.length][0],
      y: LETTER_POSITIONS[i % LETTER_POSITIONS.length][1],
      alive: true,
      anim: i * 0.5,
      color: LETTER_COLORS[i % LETTER_COLORS.length],
      collected: false,
    }));
  }

  const GW = 1000,
    GH = 700,
    HH = GH >> 1;
  const FOV = Math.PI / 3,
    RAYS = 240,
    RSTEP = FOV / RAYS;
  const MSPD = 0.065,
    RSPD = 0.042;

  // ── phase: "menu" | "playing" | "dead" | "win" ──
  const [phase, setPhase] = useState("menu");
  const [roundIdx, setRoundIdx] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [winWord, setWinWord] = useState("");

  const gcRef = useRef(null);
  const mcRef = useRef(null);
  const stateRef = useRef(null);
  const rafRef = useRef(null);
  const lastTRef = useRef(0);
  const imgdRef = useRef(null);
  const px32Ref = useRef(null);
  const hudElsRef = useRef({});
  const phaseRef = useRef("menu");
  const roundRef = useRef(0);

  // Keep refs in sync with state
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    roundRef.current = roundIdx;
  }, [roundIdx]);

  // ── startRound ─────────────────────────────────────────
  const startRound = useCallback((rIdx, prevScore = 0) => {
    const word = WORD_LIST[rIdx % WORD_LIST.length];
    stateRef.current = {
      px: 1.5,
      py: 1.5,
      angle: 0.1,
      health: 120,
      ammo: 70,
      score: prevScore,
      kills: 0,
      enemies: spawnEnemies(),
      letters: spawnLetters(word),
      collectedWord: "",
      targetWord: word,
      keys: {},
      shootCD: 0,
      flashT: 0,
      hitFlash: 0,
      msg: "",
      msgT: 0,
      zbuf: new Float32Array(RAYS),
      respawnTimer: 0,
      wordComplete: false,
    };
    imgdRef.current = null;
    px32Ref.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    lastTRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  // ── render ─────────────────────────────────────────────
  function render() {
    const s = stateRef.current;
    if (!s) return;
    const gc = gcRef.current;
    if (!gc) return;
    const ctx = gc.getContext("2d");
    if (!imgdRef.current) {
      imgdRef.current = ctx.createImageData(GW, GH);
      px32Ref.current = new Uint32Array(imgdRef.current.data.buffer);
    }
    const imgd = imgdRef.current,
      px32 = px32Ref.current,
      zbuf = s.zbuf;

    // Floor/ceiling
    for (let y = 0; y < GH; y++) {
      const isF = y > HH,
        yd = isF ? y - HH : HH - y;
      if (!yd) continue;
      const rd = HH / yd;
      const fx = s.px + Math.cos(s.angle - FOV / 2) * rd,
        fy = s.py + Math.sin(s.angle - FOV / 2) * rd;
      const xs =
        ((Math.cos(s.angle + FOV / 2) - Math.cos(s.angle - FOV / 2)) * rd) / GW;
      const ys =
        ((Math.sin(s.angle + FOV / 2) - Math.sin(s.angle - FOV / 2)) * rd) / GW;
      const sh = Math.max(0, Math.min(1, 1 - rd / 10));
      for (let x = 0; x < GW; x++) {
        const tu = fx + xs * x - Math.floor(fx + xs * x),
          tv = fy + ys * x - Math.floor(fy + ys * x);
        const tex = isF ? TEX.floor : TEX.ceil,
          [r, g, b] = texSample(tex, tu, tv, TEX.sz);
        px32[y * GW + x] = toARGB((r * sh) | 0, (g * sh) | 0, (b * sh) | 0);
      }
    }

    // Walls
    for (let ray = 0; ray < RAYS; ray++) {
      const ang = s.angle - FOV / 2 + ray * RSTEP;
      const { d, hit, tc, vert } = castRay(s.px, s.py, ang);
      const corr = d * Math.cos(ang - s.angle);
      zbuf[ray] = corr;
      if (!hit) continue;
      const wh = Math.min(GH * 2, GH / corr),
        top = Math.max(0, (HH - wh / 2) | 0),
        bot = Math.min(GH, (HH + wh / 2) | 0);
      const shade = Math.max(0, 1 - corr / 30) * (vert ? 0.6 : 1);
      const tex = hit === 2 ? TEX.wall2 : TEX.wall1;
      const colW = GW / RAYS,
        x0 = (ray * colW) | 0,
        x1 = ((ray + 1) * colW) | 0;
      for (let x = x0; x < x1; x++) {
        const tu = tc + ((x - x0) / (x1 - x0)) * 0.01;
        for (let y = top; y < bot; y++) {
          const tv = (y - top) / (bot - top),
            [r, g, b] = texSample(tex, tu, tv, TEX.sz);
          px32[y * GW + x] = toARGB(
            (r * shade) | 0,
            (g * shade) | 0,
            (b * shade) | 0,
          );
        }
      }
    }

    // Zombie sprites (pixel)
    const zSprites = s.enemies
      .filter((e) => e.alive)
      .map((e) => {
        const dx = e.x - s.px,
          dy = e.y - s.py;
        return { ...e, dist: Math.sqrt(dx * dx + dy * dy) };
      })
      .sort((a, b) => b.dist - a.dist);
    for (const sp of zSprites) {
      const dx = sp.x - s.px,
        dy = sp.y - s.py;
      const norm = Math.atan2(
        Math.sin(Math.atan2(dy, dx) - s.angle),
        Math.cos(Math.atan2(dy, dx) - s.angle),
      );
      if (Math.abs(norm) > FOV * 0.72 || sp.dist < 0.25) continue;
      const t = ZOMBIE_TYPES[sp.type];
      const sprH = Math.min(GH * 2, (GH / sp.dist) * t.size),
        sprW = sprH * 0.78;
      const screenX = ((norm / FOV + 0.5) * GW) | 0;
      drawZombiePixels(
        sp,
        Math.max(0, (screenX - sprW / 2) | 0),
        Math.min(GW, (screenX + sprW / 2) | 0),
        Math.max(0, (HH - sprH / 2) | 0),
        Math.min(GH, (HH + sprH / 2) | 0),
        zbuf,
        RAYS,
        GW,
        GH,
        px32,
      );
    }

    // Muzzle flash
    if (s.flashT > 0) {
      const fx = (GW / 2) | 0,
        fy = (GH * 0.72) | 0,
        fr = s.flashT / 8,
        rad = (55 * fr) | 0;
      for (let dy = -rad; dy <= rad; dy++)
        for (let dx = -rad; dx <= rad; dx++) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > rad) continue;
          const ppx = fx + dx,
            ppy = fy + dy;
          if (ppx < 0 || ppx >= GW || ppy < 0 || ppy >= GH) continue;
          const f = (1 - dist / rad) * fr,
            idx = ppy * GW + ppx;
          const cr = px32[idx] & 0xff,
            cg = (px32[idx] >> 8) & 0xff,
            cb = (px32[idx] >> 16) & 0xff;
          px32[idx] = toARGB(
            Math.min(255, (cr + 255 * f) | 0),
            Math.min(255, (cg + 180 * f) | 0),
            Math.min(255, (cb + 30 * f) | 0),
          );
        }
    }
    // Hit flash
    if (s.hitFlash > 0) {
      const alpha = ((s.hitFlash / 10) * 85) | 0;
      for (let i = 0; i < GW * GH; i++) {
        const cr = px32[i] & 0xff;
        px32[i] = (px32[i] & 0xffffff00) | (Math.min(255, cr + alpha) & 0xff);
      }
    }

    ctx.putImageData(imgd, 0, 0);

    // ── Letter sprites (canvas 2D) ──────────────────────
    const lSprites = s.letters
      .filter((l) => l.alive)
      .map((l) => {
        const dx = l.x - s.px,
          dy = l.y - s.py;
        return { ...l, dist: Math.sqrt(dx * dx + dy * dy) };
      })
      .sort((a, b) => b.dist - a.dist);

    ctx.save();
    for (const sp of lSprites) {
      const dx = sp.x - s.px,
        dy = sp.y - s.py;
      const spAng = Math.atan2(dy, dx) - s.angle;
      const norm = Math.atan2(Math.sin(spAng), Math.cos(spAng));
      if (Math.abs(norm) > FOV * 0.72) continue;
      const d = sp.dist;
      if (d < 0.3) continue;
      // Depth test — don't draw letter through walls
      const rayI = Math.floor((norm / FOV + 0.5) * RAYS);
      if (rayI >= 0 && rayI < RAYS && d >= zbuf[rayI]) continue;
      const size = Math.min(120, (GH / d) * 0.42);
      const screenX = (norm / FOV + 0.5) * GW;
      const bob = Math.sin(sp.anim * 2.5) * 12;
      ctx.font = `900 ${size | 0}px Impact,Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // Outer glow
      ctx.shadowColor = sp.color;
      ctx.shadowBlur = 28;
      ctx.fillStyle = sp.color;
      ctx.fillText(sp.char, screenX, HH + bob);
      // Inner bright core
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#ffffff";
      ctx.globalAlpha = 0.35;
      ctx.fillText(sp.char, screenX, HH + bob);
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    // Gun
    drawGun(ctx, s.flashT > 0);

    // Crosshair
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.75)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(GW / 2 - 12, HH);
    ctx.lineTo(GW / 2 + 12, HH);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(GW / 2, HH - 12);
    ctx.lineTo(GW / 2, HH + 12);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,80,80,0.9)";
    ctx.beginPath();
    ctx.arc(GW / 2, HH, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ── gun ────────────────────────────────────────────────
  function drawGun(ctx, firing) {
    const gx = GW / 2,
      gy = GH,
      bob = firing ? -34 : -Math.sin(Date.now() / 300) * 4;
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.38)";
    ctx.beginPath();
    ctx.ellipse(gx, gy - 10 + bob, 42, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#4a4a4a";
    ctx.fillRect(gx - 7, gy - 146 + bob, 14, 96);
    ctx.fillStyle = "#3a3a3a";
    ctx.fillRect(gx - 12, gy - 88 + bob, 24, 62);
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(gx - 8, gy - 58 + bob, 16, 52);
    ctx.fillStyle = "#222";
    for (let i = 0; i < 5; i++)
      ctx.fillRect(gx - 7, gy - 50 + bob + i * 8, 14, 3);
    ctx.fillStyle = "#555";
    ctx.fillRect(gx - 13, gy - 82 + bob, 5, 22);
    ctx.fillRect(gx + 8, gy - 82 + bob, 5, 22);
    ctx.fillStyle = "#666";
    ctx.fillRect(gx - 5, gy - 150 + bob, 10, 12);
    ctx.fillStyle = "#888";
    ctx.fillRect(gx - 5, gy - 156 + bob, 10, 12);
    ctx.fillStyle = "#999";
    ctx.fillRect(gx - 3, gy - 160 + bob, 6, 6);
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(gx + 4, gy - 110 + bob, 6, 14);
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(gx, gy - 58 + bob, 8, 0, Math.PI);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    ctx.fillRect(gx - 6, gy - 146 + bob, 3, 92);
    if (firing) {
      const grad = ctx.createRadialGradient(
        gx,
        gy - 162 + bob,
        0,
        gx,
        gy - 162 + bob,
        30,
      );
      grad.addColorStop(0, "rgba(255,255,200,1)");
      grad.addColorStop(0.35, "rgba(255,180,0,0.85)");
      grad.addColorStop(1, "rgba(255,60,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(gx, gy - 162 + bob, 30, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2,
          len = 12 + Math.random() * 24;
        ctx.strokeStyle = `rgba(255,${(130 + Math.random() * 120) | 0},0,0.75)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(gx, gy - 162 + bob);
        ctx.lineTo(gx + Math.cos(a) * len, gy - 162 + bob + Math.sin(a) * len);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // ── minimap ────────────────────────────────────────────
  function drawMinimap() {
    const s = stateRef.current;
    if (!s) return;
    const mc = mcRef.current;
    if (!mc) return;
    const mctx = mc.getContext("2d"),
      cs = 5;
    mctx.clearRect(0, 0, MW * cs, MH * cs);
    for (let y = 0; y < MH; y++)
      for (let x = 0; x < MW; x++) {
        const c = MAP[y][x];
        mctx.fillStyle = c === 2 ? "#660000" : c ? "#2a2a2a" : "#111";
        mctx.fillRect(x * cs + 0.5, y * cs + 0.5, cs - 1, cs - 1);
      }
    for (const e of s.enemies) {
      if (!e.alive) continue;
      const t = ZOMBIE_TYPES[e.type],
        los = hasLOS(e.x, e.y, s.px, s.py);
      mctx.fillStyle = los
        ? `rgb(${t.eyeR},${(t.eyeG * 0.7) | 0},30)`
        : `rgb(${(t.eyeR * 0.5) | 0},${(t.eyeG * 0.3) | 0},20)`;
      mctx.fillRect(e.x * cs - 2, e.y * cs - 2, 4, 4);
    }
    for (const l of s.letters) {
      if (!l.alive) continue;
      mctx.fillStyle = l.color;
      mctx.font = "bold 7px monospace";
      mctx.fillText(l.char, l.x * cs - 3, l.y * cs + 3);
    }
    mctx.fillStyle = "#00ff44";
    mctx.beginPath();
    mctx.arc(s.px * cs, s.py * cs, 3, 0, Math.PI * 2);
    mctx.fill();
    mctx.strokeStyle = "#00ff44";
    mctx.lineWidth = 1.5;
    mctx.beginPath();
    mctx.moveTo(s.px * cs, s.py * cs);
    mctx.lineTo(
      s.px * cs + Math.cos(s.angle) * 10,
      s.py * cs + Math.sin(s.angle) * 10,
    );
    mctx.stroke();
  }

  // ── HUD ────────────────────────────────────────────────
  function updateHUD() {
    const s = stateRef.current;
    if (!s) return;
    const els = hudElsRef.current;
    if (els.hp) els.hp.textContent = Math.max(0, s.health | 0) + "%";
    if (els.ammo) els.ammo.textContent = s.ammo;
    if (els.score) els.score.textContent = s.score;
    if (els.kills) els.kills.textContent = `${s.kills}/20`;
    if (els.face)
      els.face.textContent =
        s.health <= 0
          ? "💀"
          : s.health > 70
            ? "😤"
            : s.health > 40
              ? "😨"
              : "🤕";
    if (els.ammoWarn)
      els.ammoWarn.style.display = s.ammo < 10 && s.ammo > 0 ? "block" : "none";
    if (els.msg) {
      els.msg.textContent = s.msgT > 0 ? s.msg : "";
      els.msg.style.opacity = s.msgT > 0 ? "1" : "0";
    }
    // Word progress bar
    if (els.wordProgress) {
      const chars = s.targetWord.split("").map((ch, i) => {
        const col = s.letters.find((l) => l.id === i && !l.alive)
          ? LETTER_COLORS[i % LETTER_COLORS.length]
          : "#333";
        return `<span style="color:${col};text-shadow:0 0 10px ${col}">${ch}</span>`;
      });
      els.wordProgress.innerHTML = chars.join("");
    }
  }

  // ── loop ───────────────────────────────────────────────
  function loop(t) {
    const dt = Math.min((t - lastTRef.current) / 16, 4);
    lastTRef.current = t;
    const s = stateRef.current;
    if (!s) return;
    if (phaseRef.current !== "playing") return;

    // Death
    if (s.health <= 0) {
      render();
      drawMinimap();
      updateHUD();
      setPhase("dead");
      return;
    }

    const k = s.keys;
    if (k["ArrowLeft"] || k["a"] || k["A"]) s.angle -= RSPD * dt;
    if (k["ArrowRight"] || k["d"] || k["D"]) s.angle += RSPD * dt;
    let nx = s.px,
      ny = s.py;
    const cos = Math.cos(s.angle),
      sin = Math.sin(s.angle);
    if (k["ArrowUp"] || k["w"] || k["W"]) {
      nx += cos * MSPD * dt;
      ny += sin * MSPD * dt;
    }
    if (k["ArrowDown"] || k["s"] || k["S"]) {
      nx -= cos * MSPD * dt;
      ny -= sin * MSPD * dt;
    }
    if (MAP[ny | 0][s.px | 0] === 0) s.py = ny;
    if (MAP[s.py | 0][nx | 0] === 0) s.px = nx;

    if (s.shootCD > 0) s.shootCD -= dt;
    if (s.flashT > 0) s.flashT -= dt;
    if (s.hitFlash > 0) s.hitFlash -= dt;
    if (s.msgT > 0) s.msgT -= dt;

    // Shoot
    if (
      (k[" "] || k["f"] || k["F"] || k["mouse"]) &&
      s.shootCD <= 0 &&
      s.ammo > 0
    ) {
      s.shootCD = 8;
      s.flashT = 5;
      s.ammo--;
      let best = 99,
        hitE = null;
      for (const e of s.enemies) {
        if (!e.alive) continue;
        const dx = e.x - s.px,
          dy = e.y - s.py,
          d2 = Math.sqrt(dx * dx + dy * dy);
        if (d2 > 12) continue;
        const ea = Math.atan2(dy, dx),
          diff = Math.abs(
            Math.atan2(Math.sin(ea - s.angle), Math.cos(ea - s.angle)),
          );
        if (diff < 0.22 && d2 < best && hasLOS(s.px, s.py, e.x, e.y)) {
          best = d2;
          hitE = e;
        }
      }
      if (hitE) {
        const t = ZOMBIE_TYPES[hitE.type],
          dmg = (20 + Math.random() * 28) | 0;
        hitE.hp -= dmg;
        hitE.stagger = 1;
        if (hitE.hp <= 0) {
          hitE.alive = false;
          s.kills++;
          s.score += t.hp * 2 + Math.floor(best * 8);
          s.msg = `☠ ${t.name} DOWN!`;
          s.msgT = 50;
        } else {
          s.msg = `HIT ${t.name}! -${dmg}`;
          s.msgT = 28;
        }
      }
    }

    // Ammo respawn
    if (s.ammo <= 0 && s.respawnTimer === 0) s.respawnTimer = 360;
    if (s.respawnTimer > 0) {
      s.respawnTimer -= dt;
      if (s.respawnTimer <= 0) {
        s.ammo = 70;
        s.msg = "🔋 AMMO REFILL!";
        s.msgT = 80;
        s.respawnTimer = 0;
      }
    }

    // Enemy AI
    for (const e of s.enemies) {
      if (!e.alive) continue;
      const t = ZOMBIE_TYPES[e.type];
      e.anim += (0.045 + (e.type === 2 ? 0.055 : 0)) * dt;
      if (e.stagger > 0) e.stagger -= 0.025 * dt;
      const dx = s.px - e.x,
        dy = s.py - e.y,
        d = Math.sqrt(dx * dx + dy * dy);
      const los = d < 16 && hasLOS(e.x, e.y, s.px, s.py);
      if (los && d > 0.75) {
        const spd = t.speed * dt * (e.stagger > 0 ? 0.3 : 1);
        const enx = e.x + (dx / d) * spd,
          eny = e.y + (dy / d) * spd;
        if (MAP[e.y | 0][enx | 0] === 0) e.x = enx;
        if (MAP[eny | 0][e.x | 0] === 0) e.y = eny;
      }
      const meleeRange = e.type === 1 ? 1.1 : 0.88,
        dmgRate = e.type === 1 ? 0.19 : e.type === 2 ? 0.09 : 0.12;
      if (d < meleeRange && los) {
        s.health -= dmgRate * dt;
        s.hitFlash = 6;
      }
    }
    s.health = Math.max(0, s.health);

    // Letter collection
    for (const l of s.letters) {
      if (!l.alive) continue;
      l.anim += 0.04 * dt;
      const dx = l.x - s.px,
        dy = l.y - s.py,
        dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 0.75) {
        // Only collect if it's the NEXT needed letter
        const nextIdx = s.collectedWord.length;
        if (l.id === nextIdx) {
          l.alive = false;
          s.collectedWord += l.char;
          s.score += 150;
          s.msg = `✨ "${l.char}" COLLECTED! (${s.collectedWord}/${s.targetWord})`;
          s.msgT = 60;
        } else {
          // Wrong order hint
          s.msg = `⚠ Need "${s.targetWord[s.collectedWord.length]}" first!`;
          s.msgT = 40;
        }
      }
    }

    // Word complete!
    if (s.collectedWord === s.targetWord && !s.wordComplete) {
      s.wordComplete = true;
      s.score += 500;
      setWinWord(s.targetWord);
      setTotalScore(s.score);
      setTimeout(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        setPhase("win");
      }, 1200);
    }

    render();
    drawMinimap();
    updateHUD();
    rafRef.current = requestAnimationFrame(loop);
  }

  // ── effects ────────────────────────────────────────────
  useEffect(() => {
    hudElsRef.current = {
      hp: document.getElementById("h-hp"),
      ammo: document.getElementById("h-ammo"),
      score: document.getElementById("h-score"),
      kills: document.getElementById("h-kills"),
      face: document.getElementById("h-face"),
      ammoWarn: document.getElementById("ammo-warn"),
      msg: document.getElementById("doom-msg"),
      wordProgress: document.getElementById("word-progress"),
    };
    const onKeyDown = (e) => {
      if (stateRef.current?.keys) stateRef.current.keys[e.key] = true;
      if (
        [" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
      )
        e.preventDefault();
    };
    const onKeyUp = (e) => {
      if (stateRef.current?.keys) stateRef.current.keys[e.key] = false;
    };
    const onMouseDown = () => {
      if (stateRef.current?.keys) stateRef.current.keys["mouse"] = true;
    };
    const onMouseUp = () => {
      if (stateRef.current?.keys) stateRef.current.keys["mouse"] = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    const gc = gcRef.current;
    if (gc) {
      gc.addEventListener("mousedown", onMouseDown);
      gc.addEventListener("mouseup", onMouseUp);
    }
    const ctx = gc?.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, GW, GH);
    }
    const mc = mcRef.current;
    if (mc) {
      mc.width = MW * 5;
      mc.height = MH * 5;
    }
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      if (gc) {
        gc.removeEventListener("mousedown", onMouseDown);
        gc.removeEventListener("mouseup", onMouseUp);
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleStart = (rIdx, sc = 0) => {
    setRoundIdx(rIdx);
    setTotalScore(sc);
    setPhase("playing");
    setTimeout(() => startRound(rIdx, sc), 0);
  };

  const currentWord = WORD_LIST[roundIdx % WORD_LIST.length];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background: "#000",
        fontFamily: "'Courier New',monospace",
      }}
    >
      <div style={{ position: "relative", width: GW }}>
        {/* ── Canvas ── */}
        <div style={{ position: "relative" }}>
          <canvas
            ref={gcRef}
            width={GW}
            height={GH}
            style={{ display: "block", imageRendering: "pixelated" }}
          />
          <canvas
            ref={mcRef}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              border: "1px solid #440000",
              opacity: 0.92,
              imageRendering: "pixelated",
            }}
          />

          {/* kill/hit msg */}
          <div
            id="doom-msg"
            style={{
              position: "absolute",
              top: "38%",
              left: "50%",
              transform: "translateX(-50%)",
              color: "#ff2200",
              fontSize: 18,
              fontWeight: 900,
              letterSpacing: 3,
              textShadow: "0 0 18px #f00",
              pointerEvents: "none",
              opacity: 0,
              transition: "opacity 0.1s",
              whiteSpace: "nowrap",
            }}
          />
          <div
            id="ammo-warn"
            style={{
              position: "absolute",
              bottom: 10,
              left: "50%",
              transform: "translateX(-50%)",
              color: "#ffcc00",
              fontSize: 11,
              letterSpacing: 3,
              display: "none",
              fontWeight: 700,
              textShadow: "0 0 8px #fa0",
              animation: "pulse .5s infinite alternate",
            }}
          >
            ⚠ LOW AMMO
          </div>

          {/* ── MAIN MENU ── */}
          {phase === "menu" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "radial-gradient(ellipse at center,#1a0000 0%,#000 100%)",
                zIndex: 20,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.14) 2px,rgba(0,0,0,0.14) 4px)",
                  pointerEvents: "none",
                }}
              />
              <div style={{ position: "relative", textAlign: "center" }}>
                <h1
                  style={{
                    fontSize: 88,
                    fontWeight: 900,
                    color: "#f00",
                    letterSpacing: 8,
                    fontFamily: "Impact,sans-serif",
                    textShadow:
                      "0 0 60px #f00,0 0 120px #880000,0 6px 0 #550000",
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  DOOM
                </h1>
                <div
                  style={{
                    color: "#880000",
                    fontSize: 11,
                    letterSpacing: 7,
                    marginBottom: 4,
                  }}
                >
                  ☠ WORD HUNT ☠
                </div>
                <div
                  style={{
                    width: "100%",
                    height: 1,
                    background:
                      "linear-gradient(90deg,transparent,#880000,transparent)",
                    marginBottom: 24,
                  }}
                />
                {/* Word preview */}
                <div style={{ marginBottom: 22 }}>
                  <div
                    style={{
                      color: "#440000",
                      fontSize: 10,
                      letterSpacing: 3,
                      marginBottom: 8,
                    }}
                  >
                    ROUND 1 — SPELL THE WORD:
                  </div>
                  <div
                    style={{
                      fontSize: 36,
                      fontWeight: 900,
                      letterSpacing: 10,
                      color: "#ff2200",
                      textShadow: "0 0 20px #f00",
                      fontFamily: "Impact,sans-serif",
                    }}
                  >
                    {WORD_LIST[0].split("").map((ch, i) => (
                      <span
                        key={i}
                        style={{
                          color: LETTER_COLORS[i % LETTER_COLORS.length],
                          textShadow: `0 0 15px ${LETTER_COLORS[i % LETTER_COLORS.length]}`,
                        }}
                      >
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleStart(0, 0)}
                  style={{
                    background: "transparent",
                    border: "2px solid #cc0000",
                    color: "#ff2200",
                    padding: "14px 52px",
                    fontSize: 16,
                    fontFamily: "'Courier New',monospace",
                    letterSpacing: 5,
                    cursor: "pointer",
                    fontWeight: 700,
                    display: "block",
                    margin: "0 auto 18px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#cc0000";
                    e.currentTarget.style.color = "#fff";
                    e.currentTarget.style.boxShadow = "0 0 30px #f008";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#ff2200";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  ▶ START GAME
                </button>
                <div
                  style={{
                    color: "#440000",
                    fontSize: 10,
                    letterSpacing: 2,
                    lineHeight: 2.3,
                  }}
                >
                  WASD / ARROWS — Move &amp; Turn
                  <br />
                  SPACE / F / CLICK — Shoot zombies
                  <br />
                  <span style={{ color: "#664400" }}>
                    Collect letters IN ORDER to spell the word
                  </span>
                  <br />
                  <span style={{ color: "#553300" }}>
                    {WORD_LIST.length} words · 20 zombies per round
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── DEAD SCREEN ── */}
          {phase === "dead" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(110,0,0,0.92)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 15,
              }}
            >
              <div style={{ fontSize: 64, marginBottom: 6 }}>💀</div>
              <h2
                style={{
                  fontSize: 52,
                  color: "#fff",
                  fontWeight: 900,
                  letterSpacing: 4,
                  fontFamily: "Impact,sans-serif",
                  textShadow: "0 0 40px #f00,0 4px 0 #880000",
                  margin: 0,
                }}
              >
                YOU DIED
              </h2>
              <p
                style={{
                  color: "#ffaaaa",
                  margin: "10px 0 6px",
                  fontSize: 13,
                  letterSpacing: 2,
                }}
              >
                Score: {stateRef.current?.score ?? 0} | Kills:{" "}
                {stateRef.current?.kills ?? 0}/20
              </p>
              <p
                style={{
                  color: "#ff6666",
                  margin: "0 0 24px",
                  fontSize: 12,
                  letterSpacing: 2,
                }}
              >
                Word: {stateRef.current?.collectedWord || "—"} /{" "}
                {stateRef.current?.targetWord}
              </p>
              <div style={{ display: "flex", gap: 16 }}>
                <button
                  onClick={() => handleStart(roundIdx, 0)}
                  style={{
                    background: "transparent",
                    border: "2px solid #ff4444",
                    color: "#ff6666",
                    padding: "12px 28px",
                    fontSize: 13,
                    cursor: "pointer",
                    letterSpacing: 3,
                    fontFamily: "'Courier New',monospace",
                    fontWeight: 700,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#ff2200";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#ff6666";
                  }}
                >
                  ↺ RETRY ROUND
                </button>
                <button
                  onClick={() => setPhase("menu")}
                  style={{
                    background: "transparent",
                    border: "2px solid #884444",
                    color: "#aa6666",
                    padding: "12px 28px",
                    fontSize: 13,
                    cursor: "pointer",
                    letterSpacing: 3,
                    fontFamily: "'Courier New',monospace",
                    fontWeight: 700,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#441111";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#aa6666";
                  }}
                >
                  ⌂ MAIN MENU
                </button>
              </div>
            </div>
          )}

          {/* ── WIN SCREEN ── */}
          {phase === "win" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse at center,#001a00 0%,#000 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 15,
              }}
            >
              <div style={{ fontSize: 60, marginBottom: 4 }}>🏆</div>
              <h2
                style={{
                  fontSize: 46,
                  color: "#00ff66",
                  fontWeight: 900,
                  letterSpacing: 4,
                  fontFamily: "Impact,sans-serif",
                  textShadow: "0 0 40px #00ff44",
                  margin: 0,
                }}
              >
                WORD COMPLETE!
              </h2>
              {/* Show the completed word with letter colors */}
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 900,
                  letterSpacing: 12,
                  margin: "14px 0",
                  fontFamily: "Impact,sans-serif",
                }}
              >
                {winWord.split("").map((ch, i) => (
                  <span
                    key={i}
                    style={{
                      color: LETTER_COLORS[i % LETTER_COLORS.length],
                      textShadow: `0 0 20px ${LETTER_COLORS[i % LETTER_COLORS.length]}`,
                    }}
                  >
                    {ch}
                  </span>
                ))}
              </div>
              <p
                style={{
                  color: "#aaffaa",
                  margin: "4px 0 6px",
                  fontSize: 13,
                  letterSpacing: 2,
                }}
              >
                +500 BONUS · Score: {totalScore}
              </p>
              <p
                style={{
                  color: "#66aa66",
                  margin: "0 0 24px",
                  fontSize: 11,
                  letterSpacing: 3,
                }}
              >
                ROUND {roundIdx + 1} / {WORD_LIST.length} COMPLETE
              </p>
              {/* Next word preview */}
              {roundIdx + 1 < WORD_LIST.length && (
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <div
                    style={{
                      color: "#446644",
                      fontSize: 10,
                      letterSpacing: 3,
                      marginBottom: 8,
                    }}
                  >
                    NEXT WORD:
                  </div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      letterSpacing: 8,
                      fontFamily: "Impact,sans-serif",
                    }}
                  >
                    {WORD_LIST[(roundIdx + 1) % WORD_LIST.length]
                      .split("")
                      .map((ch, i) => (
                        <span
                          key={i}
                          style={{
                            color: LETTER_COLORS[i % LETTER_COLORS.length],
                            opacity: 0.6,
                          }}
                        >
                          {ch}
                        </span>
                      ))}
                  </div>
                </div>
              )}
              <div style={{ display: "flex", gap: 14 }}>
                {roundIdx + 1 < WORD_LIST.length ? (
                  <button
                    onClick={() => handleStart(roundIdx + 1, totalScore)}
                    style={{
                      background: "transparent",
                      border: "2px solid #00cc44",
                      color: "#00ff66",
                      padding: "12px 28px",
                      fontSize: 13,
                      cursor: "pointer",
                      letterSpacing: 3,
                      fontFamily: "'Courier New',monospace",
                      fontWeight: 700,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#00aa33";
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#00ff66";
                    }}
                  >
                    ▶ NEXT ROUND
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setRoundIdx(0);
                      setPhase("menu");
                    }}
                    style={{
                      background: "transparent",
                      border: "2px solid #ffcc00",
                      color: "#ffcc00",
                      padding: "12px 28px",
                      fontSize: 13,
                      cursor: "pointer",
                      letterSpacing: 3,
                      fontFamily: "'Courier New',monospace",
                      fontWeight: 700,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#aa8800";
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#ffcc00";
                    }}
                  >
                    🏅 ALL DONE — PLAY AGAIN
                  </button>
                )}
                <button
                  onClick={() => setPhase("menu")}
                  style={{
                    background: "transparent",
                    border: "2px solid #446644",
                    color: "#668866",
                    padding: "12px 28px",
                    fontSize: 13,
                    cursor: "pointer",
                    letterSpacing: 3,
                    fontFamily: "'Courier New',monospace",
                    fontWeight: 700,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#223322";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#668866";
                  }}
                >
                  ⌂ MENU
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── HUD ── */}
        <div
          style={{
            background: "linear-gradient(180deg,#130000 0%,#0a0000 100%)",
            borderTop: "3px solid #8b0000",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            padding: "4px 12px",
            gap: 6,
            boxShadow: "0 -4px 20px rgba(200,0,0,0.2)",
          }}
        >
          <HudStat
            label="AMMO"
            valId="h-ammo"
            color="#ffcc00"
            glow="#ffaa00"
            init="70"
          />
          <HudStat
            label="HEALTH"
            valId="h-hp"
            color="#ff2200"
            glow="#ff0000"
            init="120%"
          />

          {/* Face */}
          <div
            style={{
              width: 56,
              height: 56,
              border: "3px solid #8b0000",
              borderRadius: 4,
              background: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              boxShadow: "0 0 16px #ff000044 inset",
              flexShrink: 0,
            }}
          >
            <span id="h-face">😤</span>
          </div>

          {/* Word progress — centre piece */}
          <div style={{ textAlign: "center", flex: 1, minWidth: 120 }}>
            <div
              style={{
                fontSize: 8,
                color: "#446644",
                letterSpacing: 3,
                textTransform: "uppercase",
                marginBottom: 3,
              }}
            >
              SPELL · RND {roundIdx + 1}/{WORD_LIST.length}
            </div>
            <div
              id="word-progress"
              style={{
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: 8,
                fontFamily: "Impact,monospace",
                minHeight: 28,
              }}
            >
              {currentWord.split("").map((ch, i) => (
                <span key={i} style={{ color: "#333" }}>
                  {ch}
                </span>
              ))}
            </div>
          </div>

          <HudStat
            label="SCORE"
            valId="h-score"
            color="#00ff66"
            glow="#00ff44"
            init="0"
          />
          <HudStat
            label="KILLS"
            valId="h-kills"
            color="#ff6600"
            glow="#ff4400"
            init="0/20"
          />
        </div>

        <style>{`@keyframes pulse{from{opacity:.5}to{opacity:1}}`}</style>
      </div>
    </div>
  );
}

function HudStat({ label, valId, color, glow, init }) {
  return (
    <div style={{ textAlign: "center", minWidth: 62 }}>
      <div
        style={{
          fontSize: 8,
          color: "#660000",
          letterSpacing: 3,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        id={valId}
        style={{
          fontSize: 24,
          fontWeight: 900,
          color,
          textShadow: `0 0 12px ${glow}`,
          fontFamily: "'Courier New',monospace",
        }}
      >
        {init}
      </div>
    </div>
  );
}

export default DoomGame;
