import {
  THREE, C, MAT, TEX, world, part,
  canvasTexture, roundRect, box, plane, disc, cylinder, roundedBox,
  addGlowSprite, addPool, addStreak, addLabelPlane, edges,
} from './core.js';

export const PUDDLES = [];
const ripples = [];

function groundShape(points, material, y) {
  const shape = new THREE.Shape();
  points.forEach(([x, z], i) => {
    if (i === 0) shape.moveTo(x, -z);
    else shape.lineTo(x, -z);
  });
  shape.closePath();
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape, 8), material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = y;
  mesh.receiveShadow = true;
  return mesh;
}

function createWoodTexture() {
  return canvasTexture(512, 256, (ctx, w, h) => {
    ctx.fillStyle = '#2f211a';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      const y = Math.random() * h;
      const a = 0.03 + Math.random() * 0.08;
      ctx.strokeStyle = Math.random() > 0.45
        ? `rgba(122,82,52,${a})`
        : `rgba(10,7,6,${a})`;
      ctx.lineWidth = 0.5 + Math.random() * 2.4;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(w * 0.25, y + Math.random() * 6 - 3, w * 0.7, y + Math.random() * 8 - 4, w, y);
      ctx.stroke();
    }
    // Fine pore marks.
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 550; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#a6784c' : '#0f0a08';
      ctx.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 14, 0.6);
    }
    ctx.globalAlpha = 1;
  }, { repeat: [2, 1] });
}

function createNameplateTexture() {
  return canvasTexture(1536, 192, (ctx, w, h) => {
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#2a2118');
    bg.addColorStop(0.48, '#15110d');
    bg.addColorStop(1, '#241b13');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(208,175,100,0.35)';
    ctx.lineWidth = 2;
    roundRect(ctx, 15, 12, w - 30, h - 24, 9);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#d9bd77';
    ctx.font = '600 64px "Avenir Next", "Trebuchet MS", sans-serif';
    ctx.fillText('H O S H I Z O R A   M A R T', w / 2, 69);
    ctx.fillStyle = 'rgba(221,194,127,0.74)';
    ctx.font = '30px "Yu Gothic", "Meiryo", sans-serif';
    ctx.fillText('雨 夜 の 街 角  ·  午 前 二 時 十 七 分', w / 2, 119);
    ctx.fillStyle = 'rgba(225,201,144,0.5)';
    ctx.font = '19px "Avenir Next", sans-serif';
    ctx.fillText('A COLLECTIBLE NIGHT DIORAMA  /  1 : 64', w / 2, 157);

    // Tiny star.
    ctx.translate(74, 95);
    ctx.fillStyle = '#d9bd77';
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 16 : 6;
      const a = -Math.PI / 2 + i * Math.PI / 5;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  });
}

function createPuddleTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 512, 512);

  const blobs = [
    [256, 250, 215, 135, 0.95],
    [177, 210, 125, 172, 0.72],
    [339, 290, 120, 92, 0.62],
    [244, 330, 152, 63, 0.5],
  ];
  ctx.globalCompositeOperation = 'source-over';
  for (const [x, y, rx, ry, a] of blobs) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(rx / 100, ry / 100);
    const grad = ctx.createRadialGradient(0, 0, 30, 0, 0, 100);
    grad.addColorStop(0, `rgba(255,255,255,${a})`);
    grad.addColorStop(0.72, `rgba(255,255,255,${a * 0.86})`);
    grad.addColorStop(0.92, `rgba(255,255,255,${a * 0.3})`);
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 100, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Break up the edge just enough to feel rain-made.
  ctx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 55; i++) {
    const a = Math.random() * Math.PI * 2;
    const rr = 190 + Math.random() * 90;
    ctx.fillStyle = `rgba(0,0,0,${0.25 + Math.random() * 0.6})`;
    ctx.beginPath();
    ctx.ellipse(256 + Math.cos(a) * rr, 256 + Math.sin(a) * rr * 0.58, 8 + Math.random() * 22, 3 + Math.random() * 10, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const puddleTex = createPuddleTexture();

function addPuddle(parent, x, z, w, d, y, rot = 0, opacity = 0.64) {
  const mat = new THREE.MeshBasicMaterial({
    map: puddleTex,
    color: 0x0b1420,
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.rotation.z = rot;
  mesh.position.set(x, y, z);
  mesh.renderOrder = 2;
  parent.add(mesh);
  PUDDLES.push({ x, z, w, d, y });

  const sheen = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.78, d * 0.7), new THREE.MeshBasicMaterial({
    map: TEX.pool,
    color: 0x80a7c7,
    transparent: true,
    opacity: 0.055,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }));
  sheen.rotation.x = -Math.PI / 2;
  sheen.rotation.z = rot;
  sheen.position.set(x, y + 0.006, z);
  sheen.renderOrder = 3;
  parent.add(sheen);
  return mesh;
}

function createRipples(parent) {
  const spots = [
    { x: 2.75, z: 8.7, y: 0.108, r: 0.7 },
    { x: -2.5, z: 7.7, y: 0.108, r: 0.5 },
    { x: 8.5, z: 9.2, y: 0.108, r: 0.52 },
    { x: -8.1, z: 2.7, y: 0.108, r: 0.6 },
    { x: -9.5, z: -3.8, y: 0.108, r: 0.55 },
    { x: -7.2, z: -8.7, y: 0.108, r: 0.6 },
    { x: 8.7, z: 3.7, y: 0.292, r: 0.65 },
    { x: 3.3, z: 3.2, y: 0.292, r: 0.52 },
    { x: 0.1, z: 2.6, y: 0.292, r: 0.48 },
    { x: -2.5, z: -6.4, y: 0.292, r: 0.5 },
  ];
  for (let i = 0; i < 34; i++) {
    const spot = spots[i % spots.length];
    const geo = new THREE.PlaneGeometry(1, 1);
    const mat = new THREE.MeshBasicMaterial({
      map: TEX.rainRing,
      color: 0xbfe1ff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(
      spot.x + (Math.random() - 0.5) * spot.r * 2.2,
      spot.y,
      spot.z + (Math.random() - 0.5) * spot.r * 1.3
    );
    mesh.renderOrder = 4;
    parent.add(mesh);
    ripples.push({
      mesh,
      speed: 0.42 + Math.random() * 0.55,
      phase: Math.random(),
      maxSize: spot.r * (0.9 + Math.random() * 1.7),
    });
  }
}

export function updateRipples(time) {
  for (const r of ripples) {
    const u = (time * r.speed + r.phase) % 1;
    const s = r.maxSize * (0.13 + u * 0.86);
    r.mesh.scale.set(s, s, 1);
    r.mesh.material.opacity = Math.max(0, (1 - u) * 0.35 * Math.min(1, u * 9));
  }
}

function createDrainTexture() {
  return canvasTexture(256, 64, (ctx, w, h) => {
    ctx.fillStyle = '#20262a';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#0a0d10';
    for (let x = 7; x < w - 7; x += 13) {
      ctx.fillRect(x, 7, 5, h - 14);
    }
    ctx.strokeStyle = '#4c555a';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, w - 4, h - 4);
  });
}

function createManholeTexture() {
  return canvasTexture(256, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#3a3c3b';
    ctx.beginPath();
    ctx.arc(128, 128, 122, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#181c1e';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(128, 128, 114, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#62645f';
    ctx.lineWidth = 2;
    for (let r = 24; r < 108; r += 16) {
      ctx.beginPath();
      ctx.arc(128, 128, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.42;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
      ctx.strokeStyle = '#1a1d1f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(128 + Math.cos(a) * 26, 128 + Math.sin(a) * 26);
      ctx.lineTo(128 + Math.cos(a) * 110, 128 + Math.sin(a) * 110);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
}

function createStopRoadTexture() {
  return canvasTexture(512, 512, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.scale(1, 1.55);
    ctx.fillStyle = 'rgba(235,235,225,0.82)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 138px "Yu Gothic", "Meiryo", sans-serif';
    ctx.fillText('止まれ', 0, 6);
    ctx.restore();
    ctx.fillStyle = 'rgba(235,235,225,0.7)';
    ctx.font = 'bold 47px "Avenir Next", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('STOP', w / 2, 440);
  });
}

function createStopSignTexture() {
  return canvasTexture(256, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#bd3b30';
    ctx.beginPath();
    ctx.arc(128, 128, 122, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f2e6d2';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(128, 128, 108, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#f8f1e2';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 72px "Yu Gothic", "Meiryo", sans-serif';
    ctx.fillText('止まれ', 128, 122);
    ctx.font = '600 23px "Avenir Next", sans-serif';
    ctx.fillText('STOP', 128, 180);
  });
}

function createStreetNameTexture() {
  return canvasTexture(512, 160, (ctx, w, h) => {
    ctx.fillStyle = '#f2efe4';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#1a5e59';
    ctx.lineWidth = 12;
    ctx.strokeRect(7, 7, w - 14, h - 14);
    ctx.fillStyle = '#1a5e59';
    ctx.font = 'bold 64px "Yu Gothic", "Meiryo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('星夜町 二丁目', w / 2, 70);
    ctx.font = '600 30px "Avenir Next", sans-serif';
    ctx.fillText('HOSHIZORA-CHO 2', w / 2, 121);
  });
}

function createPosterTexture(variant = 0) {
  const palettes = [
    ['#f4dfaa', '#195b57', '#e85944'],
    ['#f2c9d2', '#7e3156', '#faf2dc'],
    ['#bcdce0', '#1c4958', '#f0a342'],
  ];
  const p = palettes[variant % palettes.length];
  return canvasTexture(512, 768, (ctx, w, h) => {
    ctx.fillStyle = p[0];
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = p[1];
    ctx.fillRect(0, 0, w, 86);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 29px "Avenir Next", sans-serif';
    ctx.fillText('HOSHIZORA', 34, 55);
    ctx.fillStyle = p[2];
    ctx.beginPath();
    ctx.arc(380, 270, 110, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p[1];
    ctx.beginPath();
    ctx.arc(405, 240, 84, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f8f4e8';
    ctx.font = 'bold 64px "Yu Gothic", "Meiryo", sans-serif';
    ctx.fillText(variant === 0 ? '新発売' : variant === 1 ? 'あったか' : '夜限定', 38, 500);
    ctx.font = 'bold 38px "Yu Gothic", "Meiryo", sans-serif';
    ctx.fillText(variant === 0 ? 'ほしぞら おにぎり' : variant === 1 ? 'ホットコーヒー' : '深夜のアイス', 38, 561);
    ctx.fillStyle = 'rgba(31,45,48,0.65)';
    ctx.font = '25px "Yu Gothic", "Meiryo", sans-serif';
    ctx.fillText('星夜マート', 38, 630);
    ctx.fillText('24時間 営業中', 38, 669);
    ctx.strokeStyle = 'rgba(20,60,58,0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 690 + i * 10);
      ctx.lineTo(w, 690 + i * 10);
      ctx.stroke();
    }
  });
}

export function buildEnvironment() {
  const baseGroup = part(0.08, { from: [0, -3.4, 0], duration: 1.35 });

  const woodTex = createWoodTexture();
  const woodMat = new THREE.MeshToonMaterial({
    color: 0x594032,
    map: woodTex,
    gradientMap: MAT.cream.gradientMap,
  });

  roundedBox(baseGroup, 25.9, 1.35, 25.9, 0.32, woodMat, 0, -0.72, 0, {
    segments: 3,
    edges: true,
    edgeOpacity: 0.38,
  });

  // Fine brass pinstripe around the plinth.
  const stripeY = -0.08;
  box(baseGroup, 25.46, 0.055, 0.065, MAT.brassLight, 0, stripeY, 12.965, { edges: false, cast: false });
  box(baseGroup, 25.46, 0.055, 0.065, MAT.brassLight, 0, stripeY, -12.965, { edges: false, cast: false });
  box(baseGroup, 0.065, 0.055, 25.46, MAT.brassLight, -12.965, stripeY, 0, { edges: false, cast: false });
  box(baseGroup, 0.065, 0.055, 25.46, MAT.brassLight, 12.965, stripeY, 0, { edges: false, cast: false });

  box(baseGroup, 25.46, 0.13, 25.46, MAT.toon(0x343634), 0, -0.01, 0, {
    edges: true,
    edgeOpacity: 0.3,
    cast: false,
  });
  const floor = plane(baseGroup, 25.3, 25.3, MAT.toon(0x252b30), 0, 0.055, 0, {
    rot: [-Math.PI / 2, 0, 0],
    receive: true,
  });
  floor.renderOrder = 0;

  // Nameplate on the display base.
  const nameplate = addLabelPlane(
    baseGroup, createNameplateTexture(), 7.6, 0.95,
    0, -0.7, 12.965,
    { rot: [0, 0, 0], toneMapped: false }
  );
  nameplate.renderOrder = 2;

  // Small brass corner studs.
  for (const x of [-12.55, 12.55]) {
    for (const z of [-12.55, 12.55]) {
      cylinder(baseGroup, 0.09, 0.11, 0.04, MAT.brassLight, x, -0.05, z, { segments: 16 });
    }
  }

  // Raised rim around the top of the plinth.
  box(baseGroup, 25.34, 0.045, 0.1, MAT.toon(0x796646), 0, 0.015, 12.6, { cast: false, edges: false });
  box(baseGroup, 25.34, 0.045, 0.1, MAT.toon(0x796646), 0, 0.015, -12.6, { cast: false, edges: false });
  box(baseGroup, 0.1, 0.045, 25.34, MAT.toon(0x796646), -12.6, 0.015, 0, { cast: false, edges: false });
  box(baseGroup, 0.1, 0.045, 25.34, MAT.toon(0x796646), 12.6, 0.015, 0, { cast: false, edges: false });

  /* ---------------- Road ---------------- */
  const roadGroup = part(0.62, { from: [0, -1.4, 0], duration: 1.2 });

  const roadMat = new THREE.MeshStandardMaterial({
    map: TEX.asphalt,
    color: 0x5f6872,
    roughness: 0.48,
    metalness: 0.2,
  });
  const frontRoad = plane(roadGroup, 25.3, 7.05, roadMat, 0, 0.07, 8.88, {
    rot: [-Math.PI / 2, 0, 0],
    receive: true,
  });
  frontRoad.renderOrder = 0;
  const sideRoad = plane(roadGroup, 7.0, 17.9, roadMat, -8.88, 0.064, -3.7, {
    rot: [-Math.PI / 2, 0, 0],
    receive: true,
  });
  sideRoad.renderOrder = 0;

  // Wet sheen across the asphalt.
  const roadSheenMat = new THREE.MeshBasicMaterial({
    map: TEX.pool,
    color: 0x28445e,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  for (const [x, z, w, d] of [
    [1.5, 8.7, 13, 6.2],
    [-8.5, 1.2, 6, 12],
    [-9.5, 9.4, 5.6, 5],
    [7.6, 10.4, 6, 4],
  ]) {
    const sheen = plane(roadGroup, w, d, roadSheenMat.clone(), x, 0.078, z, {
      rot: [-Math.PI / 2, 0, 0],
      renderOrder: 1,
    });
    sheen.material.opacity = 0.1 + Math.random() * 0.06;
  }

  /* ---------------- Sidewalk & curbs ---------------- */
  const walkGroup = part(0.98, { from: [0, -1.2, 0], duration: 1.15 });

  const walkMat = new THREE.MeshToonMaterial({
    color: 0x918d84,
    map: TEX.sidewalk,
    gradientMap: MAT.cream.gradientMap,
  });
  const walkFront = box(walkGroup, 17.8, 0.3, 4.5, walkMat, 3.5, 0.13, 3.15, {
    edges: true,
    edgeOpacity: 0.32,
    edgeThreshold: 40,
  });
  const walkLeft = box(walkGroup, 7.4, 0.3, 13.35, walkMat, -1.7, 0.13, -5.775, {
    edges: true,
    edgeOpacity: 0.32,
    edgeThreshold: 40,
  });
  walkFront.receiveShadow = true;
  walkLeft.receiveShadow = true;

  // Store apron (a slightly warmer, darker service strip by the shop).
  const apron = box(walkGroup, 8.65, 0.052, 0.68, MAT.toon(0x8e8a7f), 6.3, 0.315, 1.22, {
    cast: false,
    receive: true,
    edges: false,
  });

  // Curb stones, with a pale top bevel.
  const curbMat = MAT.toon(0x918a7d);
  box(walkGroup, 17.9, 0.4, 0.32, curbMat, 3.5, 0.15, 5.34, { edges: true, edgeOpacity: 0.34 });
  box(walkGroup, 0.32, 0.4, 13.4, curbMat, -5.34, 0.15, -5.78, { edges: true, edgeOpacity: 0.34 });
  box(walkGroup, 7.55, 0.12, 0.1, MAT.toon(0xd0c7b4), -1.66, 0.37, 5.5, { cast: false, edges: false });
  box(walkGroup, 0.1, 0.12, 13.4, MAT.toon(0xd0c7b4), -5.5, 0.37, -5.75, { cast: false, edges: false });

  // Tactile yellow paving: a path leading to the corner crossing.
  const tactileMat = new THREE.MeshBasicMaterial({
    map: TEX.tactile,
    color: 0xf0c85a,
    transparent: true,
    opacity: 0.96,
    toneMapped: false,
  });
  const tactile1 = plane(walkGroup, 4.7, 0.42, tactileMat, 5.75, 0.286, 4.95, {
    rot: [-Math.PI / 2, 0, 0],
    receive: true,
  });
  const tactile2 = plane(walkGroup, 0.42, 4.9, tactileMat, 0.9, 0.286, 3.0, {
    rot: [-Math.PI / 2, 0, 0],
    receive: true,
  });
  tactile1.renderOrder = 1;
  tactile2.renderOrder = 1;

  // Gutter channel and drain grates.
  const gutterMat = new THREE.MeshStandardMaterial({
    color: 0x12171c,
    roughness: 0.34,
    metalness: 0.24,
  });
  plane(walkGroup, 17.9, 0.46, gutterMat, 3.5, 0.082, 5.9, { rot: [-Math.PI / 2, 0, 0] });
  plane(walkGroup, 0.46, 13.4, gutterMat, -5.91, 0.082, -5.75, { rot: [-Math.PI / 2, 0, 0] });

  const drainTex = createDrainTexture();
  const drainMat = new THREE.MeshBasicMaterial({ map: drainTex, color: 0x8f999b, toneMapped: false });
  for (const x of [-2.9, 0.9, 6.9, 10.4]) {
    const d = plane(walkGroup, 0.83, 0.44, drainMat, x, 0.086, 5.9, { rot: [-Math.PI / 2, 0, Math.PI / 2] });
    d.renderOrder = 2;
  }
  for (const z of [-9.8, -5.8, -1.6, 2.3]) {
    const d = plane(walkGroup, 0.44, 0.83, drainMat, -5.91, 0.086, z, { rot: [-Math.PI / 2, 0, 0] });
    d.renderOrder = 2;
  }

  // Road paint.
  const paintGroup = part(1.28, { from: [0, -0.6, 0], duration: 0.85 });
  const whitePaint = new THREE.MeshStandardMaterial({
    color: 0xb9bbad,
    roughness: 0.4,
    metalness: 0.04,
    emissive: 0x1c1c18,
    emissiveIntensity: 0.18,
  });

  // Crosswalk across the front road.
  for (let i = 0; i < 7; i++) {
    const stripe = box(paintGroup, 4.25, 0.015, 0.61, whitePaint, 6.4, 0.089, 6.05 + i * 0.79, {
      cast: false,
      receive: true,
      edges: false,
    });
    stripe.material = whitePaint.clone();
    stripe.material.opacity = 0.84 + Math.random() * 0.1;
    stripe.material.transparent = true;
  }
  // Crosswalk across the side road.
  for (let i = 0; i < 5; i++) {
    const stripe = box(paintGroup, 0.62, 0.015, 3.3, whitePaint, -11.35 + i * 0.8, 0.089, 2.2, {
      cast: false,
      receive: true,
      edges: false,
    });
    stripe.material = whitePaint.clone();
    stripe.material.opacity = 0.7;
    stripe.material.transparent = true;
  }

  // Stop bar and lane edge lines.
  box(paintGroup, 3.7, 0.014, 0.3, whitePaint, -9.5, 0.09, 5.0, { cast: false, receive: true, edges: false });
  box(paintGroup, 0.13, 0.014, 12.4, whitePaint, -6.15, 0.09, -1.4, { cast: false, receive: true, edges: false });
  box(paintGroup, 12.8, 0.014, 0.12, whitePaint, 3.0, 0.09, 11.2, { cast: false, receive: true, edges: false });
  for (let i = 0; i < 4; i++) {
    box(paintGroup, 1.25, 0.013, 0.11, whitePaint, 1.8 + i * 2.2, 0.09, 8.0, {
      cast: false,
      receive: true,
      edges: false,
    });
  }

  // Painted 止まれ lettering.
  const stopRoadTex = createStopRoadTexture();
  const stopRoadMat = new THREE.MeshBasicMaterial({
    map: stopRoadTex,
    transparent: true,
    opacity: 0.67,
    depthWrite: false,
    toneMapped: false,
  });
  const stopRoad = plane(paintGroup, 2.2, 2.2, stopRoadMat, -9.3, 0.097, 6.25, {
    rot: [-Math.PI / 2, 0, 0],
    renderOrder: 2,
  });

  // Parking bay at the front-right edge.
  for (let i = 0; i < 2; i++) {
    const x = 10.55 + i * 0.1;
    box(paintGroup, 0.09, 0.013, 2.75, whitePaint, 9.15 + i * 2.3, 0.091, 10.1, {
      cast: false, receive: true, edges: false,
    });
  }
  box(paintGroup, 4.5, 0.013, 0.09, whitePaint, 10.3, 0.091, 8.75, {
    cast: false, receive: true, edges: false,
  });
  for (const x of [10.3, 12.55]) {
    box(paintGroup, 0.5, 0.18, 0.22, MAT.toon(0x8d8a80), x, 0.16, 11.42, {
      edges: false, cast: false,
    });
  }

  // Manhole cover.
  const manholeMat = new THREE.MeshBasicMaterial({
    map: createManholeTexture(),
    transparent: true,
    toneMapped: false,
    color: 0xb5b4a8,
  });
  const manhole = disc(paintGroup, 0.62, manholeMat, 1.1, 0.096, 8.3, {
    rot: [-Math.PI / 2, 0, 0],
    segments: 48,
  });
  manhole.renderOrder = 2;

  /* ---------------- Puddles ---------------- */
  const puddleGroup = part(1.55, { from: [0, -0.5, 0], duration: 1.0, scaleFrom: 0.84 });
  addPuddle(puddleGroup, 2.65, 8.65, 3.0, 1.5, 0.1, 0.15, 0.66);
  addPuddle(puddleGroup, -2.45, 7.7, 2.1, 1.0, 0.1, -0.4, 0.58);
  addPuddle(puddleGroup, 8.35, 9.25, 2.1, 1.1, 0.1, 0.7, 0.62);
  addPuddle(puddleGroup, -9.0, 10.35, 2.2, 1.2, 0.1, 0.2, 0.55);
  addPuddle(puddleGroup, -8.2, 2.75, 2.1, 1.35, 0.1, -0.2, 0.62);
  addPuddle(puddleGroup, -9.65, -3.75, 1.9, 1.25, 0.1, 0.5, 0.55);
  addPuddle(puddleGroup, -7.2, -8.65, 2.2, 1.1, 0.1, -0.6, 0.55);
  addPuddle(puddleGroup, 8.65, 3.55, 4.2, 1.85, 0.292, 0.05, 0.58);
  addPuddle(puddleGroup, 3.1, 3.15, 2.8, 1.2, 0.292, -0.2, 0.54);
  addPuddle(puddleGroup, 0.2, 2.55, 2.0, 1.05, 0.292, 0.35, 0.49);
  addPuddle(puddleGroup, -2.5, -6.35, 1.9, 1.0, 0.292, 0.1, 0.47);

  createRipples(puddleGroup);

  /* ---------------- Distant boundary architecture ---------------- */
  const boundaryGroup = part(1.42, { from: [0, -2.2, 0], duration: 1.0 });

  // Back wall of the block. Mostly silhouette, with a narrow service lane.
  const wallMat = MAT.toon(0x333a3f);
  box(boundaryGroup, 17.9, 3.0, 0.45, wallMat, 3.5, 1.5, -12.35, {
    edges: true, edgeOpacity: 0.36,
  });
  box(boundaryGroup, 17.9, 0.16, 0.56, MAT.toon(0x1e252a), 3.5, 3.02, -12.35, { edges: false });
  box(boundaryGroup, 0.45, 2.2, 17.8, MAT.toon(0x2b3237), 12.35, 1.1, -3.45, {
    edges: true, edgeOpacity: 0.34,
  });
  box(boundaryGroup, 0.55, 0.15, 17.8, MAT.toon(0x1c2226), 12.35, 2.22, -3.45, { edges: false });

  // Low wall across the far side of the left road.
  box(boundaryGroup, 0.5, 1.1, 17.8, MAT.toon(0x2b3134), -12.35, 0.55, -3.4, {
    edges: true, edgeOpacity: 0.3,
  });
  box(boundaryGroup, 0.62, 0.12, 17.8, MAT.toon(0x1c2225), -12.35, 1.13, -3.4, { edges: false });

  // Repeating wall piers create that narrow Japanese back-street rhythm.
  for (let z = -11.8; z < 4; z += 2.6) {
    box(boundaryGroup, 0.66, 2.5, 0.34, MAT.toon(0x3d4346), 12.3, 1.25, z, { edges: true, edgeOpacity: 0.3 });
  }
  for (let x = -5; x < 12; x += 2.9) {
    box(boundaryGroup, 0.34, 2.7, 0.62, MAT.toon(0x3d4346), x, 1.35, -12.25, {
      edges: true, edgeOpacity: 0.3,
    });
  }

  // A few barely-lit neighboring windows make the block feel inhabited without people.
  const dimWindow = new THREE.MeshBasicMaterial({ color: 0xd5a765, transparent: true, opacity: 0.28, toneMapped: false });
  for (const [x, y, z, w, h] of [
    [-2.5, 2.05, -12.11, 0.9, 0.62],
    [3.8, 1.7, -12.11, 0.8, 0.5],
    [9.4, 2.2, -12.1, 1.1, 0.58],
  ]) {
    plane(boundaryGroup, w, h, dimWindow, x, y, z, { rot: [0, 0, 0] });
  }

  // Pipes on the back wall.
  const pipeMat = MAT.toon(0x5c625f);
  for (const x of [-3.3, 5.25, 11.05]) {
    cylinder(boundaryGroup, 0.055, 0.055, 2.75, pipeMat, x, 1.45, -12.03, { segments: 10 });
    cylinder(boundaryGroup, 0.13, 0.13, 0.08, MAT.toon(0x2c3130), x, 1.7, -12.02, { segments: 12 });
  }

  // Very subtle hedge behind the parking bay.
  for (let i = 0; i < 8; i++) {
    const bush = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.27 + Math.random() * 0.1, 1),
      MAT.toon(i % 2 ? 0x223b32 : 0x1a312b)
    );
    bush.position.set(12.08, 0.57 + Math.random() * 0.08, -10.2 + i * 0.42);
    bush.scale.y = 0.8;
    bush.castShadow = true;
    boundaryGroup.add(bush);
  }

  /* ---------------- Painted reflector and light pools ---------------- */
  const reflectionGroup = part(5.4, { from: [0, 0.02, 0], duration: 1.4, scaleFrom: 0.92 });

  // Warm shop spill across the wet sidewalk.
  addPool(reflectionGroup, 0xffb75f, 12.8, 7.4, 6.1, 3.25, 0.28, 0.298);
  addPool(reflectionGroup, 0xffd69b, 6.6, 3.4, 7.9, 2.35, 0.3, 0.303);
  addStreak(reflectionGroup, 0xffa94e, 1.15, 5.2, 8.2, 3.75, 0.35, 0.305, 0.02);
  addStreak(reflectionGroup, 0xffc26f, 0.8, 4.4, 5.95, 3.65, 0.28, 0.306, -0.03);
  addStreak(reflectionGroup, 0x8be1d0, 0.75, 3.2, 3.2, 2.6, 0.19, 0.304, 0.05);
  addStreak(reflectionGroup, 0xff6c94, 0.55, 2.5, 1.85, 2.25, 0.16, 0.3045, -0.08);

  // White crosswalk reflection, slightly broken up.
  for (let i = 0; i < 7; i++) {
    addStreak(reflectionGroup, 0xbfd5e8, 0.5, 1.4, 6.4 + (i % 2 ? 0.5 : -0.4), 6.5 + i * 0.68, 0.06, 0.105, 0.02);
  }

  // Cool lamp reflection on the asphalt.
  addPool(reflectionGroup, 0x78aff0, 5.6, 3.0, -8.8, 6.7, 0.12, 0.108);
  addPool(reflectionGroup, 0x9cc9ff, 3.2, 2.0, 7.6, 7.4, 0.1, 0.108);
  addStreak(reflectionGroup, 0x7fbcff, 0.8, 4.1, -8.4, 8.4, 0.18, 0.109, 0.06);
  addStreak(reflectionGroup, 0xe6c6ff, 0.45, 2.1, -2.2, 1.8, 0.11, 0.3, 0.1);

  // Storefront window frames the scene even before the building is lit.
  return { baseGroup, roadGroup, walkGroup, paintGroup, puddleGroup, boundaryGroup, reflectionGroup };
}
