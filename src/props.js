import {
  THREE, C, MAT, TEX, world, part,
  canvasTexture, roundRect, box, plane, disc, cylinder, roundedBox, tube,
  addGlowSprite, addPool, addStreak, addLabelPlane, edges,
} from './core.js';

const JP = '"Yu Gothic", "Hiragino Kaku Gothic ProN", "Meiryo", "Noto Sans JP", sans-serif';
const EN = '"Avenir Next", "Futura", "Century Gothic", "Trebuchet MS", sans-serif';

export const streetLights = [];

function addStreetLight(x, y, z, color, intensity, distance) {
  const light = new THREE.PointLight(color, intensity, distance, 2);
  light.position.set(x, y, z);
  world.add(light);
  streetLights.push({ light, baseIntensity: intensity });
  return light;
}

/* ------------------------------------------------------------------ */
/*  Textures                                                           */
/* ------------------------------------------------------------------ */

const vendingFrontTex = canvasTexture(640, 1180, (ctx, w, h) => {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#f7f1e2');
  bg.addColorStop(1, '#ded6c5');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Header.
  ctx.fillStyle = '#164e4a';
  ctx.fillRect(0, 0, w, 150);
  ctx.fillStyle = '#f6e9cd';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold 49px ${JP}`;
  ctx.fillText('つめたい 飲みもの', w / 2, 69);
  ctx.fillStyle = '#e9b56e';
  ctx.font = `600 26px ${EN}`;
  ctx.fillText('HOSHIZORA DRINK BAR  ·  ICE COLD', w / 2, 117);

  // Product window.
  ctx.fillStyle = '#cfe7e9';
  ctx.fillRect(22, 175, w - 44, 610);
  const grad = ctx.createLinearGradient(0, 175, 0, 785);
  grad.addColorStop(0, 'rgba(255,255,255,0.92)');
  grad.addColorStop(0.45, 'rgba(229,248,252,0.32)');
  grad.addColorStop(1, 'rgba(87,157,170,0.15)');
  ctx.fillStyle = grad;
  ctx.fillRect(22, 175, w - 44, 610);

  const drinks = [
    ['#d64c3e', 'COLA'], ['#e7b83d', 'TEA'], ['#4a9d74', 'MELON'], ['#6aa9d2', 'WATER'],
    ['#ea7190', 'PEACH'], ['#f2eee2', 'MILK'], ['#375f91', 'SPORTS'], ['#d9853f', 'COCOA'],
    ['#96b84f', 'LEMON'], ['#8e67aa', 'GRAPE'], ['#e24c47', 'TOMATO'], ['#d9dde0', 'SODA'],
  ];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const idx = row * 4 + col;
      const x = 48 + col * 140;
      const y = 210 + row * 190;
      ctx.fillStyle = 'rgba(17,47,52,0.24)';
      roundRect(ctx, x + 6, y + 14, 104, 126, 10);
      ctx.fill();
      ctx.fillStyle = drinks[idx][0];
      roundRect(ctx, x + 22, y + 26, 72, 96, 12);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(x + 30, y + 39, 12, 57);
      ctx.fillStyle = '#f8f2e2';
      roundRect(ctx, x + 30, y + 46, 56, 30, 4);
      ctx.fill();
      ctx.fillStyle = drinks[idx][0];
      ctx.font = `bold 12px ${EN}`;
      ctx.textAlign = 'center';
      ctx.fillText(drinks[idx][1], x + 58, y + 67);
      ctx.fillStyle = '#f3ebd8';
      roundRect(ctx, x + 30, y + 112, 56, 16, 3);
      ctx.fill();
      ctx.fillStyle = '#1c5550';
      ctx.font = `bold 13px ${JP}`;
      ctx.fillText('¥130', x + 58, y + 124);
      // Selection button.
      ctx.fillStyle = idx % 3 === 0 ? '#db6a4f' : '#2d6d64';
      ctx.fillRect(x + 45, y + 154, 26, 8);
    }
  }

  // Buttons / payment strip.
  ctx.fillStyle = '#e8e0cf';
  ctx.fillRect(22, 806, w - 44, 136);
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i === 1 ? '#d05f49' : '#2b665e';
    roundRect(ctx, 44 + i * 112, 829, 76, 26, 7);
    ctx.fill();
    ctx.fillStyle = '#fbf4e4';
    ctx.font = `600 12px ${EN}`;
    ctx.textAlign = 'center';
    ctx.fillText(i === 1 ? 'HOT' : 'COLD', 82 + i * 112, 847);
  }
  ctx.fillStyle = '#2b3436';
  ctx.fillRect(42, 879, 136, 36);
  ctx.fillStyle = '#83e2cc';
  ctx.font = `600 18px ${EN}`;
  ctx.fillText('1 3 0', 110, 897);
  ctx.fillStyle = '#64625b';
  ctx.font = `13px ${JP}`;
  ctx.fillText('現金 / IC', 226, 897);
  ctx.fillStyle = '#343c3c';
  ctx.fillRect(438, 864, 122, 52);
  ctx.fillStyle = '#a5ada9';
  ctx.fillRect(454, 876, 58, 7);
  ctx.fillStyle = '#d05f49';
  ctx.beginPath();
  ctx.arc(520, 892, 7, 0, Math.PI * 2);
  ctx.fill();

  // Dispensing flap.
  ctx.fillStyle = '#263b3a';
  roundRect(ctx, 72, 1002, w - 144, 108, 13);
  ctx.fill();
  ctx.fillStyle = '#152321';
  roundRect(ctx, 92, 1022, w - 184, 66, 8);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(110, 1034, w - 220, 4);

  ctx.fillStyle = '#52645f';
  ctx.font = `600 15px ${EN}`;
  ctx.textAlign = 'center';
  ctx.fillText('HOSHIZORA VENDING  /  NO. 24', w / 2, 1150);
});

const vendingSideTex = canvasTexture(512, 1180, (ctx, w, h) => {
  ctx.fillStyle = '#eee7d8';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#174f4a';
  ctx.fillRect(0, 0, w, 130);
  ctx.fillStyle = '#f2e5c8';
  ctx.textAlign = 'center';
  ctx.font = `bold 42px ${JP}`;
  ctx.fillText('星夜マート', w / 2, 76);
  ctx.fillStyle = '#d8b16b';
  ctx.font = `600 17px ${EN}`;
  ctx.fillText('DRINK  ·  COFFEE  ·  SNACK', w / 2, 110);
  ctx.fillStyle = '#d8cfbd';
  ctx.fillRect(0, 130, w, 4);
  ctx.fillStyle = '#f6eedf';
  ctx.beginPath();
  ctx.arc(w / 2, 365, 150, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2f6a60';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(w / 2, 365, 150, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#2f6a60';
  ctx.font = `800 118px ${EN}`;
  ctx.fillText('24', w / 2, 372);
  ctx.fillStyle = '#d27754';
  ctx.font = `bold 31px ${JP}`;
  ctx.fillText('年中無休', w / 2, 443);
  ctx.fillStyle = '#2d5d56';
  ctx.font = `bold 43px ${JP}`;
  ctx.fillText('雨の夜も', w / 2, 640);
  ctx.fillText('あたたかく。', w / 2, 700);
  ctx.fillStyle = '#7c8a82';
  ctx.font = `19px ${EN}`;
  ctx.fillText('COLD DRINKS & HOT COFFEE', w / 2, 770);
  ctx.fillStyle = 'rgba(21,67,60,0.12)';
  for (let i = 0; i < 4; i++) ctx.fillRect(36, 850 + i * 46, w - 72, 6);
  ctx.fillStyle = '#c7bfaf';
  ctx.fillRect(0, 1040, w, 2);
  ctx.fillStyle = '#d9d2c4';
  ctx.fillRect(36, 1080, w - 72, 4);
});

const trashLabelTex = (label, en, color) => canvasTexture(256, 320, (ctx, w, h) => {
  ctx.fillStyle = '#f2ecdc';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, 66);
  ctx.fillStyle = '#f8f1df';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold 33px ${JP}`;
  ctx.fillText(label, w / 2, 35);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(w / 2, 155, 63, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f8f1df';
  ctx.font = `600 31px ${EN}`;
  ctx.fillText(en, w / 2, 155);
  ctx.fillStyle = '#5d675f';
  ctx.font = `18px ${JP}`;
  ctx.fillText('リサイクル', w / 2, 252);
  ctx.fillStyle = '#7e8379';
  ctx.font = `14px ${EN}`;
  ctx.fillText('THANK YOU', w / 2, 281);
});

const stopSignTex = canvasTexture(512, 512, (ctx, w, h) => {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#b9382f';
  ctx.beginPath();
  ctx.arc(256, 256, 244, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f1e6d2';
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.arc(256, 256, 216, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#f8f0df';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold 134px ${JP}`;
  ctx.fillText('止まれ', 256, 236);
  ctx.font = `600 46px ${EN}`;
  ctx.fillText('STOP', 256, 349);
});

const streetNameTex = canvasTexture(768, 236, (ctx, w, h) => {
  ctx.fillStyle = '#eae6d9';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#1b5f59';
  ctx.lineWidth = 16;
  ctx.strokeRect(9, 9, w - 18, h - 18);
  ctx.fillStyle = '#1b5f59';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold 82px ${JP}`;
  ctx.fillText('星夜町 二丁目', w / 2, 98);
  ctx.font = `600 34px ${EN}`;
  ctx.fillText('HOSHIZORA-CHO 2-CHOME', w / 2, 174);
});

const parkingSignTex = canvasTexture(512, 512, (ctx, w, h) => {
  ctx.fillStyle = '#205f92';
  ctx.fillRect(8, 8, w - 16, h - 16);
  ctx.strokeStyle = '#f0eee3';
  ctx.lineWidth = 20;
  ctx.strokeRect(24, 24, w - 48, h - 48);
  ctx.fillStyle = '#f4f1e5';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `800 305px ${EN}`;
  ctx.fillText('P', w / 2, 240);
  ctx.font = `bold 48px ${JP}`;
  ctx.fillText('駐車場', w / 2, 425);
});

const alleySignTex = canvasTexture(384, 1024, (ctx, w, h) => {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#f8e8d3');
  bg.addColorStop(1, '#e8d3b5');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#a34439';
  ctx.lineWidth = 9;
  ctx.strokeRect(10, 10, w - 20, h - 20);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#9f3d35';
  ctx.font = `bold 142px ${JP}`;
  ctx.fillText('路', w / 2, 172);
  ctx.fillText('地', w / 2, 340);
  ctx.fillStyle = '#4b5b54';
  ctx.font = `bold 34px ${JP}`;
  ctx.fillText('星夜横丁', w / 2, 495);
  ctx.fillStyle = '#b65d45';
  ctx.font = `600 24px ${EN}`;
  ctx.fillText('ALLEY', w / 2, 550);
  // Arrow and little lantern dot.
  ctx.strokeStyle = '#a34a3d';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(w / 2, 620);
  ctx.lineTo(w / 2, 770);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(w / 2 - 43, 720);
  ctx.lineTo(w / 2, 780);
  ctx.lineTo(w / 2 + 43, 720);
  ctx.stroke();
  ctx.fillStyle = '#ba5a45';
  ctx.beginPath();
  ctx.arc(w / 2, 890, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f3e4c7';
  ctx.font = `600 18px ${EN}`;
  ctx.fillText('OPEN', w / 2, 890);
});

const norenTex = canvasTexture(1024, 512, (ctx, w, h) => {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#223d45';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(240,225,195,0.6)';
  ctx.lineWidth = 4;
  ctx.strokeRect(14, 14, w - 28, h - 28);
  ctx.fillStyle = '#f0e3c7';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold 176px ${JP}`;
  ctx.fillText('星 夜', w / 2, 210);
  ctx.fillStyle = '#d2aa6c';
  ctx.font = `600 42px ${EN}`;
  ctx.fillText('HOSHIZORA YOKOCHO', w / 2, 367);
  // Split seams of the noren cloth.
  ctx.strokeStyle = 'rgba(12,28,30,0.45)';
  ctx.lineWidth = 6;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo((w / 4) * i, 0);
    ctx.lineTo((w / 4) * i, h);
    ctx.stroke();
  }
});

function mirrorTexture() {
  return canvasTexture(256, 256, (ctx, w, h) => {
    const g = ctx.createRadialGradient(128, 126, 8, 128, 128, 120);
    g.addColorStop(0, '#bdd9e6');
    g.addColorStop(0.36, '#5f8498');
    g.addColorStop(0.58, '#263e50');
    g.addColorStop(1, '#11202c');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // Abstract reflected neon + street.
    ctx.globalAlpha = 0.7;
    const neon = ctx.createLinearGradient(0, 90, 0, 170);
    neon.addColorStop(0, '#ffbb74');
    neon.addColorStop(1, 'rgba(255,126,96,0)');
    ctx.fillStyle = neon;
    ctx.fillRect(70, 90, 26, 90);
    ctx.fillStyle = '#6fd0c0';
    ctx.fillRect(154, 60, 14, 108);
    ctx.fillStyle = 'rgba(221,238,250,0.4)';
    ctx.fillRect(32, 186, 190, 6);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(230,245,255,0.35)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(128, 128, 112, 0, Math.PI * 2);
    ctx.stroke();
  });
}

/* ------------------------------------------------------------------ */
/*  Vending machine                                                    */
/* ------------------------------------------------------------------ */

function buildVendingMachine() {
  const g = part(5.72, { from: [0, 2.0, 0], duration: 1.05, bounce: 0.3 });
  g.position.set(2.68, 0.3, 4.2);
  g.rotation.y = -0.09;

  const bodyMat = MAT.toon(0xe9e2d3);
  const body = roundedBox(g, 1.1, 1.84, 0.78, 0.035, bodyMat, 0, 0.92, 0, {
    segments: 3, edges: true, edgeOpacity: 0.28,
  });
  box(g, 1.12, 0.12, 0.8, MAT.toon(0x174e49), 0, 1.82, 0, { edges: false });
  // Front luminous panel.
  const frontMat = new THREE.MeshBasicMaterial({
    map: vendingFrontTex,
    toneMapped: false,
  });
  const front = plane(g, 1.0, 1.7, frontMat, 0, 0.9, 0.395, { renderOrder: 2 });
  // Side panel image.
  const sideMat = new THREE.MeshBasicMaterial({
    map: vendingSideTex,
    toneMapped: false,
  });
  plane(g, 0.7, 1.68, sideMat, -0.557, 0.9, 0, {
    rot: [0, -Math.PI / 2, 0],
    renderOrder: 2,
  });
  plane(g, 0.7, 1.68, sideMat, 0.557, 0.9, 0, {
    rot: [0, Math.PI / 2, 0],
    renderOrder: 2,
  });

  // Glass rim around the product window.
  box(g, 0.98, 0.03, 0.035, MAT.toon(0x9eb2ad), 0, 1.67, 0.42, { cast: false, edges: false });
  box(g, 0.98, 0.03, 0.035, MAT.toon(0x9eb2ad), 0, 1.19, 0.42, { cast: false, edges: false });
  // Coin box on the side.
  box(g, 0.1, 0.36, 0.1, MAT.toon(0x3f4948), 0.53, 0.74, 0.41, { edges: false });
  box(g, 0.14, 0.035, 0.02, MAT.toon(0x212c2c), 0.53, 0.83, 0.47, { cast: false, edges: false });
  // Feet.
  for (const x of [-0.42, 0.42]) {
    box(g, 0.16, 0.08, 0.16, MAT.toon(0x353b39), x, 0.04, 0.2, { cast: false, edges: false });
  }

  addGlowSprite(g, 0xcef5ff, 0, 1.02, 0.55, 2.0, 0.11);
  addGlowSprite(g, 0xffcf98, 0, 1.75, 0.45, 1.2, 0.08);

  // Small recycling bin beside the vending machine.
  const bin = new THREE.Group();
  g.add(bin);
  bin.position.set(0.88, 0, 0.02);
  box(bin, 0.42, 0.58, 0.4, MAT.toon(0x465956), 0, 0.29, 0, {
    edges: true, edgeOpacity: 0.3,
  });
  box(bin, 0.43, 0.055, 0.41, MAT.toon(0x274a46), 0, 0.59, 0, { edges: false });
  box(bin, 0.22, 0.08, 0.02, MAT.toon(0x111817), 0, 0.5, 0.21, { cast: false, edges: false });

  // Reflection and lamp spill on the wet pavement.
  addPool(g, 0xc8e9e9, 2.7, 2.2, 0, 0.28, 0.22, 0.014);
  addStreak(g, 0xc0ebec, 0.55, 1.7, -0.18, 0.72, 0.2, 0.016, -0.05);
  addStreak(g, 0xffd49c, 0.35, 1.25, 0.35, 0.65, 0.13, 0.016, 0.1);
  addStreetLight(2.68, 2.1, 4.65, 0xd4f2f0, 8, 3.3);

  return g;
}

/* ------------------------------------------------------------------ */
/*  Bicycle                                                            */
/* ------------------------------------------------------------------ */

function buildBicycle() {
  const g = part(6.02, { from: [0.8, 1.6, 0.6], duration: 1.1, bounce: 0.18 });
  g.position.set(1.3, 0.3, -3.3);
  g.rotation.y = Math.PI / 2;
  g.rotation.z = -0.075;

  const frameMat = MAT.toon(0x2f7167);
  const dark = MAT.toon(0x1d2425);
  const cream = MAT.toon(0xe3d8c0);
  const wheelMat = MAT.rubber;
  const rimMat = MAT.chrome;

  const rear = new THREE.Vector3(0.6, 0.36, 0);
  const front = new THREE.Vector3(-0.62, 0.36, 0);
  const crank = new THREE.Vector3(0.03, 0.36, 0);
  const seat = new THREE.Vector3(0.23, 0.94, 0);
  const head = new THREE.Vector3(-0.41, 0.88, 0);
  const frontHub = front.clone();

  function makeWheel(pos) {
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.335, 0.018, 6, 26), wheelMat);
    wheel.position.copy(pos);
    wheel.rotation.y = 0;
    wheel.castShadow = true;
    g.add(wheel);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.009, 4, 24), rimMat);
    rim.position.copy(pos);
    g.add(rim);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      tube(g, [pos.x, pos.y, pos.z], [pos.x + Math.cos(a) * 0.29, pos.y + Math.sin(a) * 0.29, pos.z], 0.0035, MAT.chrome, {
        segments: 4, cast: false,
      });
    }
    const hub = cylinder(g, 0.044, 0.044, 0.055, MAT.chrome, pos.x, pos.y, pos.z, {
      rot: [Math.PI / 2, 0, 0], segments: 10, cast: false,
    });
    return wheel;
  }
  makeWheel(rear);
  makeWheel(front);

  const addTube = (a, b, r, m) => tube(g, [a.x, a.y, a.z], [b.x, b.y, b.z], r, m, { segments: 8 });

  addTube(rear, crank, 0.027, frameMat);
  addTube(crank, seat, 0.027, frameMat);
  addTube(seat, rear, 0.025, frameMat);
  addTube(seat, head, 0.026, frameMat);
  addTube(crank, head, 0.028, frameMat);
  addTube(head, frontHub, 0.022, chromeOr(frameMat));
  addTube(rear, seat, 0.015, cream);
  addTube(head, seat, 0.016, cream);
  // Front fork.
  addTube(head, new THREE.Vector3(-0.58, 0.37, 0.09), 0.013, frameMat);
  addTube(head, new THREE.Vector3(-0.58, 0.37, -0.09), 0.013, frameMat);

  function chromeOr(m) { return m; }

  // Seat post and saddle.
  addTube(seat, new THREE.Vector3(0.23, 1.1, 0), 0.017, MAT.chrome);
  const saddle = box(g, 0.3, 0.075, 0.15, MAT.toon(0x252c2b), 0.22, 1.13, 0, {
    edges: true, edgeOpacity: 0.25,
  });
  saddle.rotation.z = 0.03;
  // Handlebar.
  addTube(new THREE.Vector3(-0.41, 0.88, 0), new THREE.Vector3(-0.47, 1.17, 0), 0.017, MAT.chrome);
  tube(g, [-0.47, 1.17, -0.26], [-0.47, 1.17, 0.26], 0.018, MAT.chrome, { segments: 8 });
  for (const z of [-0.26, 0.26]) {
    cylinder(g, 0.027, 0.027, 0.12, dark, -0.47, 1.17, z, {
      rot: [Math.PI / 2, 0, 0], segments: 8, cast: false,
    });
  }
  // Crank and pedals.
  cylinder(g, 0.07, 0.07, 0.04, MAT.chrome, 0.03, 0.36, 0.06, {
    rot: [Math.PI / 2, 0, 0], segments: 12, cast: false,
  });
  cylinder(g, 0.07, 0.07, 0.04, MAT.chrome, 0.03, 0.36, -0.06, {
    rot: [Math.PI / 2, 0, 0], segments: 12, cast: false,
  });
  box(g, 0.08, 0.025, 0.17, dark, 0.13, 0.27, 0.12, { cast: false, edges: false });
  box(g, 0.08, 0.025, 0.17, dark, -0.07, 0.45, -0.12, { cast: false, edges: false });

  // Wire basket at the front.
  const basket = new THREE.Group();
  g.add(basket);
  basket.position.set(-0.63, 1.03, 0);
  const basketMat = MAT.toon(0x4e5552);
  for (let i = 0; i < 6; i++) {
    box(basket, 0.025, 0.29, 0.34, basketMat, -0.18 + i * 0.072, 0, 0, { cast: false, edges: false });
  }
  box(basket, 0.37, 0.025, 0.34, basketMat, 0, 0.15, 0, { cast: false, edges: false });
  box(basket, 0.37, 0.025, 0.34, basketMat, 0, -0.15, 0, { cast: false, edges: false });
  for (let i = 0; i < 4; i++) {
    box(basket, 0.37, 0.025, 0.03, basketMat, 0, 0, -0.16 + i * 0.1, { cast: false, edges: false });
  }
  // A small shopping bag in the basket.
  box(basket, 0.18, 0.18, 0.16, MAT.toon(0xe8ddc8), 0.02, 0.02, 0.02, { edges: true, edgeOpacity: 0.2 });
  // Kickstand.
  tube(g, [0.15, 0.34, 0.02], [0.3, 0.02, 0.14], 0.012, MAT.chrome, { segments: 6, cast: false });
  // Mudguards.
  const guardMat = MAT.toon(0x234b47);
  const guard1 = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.018, 4, 14, Math.PI * 0.72), guardMat);
  guard1.position.copy(rear);
  guard1.rotation.z = 1.12;
  guard1.rotation.y = 0.03;
  g.add(guard1);
  const guard2 = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.018, 4, 14, Math.PI * 0.72), guardMat);
  guard2.position.copy(front);
  guard2.rotation.z = 1.12;
  g.add(guard2);

  // Tiny bell.
  cylinder(g, 0.035, 0.035, 0.035, MAT.brass, -0.43, 1.22, -0.17, { segments: 10, cast: false });
  return g;
}

/* ------------------------------------------------------------------ */
/*  Umbrella stand and bins                                            */
/* ------------------------------------------------------------------ */

function buildEntranceDetails() {
  const g = part(5.98, { from: [0.3, 1.4, 0], duration: 1.0, bounce: 0.2 });
  g.position.set(0, 0, 0);

  // Umbrella stand.
  const stand = new THREE.Group();
  g.add(stand);
  stand.position.set(6.25, 0.29, 1.62);
  cylinder(stand, 0.2, 0.16, 0.5, MAT.toon(0x6f7772), 0, 0.25, 0, { segments: 18, cast: true });
  cylinder(stand, 0.175, 0.175, 0.03, MAT.toon(0x313a38), 0, 0.03, 0, { segments: 18, cast: false });
  const umbCols = [0xe5deca, 0x385e78, 0x9e4e4a, 0x3f6d5d];
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.3;
    const bx = Math.cos(a) * 0.11;
    const bz = Math.sin(a) * 0.11;
    const tx = Math.cos(a) * 0.34;
    const tz = Math.sin(a) * 0.34;
    const shaft = tube(stand, [bx, 0.18, bz], [tx, 1.18, tz], 0.011, MAT.chrome, { segments: 6 });
    const canopyMat = new THREE.MeshPhysicalMaterial({
      color: umbCols[i],
      transparent: true,
      opacity: 0.72,
      roughness: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.2, 10, 1, true), canopyMat);
    canopy.position.set(tx, 1.12, tz);
    canopy.rotation.z = -Math.cos(a) * 0.2;
    canopy.rotation.x = Math.sin(a) * 0.2;
    canopy.castShadow = true;
    stand.add(canopy);
    tube(stand, [tx, 1.07, tz], [tx + Math.cos(a) * 0.26, 0.94, tz + Math.sin(a) * 0.26], 0.012, MAT.chrome, {
      segments: 6, cast: false,
    });
  }
  addPool(g, 0x91b1c2, 1.3, 1.0, 6.25, 1.62, 0.12, 0.31);

  // Three tidy recycling bins by the vending machine.
  const binData = [
    ['燃えるごみ', 'BURN', '#a95147', 3.54, 4.33],
    ['かん', 'CAN', '#276e69', 4.08, 4.35],
    ['ペットボトル', 'PET', '#486d92', 4.62, 4.31],
  ];
  binData.forEach(([label, en, color, x, z], i) => {
    const bin = new THREE.Group();
    bin.position.set(x, 0.29, z);
    bin.rotation.y = 0.2 - i * 0.08;
    g.add(bin);
    box(bin, 0.47, 0.66, 0.46, MAT.toon(0xcfc8b9), 0, 0.33, 0, {
      edges: true, edgeOpacity: 0.28,
    });
    box(bin, 0.49, 0.08, 0.48, MAT.toon(color), 0, 0.69, 0, { edges: true, edgeOpacity: 0.22 });
    box(bin, 0.19, 0.07, 0.02, MAT.toon(0x252c2b), 0, 0.57, 0.24, { cast: false, edges: false });
    const labelMat = new THREE.MeshBasicMaterial({ map: trashLabelTex(label, en, color), toneMapped: false });
    plane(bin, 0.36, 0.47, labelMat, 0, 0.35, 0.232, { renderOrder: 2 });
    box(bin, 0.08, 0.32, 0.03, MAT.toon(0x5f625b), -0.28, 0.45, 0, { cast: false, edges: false });
  });

  // Potted shrubs: two small ones flanking the doorway.
  for (const [x, z, s] of [[6.42, 1.98, 0.85], [9.38, 1.96, 0.75]]) {
    const pot = new THREE.Group();
    pot.position.set(x, 0.29, z);
    g.add(pot);
    cylinder(pot, 0.19 * s, 0.14 * s, 0.32 * s, MAT.toon(0x8f684b), 0, 0.16 * s, 0, { segments: 12 });
    for (let i = 0; i < 6; i++) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.12 * s, 6, 5), MAT.toon(i % 2 ? 0x346849 : 0x2a5840));
      leaf.position.set((Math.random() - 0.5) * 0.24 * s, 0.4 * s + Math.random() * 0.25 * s, (Math.random() - 0.5) * 0.24 * s);
      leaf.scale.y = 1.3;
      leaf.castShadow = true;
      pot.add(leaf);
    }
  }

  return g;
}

/* ------------------------------------------------------------------ */
/*  Street lamps, utility pole and wires                               */
/* ------------------------------------------------------------------ */

function buildStreetLamp() {
  const g = part(6.18, { from: [1.8, 2.0, 0], duration: 1.05 });
  g.position.set(10.55, 0.3, 4.85);

  cylinder(g, 0.055, 0.085, 4.45, MAT.toon(0x3e4b4b), 0, 2.22, 0, { segments: 12 });
  cylinder(g, 0.16, 0.2, 0.2, MAT.toon(0x313b3b), 0, 0.1, 0, { segments: 16 });
  cylinder(g, 0.07, 0.07, 0.18, MAT.toon(0x4c5755), 0, 0.3, 0, { segments: 12 });

  // Curved arm built from short segments.
  const arc = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0, 4.42, 0),
    new THREE.Vector3(0, 5.05, 0.18),
    new THREE.Vector3(0, 4.92, 0.8)
  );
  const arm = new THREE.Mesh(new THREE.TubeGeometry(arc, 18, 0.042, 5, false), MAT.toon(0x3e4b4b));
  arm.castShadow = true;
  g.add(arm);
  // Lamp head.
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.25, 14, 1, true), MAT.toon(0x405052));
  shade.position.set(0, 4.84, 0.8);
  shade.rotation.x = Math.PI;
  g.add(shade);
  const bulbMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xffd7a0).multiplyScalar(1.8),
    toneMapped: false,
  });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8), bulbMat);
  bulb.position.set(0, 4.75, 0.8);
  g.add(bulb);
  addGlowSprite(g, 0xffc57e, 0, 4.75, 0.8, 3.2, 0.4);
  addGlowSprite(g, 0xffdc9e, 0, 4.75, 0.8, 8.5, 0.1);

  // Banner on the lamp post.
  const bannerTex = canvasTexture(320, 680, (ctx, w, h) => {
    ctx.fillStyle = '#1c5954';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#d9bd81';
    ctx.lineWidth = 7;
    ctx.strokeRect(12, 12, w - 24, h - 24);
    ctx.fillStyle = '#f0e2c6';
    ctx.textAlign = 'center';
    ctx.font = `bold 52px ${JP}`;
    ctx.fillText('星夜町', w / 2, 98);
    ctx.fillStyle = '#e7b56f';
    ctx.font = `600 24px ${EN}`;
    ctx.fillText('NIGHT TOWN', w / 2, 145);
    ctx.fillStyle = '#f2e8d4';
    ctx.font = `bold 38px ${JP}`;
    ctx.fillText('安全運転', w / 2, 275);
    ctx.fillText('お願いします', w / 2, 323);
    ctx.fillStyle = '#d7bc84';
    ctx.beginPath();
    ctx.arc(w / 2, 460, 54, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1c5954';
    ctx.font = `800 55px ${EN}`;
    ctx.fillText('24', w / 2, 471);
    ctx.fillStyle = '#f3e9d6';
    ctx.font = `18px ${EN}`;
    ctx.fillText('HOSHIZORA', w / 2, 565);
    ctx.fillText('MART', w / 2, 590);
  });
  const banner = new THREE.Mesh(
    new THREE.PlaneGeometry(0.62, 1.32),
    new THREE.MeshBasicMaterial({ map: bannerTex, side: THREE.DoubleSide, toneMapped: false })
  );
  banner.position.set(0, 3.35, 0);
  banner.rotation.y = -0.15;
  g.add(banner);

  addStreetLight(10.55, 4.75, 5.65, 0xffc178, 36, 9.5);
  addPool(g, 0xffb668, 6.0, 3.2, 0, 1.0, 0.24, 0.012);
  addStreak(g, 0xffcb88, 0.78, 4.2, 0.1, 1.3, 0.25, 0.014, 0.04);

  return g;
}

function buildUtilityPole() {
  const g = part(6.32, { from: [-0.6, 3.2, 0], duration: 1.2 });
  const pole1 = new THREE.Group();
  pole1.position.set(-5.72, 0.3, 3.95);
  g.add(pole1);

  const concreteMat = MAT.toon(0x8e9090);
  cylinder(pole1, 0.15, 0.24, 8.85, concreteMat, 0, 4.42, 0, { segments: 14 });
  cylinder(pole1, 0.3, 0.32, 0.5, MAT.toon(0x747a79), 0, 0.25, 0, { segments: 14 });
  // Yellow-black guard at the base.
  for (let i = 0; i < 4; i++) {
    const ring = cylinder(pole1, 0.195, 0.21, 0.28, MAT.toon(i % 2 ? 0xd7b64d : 0x272d2b), 0, 0.62 + i * 0.28, 0, {
      segments: 14, cast: false,
    });
  }
  // Crossarms.
  for (const [y, w] of [[7.9, 4.2], [7.3, 3.3], [6.65, 2.2]]) {
    box(pole1, w, 0.14, 0.14, MAT.toon(0x4c5350), 0, y, 0, { edges: true, edgeOpacity: 0.28 });
    for (let i = -2; i <= 2; i++) {
      const x = i * (w / 5);
      if (Math.abs(x) > w * 0.45) continue;
      cylinder(pole1, 0.055, 0.07, 0.2, MAT.toon(0xd5d0c0), x, y + 0.14, 0, { segments: 8, cast: false });
      cylinder(pole1, 0.09, 0.09, 0.035, MAT.toon(0x7c8582), x, y + 0.25, 0, { segments: 10, cast: false });
    }
  }
  // Transformer.
  const transformer = cylinder(pole1, 0.28, 0.28, 0.76, MAT.toon(0x606866), 0.5, 6.12, 0, { segments: 14 });
  for (let i = 0; i < 5; i++) {
    box(pole1, 0.4, 0.56, 0.035, MAT.toon(0x565d5b), 0.5, 6.12, -0.3 + i * 0.12, { cast: false, edges: false });
  }
  cylinder(pole1, 0.07, 0.09, 0.22, MAT.toon(0x3e4643), 0.5, 6.62, 0, { segments: 10, cast: false });
  // Utility boxes and steps.
  box(pole1, 0.28, 0.44, 0.2, MAT.toon(0x7c847d), 0.24, 2.8, 0.12, { edges: true, edgeOpacity: 0.25 });
  for (let i = 0; i < 7; i++) {
    box(pole1, 0.08, 0.04, 0.3, MAT.toon(0x5c6460), 0, 1.4 + i * 0.72, 0.15, { cast: false, edges: false });
  }
  // Pole label.
  const labelTex = canvasTexture(256, 380, (ctx, w, h) => {
    ctx.fillStyle = '#e9e5d8';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1d5d58';
    ctx.fillRect(0, 0, w, 56);
    ctx.fillStyle = '#f0e8d7';
    ctx.font = `bold 27px ${JP}`;
    ctx.textAlign = 'center';
    ctx.fillText('電力柱', w / 2, 39);
    ctx.fillStyle = '#4e5e59';
    ctx.font = `600 25px ${EN}`;
    ctx.fillText('No. 24-17', w / 2, 111);
    ctx.font = `bold 21px ${JP}`;
    ctx.fillText('星夜町二丁目', w / 2, 151);
    ctx.fillStyle = '#d67556';
    ctx.fillRect(33, 181, w - 66, 5);
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = '#6f7a73';
      ctx.font = `16px ${EN}`;
      ctx.fillText('HOSHIZORA ELECTRIC', w / 2, 220 + i * 26);
    }
  });
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.35, 0.52),
    new THREE.MeshBasicMaterial({ map: labelTex, toneMapped: false })
  );
  label.position.set(0.11, 2.25, 0.21);
  label.rotation.y = 0.25;
  pole1.add(label);

  // The cool street light on the pole, arm reaching over the crossing.
  const arm = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0, 5.3, 0),
    new THREE.Vector3(0, 5.8, 0.6),
    new THREE.Vector3(0, 5.6, 1.3)
  );
  const armMesh = new THREE.Mesh(new THREE.TubeGeometry(arm, 14, 0.038, 5, false), MAT.toon(0x57605d));
  pole1.add(armMesh);
  const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.2, 12, 1, true), MAT.toon(0x4e5d5d));
  lampShade.position.set(0, 5.52, 1.3);
  lampShade.rotation.x = Math.PI;
  pole1.add(lampShade);
  const coolBulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 10, 7),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(0xbfe2ff).multiplyScalar(1.6), toneMapped: false })
  );
  coolBulb.position.set(0, 5.43, 1.3);
  pole1.add(coolBulb);
  addGlowSprite(pole1, 0x9fc9ff, 0, 5.43, 1.3, 3.4, 0.35);
  addGlowSprite(pole1, 0xaed2ff, 0, 5.43, 1.3, 8.2, 0.09);

  // Street name and stop signs mounted at the corner.
  const nameSign = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 0.34),
    new THREE.MeshBasicMaterial({ map: streetNameTex, side: THREE.DoubleSide, toneMapped: false })
  );
  nameSign.position.set(0.05, 4.33, 0.18);
  nameSign.rotation.y = -0.12;
  pole1.add(nameSign);

  const stopSign = new THREE.Mesh(
    new THREE.CircleGeometry(0.33, 32),
    new THREE.MeshBasicMaterial({ map: stopSignTex, side: THREE.DoubleSide, toneMapped: false })
  );
  stopSign.position.set(0.0, 3.3, 0.22);
  stopSign.rotation.y = -0.14;
  pole1.add(stopSign);
  const stopRing = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.022, 6, 28), MAT.toon(0xe4ddca));
  stopRing.position.copy(stopSign.position);
  stopRing.rotation.y = -0.14;
  pole1.add(stopRing);
  // Small street light below the stop sign.
  cylinder(pole1, 0.02, 0.02, 0.7, MAT.toon(0x555e5b), -0.5, 3.9, 0.0, {
    rot: [0, 0, Math.PI / 2], segments: 6, cast: false,
  });
  const tinyLamp = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xffd7a2).multiplyScalar(1.4), toneMapped: false,
  }));
  tinyLamp.position.set(-0.85, 3.9, 0);
  pole1.add(tinyLamp);

  // Second pole, across the back of the store.
  const pole2 = new THREE.Group();
  pole2.position.set(11.65, 0.3, -9.6);
  g.add(pole2);
  cylinder(pole2, 0.12, 0.2, 7.9, concreteMat, 0, 3.95, 0, { segments: 12 });
  for (const [y, w] of [[7.1, 3.0], [6.55, 2.2]]) {
    box(pole2, w, 0.12, 0.12, MAT.toon(0x4c5350), 0, y, 0, { edges: true, edgeOpacity: 0.25 });
    for (let i = -1; i <= 1; i++) {
      cylinder(pole2, 0.05, 0.06, 0.18, MAT.toon(0xd5d0c0), i * 0.75, y + 0.13, 0, { segments: 8, cast: false });
    }
  }
  cylinder(pole2, 0.25, 0.25, 0.65, MAT.toon(0x5c6461), 0.4, 5.55, 0, { segments: 12 });

  // Wires with natural sag.
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x29363d });
  const wireAnchors = [
    [[-1.9, 7.9, 0], [-1.45, 7.05, 0], 0.028],
    [[-1.15, 7.9, 0], [-0.78, 7.05, 0], 0.02],
    [[-0.35, 7.9, 0], [-0.1, 7.05, 0], 0.02],
    [[0.55, 7.3, 0], [0.6, 6.55, 0], 0.018],
    [[1.25, 6.65, 0], [1.4, 5.55, 0.05], 0.015],
  ];
  for (const [a, b, r] of wireAnchors) {
    const start = new THREE.Vector3(a[0], a[1], a[2]).add(pole1.position);
    const end = new THREE.Vector3(b[0], b[1], b[2]).add(pole2.position);
    const mid = start.clone().lerp(end, 0.5);
    mid.y -= 0.55 + Math.random() * 0.35;
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const wire = new THREE.Mesh(new THREE.TubeGeometry(curve, 28, r, 4, false), wireMat);
    wire.frustumCulled = false;
    g.add(wire);
  }
  // A service drop to the store roof.
  {
    const start = new THREE.Vector3(-0.4, 7.3, 0).add(pole1.position);
    const end = new THREE.Vector3(5.4, 4.9, -7.4);
    const mid = start.clone().lerp(end, 0.5);
    mid.y = 5.8;
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const wire = new THREE.Mesh(new THREE.TubeGeometry(curve, 30, 0.017, 4, false), wireMat);
    g.add(wire);
  }

  addStreetLight(-5.72, 5.45, 5.25, 0x9fc9ff, 24, 9);
  addStreetLight(11.65, 5.4, -9.6, 0x92bdf2, 12, 8);
  addPool(g, 0x7aa8db, 5.0, 2.7, -5.95, 4.75, 0.15, 0.012);
  addPool(g, 0x7aa8db, 2.6, 2.0, -5.65, 3.75, 0.08, 0.012);

  return g;
}

/* ------------------------------------------------------------------ */
/*  Guardrail, mirror, parking sign, alley                             */
/* ------------------------------------------------------------------ */

function buildGuardrail() {
  const g = part(6.42, { from: [0, 1.1, 0], duration: 0.9 });

  function railSegment(x1, z1, x2, z2) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    const angle = Math.atan2(dx, dz);
    const group = new THREE.Group();
    group.position.set((x1 + x2) / 2, 0.28, (z1 + z2) / 2);
    group.rotation.y = angle;
    g.add(group);
    const railMat = MAT.toon(0xd7d1c2);
    for (const y of [0.62, 0.95]) {
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, len, 8), railMat);
      bar.position.y = y;
      bar.rotation.x = Math.PI / 2;
      bar.castShadow = true;
      group.add(bar);
      // Yellow reflective bands.
      for (let i = -1; i <= 1; i++) {
        const band = new THREE.Mesh(new THREE.CylinderGeometry(0.041, 0.041, 0.2, 8), MAT.yellow);
        band.position.set(0, y, i * len * 0.28);
        band.rotation.x = Math.PI / 2;
        group.add(band);
      }
    }
    for (let i = 0; i <= 2; i++) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 1.0, 8), railMat);
      post.position.set(0, 0.5, -len / 2 + (len / 2) * i);
      post.castShadow = true;
      group.add(post);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 5), railMat);
      cap.position.set(0, 1.0, -len / 2 + (len / 2) * i);
      group.add(cap);
    }
  }

  railSegment(-5.05, 4.95, -0.8, 4.95);
  railSegment(-5.05, 4.95, -5.05, 1.35);

  // Corner convex mirror.
  const mirrorGroup = new THREE.Group();
  mirrorGroup.position.set(-2.45, 0.28, 5.15);
  g.add(mirrorGroup);
  cylinder(mirrorGroup, 0.045, 0.055, 2.55, MAT.toon(0x6a6f68), 0, 1.28, 0, { segments: 8 });
  const mirrorBack = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.07, 28), MAT.toon(0xd47443));
  mirrorBack.position.set(0, 2.48, 0);
  mirrorBack.rotation.x = Math.PI / 2;
  mirrorBack.rotation.z = 0.18;
  mirrorGroup.add(mirrorBack);
  const mirror = new THREE.Mesh(
    new THREE.CircleGeometry(0.37, 32),
    new THREE.MeshBasicMaterial({ map: mirrorTexture(), toneMapped: false })
  );
  mirror.position.set(0, 2.48, 0.05);
  mirror.rotation.z = 0.18;
  mirrorGroup.add(mirror);
  const mirrorRim = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.035, 8, 32), MAT.toon(0xcb6d42));
  mirrorRim.position.set(0, 2.48, 0.055);
  mirrorRim.rotation.z = 0.18;
  mirrorGroup.add(mirrorRim);
  addGlowSprite(mirrorGroup, 0x88b8cc, 0, 2.48, 0.15, 1.0, 0.05);

  return g;
}

function buildParkingSign() {
  const g = part(6.5, { from: [0, 1.2, 0], duration: 0.9 });
  g.position.set(11.92, 0.3, 8.0);
  cylinder(g, 0.04, 0.055, 2.1, MAT.toon(0x6d746d), 0, 1.05, 0, { segments: 8 });
  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(0.52, 0.52),
    new THREE.MeshBasicMaterial({ map: parkingSignTex, side: THREE.DoubleSide, toneMapped: false })
  );
  panel.position.set(0, 2.1, 0.03);
  panel.rotation.y = -0.1;
  g.add(panel);
  // Small P flag at the top.
  const flagTex = canvasTexture(380, 150, (ctx, w, h) => {
    ctx.fillStyle = '#f2eee2';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#205f92';
    ctx.font = `800 118px ${EN}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('P', 80, 79);
    ctx.fillStyle = '#1f4f74';
    ctx.font = `bold 25px ${JP}`;
    ctx.textAlign = 'left';
    ctx.fillText('24時間', 154, 66);
    ctx.fillText('駐車可', 154, 105);
  });
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.32), new THREE.MeshBasicMaterial({
    map: flagTex, side: THREE.DoubleSide, toneMapped: false,
  }));
  flag.position.set(0, 2.56, 0.03);
  g.add(flag);
  return g;
}

function buildAlley() {
  const pave = part(1.64, { from: [0, -1.0, 0], duration: 1.0 });
  // Narrow paved alley along the right flank of the store.
  box(pave, 1.84, 0.26, 9.1, MAT.toon(0x8f8b81), 11.38, 0.14, -3.9, {
    edges: true, edgeOpacity: 0.28, edgeThreshold: 40,
  });
  box(pave, 1.84, 0.04, 9.1, MAT.toon(0x7d7b72), 11.38, 0.285, -3.9, {
    cast: false, receive: true, edges: false,
  });
  // Alley drain line.
  box(pave, 0.18, 0.025, 8.9, MAT.toon(0x343c3a), 11.38, 0.306, -3.9, {
    cast: false, edges: false,
  });
  for (let i = 0; i < 5; i++) {
    box(pave, 0.42, 0.012, 0.34, MAT.toon(0x232b2a), 11.38, 0.32, -7.4 + i * 1.6, {
      cast: false, edges: false,
    });
  }

  const gate = part(6.24, { from: [0, 1.5, 0], duration: 1.0 });
  // Gate frame across the mouth of the alley.
  for (const x of [10.44, 12.23]) {
    box(gate, 0.12, 2.35, 0.12, MAT.toon(0x384b45), x, 1.36, -0.85, {
      edges: true, edgeOpacity: 0.3,
    });
  }
  box(gate, 1.9, 0.14, 0.16, MAT.toon(0x384b45), 11.33, 2.45, -0.85, {
    edges: true, edgeOpacity: 0.3,
  });
  const noren = new THREE.Mesh(
    new THREE.PlaneGeometry(1.74, 0.72),
    new THREE.MeshPhysicalMaterial({
      map: norenTex,
      transparent: true,
      opacity: 0.94,
      side: THREE.DoubleSide,
      roughness: 0.9,
      depthWrite: false,
    })
  );
  noren.position.set(11.33, 2.0, -0.82);
  gate.add(noren);

  // Warm lantern in the gate.
  const lanternGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 12, 8),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(0xffad63).multiplyScalar(1.4),
      toneMapped: false,
    })
  );
  lanternGlow.position.set(12.15, 2.23, -0.9);
  gate.add(lanternGlow);
  const lanternCap = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.08, 12), MAT.toon(0x313d39));
  lanternCap.position.set(12.15, 2.35, -0.9);
  gate.add(lanternCap);
  addGlowSprite(gate, 0xffa65c, 12.15, 2.23, -0.82, 1.9, 0.38);

  // Vertical lit alley sign on the right wall.
  const alleySign = addLabelPlane(gate, alleySignTex, 0.5, 1.34, 12.14, 1.65, -3.0, {
    rot: [0, -Math.PI / 2, 0],
    toneMapped: false,
  });
  addGlowSprite(gate, 0xffb774, 12.02, 1.65, -3.0, 1.7, 0.18);

  // Crates and gas cylinders deep in the alley.
  const crateMat = MAT.toon(0x8b6a45);
  for (let i = 0; i < 4; i++) {
    box(gate, 0.42, 0.3, 0.38, crateMat, 11.0 + (i % 2) * 0.5, 0.46 + Math.floor(i / 2) * 0.31, -8.05, {
      edges: true, edgeOpacity: 0.3,
    });
  }
  for (const x of [10.72, 11.92]) {
    cylinder(gate, 0.16, 0.18, 0.7, MAT.toon(0x6a7470), x, 0.67, -6.6, { segments: 12 });
    cylinder(gate, 0.08, 0.1, 0.09, MAT.toon(0x3e4946), x, 1.06, -6.6, { segments: 10 });
  }
  // Overhead bulb at the back of the alley.
  cylinder(gate, 0.02, 0.02, 0.45, MAT.toon(0x3c4541), 11.9, 2.7, -6.4, { segments: 6, cast: false });
  const alleyBulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 10, 7),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc37d).multiplyScalar(1.4), toneMapped: false })
  );
  alleyBulb.position.set(11.9, 2.48, -6.4);
  gate.add(alleyBulb);
  addGlowSprite(gate, 0xffb870, 11.9, 2.48, -6.4, 1.5, 0.3);
  addStreetLight(11.7, 2.5, -2.0, 0xffb870, 7, 4.8);

  addPool(gate, 0xffb064, 1.3, 2.4, 11.1, -1.2, 0.18, 0.315);
  addPool(gate, 0x6b8db2, 1.1, 1.8, 11.6, -4.5, 0.1, 0.315);
  return { pave, gate };
}

/* ------------------------------------------------------------------ */
/*  Main build                                                         */
/* ------------------------------------------------------------------ */

export function buildProps() {
  buildAlley();
  buildVendingMachine();
  buildBicycle();
  buildEntranceDetails();
  buildStreetLamp();
  buildUtilityPole();
  buildGuardrail();
  buildParkingSign();

  // Extra poster board / notice on the far wall in the alley.
  const extras = part(6.56, { from: [0, 1.25, 0], duration: 0.95 });
  // Air vent and a bike rack on the sidewalk.
  const rackMat = MAT.toon(0x7f8885);
  for (let i = 0; i < 4; i++) {
    const u = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.025, 6, 12, Math.PI), rackMat);
    u.position.set(1.45 + i * 0.32, 0.3, 2.6);
    u.rotation.x = Math.PI / 2;
    u.rotation.z = Math.PI / 2;
    u.castShadow = true;
    extras.add(u);
  }
  // Small stacking beer crates outside the alley.
  for (let i = 0; i < 3; i++) {
    box(extras, 0.38, 0.25, 0.3, MAT.toon(0x7d5c3d), 11.9, 0.42 + i * 0.26, -1.55, {
      edges: true, edgeOpacity: 0.28,
    });
  }

  return { streetLights };
}
