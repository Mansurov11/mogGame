import { useEffect, useRef, useCallback } from "react";

function Doom() {
  const GW = 640,
    GH = 360,
    HH = GH >> 1;
  const FOV = Math.PI / 3,
    RAYS = 240,
    RSTEP = FOV / RAYS,
    MAXD = 20;
  const MSPD = 0.065,
    RSPD = 0.042;

  const MAP = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1],
    [1, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];
  const MH = MAP.length,
    MW = MAP[0].length;

  function makeTextures() {
    const sz = 64;
    const wall1 = new Uint8Array(sz * sz * 3);
    const wall2 = new Uint8Array(sz * sz * 3);
    const floor = new Uint8Array(sz * sz * 3);
    const ceil = new Uint8Array(sz * sz * 3);
    for (let y = 0; y < sz; y++) {
      for (let x = 0; x < sz; x++) {
        const i = (y * sz + x) * 3;
        const noise =
          (Math.sin(x * 0.9 + y * 0.3) * 18 +
            Math.cos(x * 0.4 - y * 0.7) * 12) |
          0;
        const mortar = x % 16 < 1 || y % 16 < 1 ? -40 : 0;
        const base = 80 + noise + mortar;
        wall1[i] = Math.max(0, Math.min(255, base));
        wall1[i + 1] = Math.max(0, Math.min(255, (base * 0.4) | 0));
        wall1[i + 2] = Math.max(0, Math.min(255, (base * 0.3) | 0));
        const bx = x % 16,
          by = y % 8;
        const brick = by < 1 || bx < 1 ? -50 : 0;
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
    }
    return { wall1, wall2, floor, ceil, sz };
  }

  // Line-of-sight check: returns true if there's a clear line between two points
  function hasLOS(x1, y1, x2, y2) {
    const dx = x2 - x1,
      dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.ceil(dist * 10);
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const cx = x1 + dx * t,
        cy = y1 + dy * t;
      if (MAP[cy | 0][cx | 0] !== 0) return false;
    }
    return true;
  }

  function castRay(px, py, ang) {
    const cos = Math.cos(ang),
      sin = Math.sin(ang);
    let t = 0.02;
    for (let i = 0; i < MAXD * 25; i++) {
      const tx = px + cos * t,
        ty = py + sin * t;
      const mx = tx | 0,
        my = ty | 0;
      if (mx < 0 || my < 0 || mx >= MW || my >= MH) return { d: MAXD, hit: 0 };
      const cell = MAP[my][mx];
      if (cell) {
        const wx = tx - Math.floor(tx),
          wy = ty - Math.floor(ty);
        const tc = Math.abs(cos) > Math.abs(sin) ? wy : wx;
        return { d: t, hit: cell, tc, vert: Math.abs(cos) > Math.abs(sin) };
      }
      t += 0.04;
    }
    return { d: MAXD, hit: 0 };
  }

  function texSample(tex, u, v, sz) {
    const tx = ((u * sz) | (0 + sz)) % sz;
    const ty = ((v * sz) | (0 + sz)) % sz;
    const i = (ty * sz + tx) * 3;
    return [tex[i], tex[i + 1], tex[i + 2]];
  }

  function toARGB(r, g, b, a = 255) {
    return (a << 24) | (b << 16) | (g << 8) | r;
  }

  const TEX = makeTextures();
  const gcRef = useRef(null);
  const mcRef = useRef(null);
  const stateRef = useRef(null);
  const rafRef = useRef(null);
  const lastTRef = useRef(0);
  const phaseRef = useRef("start"); // "start" | "playing" | "dead"
  const hudRef = useRef({
    hp: 100,
    ammo: 50,
    score: 0,
    kills: 0,
    msg: "",
    face: "😤",
    lowAmmo: false,
  });
  const hudElsRef = useRef({});

  function spawnEnemies() {
    return [
      { id: 0, x: 3.5, y: 3.5, hp: 100, alive: true, anim: 0 },
      { id: 1, x: 8.5, y: 5.5, hp: 100, alive: true, anim: Math.PI },
      { id: 2, x: 14.5, y: 9.5, hp: 100, alive: true, anim: 1 },
      { id: 3, x: 4.5, y: 12.5, hp: 100, alive: true, anim: 2 },
      { id: 4, x: 12.5, y: 15.5, hp: 100, alive: true, anim: 0.5 },
      { id: 5, x: 7.5, y: 8.5, hp: 100, alive: true, anim: 1.5 },
      { id: 6, x: 16.5, y: 3.5, hp: 100, alive: true, anim: 0.8 },
      { id: 7, x: 10.5, y: 13.5, hp: 100, alive: true, anim: 2.2 },
    ];
  }

  const startGame = useCallback(() => {
    phaseRef.current = "playing";
    // Force re-render overlay
    const overlay = document.getElementById("doom-overlay");
    const dead = document.getElementById("doom-dead");
    if (overlay) overlay.style.display = "none";
    if (dead) dead.style.display = "none";

    stateRef.current = {
      px: 1.5,
      py: 1.5,
      angle: 0.1,
      health: 100,
      ammo: 50,
      score: 0,
      kills: 0,
      enemies: spawnEnemies(),
      keys: {},
      shootCD: 0,
      flashT: 0,
      hitFlash: 0,
      msg: "",
      msgT: 0,
      zbuf: new Float32Array(RAYS),
      respawnTimer: 0,
    };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    lastTRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  function render() {
    const s = stateRef.current;
    if (!s) return;
    const gc = gcRef.current;
    if (!gc) return;
    const ctx = gc.getContext("2d");
    const imgd = ctx.createImageData(GW, GH);
    const px32 = new Uint32Array(imgd.data.buffer);
    const zbuf = s.zbuf;

    // Floor & ceiling
    for (let y = 0; y < GH; y++) {
      const isFloor = y > HH;
      const yd = isFloor ? y - HH : HH - y;
      if (yd === 0) continue;
      const rowDist = HH / yd;
      const floorX = s.px + Math.cos(s.angle - FOV / 2) * rowDist;
      const floorY = s.py + Math.sin(s.angle - FOV / 2) * rowDist;
      const xStep =
        ((Math.cos(s.angle + FOV / 2) - Math.cos(s.angle - FOV / 2)) *
          rowDist) /
        GW;
      const yStep =
        ((Math.sin(s.angle + FOV / 2) - Math.sin(s.angle - FOV / 2)) *
          rowDist) /
        GW;
      const shade = Math.max(0, Math.min(1, 1 - rowDist / 10));
      for (let x = 0; x < GW; x++) {
        const tu = floorX + xStep * x - Math.floor(floorX + xStep * x);
        const tv = floorY + yStep * x - Math.floor(floorY + yStep * x);
        const tex = isFloor ? TEX.floor : TEX.ceil;
        const [r, g, b] = texSample(tex, tu, tv, TEX.sz);
        const rs = (r * shade) | 0,
          gs = (g * shade) | 0,
          bs = (b * shade) | 0;
        px32[y * GW + x] = toARGB(rs, gs, bs);
      }
    }

    // Walls
    for (let ray = 0; ray < RAYS; ray++) {
      const ang = s.angle - FOV / 2 + ray * RSTEP;
      const { d, hit, tc, vert } = castRay(s.px, s.py, ang);
      const corr = d * Math.cos(ang - s.angle);
      zbuf[ray] = corr;
      if (!hit) continue;
      const wh = Math.min(GH * 2, GH / corr);
      const top = Math.max(0, (HH - wh / 2) | 0);
      const bot = Math.min(GH, (HH + wh / 2) | 0);
      const shade = Math.max(0, 1 - corr / MAXD);
      const darkFactor = vert ? 0.6 : 1.0;
      const tex = hit === 2 ? TEX.wall2 : TEX.wall1;
      const colW = GW / RAYS;
      const x0 = (ray * colW) | 0;
      const x1 = ((ray + 1) * colW) | 0;
      for (let x = x0; x < x1; x++) {
        const tu = tc + ((x - x0) / (x1 - x0)) * 0.01;
        for (let y = top; y < bot; y++) {
          const tv = (y - top) / (bot - top);
          const [r, g, b] = texSample(tex, tu, tv, TEX.sz);
          const f = shade * darkFactor;
          px32[y * GW + x] = toARGB((r * f) | 0, (g * f) | 0, (b * f) | 0);
        }
      }
    }

    // Sprites
    const alive = s.enemies.filter((e) => e.alive);
    const sprites = alive
      .map((e) => {
        const dx = e.x - s.px,
          dy = e.y - s.py;
        return { ...e, dist: Math.sqrt(dx * dx + dy * dy) };
      })
      .sort((a, b) => b.dist - a.dist);

    for (const sp of sprites) {
      const dx = sp.x - s.px,
        dy = sp.y - s.py;
      const spAng = Math.atan2(dy, dx) - s.angle;
      const norm = Math.atan2(Math.sin(spAng), Math.cos(spAng));
      if (Math.abs(norm) > FOV * 0.7) continue;
      const d = sp.dist;
      if (d < 0.25) continue;
      const sprH = Math.min(GH * 2, GH / d);
      const sprW = sprH;
      const screenX = ((norm / FOV + 0.5) * GW) | 0;
      const x0 = Math.max(0, (screenX - sprW / 2) | 0);
      const x1 = Math.min(GW, (screenX + sprW / 2) | 0);
      const y0 = Math.max(0, (HH - sprH / 2) | 0);
      const y1 = Math.min(GH, (HH + sprH / 2) | 0);
      const hpPct = sp.hp / 100;
      const bodyR = Math.floor(180 * (1 - hpPct) + 140 * hpPct);
      const shade = Math.max(0.15, 1 - d / 12);
      const bob = Math.sin(sp.anim * 3) * 2;

      for (let x = x0; x < x1; x++) {
        const ray = Math.floor((x / GW) * RAYS);
        if (ray < 0 || ray >= RAYS || d >= zbuf[ray]) continue;
        const u = (x - x0) / (x1 - x0);
        for (let y = y0; y < y1; y++) {
          const v = (y - y0 + bob) / (y1 - y0);
          if (v < 0 || v > 1) continue;
          let r = 0,
            g = 0,
            b = 0,
            a = 0;
          const cx = u - 0.5,
            cy = v - 0.5;
          const bodyDist = Math.sqrt(cx * cx + cy * 1.3 * (cy * 1.3));
          if (bodyDist < 0.48) {
            const headDist = Math.sqrt(cx * cx + (cy + 0.15) * (cy + 0.15));
            if (v < 0.35 && headDist < 0.28) {
              const le = Math.sqrt(
                (cx + 0.1) * (cx + 0.1) + (cy + 0.02) * (cy + 0.02),
              );
              const re = Math.sqrt(
                (cx - 0.1) * (cx - 0.1) + (cy + 0.02) * (cy + 0.02),
              );
              if (le < 0.06 || re < 0.06) {
                r = 255;
                g = 220;
                b = 0;
              } else if (le < 0.09 || re < 0.09) {
                r = 0;
                g = 0;
                b = 0;
              } else {
                r = (bodyR * 0.8) | 0;
                g = (bodyR * 0.2) | 0;
                b = (bodyR * 0.1) | 0;
              }
              a = 255;
            } else if (v > 0.55 && v < 0.65 && Math.abs(cx) < 0.2) {
              r = 200;
              g = 20;
              b = 10;
              a = 255;
            } else if (v < 0.12 && Math.abs(cx) > 0.1 && Math.abs(cx) < 0.25) {
              r = (bodyR * 0.5) | 0;
              g = (bodyR * 0.15) | 0;
              b = 0;
              a = 255;
            } else if (
              v > 0.4 &&
              v < 0.75 &&
              Math.abs(cx) > 0.35 &&
              Math.abs(cx) < 0.5
            ) {
              r = (bodyR * 0.7) | 0;
              g = (bodyR * 0.2) | 0;
              b = (bodyR * 0.1) | 0;
              a = 200;
            } else if (
              v >= 0.35 ||
              Math.sqrt(cx * cx + (cy + 0.15) * (cy + 0.15)) >= 0.28
            ) {
              r = (bodyR * 0.9) | 0;
              g = (bodyR * 0.25) | 0;
              b = (bodyR * 0.15) | 0;
              a = 230;
            }
          }
          if (a > 0) {
            px32[y * GW + x] = toARGB(
              (r * shade) | 0,
              (g * shade) | 0,
              (b * shade) | 0,
              a,
            );
          }
        }
      }
    }

    // Muzzle flash
    if (s.flashT > 0) {
      const fx = (GW / 2) | 0,
        fy = (GH * 0.72) | 0;
      const fr = s.flashT / 8;
      const rad = (50 * fr) | 0;
      for (let dy = -rad; dy <= rad; dy++) {
        for (let dx = -rad; dx <= rad; dx++) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > rad) continue;
          const ppx = fx + dx,
            ppy = fy + dy;
          if (ppx < 0 || ppx >= GW || ppy < 0 || ppy >= GH) continue;
          const f = Math.max(0, 1 - dist / rad) * fr;
          const idx = ppy * GW + ppx;
          const cr = imgd.data[idx * 4] || 0;
          const cg = imgd.data[idx * 4 + 1] || 0;
          const cb = imgd.data[idx * 4 + 2] || 0;
          px32[idx] = toARGB(
            Math.min(255, (cr + 255 * f) | 0),
            Math.min(255, (cg + 180 * f) | 0),
            Math.min(255, (cb + 30 * f) | 0),
          );
        }
      }
    }

    // Hit flash
    if (s.hitFlash > 0) {
      const alpha = ((s.hitFlash / 10) * 80) | 0;
      for (let i = 0; i < GW * GH; i++) {
        const cr = px32[i] & 0xff;
        px32[i] = (px32[i] & 0xff00ffff) | (Math.min(255, cr + alpha) & 0xff);
      }
    }

    ctx.putImageData(imgd, 0, 0);
    drawGun(ctx, s.flashT > 0);

    // Crosshair
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 1.5;
    const cx2 = GW / 2,
      cy2 = GH / 2;
    ctx.beginPath();
    ctx.moveTo(cx2 - 12, cy2);
    ctx.lineTo(cx2 + 12, cy2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx2, cy2 - 12);
    ctx.lineTo(cx2, cy2 + 12);
    ctx.stroke();
    // Crosshair dot
    ctx.fillStyle = "rgba(255,80,80,0.9)";
    ctx.beginPath();
    ctx.arc(cx2, cy2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawGun(ctx, firing) {
    const gx = GW / 2,
      gy = GH;
    const bob = firing ? -32 : -Math.sin(Date.now() / 300) * 4;
    ctx.save();
    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.ellipse(gx, gy - 10 + bob, 42, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    // Main barrel
    ctx.fillStyle = "#4a4a4a";
    ctx.fillRect(gx - 7, gy - 145 + bob, 14, 95);
    // Lower frame
    ctx.fillStyle = "#3a3a3a";
    ctx.fillRect(gx - 12, gy - 88 + bob, 24, 62);
    // Handle
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(gx - 8, gy - 58 + bob, 16, 52);
    // Handle grip lines
    ctx.fillStyle = "#222";
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(gx - 7, gy - 50 + bob + i * 8, 14, 3);
    }
    // Side details
    ctx.fillStyle = "#555";
    ctx.fillRect(gx - 12, gy - 82 + bob, 5, 22);
    ctx.fillRect(gx + 7, gy - 82 + bob, 5, 22);
    // Top rail
    ctx.fillStyle = "#666";
    ctx.fillRect(gx - 5, gy - 148 + bob, 10, 12);
    // Muzzle brake
    ctx.fillStyle = "#888";
    ctx.fillRect(gx - 5, gy - 154 + bob, 10, 12);
    ctx.fillStyle = "#999";
    ctx.fillRect(gx - 3, gy - 158 + bob, 6, 6);
    // Ejection port
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(gx + 4, gy - 110 + bob, 6, 14);
    // Trigger guard
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(gx, gy - 58 + bob, 8, 0, Math.PI);
    ctx.stroke();

    if (firing) {
      // Muzzle flash
      const grad = ctx.createRadialGradient(
        gx,
        gy - 160 + bob,
        0,
        gx,
        gy - 160 + bob,
        28,
      );
      grad.addColorStop(0, "rgba(255,255,200,1)");
      grad.addColorStop(0.4, "rgba(255,180,0,0.8)");
      grad.addColorStop(1, "rgba(255,60,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(gx, gy - 160 + bob, 28, 0, Math.PI * 2);
      ctx.fill();
      // Sparks
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const len = 10 + Math.random() * 22;
        ctx.strokeStyle = `rgba(255,${(150 + Math.random() * 105) | 0},0,0.8)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(gx, gy - 160 + bob);
        ctx.lineTo(gx + Math.cos(a) * len, gy - 160 + bob + Math.sin(a) * len);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawMinimap() {
    const s = stateRef.current;
    if (!s) return;
    const mc = mcRef.current;
    if (!mc) return;
    const mctx = mc.getContext("2d");
    const cs = 5;
    mctx.clearRect(0, 0, MW * cs, MH * cs);
    for (let y = 0; y < MH; y++) {
      for (let x = 0; x < MW; x++) {
        const c = MAP[y][x];
        mctx.fillStyle = c === 2 ? "#660000" : c ? "#2a2a2a" : "#111";
        mctx.fillRect(x * cs + 0.5, y * cs + 0.5, cs - 1, cs - 1);
      }
    }
    for (const e of s.enemies) {
      if (!e.alive) continue;
      // Color indicates LOS to player
      const los = hasLOS(e.x, e.y, s.px, s.py);
      mctx.fillStyle = los
        ? `hsl(${e.hp * 1.2},100%,45%)`
        : `hsl(${e.hp * 1.2},60%,30%)`;
      mctx.fillRect(e.x * cs - 2, e.y * cs - 2, 4, 4);
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

  function updateHUD() {
    const s = stateRef.current;
    if (!s) return;
    const els = hudElsRef.current;
    if (els.hp) els.hp.textContent = Math.max(0, s.health | 0) + "%";
    if (els.ammo) els.ammo.textContent = s.ammo;
    if (els.score) els.score.textContent = s.score;
    if (els.kills) els.kills.textContent = s.kills;
    if (els.face) {
      const face =
        s.health <= 0
          ? "💀"
          : s.health > 70
            ? "😤"
            : s.health > 40
              ? "😨"
              : "🤕";
      els.face.textContent = face;
    }
    if (els.ammoWarn)
      els.ammoWarn.style.display = s.ammo < 10 && s.ammo > 0 ? "block" : "none";
    if (els.msg) {
      if (s.msgT > 0) {
        els.msg.textContent = s.msg;
        els.msg.style.opacity = "1";
      } else {
        els.msg.style.opacity = "0";
      }
    }
  }

  function loop(t) {
    const dt = Math.min((t - lastTRef.current) / 16, 4);
    lastTRef.current = t;
    const s = stateRef.current;
    if (!s) return;

    if (s.health <= 0) {
      render();
      drawMinimap();
      updateHUD();
      const dead = document.getElementById("doom-dead");
      if (dead) {
        dead.style.display = "flex";
        const ds = document.getElementById("doom-dead-score");
        if (ds) ds.textContent = `Score: ${s.score} | Kills: ${s.kills}`;
      }
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

    // Shoot — with wall check via zbuf
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
          dy = e.y - s.py;
        const d2 = Math.sqrt(dx * dx + dy * dy);
        if (d2 > 10) continue;
        const ea = Math.atan2(dy, dx);
        const diff = Math.abs(
          Math.atan2(Math.sin(ea - s.angle), Math.cos(ea - s.angle)),
        );
        if (diff < 0.22 && d2 < best) {
          // ✅ FIX: Check line of sight — can't shoot through walls
          if (hasLOS(s.px, s.py, e.x, e.y)) {
            best = d2;
            hitE = e;
          }
        }
      }
      if (hitE) {
        const dmg = 25 + ((Math.random() * 30) | 0);
        hitE.hp -= dmg;
        if (hitE.hp <= 0) {
          hitE.alive = false;
          s.kills++;
          s.score += 100 + Math.floor(best * 10);
          s.msg = "💀 KILL!";
          s.msgT = 50;
        } else {
          s.msg = `HIT! -${dmg}`;
          s.msgT = 28;
        }
      }
    }

    // Ammo respawn
    if (s.ammo <= 0 && s.respawnTimer === 0) s.respawnTimer = 360;
    if (s.respawnTimer > 0) {
      s.respawnTimer -= dt;
      if (s.respawnTimer <= 0) {
        s.ammo = 30;
        s.msg = "🔋 AMMO REFILL!";
        s.msgT = 80;
        s.respawnTimer = 0;
      }
    }

    // Enemy AI — only damage player if LOS
    for (const e of s.enemies) {
      if (!e.alive) continue;
      e.anim += 0.04 * dt;
      const dx = s.px - e.x,
        dy = s.py - e.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 14 && d > 0.6) {
        // Only move toward player if has LOS
        const los = hasLOS(e.x, e.y, s.px, s.py);
        if (los) {
          const spd = 0.012 * dt;
          const enx = e.x + (dx / d) * spd,
            eny = e.y + (dy / d) * spd;
          if (MAP[e.y | 0][enx | 0] === 0) e.x = enx;
          if (MAP[eny | 0][e.x | 0] === 0) e.y = eny;
        }
      }

      if (d < 0.9 && hasLOS(e.x, e.y, s.px, s.py)) {
        s.health -= 0.12 * dt;
        s.hitFlash = 6;
      }
    }
    s.health = Math.max(0, s.health);

    render();
    drawMinimap();
    updateHUD();
    rafRef.current = requestAnimationFrame(loop);
  }

  useEffect(() => {
    // Cache HUD elements
    hudElsRef.current = {
      hp: document.getElementById("h-hp"),
      ammo: document.getElementById("h-ammo"),
      score: document.getElementById("h-score"),
      kills: document.getElementById("h-kills"),
      face: document.getElementById("h-face"),
      ammoWarn: document.getElementById("ammo-warn"),
      msg: document.getElementById("doom-msg"),
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

    // Draw initial black frame
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

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background: "#000",
        fontFamily: "'Courier New', monospace",
      }}
    >
      <div style={{ position: "relative", width: 640 }}>
        {/* Game canvas */}
        <div style={{ position: "relative" }}>
          <canvas
            ref={gcRef}
            id="gc"
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

          {/* Kill/Hit message */}
          <div
            id="doom-msg"
            style={{
              position: "absolute",
              top: "42%",
              left: "50%",
              transform: "translateX(-50%)",
              color: "#ff2200",
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: 4,
              textShadow: "0 0 20px #ff0000",
              pointerEvents: "none",
              opacity: 0,
              transition: "opacity 0.1s",
              whiteSpace: "nowrap",
            }}
          />

          {/* Low ammo warning */}
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
              pointerEvents: "none",
              display: "none",
              fontWeight: 700,
              textShadow: "0 0 8px #ffaa00",
              animation: "pulse 0.5s infinite alternate",
            }}
          >
            ⚠ LOW AMMO
          </div>

          {/* Dead screen */}
          <div
            id="doom-dead"
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(110,0,0,0.88)",
              display: "none",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 15,
              backdropFilter: "blur(2px)",
            }}
          >
            <div style={{ fontSize: 72, marginBottom: 8 }}>💀</div>
            <h2
              style={{
                fontSize: 56,
                color: "#fff",
                fontWeight: 900,
                letterSpacing: 4,
                fontFamily: "Impact, sans-serif",
                textShadow: "0 0 40px #ff0000, 0 4px 0 #880000",
                margin: 0,
              }}
            >
              YOU DIED
            </h2>
            <p
              id="doom-dead-score"
              style={{
                color: "#ffaaaa",
                margin: "14px 0 28px",
                fontSize: 14,
                letterSpacing: 2,
              }}
            />
            <button
              onClick={startGame}
              style={{
                background: "transparent",
                border: "2px solid #ff4444",
                color: "#ff6666",
                padding: "12px 36px",
                fontSize: 14,
                cursor: "pointer",
                letterSpacing: 3,
                fontFamily: "'Courier New', monospace",
                transition: "all 0.2s",
                fontWeight: 700,
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#ff2200";
                e.target.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
                e.target.style.color = "#ff6666";
              }}
            >
              ▶ TRY AGAIN
            </button>
          </div>

          {/* Start overlay */}
          <div
            id="doom-overlay"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background:
                "radial-gradient(ellipse at center, #1a0000 0%, #000 100%)",
              zIndex: 20,
            }}
          >
            {/* Decorative scanlines */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative", textAlign: "center" }}>
              <h1
                style={{
                  fontSize: 88,
                  fontWeight: 900,
                  color: "#ff0000",
                  letterSpacing: 8,
                  fontFamily: "Impact, sans-serif",
                  textShadow:
                    "0 0 60px #ff0000, 0 0 120px #880000, 0 6px 0 #550000",
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
                  letterSpacing: 8,
                  marginBottom: 6,
                }}
              >
                ⚔ RAYCASTER EDITION ⚔
              </div>
              <div
                style={{
                  width: "100%",
                  height: 1,
                  background:
                    "linear-gradient(90deg, transparent, #880000, transparent)",
                  marginBottom: 32,
                }}
              />
              <button
                onClick={startGame}
                style={{
                  background: "transparent",
                  border: "2px solid #cc0000",
                  color: "#ff2200",
                  padding: "14px 52px",
                  fontSize: 16,
                  fontFamily: "'Courier New', monospace",
                  letterSpacing: 5,
                  cursor: "pointer",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  transition: "all 0.2s",
                  display: "block",
                  margin: "0 auto 20px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#cc0000";
                  e.target.style.color = "#fff";
                  e.target.style.boxShadow = "0 0 30px #ff000088";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                  e.target.style.color = "#ff2200";
                  e.target.style.boxShadow = "none";
                }}
              >
                ▶ START GAME
              </button>
              <div
                style={{
                  color: "#440000",
                  fontSize: 10,
                  letterSpacing: 2,
                  lineHeight: 2.2,
                }}
              >
                WASD / ARROWS — Move &amp; Turn
                <br />
                SPACE / F / CLICK — Shoot
                <br />
                <span style={{ color: "#664400" }}>
                  ✓ Wall-accurate shooting & damage
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* HUD */}
        <div
          style={{
            background: "linear-gradient(180deg, #130000 0%, #0a0000 100%)",
            borderTop: "3px solid #8b0000",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            padding: "6px 16px",
            gap: 8,
            boxShadow: "0 -4px 20px rgba(200,0,0,0.2)",
          }}
        >
          <HudStat
            label="AMMO"
            valId="h-ammo"
            color="#ffcc00"
            glow="#ffaa00"
            init="50"
          />
          <HudStat
            label="HEALTH"
            valId="h-hp"
            color="#ff2200"
            glow="#ff0000"
            init="100%"
          />
          <div
            style={{
              width: 64,
              height: 64,
              border: "3px solid #8b0000",
              borderRadius: 4,
              background: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              boxShadow: "0 0 20px #ff000044 inset, 0 0 10px #ff000022",
            }}
          >
            <span id="h-face">😤</span>
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
            init="0"
          />
        </div>

        <style>{`
          @keyframes pulse { from { opacity: 0.5 } to { opacity: 1 } }
        `}</style>
      </div>
    </div>
  );
}

function HudStat({ label, valId, color, glow, init }) {
  return (
    <div style={{ textAlign: "center", minWidth: 70 }}>
      <div
        style={{
          fontSize: 9,
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
          fontSize: 26,
          fontWeight: 900,
          color,
          textShadow: `0 0 12px ${glow}`,
          fontFamily: "'Courier New', monospace",
        }}
      >
        {init}
      </div>
    </div>
  );
}
export default Doom;
