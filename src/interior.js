import {
  THREE, C, MAT, world, part,
  canvasTexture, roundRect, box, plane, disc, cylinder, roundedBox,
  addGlowSprite, addLabelPlane,
} from './core.js';
import { STORE } from './config.js';

const JP = '"Yu Gothic", "Hiragino Kaku Gothic ProN", "Meiryo", "Noto Sans JP", sans-serif';
const EN = '"Avenir Next", "Futura", "Century Gothic", "Trebuchet MS", sans-serif';

export const interiorLights = [];
export const interiorInfo = {
  lightPanels: [],
  fridgeGlow: null,
  neonSigns: [],
};

/* ------------------------------------------------------------------ */
/*  Textures                                                           */
/* ------------------------------------------------------------------ */

const floorTex = canvasTexture(512, 512, (ctx, w, h) => {
  ctx.fillStyle = '#d8d0be';
  ctx.fillRect(0, 0, w, h);
  const n = 8;
  const s = w / n;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const warm = (x + y) % 2 === 0;
      ctx.fillStyle = warm ? '#ddd5c3' : '#d3cbb9';
      ctx.fillRect(x * s + 1.5, y * s + 1.5, s - 3, s - 3);
      ctx.globalAlpha = 0.09;
      for (let i = 0; i < 12; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#fff8e9' : '#8d877a';
        ctx.fillRect(x * s + Math.random() * s, y * s + Math.random() * s, 2, 1);
      }
      ctx.globalAlpha = 1;
    }
  }
  ctx.strokeStyle = 'rgba(102,96,84,0.25)';
  ctx.lineWidth = 2;
  for (let i = 0; i <= n; i++) {
    ctx.beginPath();
    ctx.moveTo(i * s, 0);
    ctx.lineTo(i * s, h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * s);
    ctx.lineTo(w, i * s);
    ctx.stroke();
  }
}, { repeat: [3.8, 4.4] });

const priceStripTex = canvasTexture(1024, 64, (ctx, w, h) => {
  ctx.fillStyle = '#f4f0e6';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#d9d4c7';
  ctx.fillRect(0, h - 6, w, 6);
  for (let i = 0; i < 16; i++) {
    const x = i * 64 + 6;
    ctx.fillStyle = i % 3 === 0 ? '#e5563f' : i % 3 === 1 ? '#e4ae39' : '#2c7b70';
    ctx.fillRect(x + 8, 20, 34, 18);
    ctx.fillStyle = '#4e4a43';
    ctx.fillRect(x + 15, 44, 21, 3);
  }
  // Fine tick marks.
  ctx.fillStyle = 'rgba(80,76,68,0.3)';
  for (let x = 0; x < w; x += 64) ctx.fillRect(x, 0, 1, h);
}, { repeat: [1.2, 1] });

const fridgeBackTex = canvasTexture(1024, 512, (ctx, w, h) => {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#e8f6fb');
  g.addColorStop(0.5, '#c7e5ef');
  g.addColorStop(1, '#a8cddd');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 0.18;
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(30 + i * 82, 0, 2, h);
  }
  ctx.globalAlpha = 1;
  const glow = ctx.createRadialGradient(w * 0.5, h * 0.32, 12, w * 0.5, h * 0.32, h * 0.8);
  glow.addColorStop(0, 'rgba(255,255,255,0.7)');
  glow.addColorStop(0.7, 'rgba(255,255,255,0.08)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
});

const drinksHeaderTex = canvasTexture(1536, 240, (ctx, w, h) => {
  ctx.fillStyle = '#eff7f4';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#0b5251';
  ctx.fillRect(0, 0, w, 18);
  ctx.fillStyle = '#0b5251';
  ctx.font = `bold 88px ${JP}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('つめたい飲みもの', w / 2, 94);
  ctx.fillStyle = '#3a8177';
  ctx.font = `600 42px ${EN}`;
  ctx.fillText('COLD DRINKS  ·  ICE COLD  ·  HOSHIZORA', w / 2, 167);
  ctx.strokeStyle = 'rgba(16,82,78,0.16)';
  ctx.lineWidth = 3;
  ctx.strokeRect(24, 32, w - 48, h - 56);
});

function magazineTexture(variant, title, sub, colors) {
  return canvasTexture(256, 344, (ctx, w, h) => {
    ctx.fillStyle = colors[0];
    ctx.fillRect(0, 0, w, h);
    // A soft geometric cover illustration.
    ctx.fillStyle = colors[1];
    ctx.beginPath();
    ctx.arc(182, 92, 64, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = colors[2];
    ctx.beginPath();
    ctx.arc(85, 158, 85, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.84)';
    ctx.beginPath();
    ctx.moveTo(0, 236);
    ctx.quadraticCurveTo(126, 177, 256, 224);
    ctx.lineTo(256, 344);
    ctx.lineTo(0, 344);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = colors[3];
    ctx.fillRect(0, 0, w, 58);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 25px ${JP}`;
    ctx.textAlign = 'left';
    ctx.fillText(title, 15, 36);
    ctx.fillStyle = '#24343a';
    ctx.font = `bold 20px ${JP}`;
    ctx.fillText(sub, 15, 266);
    ctx.fillStyle = 'rgba(30,40,42,0.55)';
    ctx.font = `12px ${EN}`;
    ctx.fillText(`HOSHIZORA WEEKLY  ·  0${(variant % 9) + 1}`, 15, 294);
    ctx.fillStyle = colors[3];
    ctx.fillRect(15, 307, 76, 3);
    ctx.fillRect(15, 316, 48, 3);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(6, 6, w - 12, h - 12);
  });
}

const magazineCovers = [
  magazineTexture(0, '星夜グラフィティ', '夜の街を歩く', ['#e9c578', '#315d5d', '#de6d4e', '#174c4c']),
  magazineTexture(1, 'COMIC つきあかり', '第12話 雨のあとで', ['#d9b1bf', '#6c3851', '#e8cf91', '#5a2d43']),
  magazineTexture(2, '暮らしと灯り', '小さな部屋の冬', ['#aecdd2', '#2d5f6d', '#e6b45f', '#24525c']),
  magazineTexture(3, '月刊 星屑', '深夜二時の珈琲', ['#b7c6ad', '#335247', '#d78d5f', '#29433b']),
];

function hangingSignTexture(ja, en, accent = '#175e59') {
  return canvasTexture(768, 224, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#f6efdf';
    roundRect(ctx, 7, 7, w - 14, h - 14, 16);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 8;
    roundRect(ctx, 12, 12, w - 24, h - 24, 12);
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold 88px ${JP}`;
    ctx.fillText(ja, w / 2, 91);
    ctx.font = `600 30px ${EN}`;
    ctx.fillStyle = '#47736d';
    ctx.fillText(en, w / 2, 165);
    // Star bullet.
    ctx.fillStyle = '#e89a58';
    for (const x of [72, w - 72]) {
      ctx.beginPath();
      ctx.arc(x, 112, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

const signOden = hangingSignTexture('おにぎり・お弁当', 'RICE BALLS & BENTO', '#22665d');
const signDrinks = hangingSignTexture('飲みもの', 'COLD & HOT DRINKS', '#1e5a73');
const signSnacks = hangingSignTexture('ホットスナック', 'HOT SNACK', '#9b503b');
const signMagazines = hangingSignTexture('雑誌・コミック', 'MAGAZINES', '#5a4a70');

function menuTexture() {
  return canvasTexture(768, 768, (ctx, w, h) => {
    ctx.fillStyle = '#1d2b2b';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#d3b26d';
    ctx.lineWidth = 6;
    ctx.strokeRect(18, 18, w - 36, h - 36);
    ctx.fillStyle = '#e9d4a2';
    ctx.textAlign = 'center';
    ctx.font = `600 36px ${EN}`;
    ctx.fillText('HOSHIZORA COFFEE', w / 2, 92);
    ctx.strokeStyle = 'rgba(237,220,181,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(92, 120);
    ctx.lineTo(w - 92, 120);
    ctx.stroke();
    ctx.fillStyle = '#f4ead5';
    ctx.textAlign = 'left';
    ctx.font = `bold 52px ${JP}`;
    const items = [
      ['ブレンドコーヒー', '¥160'],
      ['カフェラテ', '¥220'],
      ['ほうじ茶ラテ', '¥200'],
      ['ホットスナック', '¥180'],
      ['おにぎり', '¥150'],
      ['肉まん', '¥140'],
    ];
    items.forEach(([name, price], i) => {
      const y = 202 + i * 82;
      ctx.fillStyle = '#f0e4ca';
      ctx.font = `42px ${JP}`;
      ctx.fillText(name, 80, y);
      ctx.fillStyle = '#e3b356';
      ctx.textAlign = 'right';
      ctx.fillText(price, w - 80, y);
      ctx.textAlign = 'left';
    });
    ctx.fillStyle = '#92b9a7';
    ctx.font = `24px ${EN}`;
    ctx.fillText('OPEN 24 HOURS', 80, h - 58);
    ctx.textAlign = 'right';
    ctx.fillText('星夜町二丁目', w - 80, h - 58);
  });
}

function clockTexture() {
  return canvasTexture(256, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#f4efdf';
    ctx.beginPath();
    ctx.arc(128, 128, 118, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#255d58';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(128, 128, 110, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#203c3b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold 24px ${EN}`;
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6 - Math.PI / 2;
      ctx.fillText(String(i === 0 ? 12 : i), 128 + Math.cos(a) * 88, 128 + Math.sin(a) * 88);
    }
    ctx.strokeStyle = '#223d3b';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(128, 128);
    ctx.lineTo(128, 58);
    ctx.stroke();
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(128, 128);
    ctx.lineTo(173, 151);
    ctx.stroke();
    ctx.fillStyle = '#c7654e';
    ctx.beginPath();
    ctx.arc(128, 128, 7, 0, Math.PI * 2);
    ctx.fill();
  });
}

const magazineRackSignTex = canvasTexture(768, 192, (ctx, w, h) => {
  ctx.fillStyle = '#f4efdf';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#1c5954';
  ctx.fillRect(0, 0, 26, h);
  ctx.fillStyle = '#1c5954';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold 74px ${JP}`;
  ctx.fillText('雑誌・コミック', w / 2, 80);
  ctx.fillStyle = '#5e7f77';
  ctx.font = `600 31px ${EN}`;
  ctx.fillText('MAGAZINES  &  COMICS', w / 2, 144);
});

const windowStickerTex = canvasTexture(1024, 280, (ctx, w, h) => {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(250,245,226,0.96)';
  roundRect(ctx, 10, 10, w - 20, h - 20, 30);
  ctx.fill();
  ctx.fillStyle = '#155b58';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold 75px ${JP}`;
  ctx.fillText('24時間 営業中', w / 2, 100);
  ctx.fillStyle = '#4c7b72';
  ctx.font = `600 38px ${EN}`;
  ctx.fillText('OPEN EVERY NIGHT  ·  HOSHIZORA MART', w / 2, 185);
  ctx.fillStyle = '#ef815f';
  ctx.beginPath();
  ctx.arc(80, 194, 10, 0, Math.PI * 2);
  ctx.fill();
});

const coffeeNeonTex = canvasTexture(512, 200, (ctx, w, h) => {
  ctx.clearRect(0, 0, w, h);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#ff6f8f';
  ctx.shadowBlur = 26;
  ctx.strokeStyle = '#ff8aa2';
  ctx.lineWidth = 8;
  ctx.font = `bold 102px ${EN}`;
  ctx.strokeText('OPEN', w / 2, 92);
  ctx.fillStyle = '#ffd9e2';
  ctx.fillText('OPEN', w / 2, 92);
  ctx.shadowBlur = 12;
  ctx.font = `600 27px ${JP}`;
  ctx.fillStyle = '#ffe5d1';
  ctx.fillText('深夜も、あかりを。', w / 2, 161);
});

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function addPointLight(x, y, z, color, baseIntensity, distance) {
  const light = new THREE.PointLight(color, baseIntensity, distance, 2);
  light.position.set(x, y, z);
  world.add(light);
  interiorLights.push({ light, baseIntensity });
  return light;
}

function makeProductInstances(parent, specs) {
  if (!specs.length) return null;
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshToonMaterial({
    color: 0xffffff,
    gradientMap: MAT.cream.gradientMap,
  });
  const mesh = new THREE.InstancedMesh(geo, mat, specs.length);
  const dummy = new THREE.Object3D();
  const col = new THREE.Color();
  specs.forEach((p, i) => {
    dummy.position.set(p.x, p.y, p.z);
    dummy.rotation.set(0, p.ry || 0, 0);
    dummy.scale.set(p.w, p.h, p.d);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    col.setHex(p.color);
    mesh.setColorAt(i, col);
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  parent.add(mesh);
  return mesh;
}

function makeBottleInstances(parent, specs) {
  if (!specs.length) return null;
  const geo = new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
  const mat = new THREE.MeshToonMaterial({
    color: 0xffffff,
    gradientMap: MAT.cream.gradientMap,
  });
  const mesh = new THREE.InstancedMesh(geo, mat, specs.length);
  const dummy = new THREE.Object3D();
  const col = new THREE.Color();
  specs.forEach((p, i) => {
    dummy.position.set(p.x, p.y, p.z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(p.r * 2, p.h, p.r * 2);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    col.setHex(p.color);
    mesh.setColorAt(i, col);
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  parent.add(mesh);
  return mesh;
}

/* ------------------------------------------------------------------ */
/*  Shop interior                                                      */
/* ------------------------------------------------------------------ */

export function buildInterior() {
  const shell = part(3.05, { from: [0, -2.35, 0], duration: 1.15 });
  const fixtures = part(3.34, { from: [0, -2.0, 0], duration: 1.1 });
  const fresh = part(3.62, { from: [0, -1.65, 0], duration: 1.05 });
  const stock = part(3.82, { from: [0, -1.35, 0], duration: 1.0, scaleFrom: 0.86 });
  const counterPart = part(4.05, { from: [0, -1.3, 0], duration: 1.0 });
  const dressing = part(4.28, { from: [0, 0.7, 0], duration: 1.1 });

  const floorMat = new THREE.MeshToonMaterial({
    color: 0xead7b8,
    map: floorTex,
    gradientMap: MAT.cream.gradientMap,
  });
  const floor = plane(shell, 8.18, 9.38, floorMat, 6.2, STORE.floorY + 0.005, -3.8, {
    rot: [-Math.PI / 2, 0, 0],
    receive: true,
  });
  floor.renderOrder = 1;

  // Entrance interior arrow, polished onto the tile.
  const arrowMat = new THREE.MeshBasicMaterial({
    color: 0x2e7c6f,
    transparent: true,
    opacity: 0.45,
  });
  for (let i = 0; i < 3; i++) {
    plane(shell, 0.65 - i * 0.1, 0.3, arrowMat, 7.9, STORE.floorY + 0.012, 0.33 - i * 0.42, {
      rot: [-Math.PI / 2, 0, 0],
      renderOrder: 2,
    });
  }

  // Ceiling.
  const ceilingMat = new THREE.MeshToonMaterial({
    color: 0xf4eddd,
    gradientMap: MAT.cream.gradientMap,
  });
  plane(shell, 8.05, 9.25, ceilingMat, 6.2, STORE.ceilingY, -3.8, {
    rot: [Math.PI / 2, 0, 0],
    receive: true,
  });

  // Ceiling beams and track.
  for (const z of [-6.8, -4.4, -2.0, 0.25]) {
    box(shell, 8.0, 0.08, 0.09, MAT.toon(0xd8d0c0), 6.2, STORE.ceilingY - 0.045, z, {
      cast: false, receive: false, edges: false,
    });
  }
  for (const x of [3.15, 9.25]) {
    box(shell, 0.08, 0.08, 9.2, MAT.toon(0xd8d0c0), x, STORE.ceilingY - 0.045, -3.8, {
      cast: false, receive: false, edges: false,
    });
  }

  // Light panels — the warm heart of the shop.
  const lightMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xffecc4).multiplyScalar(1.08),
    toneMapped: false,
  });
  const panelPositions = [];
  for (const z of [-6.5, -4.15, -1.8, 0.3]) {
    for (const x of [4.4, 6.1, 7.8]) {
      panelPositions.push([x, z]);
    }
  }
  for (const [x, z] of panelPositions) {
    const p = box(shell, 1.05, 0.045, 0.28, lightMat, x, STORE.ceilingY - 0.055, z, {
      cast: false, receive: false, edges: false,
    });
    p.renderOrder = 2;
    addGlowSprite(shell, 0xffe0a4, x, STORE.ceilingY - 0.08, z, 1.6, 0.09);
  }

  // Interior wall trim and a highly visible back wall above the fridges.
  box(shell, 8.0, 0.14, 0.07, MAT.teal, 6.2, 3.9, -8.34, { cast: false, edges: false });
  box(shell, 0.07, 3.5, 9.2, MAT.toon(0xe4dbc9), 10.28, 2.3, -3.8, { cast: false, edges: false });

  // Wall clock.
  const clock = addLabelPlane(
    dressing, clockTexture(), 0.65, 0.65,
    10.22, 3.2, -1.25,
    { rot: [0, -Math.PI / 2, 0], transparent: true, toneMapped: false }
  );

  // Small framed notice.
  const noticeTex = canvasTexture(320, 440, (ctx, w, h) => {
    ctx.fillStyle = '#f0eadb';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#28625b';
    ctx.fillRect(0, 0, w, 58);
    ctx.fillStyle = '#fff8e7';
    ctx.textAlign = 'center';
    ctx.font = `bold 26px ${JP}`;
    ctx.fillText('お知らせ', w / 2, 39);
    ctx.fillStyle = '#4b5652';
    ctx.textAlign = 'left';
    ctx.font = `20px ${JP}`;
    const lines = ['・深夜も元気に営業中', '・ホットコーヒー始めました', '・雨の日はあたたかく', '・落とし物にご注意を', '・星夜町二丁目'];
    lines.forEach((line, i) => ctx.fillText(line, 32, 120 + i * 54));
    ctx.fillStyle = '#cf7e55';
    ctx.beginPath();
    ctx.arc(w - 52, h - 42, 18, 0, Math.PI * 2);
    ctx.fill();
  });
  const notice = addLabelPlane(
    dressing, noticeTex, 0.7, 0.95,
    10.22, 2.1, -0.3,
    { rot: [0, -Math.PI / 2, 0], toneMapped: false }
  );

  /* ---------------- Refrigerated drink wall ---------------- */
  const fridgeGroup = new THREE.Group();
  fixtures.add(fridgeGroup);

  const fridgeX0 = 3.18;
  const fridgeX1 = 9.5;
  const fridgeZ = -8.16;
  const fridgeW = fridgeX1 - fridgeX0;
  const fridgeH = 3.14;
  const cabinetY = STORE.floorY + 0.05 + fridgeH / 2;

  // Bright glowing interior plane.
  const backMat = new THREE.MeshBasicMaterial({
    map: fridgeBackTex,
    color: new THREE.Color(0xdff3ff).multiplyScalar(0.95),
    toneMapped: false,
  });
  plane(fridgeGroup, fridgeW - 0.12, fridgeH - 0.1, backMat, (fridgeX0 + fridgeX1) / 2, cabinetY, -8.38, {
    rot: [0, 0, 0],
  });

  // Open cabinet frame — deliberately not a solid box, so the cold wall glows through.
  for (const x of [fridgeX0 - 0.04, fridgeX1 + 0.04]) {
    box(fridgeGroup, 0.12, fridgeH + 0.1, 0.58, MAT.toon(0x273b3a), x, cabinetY, -8.08, {
      edges: true, edgeOpacity: 0.3,
    });
  }
  box(fridgeGroup, fridgeW + 0.16, 0.16, 0.72, MAT.toon(0xe4ddcd), (fridgeX0 + fridgeX1) / 2, cabinetY + fridgeH / 2 + 0.13, -8.07, {
    edges: false,
  });
  box(fridgeGroup, fridgeW + 0.16, 0.23, 0.7, MAT.toon(0x2e3d3c), (fridgeX0 + fridgeX1) / 2, STORE.floorY + 0.13, -8.07, {
    edges: false,
  });
  box(fridgeGroup, fridgeW + 0.12, 0.1, 0.7, MAT.toon(0x273b3a), (fridgeX0 + fridgeX1) / 2, cabinetY - fridgeH / 2 + 0.06, -8.07, {
    edges: false,
  });

  // Internal shelves.
  const shelfYs = [1.02, 1.79, 2.56];
  for (const y of shelfYs) {
    box(fridgeGroup, fridgeW - 0.18, 0.035, 0.44, MAT.toon(0xd8eef2), (fridgeX0 + fridgeX1) / 2, y, -8.17, {
      cast: false, receive: false, edges: false,
    });
  }

  // Four glass doors with drinks behind them.
  const doorCount = 4;
  const doorW = fridgeW / doorCount;
  const drinkPalette = [
    0xde6247, 0xf0d05a, 0x4b9c78, 0x75bdd6, 0xeb8aa6, 0xf4eedc,
    0x3f6e9e, 0xc97d3d, 0x85b84c, 0xe3e8e6, 0x9b73b4, 0xd6453b,
  ];
  const drinkSpecs = [];
  for (let d = 0; d < doorCount; d++) {
    const cx = fridgeX0 + doorW * (d + 0.5);
    // Door frame.
    const frameMat = MAT.toon(0x435352);
    box(fridgeGroup, 0.045, fridgeH, 0.08, frameMat, cx - doorW / 2 + 0.02, cabinetY, -7.74, {
      cast: false, edges: false,
    });
    box(fridgeGroup, 0.045, fridgeH, 0.08, frameMat, cx + doorW / 2 - 0.02, cabinetY, -7.74, {
      cast: false, edges: false,
    });
    box(fridgeGroup, doorW - 0.05, 0.045, 0.08, frameMat, cx, cabinetY + fridgeH / 2 - 0.02, -7.74, {
      cast: false, edges: false,
    });
    box(fridgeGroup, doorW - 0.05, 0.045, 0.08, frameMat, cx, cabinetY - fridgeH / 2 + 0.02, -7.74, {
      cast: false, edges: false,
    });
    // Glass.
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xbfe6f2,
      transparent: true,
      opacity: 0.13,
      roughness: 0.04,
      metalness: 0.0,
      transmission: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    plane(fridgeGroup, doorW - 0.08, fridgeH - 0.08, glassMat, cx, cabinetY, -7.72, {
      transparent: true,
      depthWrite: false,
    });
    // Door handle.
    box(fridgeGroup, 0.03, 0.7, 0.04, MAT.chrome, cx + doorW * 0.32, 2.0, -7.66, {
      cast: false, edges: false,
    });

    // Rows of drinks.
    for (let row = 0; row < 3; row++) {
      const shelfY = shelfYs[row] + 0.03;
      const count = 7 + (row === 1 ? 1 : 0);
      for (let i = 0; i < count; i++) {
        const jitter = (Math.random() - 0.5) * 0.035;
        const bottleH = row === 0 ? 0.29 : 0.32;
        drinkSpecs.push({
          x: cx - doorW * 0.5 + 0.16 + i * ((doorW - 0.3) / Math.max(1, count - 1)),
          y: shelfY + bottleH / 2,
          z: -7.93 + jitter,
          r: 0.047 + Math.random() * 0.012,
          h: bottleH,
          color: drinkPalette[(i + d * 3 + row * 2) % drinkPalette.length],
        });
      }
    }
  }
  const bottles = makeBottleInstances(fridgeGroup, drinkSpecs);
  bottles.renderOrder = 1;

  // Fridge header lightbox.
  const header = addLabelPlane(
    fridgeGroup, drinksHeaderTex, fridgeW + 0.25, 0.47,
    (fridgeX0 + fridgeX1) / 2, 3.87, -7.73,
    { toneMapped: false }
  );
  header.renderOrder = 2;
  addGlowSprite(fridgeGroup, 0xbfe7ee, 6.25, 3.78, -7.5, 5.3, 0.12);

  /* ---------------- Gondola shelf rows ---------------- */
  const productSpecs = [];
  const canSpecs = [];
  const categoryColors = [
    0xd95c47, 0xe9a33f, 0xefd15e, 0x69a85f, 0x3c897e, 0x5c8eb1,
    0xdf84a0, 0xefe8d7, 0xb4774b, 0x8c5f8f, 0xd7c34b, 0x5ca2b0,
  ];

  const shelfRowDefs = [
    { x: 4.3, z: -5.0, len: 3.7, category: 'food' },
    { x: 6.55, z: -5.0, len: 3.7, category: 'daily' },
  ];

  function buildShelfRow(def, rowIndex) {
    const g = new THREE.Group();
    fixtures.add(g);
    const sx = def.x;
    const sz = def.z;
    const len = def.len;

    box(g, 0.84, 0.13, len, MAT.toon(0xd5cdbd), sx, 0.515, sz, {
      edges: true, edgeOpacity: 0.3,
    });
    box(g, 0.1, 1.58, len, MAT.toon(0x30625a), sx, 1.28, sz, {
      edges: true, edgeOpacity: 0.3,
    });
    // Back/end caps.
    box(g, 0.84, 1.72, 0.06, MAT.toon(0x1d5f59), sx, 1.27, sz + len / 2 + 0.02, {
      edges: true, edgeOpacity: 0.38,
    });
    box(g, 0.84, 1.72, 0.06, MAT.toon(0x1d5f59), sx, 1.27, sz - len / 2 - 0.02, {
      edges: true, edgeOpacity: 0.38,
    });

    const levels = [0.63, 1.07, 1.51, 1.9];
    for (let li = 0; li < levels.length - 1; li++) {
      const y = levels[li];
      box(g, 0.8, 0.045, len - 0.03, MAT.toon(0xeee6d7), sx, y, sz, {
        cast: false, receive: true, edges: false,
      });
      // Price strip on both faces.
      const stripMat = new THREE.MeshBasicMaterial({
        map: priceStripTex,
        toneMapped: false,
      });
      for (const side of [-1, 1]) {
        const strip = plane(g, len - 0.08, 0.055, stripMat, sx + side * 0.405, y + 0.01, sz, {
          rot: [0, side * Math.PI / 2, 0],
        });
        strip.renderOrder = 2;
      }
      // Products on both sides.
      for (const side of [-1, 1]) {
        let cursor = sz - (len - 0.25) / 2;
        while (cursor < sz + (len - 0.3) / 2) {
          const w = 0.13 + Math.random() * 0.13;
          const h = li === 0 ? 0.34 + Math.random() * 0.08 : 0.19 + Math.random() * 0.15;
          const d = 0.16 + Math.random() * 0.12;
          productSpecs.push({
            x: sx + side * (0.23 + Math.random() * 0.07),
            y: y + 0.025 + h / 2,
            z: cursor + w / 2,
            w: w * 0.8,
            h,
            d,
            ry: (Math.random() - 0.5) * 0.08,
            color: categoryColors[Math.floor(Math.random() * categoryColors.length)],
          });
          cursor += w + 0.085;
        }
        // A few cans on the top shelf.
        if (li === 2) {
          for (let i = 0; i < 5; i++) {
            canSpecs.push({
              x: sx + side * 0.27,
              y: y + 0.025 + 0.16,
              z: sz - 1.25 + i * 0.63 + (Math.random() - 0.5) * 0.08,
              r: 0.055,
              h: 0.28,
              color: categoryColors[(i + rowIndex * 3) % categoryColors.length],
            });
          }
        }
      }
    }

    // Small header on the end facing the entrance.
    const catTex = canvasTexture(512, 140, (ctx, w, h) => {
      ctx.fillStyle = '#f6f0df';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#1b5f59';
      ctx.fillRect(0, 0, w, 12);
      ctx.fillStyle = '#24564f';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `bold 49px ${JP}`;
      ctx.fillText(def.category === 'food' ? 'おいしいもの' : '毎日のもの', w / 2, 69);
      ctx.fillStyle = '#6f857d';
      ctx.font = `600 22px ${EN}`;
      ctx.fillText(def.category === 'food' ? 'FOOD & SNACKS' : 'DAILY GOODS', w / 2, 110);
    });
    addLabelPlane(g, catTex, 0.8, 0.22, sx, 2.02, sz + len / 2 + 0.055, { toneMapped: false });

    // A product display on the front end-cap, so the shop reads richly from the street.
    const endZ = sz + len / 2 + 0.02;
    for (let li = 0; li < 3; li++) {
      const y = 0.72 + li * 0.44;
      box(g, 0.76, 0.04, 0.22, MAT.toon(0xece3d2), sx, y, endZ + 0.1, {
        cast: false, receive: true, edges: false,
      });
      for (let k = 0; k < 3; k++) {
        const w = 0.15 + Math.random() * 0.06;
        const h = 0.2 + Math.random() * 0.09;
        productSpecs.push({
          x: sx - 0.25 + k * 0.25 + (Math.random() - 0.5) * 0.04,
          y: y + 0.02 + h / 2,
          z: endZ + 0.13,
          w,
          h,
          d: 0.1,
          ry: (Math.random() - 0.5) * 0.12,
          color: categoryColors[(li * 5 + k + rowIndex * 3) % categoryColors.length],
        });
      }
    }
    return g;
  }

  buildShelfRow(shelfRowDefs[0], 0);
  buildShelfRow(shelfRowDefs[1], 1);
  const productMesh = makeProductInstances(fresh, productSpecs);
  const canMesh = makeBottleInstances(fresh, canSpecs);

  /* ---------------- Magazine rack by the glass ---------------- */
  const magGroup = new THREE.Group();
  fresh.add(magGroup);
  box(magGroup, 2.7, 0.14, 0.6, MAT.toon(0xbdb5a5), 4.18, 0.51, -0.1, {
    edges: true, edgeOpacity: 0.28,
  });
  box(magGroup, 2.7, 0.64, 0.4, MAT.toon(0xebe3d4), 4.18, 0.9, -0.2, {
    edges: true, edgeOpacity: 0.26,
  });
  for (let i = 0; i < 7; i++) {
    const x = 3.0 + i * 0.39;
    box(magGroup, 0.03, 0.62, 0.46, MAT.toon(0x2d6860), x, 0.93, -0.17, {
      cast: false, edges: false,
    });
    for (let row = 0; row < 2; row++) {
      const cover = magazineCovers[(i + row * 2) % magazineCovers.length];
      addLabelPlane(
        magGroup, cover, 0.36, 0.48,
        x + 0.19, 0.98 + row * 0.27, 0.095 + row * 0.02,
        { rot: [-0.06, 0, 0], toneMapped: false }
      );
    }
  }
  addLabelPlane(magGroup, magazineRackSignTex, 2.4, 0.27, 4.18, 1.43, 0.09, {
    rot: [-0.08, 0, 0],
    toneMapped: false,
  });

  /* ---------------- Service counter ---------------- */
  const counterGroup = new THREE.Group();
  counterPart.add(counterGroup);

  const counterX = 9.48;
  const counterZ = -1.72;
  box(counterGroup, 1.36, 0.82, 2.3, MAT.toon(0x2e5d56), counterX, 0.84, counterZ, {
    edges: true, edgeOpacity: 0.34,
  });
  box(counterGroup, 1.48, 0.09, 2.42, MAT.toon(0xe9dfcd), counterX, 1.29, counterZ, {
    edges: true, edgeOpacity: 0.28,
  });
  box(counterGroup, 1.36, 0.13, 2.3, MAT.toon(0x223d39), counterX, 0.47, counterZ, {
    cast: false, edges: false,
  });
  // Wood slat front.
  for (let i = 0; i < 9; i++) {
    box(counterGroup, 0.035, 0.72, 0.02, MAT.toon(0x9b7650), 8.88, 0.82, counterZ - 1.03 + i * 0.255, {
      cast: false, edges: false,
    });
  }

  // Register.
  const registerBase = box(counterGroup, 0.52, 0.1, 0.42, MAT.toon(0x303b3c), 9.38, 1.37, -2.32, {
    edges: true, edgeOpacity: 0.28,
  });
  const regScreenMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0x9df3da),
    toneMapped: false,
  });
  const screen = plane(counterGroup, 0.42, 0.3, regScreenMat, 9.38, 1.69, -2.25, {
    rot: [-0.28, 0, 0],
  });
  box(counterGroup, 0.52, 0.52, 0.08, MAT.toon(0x334042), 9.38, 1.59, -2.33, {
    edges: true, edgeOpacity: 0.3,
  });

  // Coffee machine.
  box(counterGroup, 0.6, 0.78, 0.5, MAT.toon(0x3a3e3c), 9.46, 1.68, -1.48, {
    edges: true, edgeOpacity: 0.3,
  });
  box(counterGroup, 0.5, 0.08, 0.12, MAT.toon(0xb74d3c), 9.46, 1.95, -1.2, { cast: false, edges: false });
  const coffeeGlow = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xff9d5d),
    transparent: true,
    opacity: 0.82,
    toneMapped: false,
  });
  plane(counterGroup, 0.35, 0.22, coffeeGlow, 9.46, 1.77, -1.218, { rot: [0, 0, 0] });
  box(counterGroup, 0.3, 0.12, 0.25, MAT.toon(0xd9d2c4), 9.46, 1.35, -1.27, {
    edges: true, edgeOpacity: 0.26,
  });

  // Hot snack warmer with a warm orange interior.
  box(counterGroup, 0.52, 0.16, 0.46, MAT.toon(0x3d3a35), 9.44, 1.4, -0.77, {
    edges: true, edgeOpacity: 0.28,
  });
  const warmerGlass = new THREE.MeshPhysicalMaterial({
    color: 0xffd29a,
    transparent: true,
    opacity: 0.3,
    roughness: 0.08,
    metalness: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  box(counterGroup, 0.48, 0.38, 0.42, warmerGlass, 9.44, 1.68, -0.77, {
    cast: false, edges: false,
  });
  const warmGlow = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xff8a3d).multiplyScalar(1.3),
    transparent: true,
    opacity: 0.55,
    toneMapped: false,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  plane(counterGroup, 0.4, 0.27, warmGlow, 9.44, 1.55, -0.77, { rot: [-Math.PI / 2, 0, 0] });
  for (let i = 0; i < 5; i++) {
    box(counterGroup, 0.07, 0.055, 0.1, MAT.toon(0xb87538), 9.27 + i * 0.08, 1.54, -0.77 + (i % 2) * 0.09, {
      cast: false, edges: false,
    });
  }

  // Cup stacks and a tiny plant.
  for (let i = 0; i < 5; i++) {
    const cup = cylinder(counterGroup, 0.05, 0.04, 0.095, MAT.toon(0xf0e9d9), 9.88, 1.39 + i * 0.095, -1.06, {
      segments: 12,
      cast: false,
    });
  }
  const potMat = MAT.toon(0x8e5a43);
  cylinder(counterGroup, 0.13, 0.1, 0.22, potMat, 8.97, 1.44, -0.72, { segments: 12 });
  const leafMat = MAT.toon(0x3e7e5d);
  for (let i = 0; i < 5; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.11, 7, 5), leafMat);
    leaf.position.set(8.97 + (Math.random() - 0.5) * 0.14, 1.6 + Math.random() * 0.12, -0.72 + (Math.random() - 0.5) * 0.13);
    leaf.scale.y = 1.35;
    counterGroup.add(leaf);
  }

  // Menu lightbox on the right wall.
  addLabelPlane(counterPart, menuTexture(), 1.1, 1.1, 10.235, 2.52, -2.36, {
    rot: [0, -Math.PI / 2, 0],
    toneMapped: false,
  });
  // Menu lightbox frame.
  box(counterPart, 0.08, 1.22, 1.22, MAT.toon(0x2a4b46), 10.27, 2.52, -2.36, {
    cast: false, edges: false,
  });

  // Cigarette / small goods rack behind the counter.
  for (let i = 0; i < 12; i++) {
    const col = categoryColors[i % categoryColors.length];
    box(counterPart, 0.025, 0.12, 0.16, MAT.toon(col), 10.22, 1.8 + Math.floor(i / 4) * 0.18, -1.12 + (i % 4) * 0.18, {
      cast: false, edges: false,
    });
  }
  box(counterPart, 0.02, 0.62, 0.78, MAT.toon(0x2b3a37), 10.25, 2.0, -0.84, { cast: false, edges: false });

  /* ---------------- Hanging aisle signs ---------------- */
  const signDefs = [
    { tex: signOden, x: 4.35, z: -3.0, y: 3.15, w: 1.42, h: 0.42 },
    { tex: signDrinks, x: 6.5, z: -4.9, y: 3.18, w: 1.32, h: 0.4 },
    { tex: signSnacks, x: 8.55, z: -2.9, y: 3.04, w: 1.28, h: 0.39 },
    { tex: signMagazines, x: 4.0, z: -1.0, y: 3.0, w: 1.25, h: 0.38 },
  ];
  for (const def of signDefs) {
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(def.w, def.h),
      new THREE.MeshBasicMaterial({
        map: def.tex,
        transparent: true,
        side: THREE.DoubleSide,
        toneMapped: false,
      })
    );
    sign.position.set(def.x, def.y, def.z);
    sign.renderOrder = 2;
    dressing.add(sign);
    for (const side of [-1, 1]) {
      const x = def.x + side * def.w * 0.38;
      cylinder(dressing, 0.008, 0.008, STORE.ceilingY - def.y - def.h * 0.5, MAT.chrome, x, (STORE.ceilingY + def.y + def.h * 0.5) / 2, def.z, {
        segments: 5,
        cast: false,
      });
    }
  }

  /* ---------------- Window stickers and open sign ---------------- */
  addLabelPlane(dressing, windowStickerTex, 1.72, 0.47, 3.92, 3.52, 0.78, {
    transparent: true,
    opacity: 0.94,
    toneMapped: false,
  });
  addLabelPlane(dressing, windowStickerTex, 0.95, 0.26, 9.54, 3.36, 0.8, {
    transparent: true,
    opacity: 0.9,
    toneMapped: false,
  });

  // Pink OPEN neon on the right wall, reflected in the glass.
  const openNeon = addLabelPlane(dressing, coffeeNeonTex, 1.25, 0.49, 10.2, 3.35, 0.2, {
    rot: [0, -Math.PI / 2, 0],
    transparent: true,
    additive: true,
    toneMapped: false,
    depthWrite: false,
  });
  openNeon.renderOrder = 3;
  addGlowSprite(dressing, 0xff6688, 10.05, 3.35, 0.2, 1.9, 0.16);

  // A few cheerful small posters inside the glass.
  for (let i = 0; i < 3; i++) {
    const tex = magazineCovers[(i + 1) % magazineCovers.length];
    addLabelPlane(dressing, tex, 0.34, 0.46, 3.0 + i * 0.46, 1.75, 0.79, {
      toneMapped: false,
    });
  }

  // Bags / small items hung near the entrance.
  const bagColors = [0xe5d6b5, 0xcf5d4a, 0x3d7b6c];
  for (let i = 0; i < 6; i++) {
    box(dressing, 0.2, 0.3, 0.06, MAT.toon(bagColors[i % 3]), 9.0 + (i % 3) * 0.22, 2.28 - Math.floor(i / 3) * 0.37, 0.74, {
      cast: false, edges: true, edgeOpacity: 0.2,
    });
  }

  /* ---------------- Warm interior lights ---------------- */
  addPointLight(5.2, 3.55, -3.2, 0xffd59a, 33, 9.5);
  addPointLight(8.05, 3.45, -4.9, 0xffcf8b, 24, 8.0);
  addPointLight(7.6, 2.5, -1.2, 0xffd7a4, 20, 6.5);
  addPointLight(6.2, 2.7, -7.1, 0xd3f2ff, 13, 5.0);

  // Subtle dust / warmth in the light.
  const dustCount = 40;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = 3.1 + Math.random() * 6.9;
    dustPos[i * 3 + 1] = 0.7 + Math.random() * 3.2;
    dustPos[i * 3 + 2] = -7.9 + Math.random() * 8.2;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      color: 0xffe5b6,
      size: 0.018,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  dressing.add(dust);

  return {
    shell,
    fixtures,
    fresh,
    stock,
    counterPart,
    dressing,
    productMesh,
    canMesh,
  };
}
