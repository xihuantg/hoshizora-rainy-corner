import {
  THREE, C, MAT, TEX, world, part,
  canvasTexture, roundRect, box, plane, disc, cylinder, roundedBox,
  addGlowSprite, addLabelPlane, addPool, addStreak, edges,
} from './core.js';
import { STORE } from './config.js';
import { buildInterior, interiorLights } from './interior.js';

const JP = '"Yu Gothic", "Hiragino Kaku Gothic ProN", "Meiryo", "Noto Sans JP", sans-serif';
const EN = '"Avenir Next", "Futura", "Century Gothic", "Trebuchet MS", sans-serif';

export const storeLights = [];
export const storeInfo = {};

/* ------------------------------------------------------------------ */
/*  Signage textures                                                   */
/* ------------------------------------------------------------------ */

const fasciaTex = canvasTexture(2048, 300, (ctx, w, h) => {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#fff8e8');
  bg.addColorStop(0.62, '#f4e7cc');
  bg.addColorStop(1, '#e9d9ba');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Fine printed texture / panel lines.
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = '#9d8153';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 22) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = '#0e4f4c';
  ctx.fillRect(0, 0, w, 14);
  ctx.fillRect(0, h - 17, w, 17);

  // Logo emblem.
  ctx.save();
  ctx.translate(154, 146);
  ctx.strokeStyle = '#155c58';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(0, 0, 95, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#155c58';
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 54 : 21;
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#155c58';
  ctx.textAlign = 'center';
  ctx.font = `bold 20px ${EN}`;
  ctx.fillText('EST. 1998', 0, 126);
  ctx.restore();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#134f4c';
  ctx.font = `800 111px ${EN}`;
  ctx.fillText('HOSHIZORA', 294, 150);
  ctx.fillStyle = '#d96e4f';
  ctx.font = `800 88px ${EN}`;
  ctx.fillText('MART', 976, 149);
  ctx.fillStyle = '#255f5a';
  ctx.font = `bold 49px ${JP}`;
  ctx.fillText('ほしぞらマート', 296, 220);
  ctx.fillStyle = '#6e776a';
  ctx.font = `600 23px ${EN}`;
  ctx.fillText('A LITTLE LIGHT FOR THE NIGHT  ·  星夜町二丁目', 296, 258);

  // 24H block.
  ctx.fillStyle = '#155d59';
  roundRect(ctx, 1610, 28, 300, 244, 18);
  ctx.fill();
  ctx.fillStyle = '#fff4dc';
  ctx.textAlign = 'center';
  ctx.font = `800 122px ${EN}`;
  ctx.fillText('24H', 1760, 152);
  ctx.font = `600 27px ${EN}`;
  ctx.fillText('OPEN EVERY NIGHT', 1760, 207);
  ctx.fillStyle = '#efaf66';
  ctx.beginPath();
  ctx.arc(1690, 236, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#efaf66';
  ctx.beginPath();
  ctx.arc(1830, 236, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f8edda';
  ctx.font = `bold 22px ${JP}`;
  ctx.fillText('年中無休', 1760, 252);
});

const sideFasciaTex = canvasTexture(1536, 280, (ctx, w, h) => {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#fff7e5');
  bg.addColorStop(0.7, '#f1e2c5');
  bg.addColorStop(1, '#dfcba7');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#0d504c';
  ctx.fillRect(0, 0, w, 13);
  ctx.fillRect(0, h - 15, w, 15);

  ctx.save();
  ctx.translate(135, 145);
  ctx.strokeStyle = '#155d58';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 0, 84, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#155d58';
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 49 : 19;
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#155d58';
  ctx.font = `800 92px ${EN}`;
  ctx.fillText('HOSHIZORA', 265, 135);
  ctx.fillStyle = '#d96e4f';
  ctx.font = `800 72px ${EN}`;
  ctx.fillText('MART', 1010, 135);
  ctx.fillStyle = '#4f7068';
  ctx.font = `bold 43px ${JP}`;
  ctx.fillText('ほしぞらマート', 267, 196);
  ctx.fillStyle = '#77877c';
  ctx.font = `600 20px ${EN}`;
  ctx.fillText('COLD DRINKS  ·  HOT SNACKS  ·  COFFEE  ·  EVERY NIGHT', 267, 238);
  ctx.fillStyle = '#155d58';
  roundRect(ctx, 1292, 43, 185, 190, 14);
  ctx.fill();
  ctx.fillStyle = '#fff5df';
  ctx.textAlign = 'center';
  ctx.font = `800 92px ${EN}`;
  ctx.fillText('24H', 1384, 139);
  ctx.fillStyle = '#f0b36c';
  ctx.font = `bold 29px ${JP}`;
  ctx.fillText('営業中', 1384, 188);
});

const pylonTex = canvasTexture(512, 2048, (ctx, w, h) => {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#0e5b56');
  bg.addColorStop(0.55, '#0a4845');
  bg.addColorStop(1, '#0b3c3a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#efd6a1';
  ctx.lineWidth = 10;
  roundRect(ctx, 16, 16, w - 32, h - 32, 25);
  ctx.stroke();

  ctx.fillStyle = '#fff4db';
  ctx.textAlign = 'center';
  ctx.font = `800 180px ${EN}`;
  ctx.fillText('24', w / 2, 235);
  ctx.font = `800 170px ${EN}`;
  ctx.fillStyle = '#f2ba71';
  ctx.fillText('H', w / 2, 403);
  ctx.fillStyle = '#f8edd6';
  ctx.font = `600 35px ${EN}`;
  ctx.fillText('HOURS', w / 2, 456);

  // Star.
  ctx.save();
  ctx.translate(w / 2, 550);
  ctx.fillStyle = '#f2c178';
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 55 : 22;
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = '#fff6e4';
  ctx.font = `600 34px ${EN}`;
  ctx.fillText('HOSHIZORA', w / 2, 656);
  ctx.fillStyle = '#f2c178';
  ctx.font = `bold 68px ${JP}`;
  const chars = ['ほ', 'し', 'ぞ', 'ら', 'マ', 'ー', 'ト'];
  chars.forEach((ch, i) => ctx.fillText(ch, w / 2, 760 + i * 88));

  ctx.fillStyle = '#e9735b';
  ctx.fillRect(56, 1416, w - 112, 8);
  ctx.fillStyle = '#ffe8c2';
  ctx.font = `bold 37px ${JP}`;
  ctx.fillText('深夜も、あかりを。', w / 2, 1492);
  ctx.fillStyle = '#f2ba71';
  ctx.font = `600 26px ${EN}`;
  ctx.fillText('OPEN EVERY NIGHT', w / 2, 1545);
  ctx.fillStyle = '#f7ead1';
  ctx.font = `600 22px ${JP}`;
  ctx.fillText('星夜町二丁目', w / 2, 1860);
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.fillRect(88, 1750, w - 176, 2);
});

const autoDoorTex = canvasTexture(512, 192, (ctx, w, h) => {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(250,245,230,0.92)';
  roundRect(ctx, 8, 8, w - 16, h - 16, 22);
  ctx.fill();
  ctx.strokeStyle = '#1b5f59';
  ctx.lineWidth = 5;
  roundRect(ctx, 14, 14, w - 28, h - 28, 16);
  ctx.stroke();
  ctx.fillStyle = '#1a544f';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold 63px ${JP}`;
  ctx.fillText('自動ドア', w / 2, 77);
  ctx.fillStyle = '#5e8079';
  ctx.font = `600 25px ${EN}`;
  ctx.fillText('AUTOMATIC DOOR', w / 2, 132);
  ctx.fillStyle = '#dc704f';
  ctx.beginPath();
  ctx.moveTo(392, 101);
  ctx.lineTo(438, 101);
  ctx.lineTo(438, 88);
  ctx.lineTo(470, 110);
  ctx.lineTo(438, 132);
  ctx.lineTo(438, 119);
  ctx.lineTo(392, 119);
  ctx.closePath();
  ctx.fill();
});

const welcomeMatTex = canvasTexture(512, 256, (ctx, w, h) => {
  ctx.fillStyle = '#244d46';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(233,218,182,0.58)';
  ctx.lineWidth = 9;
  roundRect(ctx, 16, 16, w - 32, h - 32, 8);
  ctx.stroke();
  ctx.fillStyle = '#f1e5c9';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold 73px ${JP}`;
  ctx.fillText('いらっしゃいませ', w / 2, 108);
  ctx.fillStyle = '#e6b56a';
  ctx.font = `600 30px ${EN}`;
  ctx.fillText('WELCOME  ·  HOSHIZORA MART', w / 2, 174);
});

const noticeTex = canvasTexture(512, 680, (ctx, w, h) => {
  ctx.fillStyle = '#d9c9a6';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#2e514d';
  ctx.fillRect(0, 0, w, 82);
  ctx.fillStyle = '#f6edda';
  ctx.textAlign = 'center';
  ctx.font = `bold 38px ${JP}`;
  ctx.fillText('地域のお知らせ', w / 2, 55);
  const colors = ['#f3e8ce', '#c8dbd0', '#efd6c0'];
  for (let i = 0; i < 3; i++) {
    ctx.save();
    ctx.translate(62 + (i % 2) * 225, 118 + Math.floor(i / 2) * 245);
    ctx.rotate((i - 1) * 0.035);
    ctx.fillStyle = colors[i];
    ctx.fillRect(0, 0, 175, 220);
    ctx.fillStyle = ['#c8644d', '#44776b', '#d6a64d'][i];
    ctx.fillRect(12, 13, 151, 28);
    ctx.fillStyle = '#4e5852';
    ctx.font = `15px ${JP}`;
    for (let l = 0; l < 8; l++) {
      ctx.fillRect(15, 60 + l * 19, 120 - Math.random() * 38, 3);
    }
    ctx.fillStyle = '#d0684c';
    ctx.beginPath();
    ctx.arc(145, 188, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#5d5b51';
  ctx.font = `21px ${JP}`;
  ctx.textAlign = 'center';
  ctx.fillText('星夜町町内会  ·  雨の日は足もとにご注意ください', w / 2, 642);
});

const glassSheenTex = canvasTexture(512, 512, (ctx, w, h) => {
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-0.55);
  const g = ctx.createLinearGradient(-w * 0.7, 0, w * 0.7, 0);
  g.addColorStop(0, 'rgba(190,225,255,0)');
  g.addColorStop(0.3, 'rgba(190,225,255,0.05)');
  g.addColorStop(0.44, 'rgba(220,240,255,0.23)');
  g.addColorStop(0.5, 'rgba(230,247,255,0.32)');
  g.addColorStop(0.56, 'rgba(220,240,255,0.12)');
  g.addColorStop(1, 'rgba(190,225,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(-w, -h, w * 2, h * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.055)';
  ctx.fillRect(-w * 0.1, -h, 22, h * 2);
  ctx.fillRect(w * 0.34, -h, 8, h * 2);
  ctx.restore();
});

const vendingDecalTex = canvasTexture(512, 512, (ctx, w, h) => {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#e8e2d3';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#27625b';
  ctx.fillRect(0, 0, w, 90);
  ctx.fillStyle = '#f8f1df';
  ctx.textAlign = 'center';
  ctx.font = `bold 44px ${JP}`;
  ctx.fillText('空き缶・ペットボトル', w / 2, 58);
  ctx.fillStyle = '#3e7d6e';
  ctx.beginPath();
  ctx.arc(w / 2, 270, 118, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f2ead7';
  ctx.textAlign = 'center';
  ctx.font = `bold 190px ${EN}`;
  ctx.fillText('R', w / 2, 340);
  ctx.fillStyle = '#354943';
  ctx.font = `bold 38px ${JP}`;
  ctx.fillText('リサイクルにご協力ください', w / 2, 452);
});

/* ------------------------------------------------------------------ */
/*  Exterior helper                                                    */
/* ------------------------------------------------------------------ */

function addStoreLight(x, y, z, color, intensity, distance) {
  const light = new THREE.PointLight(color, intensity, distance, 2);
  light.position.set(x, y, z);
  world.add(light);
  storeLights.push({ light, baseIntensity: intensity });
  return light;
}

function addSpot(x, y, z, tx, ty, tz, color, intensity, distance, angle) {
  const light = new THREE.SpotLight(color, intensity, distance, angle, 0.75, 2);
  light.position.set(x, y, z);
  light.target.position.set(tx, ty, tz);
  world.add(light);
  world.add(light.target);
  storeLights.push({ light, baseIntensity: intensity });
  return light;
}

function makeAirConditioner(parent, x, y, z, w, h, d, facing = -1) {
  const g = new THREE.Group();
  parent.add(g);
  g.position.set(x, y, z);
  box(g, w, h, d, MAT.toon(0xd7d2c4), 0, 0, 0, {
    edges: true, edgeOpacity: 0.32,
  });
  box(g, w + 0.03, 0.05, d + 0.04, MAT.toon(0x8e918b), 0, h / 2 - 0.02, 0, {
    cast: false, edges: false,
  });
  // Fan grille.
  const fanMat = MAT.toon(0x555e5c);
  const fan = cylinder(g, h * 0.31, h * 0.31, 0.025, fanMat, facing * (w / 2 + 0.015), -0.04, 0, {
    segments: 24,
    rot: [0, 0, Math.PI / 2],
    cast: false,
  });
  const hub = cylinder(g, 0.055, 0.055, 0.04, MAT.toon(0x242a2b), facing * (w / 2 + 0.03), -0.04, 0, {
    segments: 16,
    rot: [0, 0, Math.PI / 2],
    cast: false,
  });
  const spokeMat = MAT.toon(0x606864);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const len = h * 0.26;
    const spoke = box(
      g, 0.012, len, 0.012, spokeMat,
      facing * (w / 2 + 0.032), -0.04 + Math.sin(a) * len * 0.5, Math.cos(a) * len * 0.5,
      { cast: false, edges: false }
    );
    spoke.rotation.x = a;
  }
  // Feet / bracket.
  box(g, w * 0.9, 0.04, 0.06, MAT.toon(0x3d4543), 0, -h / 2 - 0.15, d * 0.2, {
    cast: false, edges: false,
  });
  box(g, 0.05, 0.18, 0.05, MAT.toon(0x4c5351), -w * 0.32, -h / 2 - 0.12, d * 0.2, {
    cast: false, edges: false,
  });
  box(g, 0.05, 0.18, 0.05, MAT.toon(0x4c5351), w * 0.32, -h / 2 - 0.12, d * 0.2, {
    cast: false, edges: false,
  });
  return g;
}

/* ------------------------------------------------------------------ */
/*  Main store build                                                   */
/* ------------------------------------------------------------------ */

export function buildStore() {
  buildInterior();

  const structure = part(1.82, { from: [0, -4.2, 0], duration: 1.38, scaleFrom: 0.94 });
  const glassPart = part(4.5, { from: [0, 2.2, 0], duration: 1.15 });
  const signage = part(5.02, { from: [0, 2.5, 0], duration: 1.2, scaleFrom: 0.92 });
  const awningPart = part(5.35, { from: [0, 1.7, 0], duration: 1.0, bounce: 0.2 });
  const pavementPart = part(5.68, { from: [0, -0.6, 0], duration: 0.9 });
  const decorPart = part(5.88, { from: [0, 1.2, 0], duration: 1.0 });
  const roofPart = part(6.08, { from: [0, 2.6, 0], duration: 1.0 });

  /* ---------------- Foundation and shell ---------------- */

  box(structure, 8.58, 0.3, 9.78, MAT.toon(0x24463f), 6.2, 0.32, -3.8, {
    edges: true, edgeOpacity: 0.36,
  });
  box(structure, 8.34, 0.08, 9.52, MAT.toon(0xd3c7b2), 6.2, 0.405, -3.8, {
    cast: false, edges: false,
  });

  // Main wall stock.
  const wallMat = MAT.cream;
  box(structure, 8.3, 3.94, 0.18, wallMat, 6.2, 2.38, -8.46, {
    edges: true, edgeOpacity: 0.42,
  });
  box(structure, 0.18, 3.94, 9.48, wallMat, 10.26, 2.38, -3.8, {
    edges: true, edgeOpacity: 0.42,
  });

  // Left facade: solid near the corner, glass in the middle, solid at the rear.
  box(structure, 0.18, 3.94, 2.16, wallMat, 2.14, 2.38, -0.125, {
    edges: true, edgeOpacity: 0.42,
  });
  box(structure, 0.18, 3.94, 2.35, wallMat, 2.14, 2.38, -7.375, {
    edges: true, edgeOpacity: 0.42,
  });
  box(structure, 0.18, 0.35, 5.0, wallMat, 2.14, 0.58, -3.65, {
    edges: false,
  });
  box(structure, 0.18, 0.26, 5.0, wallMat, 2.14, 4.17, -3.65, {
    edges: false,
  });

  // Front header and kick panels.
  box(structure, 8.3, 0.32, 0.25, wallMat, 6.2, 4.16, 0.92, {
    edges: true, edgeOpacity: 0.36,
  });
  box(structure, 8.3, 0.32, 0.25, MAT.toon(0x1f4c44), 6.2, 0.59, 0.92, {
    edges: true, edgeOpacity: 0.34,
  });
  // Dark green wainscot wrapping the solid wall pieces.
  box(structure, 8.3, 0.42, 0.26, MAT.toon(0x27564d), 6.2, 0.49, 0.93, {
    edges: false,
  });
  box(structure, 0.2, 0.42, 2.16, MAT.toon(0x27564d), 2.14, 0.49, -0.125, {
    edges: false,
  });
  box(structure, 0.2, 0.42, 2.35, MAT.toon(0x27564d), 2.14, 0.49, -7.375, {
    edges: false,
  });

  // Corner pillars.
  box(structure, 0.32, 4.0, 0.33, MAT.toon(0x19534d), 2.24, 2.36, 0.82, {
    edges: true, edgeOpacity: 0.45,
  });
  box(structure, 0.32, 4.0, 0.33, MAT.toon(0x19534d), 10.18, 2.36, 0.82, {
    edges: true, edgeOpacity: 0.45,
  });
  box(structure, 0.32, 4.0, 0.33, MAT.toon(0x19534d), 2.24, 2.36, -8.42, {
    edges: true, edgeOpacity: 0.45,
  });
  box(structure, 0.32, 4.0, 0.33, MAT.toon(0x19534d), 10.18, 2.36, -8.42, {
    edges: true, edgeOpacity: 0.45,
  });

  // Thin facade seams / panels.
  for (const y of [1.05, 2.24, 3.32]) {
    box(structure, 0.018, 0.036, 2.13, MAT.toon(0xd2c5af), 2.045, y, -0.125, {
      cast: false, edges: false,
    });
    box(structure, 0.018, 0.036, 2.32, MAT.toon(0xd2c5af), 2.045, y, -7.375, {
      cast: false, edges: false,
    });
  }

  // Window frames: warm aluminium, with dark rubber gaskets and teal structure.
  const frameMat = MAT.toon(0xd8ccb5);
  const rubberMat = MAT.toon(0x1b2325);
  for (const x of [2.5, 4.45, 6.35, 6.6, 9.2, 9.27, 9.98]) {
    const thick = (x === 6.6 || x === 9.2) ? 0.12 : 0.085;
    box(structure, thick, 3.46, 0.2, frameMat, x, 2.39, 0.96, {
      edges: false,
    });
  }
  for (const z of [-1.2, -3.7, -6.2]) {
    box(structure, 0.2, 3.46, 0.085, frameMat, 2.08, 2.39, z, {
      edges: false,
    });
  }
  box(structure, 0.2, 0.1, 5.0, frameMat, 2.08, 0.74, -3.68, { edges: false });
  box(structure, 0.2, 0.1, 5.0, frameMat, 2.08, 4.04, -3.68, { edges: false });
  box(structure, 7.64, 0.1, 0.2, frameMat, 6.24, 0.74, 0.96, { edges: false });
  box(structure, 7.64, 0.1, 0.2, frameMat, 6.24, 4.04, 0.96, { edges: false });

  // Automatic door frames and center track.
  box(structure, 2.72, 0.16, 0.18, MAT.toon(0x2a3837), 7.9, 4.0, 0.98, { edges: false });
  box(structure, 0.06, 3.3, 0.18, rubberMat, 7.9, 2.39, 1.015, { edges: false });
  box(structure, 0.07, 0.13, 0.2, MAT.toon(0xc5c2b5), 6.62, 2.39, 1.0, { edges: false });
  box(structure, 0.07, 0.13, 0.2, MAT.toon(0xc5c2b5), 9.18, 2.39, 1.0, { edges: false });

  // Sensor over the doorway.
  box(structure, 0.52, 0.12, 0.18, MAT.toon(0x252f31), 7.9, 3.91, 1.06, {
    edges: false,
  });
  const sensorEye = new THREE.MeshBasicMaterial({ color: 0x8dffc7, toneMapped: false });
  disc(structure, 0.035, sensorEye, 7.9, 3.91, 1.16, { rot: [Math.PI / 2, 0, 0], segments: 12 });

  // Roofline and roof deck.
  box(structure, 8.6, 0.18, 9.72, MAT.toon(0x294b45), 6.2, 4.44, -3.8, {
    edges: true, edgeOpacity: 0.38,
  });
  box(structure, 8.6, 0.32, 0.14, MAT.toon(0x1d4a43), 6.2, 4.61, 1.02, {
    edges: true, edgeOpacity: 0.34,
  });
  box(structure, 0.14, 0.32, 9.72, MAT.toon(0x1d4a43), 10.44, 4.61, -3.8, {
    edges: true, edgeOpacity: 0.34,
  });
  box(structure, 8.6, 0.32, 0.14, MAT.toon(0x1d4a43), 6.2, 4.61, -8.54, {
    edges: true, edgeOpacity: 0.34,
  });

  // Storefront step.
  box(structure, 2.85, 0.09, 0.7, MAT.toon(0xa7a092), 7.9, 0.34, 1.25, {
    cast: false, receive: true, edges: true, edgeOpacity: 0.25,
  });

  // Small vents and a service door at the back.
  box(structure, 0.9, 2.1, 0.08, MAT.toon(0x50605a), 9.45, 1.35, -8.53, {
    edges: true, edgeOpacity: 0.28,
  });
  box(structure, 0.08, 0.16, 0.06, MAT.chrome, 9.08, 1.3, -8.58, { cast: false, edges: false });
  for (let i = 0; i < 5; i++) {
    box(structure, 0.6, 0.025, 0.02, MAT.toon(0x2e3f3c), 9.45, 2.1 + i * 0.1, -8.58, {
      cast: false, edges: false,
    });
  }

  /* ---------------- Glass ---------------- */

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xd7edf4,
    transparent: true,
    opacity: 0.075,
    roughness: 0.035,
    metalness: 0.0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  plane(glassPart, 3.82, 3.28, glassMat, 4.45, 2.385, 0.952, {
    transparent: true, depthWrite: false,
  });
  plane(glassPart, 0.67, 3.28, glassMat, 9.625, 2.385, 0.952, {
    transparent: true, depthWrite: false,
  });
  plane(glassPart, 4.88, 3.28, glassMat, 2.075, 2.385, -3.68, {
    rot: [0, -Math.PI / 2, 0], transparent: true, depthWrite: false,
  });
  plane(glassPart, 1.18, 3.28, glassMat, 7.255, 2.385, 0.953, {
    transparent: true, depthWrite: false,
  });
  plane(glassPart, 1.18, 3.28, glassMat, 8.54, 2.385, 0.953, {
    transparent: true, depthWrite: false,
  });

  // Sliding door leaf frames.
  for (const cx of [7.255, 8.54]) {
    box(glassPart, 1.25, 0.065, 0.09, MAT.toon(0x2a3b39), cx, 3.98, 1.0, { edges: false });
    box(glassPart, 1.25, 0.12, 0.09, MAT.toon(0x2a3b39), cx, 0.78, 1.0, { edges: false });
    box(glassPart, 0.055, 3.24, 0.09, MAT.toon(0x3f4b48), cx - 0.61, 2.38, 1.0, { edges: false });
    box(glassPart, 0.055, 3.24, 0.09, MAT.toon(0x3f4b48), cx + 0.61, 2.38, 1.0, { edges: false });
  }
  // Door handles.
  for (const [x, dir] of [[7.82, -1], [7.99, 1]]) {
    box(glassPart, 0.035, 0.62, 0.05, MAT.chrome, x, 1.68, 1.04, { cast: false, edges: false });
    box(glassPart, 0.05, 0.06, 0.1, MAT.chrome, x + dir * 0.02, 1.4, 1.04, { cast: false, edges: false });
  }

  // Glass reflections / sheen.
  const sheenMat = new THREE.MeshBasicMaterial({
    map: glassSheenTex,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const frontSheen = plane(glassPart, 7.7, 3.25, sheenMat, 6.23, 2.4, 1.025, {
    renderOrder: 3,
  });
  const sideSheen = plane(glassPart, 4.95, 3.25, sheenMat, 2.015, 2.4, -3.68, {
    rot: [0, -Math.PI / 2, 0],
    renderOrder: 3,
  });
  frontSheen.material.opacity = 0.12;
  sideSheen.material.opacity = 0.16;

  // Automatically slide decal.
  addLabelPlane(glassPart, autoDoorTex, 1.2, 0.45, 7.9, 2.75, 1.04, {
    transparent: true, toneMapped: false,
  });

  // Warm LED strip tucked under the eave.
  const ledMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xffdca0).multiplyScalar(1.3),
    toneMapped: false,
  });
  box(glassPart, 8.05, 0.035, 0.035, ledMat, 6.2, 4.07, 1.08, { cast: false, edges: false });
  box(glassPart, 0.035, 0.035, 4.9, ledMat, 2.06, 4.07, -3.68, { cast: false, edges: false });

  /* ---------------- Fascia signage ---------------- */

  // Main front lightbox.
  box(signage, 8.68, 1.28, 0.42, MAT.toon(0x1a5450), 6.2, 4.97, 1.06, {
    edges: true, edgeOpacity: 0.4,
  });
  box(signage, 8.48, 1.1, 0.4, MAT.toon(0xf2e5ca), 6.2, 4.97, 1.075, {
    cast: false, edges: false,
  });
  const fascia = addLabelPlane(signage, fasciaTex, 8.4, 1.15, 6.2, 4.97, 1.285, {
    toneMapped: false,
  });
  fascia.renderOrder = 2;

  // Side lightbox.
  box(signage, 0.42, 1.16, 5.55, MAT.toon(0x1a5450), 2.0, 4.98, -3.6, {
    edges: true, edgeOpacity: 0.38,
  });
  box(signage, 0.4, 1.01, 5.38, MAT.toon(0xf2e5ca), 1.985, 4.98, -3.6, {
    cast: false, edges: false,
  });
  const sideFascia = addLabelPlane(signage, sideFasciaTex, 5.35, 1.0, 1.77, 4.98, -3.6, {
    rot: [0, -Math.PI / 2, 0], toneMapped: false,
  });
  sideFascia.renderOrder = 2;

  // Sign frame highlights.
  box(signage, 8.78, 0.045, 0.46, MAT.brassLight, 6.2, 5.6, 1.06, {
    cast: false, edges: false,
  });
  box(signage, 8.78, 0.045, 0.46, MAT.toon(0xd5c3a2), 6.2, 4.35, 1.06, {
    cast: false, edges: false,
  });
  // Neon accent line.
  const pinkNeon = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xff6d94).multiplyScalar(1.4),
    toneMapped: false,
  });
  box(signage, 8.05, 0.032, 0.04, pinkNeon, 6.2, 4.39, 1.285, { cast: false, edges: false });
  addGlowSprite(signage, 0xff6d94, 6.2, 4.4, 1.4, 4.4, 0.1);
  addGlowSprite(signage, 0xffd79e, 6.2, 5.05, 1.5, 8.8, 0.13);
  addGlowSprite(signage, 0xffd79e, 1.7, 4.98, -3.6, 5.2, 0.09);

  // Pylon sign at the corner.
  box(signage, 0.18, 3.05, 0.8, MAT.toon(0x174f4b), 1.66, 3.75, 1.25, {
    edges: true, edgeOpacity: 0.42,
  });
  addLabelPlane(signage, pylonTex, 0.76, 3.0, 1.66, 3.75, 1.66, {
    toneMapped: false,
  });
  addLabelPlane(signage, pylonTex, 0.76, 3.0, 1.66, 3.75, 0.84, {
    rot: [0, Math.PI, 0], toneMapped: false,
  });
  box(signage, 0.7, 0.06, 0.06, MAT.toon(0x3f4542), 1.9, 5.19, 1.25, { cast: false, edges: false });
  box(signage, 0.7, 0.06, 0.06, MAT.toon(0x3f4542), 1.9, 2.35, 1.25, { cast: false, edges: false });
  addGlowSprite(signage, 0xffce95, 1.62, 4.4, 1.55, 3.8, 0.16);

  /* ---------------- Awning and entrance ---------------- */

  const canopyMat = MAT.toon(0x174f49);
  const canopy = box(awningPart, 3.25, 0.16, 1.42, canopyMat, 7.9, 3.54, 1.66, {
    edges: true, edgeOpacity: 0.44,
  });
  canopy.rotation.x = -0.035;
  box(awningPart, 3.25, 0.09, 0.08, MAT.toon(0xefe5d2), 7.9, 3.47, 2.35, {
    cast: false, edges: false,
  });
  // Awning support struts.
  for (const x of [6.44, 9.36]) {
    const strut = cylinder(awningPart, 0.025, 0.025, 1.47, MAT.toon(0x515a55), x, 3.25, 1.7, {
      segments: 8,
      cast: false,
    });
    strut.rotation.x = 0.56;
  }
  // Downlights in the canopy.
  for (let i = 0; i < 3; i++) {
    const x = 6.95 + i * 0.95;
    cylinder(awningPart, 0.095, 0.095, 0.03, MAT.toon(0x2b3d3a), x, 3.45, 2.05, { segments: 16, cast: false });
    const bulb = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0xffdca3).multiplyScalar(1.35),
      toneMapped: false,
    });
    disc(awningPart, 0.073, bulb, x, 3.43, 2.05, { rot: [Math.PI / 2, 0, 0], segments: 16 });
    addGlowSprite(awningPart, 0xffca87, x, 3.36, 2.05, 1.15, 0.18);
  }

  // 24H sign on the awning valance.
  const awningSignTex = canvasTexture(768, 180, (ctx, w, h) => {
    ctx.fillStyle = '#174f49';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(239,221,183,0.65)';
    ctx.lineWidth = 3;
    ctx.strokeRect(12, 12, w - 24, h - 24);
    ctx.fillStyle = '#f4e7c9';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 48px ${EN}`;
    ctx.fillText('A WARM LIGHT,  ALL NIGHT', w / 2, 66);
    ctx.fillStyle = '#e9b875';
    ctx.font = `bold 33px ${JP}`;
    ctx.fillText('雨の夜も、お気軽に。', w / 2, 122);
  });
  addLabelPlane(awningPart, awningSignTex, 3.08, 0.42, 7.9, 3.37, 2.375, {
    toneMapped: false,
  });

  // Entrance mat.
  const matPlane = new THREE.MeshBasicMaterial({
    map: welcomeMatTex,
    toneMapped: false,
  });
  const mat = plane(pavementPart, 2.2, 0.98, matPlane, 7.9, 0.298, 1.82, {
    rot: [-Math.PI / 2, 0, 0],
    renderOrder: 2,
  });

  // Warm light spilling from the entrance.
  addSpot(7.9, 3.38, 1.9, 7.9, 0.2, 1.85, 0xffc380, 24, 8.5, 0.8);
  addStoreLight(7.9, 3.5, 1.75, 0xffd9a7, 10, 5.5);
  addStoreLight(4.6, 3.3, 1.6, 0xffca8a, 7, 4.8);
  addStoreLight(9.8, 3.15, 1.2, 0xffc37f, 6, 4.0);

  // Recycle / waste station sign next to the entrance.
  const recyclePanel = addLabelPlane(decorPart, vendingDecalTex, 0.64, 0.64, 9.92, 1.13, 1.5, {
    toneMapped: false,
  });
  recyclePanel.rotation.y = -0.28;

  /* ---------------- Side wall details ---------------- */

  // Bulletin board on the left wall.
  const boardCenterX = 1.935;
  box(decorPart, 0.08, 1.65, 1.22, MAT.toon(0x3d4b47), boardCenterX, 1.55, -0.23, {
    edges: true, edgeOpacity: 0.35,
  });
  box(decorPart, 0.045, 1.5, 1.08, MAT.toon(0x7d6e54), boardCenterX - 0.042, 1.55, -0.23, {
    cast: false, edges: false,
  });
  addLabelPlane(decorPart, noticeTex, 1.0, 1.35, boardCenterX - 0.075, 1.55, -0.23, {
    rot: [0, -Math.PI / 2, 0], toneMapped: false,
  });
  // Small gooseneck lamp above the board.
  cylinder(decorPart, 0.018, 0.018, 0.58, MAT.toon(0x5b625e), 1.98, 2.48, -0.23, {
    rot: [0, 0, Math.PI / 2], segments: 6, cast: false,
  });
  cylinder(decorPart, 0.09, 0.07, 0.1, MAT.toon(0x2e3a37), 1.68, 2.52, -0.23, {
    segments: 12, cast: false,
  });
  addGlowSprite(decorPart, 0xffce8f, 1.66, 2.43, -0.23, 0.6, 0.22);

  // Posters on the solid front-left wall.
  const posterTex1 = canvasTexture(384, 540, (ctx, w, h) => {
    ctx.fillStyle = '#e9d6ab';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#215f58';
    ctx.fillRect(0, 0, w, 76);
    ctx.fillStyle = '#f6ecd8';
    ctx.textAlign = 'center';
    ctx.font = `bold 36px ${JP}`;
    ctx.fillText('星夜マート', w / 2, 52);
    ctx.fillStyle = '#d07754';
    ctx.beginPath();
    ctx.arc(w / 2, 235, 106, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2e4c4';
    ctx.beginPath();
    ctx.arc(w / 2, 235, 84, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#245b54';
    ctx.font = `bold 39px ${JP}`;
    ctx.fillText('あったか', w / 2, 225);
    ctx.fillText('コーヒー', w / 2, 272);
    ctx.fillStyle = '#546e65';
    ctx.font = `18px ${JP}`;
    ctx.fillText('雨の夜に、一杯。', w / 2, 388);
    ctx.fillStyle = '#205c55';
    ctx.fillRect(66, 432, w - 132, 5);
    ctx.font = `bold 28px ${JP}`;
    ctx.fillText('HOT ¥160', w / 2, 478);
  });
  addLabelPlane(decorPart, posterTex1, 0.72, 1.02, 2.015, 1.95, 0.28, {
    rot: [0, -Math.PI / 2, 0], toneMapped: false,
  });

  // AC condensers: one on the side wall, one pair on the roof.
  makeAirConditioner(decorPart, 1.71, 2.72, -7.05, 0.66, 0.58, 0.94, -1);
  cylinder(decorPart, 0.035, 0.035, 2.2, MAT.toon(0xb9b1a1), 1.82, 1.0, -7.47, {
    segments: 7, cast: false,
  });

  // Small drainpipe on the corner.
  cylinder(decorPart, 0.048, 0.048, 4.0, MAT.toon(0x9e998b), 2.0, 2.2, 0.7, {
    segments: 8, cast: false,
  });
  for (let i = 0; i < 5; i++) {
    box(decorPart, 0.13, 0.04, 0.1, MAT.toon(0x6b6f68), 2.0, 0.7 + i * 0.82, 0.7, {
      cast: false, edges: false,
    });
  }

  // Rooftop units and vents.
  makeAirConditioner(roofPart, 5.3, 4.86, -5.9, 0.82, 0.66, 1.08, -1);
  makeAirConditioner(roofPart, 8.25, 4.82, -7.1, 0.74, 0.6, 0.95, -1);
  cylinder(roofPart, 0.13, 0.13, 0.8, MAT.toon(0x8d9189), 3.3, 4.95, -7.4, {
    segments: 12, cast: false,
  });
  const ventTop = cylinder(roofPart, 0.21, 0.12, 0.15, MAT.toon(0x5b625c), 3.3, 5.38, -7.4, {
    segments: 12, cast: false,
  });
  const ventHood = new THREE.Mesh(new THREE.ConeGeometry(0.27, 0.16, 12), MAT.toon(0x5b625c));
  ventHood.position.set(3.3, 5.48, -7.4);
  roofPart.add(ventHood);
  box(roofPart, 1.1, 0.08, 0.55, MAT.toon(0x6b716b), 7.1, 4.56, -2.25, {
    cast: false, edges: true, edgeOpacity: 0.25,
  });
  // Faint roof safety rail along the back.
  for (let i = 0; i < 4; i++) {
    cylinder(roofPart, 0.018, 0.018, 0.75, MAT.toon(0x636d68), 3.9 + i * 1.55, 4.9, -8.3, {
      segments: 6, cast: false,
    });
  }

  // Slight dirt / water streaks under the roof lip.
  const streakMat = new THREE.MeshBasicMaterial({
    color: 0x1b2928,
    transparent: true,
    opacity: 0.22,
  });
  for (let i = 0; i < 6; i++) {
    plane(decorPart, 0.1 + Math.random() * 0.13, 0.6 + Math.random() * 0.7, streakMat, 2.3 + i * 0.9, 3.75, 1.06, {
      rot: [0, 0, 0],
    });
  }

  // Boot mat / drainage strip.
  const bootMat = new THREE.MeshBasicMaterial({ color: 0x4e5c58, transparent: true, opacity: 0.65 });
  plane(pavementPart, 2.2, 0.22, bootMat, 7.9, 0.3, 1.89, { rot: [-Math.PI / 2, 0, 0] });

  // Neon spill and reflections from the shop.
  addPool(pavementPart, 0xffb15b, 8.8, 3.0, 7.15, 2.55, 0.25, 0.313);
  addStreak(pavementPart, 0xffd094, 0.95, 3.8, 8.05, 2.9, 0.32, 0.315);
  addStreak(pavementPart, 0xff7e98, 0.5, 2.0, 7.9, 2.3, 0.18, 0.316);
  addStreak(pavementPart, 0x8cd9c4, 0.44, 1.8, 6.4, 2.4, 0.12, 0.316);

  /* ---------------- Extra facade lights ---------------- */
  addStoreLight(2.35, 2.55, 0.0, 0xffd19a, 5.5, 2.7); // bulletin board

  storeInfo.windowCenters = {
    frontGlass: new THREE.Vector3(6.2, 2.2, 1.0),
    sideGlass: new THREE.Vector3(2.0, 2.2, -3.7),
    door: new THREE.Vector3(7.9, 2.0, 1.0),
  };

  return { structure, glassPart, signage, awningPart, pavementPart, decorPart, roofPart };
}
