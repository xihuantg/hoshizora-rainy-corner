import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export { THREE };

/* ------------------------------------------------------------------ */
/*  Stage                                                              */
/* ------------------------------------------------------------------ */

const stage = document.getElementById('stage');

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance',
  stencil: false,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.85));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.9;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x060a12, 1);
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = makeBackdropTexture();

const camera = new THREE.PerspectiveCamera(37, window.innerWidth / window.innerHeight, 0.1, 120);
camera.position.set(-17, 14, 22);

const composer = new EffectComposer(renderer);
composer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.85));
composer.setSize(window.innerWidth, window.innerHeight);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.27,
  0.58,
  0.92
);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

const world = new THREE.Group();
world.name = 'HOSHIZORA_DIORAMA';
scene.add(world);
export { world };

/* ------------------------------------------------------------------ */
/*  Lighting                                                           */
/* ------------------------------------------------------------------ */

const hemi = new THREE.HemisphereLight(0x718dba, 0x17120f, 0.55);
scene.add(hemi);

const moon = new THREE.DirectionalLight(0x9bbcf0, 1.15);
moon.position.set(-13, 20, 15);
moon.castShadow = true;
moon.shadow.mapSize.set(2048, 2048);
moon.shadow.camera.near = 2;
moon.shadow.camera.far = 55;
moon.shadow.camera.left = -20;
moon.shadow.camera.right = 20;
moon.shadow.camera.top = 20;
moon.shadow.camera.bottom = -20;
moon.shadow.bias = -0.00055;
moon.shadow.normalBias = 0.028;
scene.add(moon);

const rim = new THREE.DirectionalLight(0x41679f, 0.36);
rim.position.set(16, 9, -18);
scene.add(rim);

const warmBounce = new THREE.DirectionalLight(0xffc37e, 0.13);
warmBounce.position.set(-8, 3, 11);
scene.add(warmBounce);

/* ------------------------------------------------------------------ */
/*  Palette & shared materials                                         */
/* ------------------------------------------------------------------ */

export const C = {
  ink: 0x10161c,
  line: 0x121a20,
  asphalt: 0x1d232b,
  asphaltDark: 0x131820,
  sidewalk: 0x8f8b81,
  sidewalkLight: 0xb0a99b,
  curb: 0xa39c8e,
  concrete: 0x8d8c85,
  cream: 0xeee2cc,
  creamDeep: 0xd6c5aa,
  teal: 0x145d5a,
  tealDark: 0x0b3e3e,
  tealLight: 0x2b8980,
  green: 0x1e6d5e,
  mint: 0x9ed9c2,
  brass: 0x9b7b40,
  brassLight: 0xd8b86c,
  wood: 0x6e4f38,
  woodDark: 0x3a2b23,
  metal: 0x687078,
  metalDark: 0x2e353b,
  white: 0xf6f0e2,
  warm: 0xffd59a,
  warmHot: 0xffb45e,
  cool: 0x9ecbff,
  pink: 0xff7293,
  red: 0xc8493e,
  yellow: 0xe7bb45,
  glass: 0xb8dcf2,
};

const gradientData = new Uint8Array([24, 118, 190, 255]);
const toonGradient = new THREE.DataTexture(gradientData, gradientData.length, 1, THREE.RedFormat);
toonGradient.minFilter = THREE.NearestFilter;
toonGradient.magFilter = THREE.NearestFilter;
toonGradient.needsUpdate = true;

export const MAT = {};
MAT.toon = (color, opts = {}) =>
  new THREE.MeshToonMaterial({
    color,
    gradientMap: toonGradient,
    ...opts,
  });

MAT.cream = MAT.toon(C.cream);
MAT.creamDeep = MAT.toon(C.creamDeep);
MAT.teal = MAT.toon(C.teal);
MAT.tealDark = MAT.toon(C.tealDark);
MAT.tealLight = MAT.toon(C.tealLight);
MAT.green = MAT.toon(C.green);
MAT.mint = MAT.toon(C.mint);
MAT.wood = MAT.toon(C.wood);
MAT.woodDark = MAT.toon(C.woodDark);
MAT.metal = MAT.toon(C.metal);
MAT.metalDark = MAT.toon(C.metalDark);
MAT.brass = MAT.toon(C.brass);
MAT.brassLight = MAT.toon(C.brassLight);
MAT.white = MAT.toon(C.white);
MAT.red = MAT.toon(C.red);
MAT.yellow = MAT.toon(C.yellow);
MAT.ink = MAT.toon(C.ink);
MAT.concrete = MAT.toon(C.concrete);
MAT.curb = MAT.toon(C.curb);

MAT.rubber = new THREE.MeshToonMaterial({ color: 0x161a1e, gradientMap: toonGradient });
MAT.chrome = new THREE.MeshStandardMaterial({
  color: 0x9aa8b3,
  metalness: 0.85,
  roughness: 0.3,
});
MAT.darkGlass = new THREE.MeshStandardMaterial({
  color: 0x111a24,
  metalness: 0.45,
  roughness: 0.18,
});

/* ------------------------------------------------------------------ */
/*  Canvas texture helpers                                             */
/* ------------------------------------------------------------------ */

const JP_FONT = '"Yu Gothic", "Hiragino Kaku Gothic ProN", "Meiryo", "Noto Sans JP", sans-serif';
const EN_FONT = '"Avenir Next", "Futura", "Century Gothic", "Trebuchet MS", sans-serif';
const maxAniso = renderer.capabilities.getMaxAnisotropy();

export function canvasTexture(width, height, draw, opts = {}) {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const ctx = c.getContext('2d');
  draw(ctx, width, height);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, maxAniso);
  if (opts.repeat) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(opts.repeat[0], opts.repeat[1]);
  }
  if (opts.clamp) {
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  }
  tex.needsUpdate = true;
  return tex;
}

export function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function drawSpacedText(ctx, text, x, y, spacing) {
  const chars = [...text];
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * Math.max(0, chars.length - 1);
  let cx = x - total / 2;
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i], cx + widths[i] / 2, y);
    cx += widths[i] + spacing;
  }
}

function makeBackdropTexture() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 1024;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(512, 460, 40, 512, 460, 740);
  g.addColorStop(0, '#162939');
  g.addColorStop(0.34, '#0d1928');
  g.addColorStop(0.68, '#070d18');
  g.addColorStop(1, '#02040a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1024, 1024);

  // Cool atmospheric bloom behind the model.
  const halo = ctx.createRadialGradient(520, 470, 20, 520, 470, 430);
  halo.addColorStop(0, 'rgba(74, 118, 150, 0.18)');
  halo.addColorStop(0.55, 'rgba(42, 75, 108, 0.08)');
  halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, 1024, 1024);

  // A scarce veil of grain in the void.
  ctx.globalAlpha = 0.08;
  for (let i = 0; i < 1500; i++) {
    const v = Math.random() * 55 + 20;
    ctx.fillStyle = `rgba(${v}, ${v + 7}, ${v + 14}, 0.35)`;
    ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 1, 1);
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ------------------------------------------------------------------ */
/*  Procedural surface textures                                        */
/* ------------------------------------------------------------------ */

export const TEX = {};

TEX.asphalt = canvasTexture(512, 512, (ctx, w, h) => {
  ctx.fillStyle = '#222932';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 6500; i++) {
    const g = Math.floor(26 + Math.random() * 34);
    ctx.fillStyle = `rgba(${g},${g + 3},${g + 8},${0.15 + Math.random() * 0.5})`;
    const s = Math.random() * 2.2 + 0.4;
    ctx.fillRect(Math.random() * w, Math.random() * h, s, s);
  }
  // Faint wet tire tracks.
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = '#8e9ead';
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.moveTo(50, 0);
  ctx.bezierCurveTo(70, 160, 35, 330, 62, 512);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(380, 0);
  ctx.bezierCurveTo(410, 160, 360, 340, 395, 512);
  ctx.stroke();
  ctx.globalAlpha = 1;
  // Patches and seams.
  ctx.globalAlpha = 0.14;
  ctx.strokeStyle = '#10151b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 255);
  ctx.lineTo(512, 265);
  ctx.stroke();
  ctx.globalAlpha = 1;
}, { repeat: [6, 6] });

TEX.sidewalk = canvasTexture(512, 512, (ctx, w, h) => {
  ctx.fillStyle = '#9c978d';
  ctx.fillRect(0, 0, w, h);
  const tile = 128;
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const tone = 143 + Math.floor(Math.random() * 20);
      ctx.fillStyle = `rgb(${tone},${tone - 4},${tone - 12})`;
      ctx.fillRect(x * tile + 2, y * tile + 2, tile - 4, tile - 4);
      ctx.strokeStyle = 'rgba(49,47,43,0.38)';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x * tile + 1, y * tile + 1, tile - 2, tile - 2);
      // Small wear marks.
      ctx.globalAlpha = 0.14;
      for (let i = 0; i < 14; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#5d5a54' : '#c9c3b8';
        ctx.fillRect(x * tile + Math.random() * tile, y * tile + Math.random() * tile, 2 + Math.random() * 6, 1 + Math.random() * 2);
      }
      ctx.globalAlpha = 1;
    }
  }
}, { repeat: [3, 3] });

TEX.tactile = canvasTexture(256, 128, (ctx, w, h) => {
  ctx.fillStyle = '#c99c34';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#e0b44b';
  for (let y = 18; y < h; y += 30) {
    for (let x = 14; x < w; x += 30) {
      ctx.beginPath();
      ctx.arc(x, y, 7.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(90,65,18,0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }
}, { repeat: [3, 1] });

TEX.glow = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.18, 'rgba(255,255,255,0.78)');
  g.addColorStop(0.46, 'rgba(255,255,255,0.2)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();

TEX.pool = (() => {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(128, 128, 8, 128, 128, 126);
  g.addColorStop(0, 'rgba(255,255,255,0.9)');
  g.addColorStop(0.52, 'rgba(255,255,255,0.34)');
  g.addColorStop(0.83, 'rgba(255,255,255,0.08)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();

TEX.streak = (() => {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 512;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, 'rgba(255,255,255,0.05)');
  g.addColorStop(0.22, 'rgba(255,255,255,0.84)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.24)');
  g.addColorStop(0.8, 'rgba(255,255,255,0.5)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 512);
  ctx.globalCompositeOperation = 'destination-in';
  const h = ctx.createLinearGradient(0, 0, 128, 0);
  h.addColorStop(0, 'rgba(255,255,255,0)');
  h.addColorStop(0.38, 'rgba(255,255,255,1)');
  h.addColorStop(0.62, 'rgba(255,255,255,1)');
  h.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = h;
  ctx.fillRect(0, 0, 128, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();

TEX.rainRing = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  ctx.strokeStyle = 'rgba(195,225,255,0.85)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(64, 64, 45, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(195,225,255,0.25)';
  ctx.lineWidth = 13;
  ctx.beginPath();
  ctx.arc(64, 64, 45, 0, Math.PI * 2);
  ctx.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();

/* ------------------------------------------------------------------ */
/*  Geometry helpers                                                   */
/* ------------------------------------------------------------------ */

const outlineMaterial = new THREE.LineBasicMaterial({
  color: 0x0b1116,
  transparent: true,
  opacity: 0.52,
  depthWrite: false,
});

export function edges(mesh, opacity = 0.52, threshold = 28) {
  const geo = new THREE.EdgesGeometry(mesh.geometry, threshold);
  const line = new THREE.LineSegments(geo, outlineMaterial.clone());
  line.material.opacity = opacity;
  line.renderOrder = 1;
  mesh.add(line);
  return line;
}

export function box(parent, w, h, d, material, x = 0, y = 0, z = 0, opts = {}) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(x, y, z);
  if (opts.rot) mesh.rotation.set(opts.rot[0] || 0, opts.rot[1] || 0, opts.rot[2] || 0);
  if (opts.cast !== false) mesh.castShadow = true;
  if (opts.receive !== false) mesh.receiveShadow = true;
  if (opts.edges) edges(mesh, opts.edgeOpacity ?? 0.45, opts.edgeThreshold ?? 25);
  if (opts.name) mesh.name = opts.name;
  parent.add(mesh);
  return mesh;
}

export function plane(parent, w, h, material, x = 0, y = 0, z = 0, opts = {}) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
  mesh.position.set(x, y, z);
  if (opts.rot) mesh.rotation.set(opts.rot[0] || 0, opts.rot[1] || 0, opts.rot[2] || 0);
  mesh.receiveShadow = opts.receive ?? false;
  if (opts.cast) mesh.castShadow = true;
  mesh.renderOrder = opts.renderOrder ?? 0;
  if (opts.depthWrite !== undefined) material.depthWrite = opts.depthWrite;
  parent.add(mesh);
  return mesh;
}

export function disc(parent, radius, material, x = 0, y = 0, z = 0, opts = {}) {
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(radius, opts.segments || 32), material);
  mesh.position.set(x, y, z);
  if (opts.rot) mesh.rotation.set(opts.rot[0] || 0, opts.rot[1] || 0, opts.rot[2] || 0);
  mesh.receiveShadow = opts.receive ?? false;
  parent.add(mesh);
  return mesh;
}

export function cylinder(parent, rt, rb, h, material, x = 0, y = 0, z = 0, opts = {}) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, opts.segments || 16), material);
  mesh.position.set(x, y, z);
  if (opts.rot) mesh.rotation.set(opts.rot[0] || 0, opts.rot[1] || 0, opts.rot[2] || 0);
  mesh.castShadow = opts.cast ?? true;
  mesh.receiveShadow = opts.receive ?? true;
  parent.add(mesh);
  return mesh;
}

export function tube(parent, a, b, radius, material, opts = {}) {
  const start = new THREE.Vector3(...a);
  const end = new THREE.Vector3(...b);
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const dir = end.clone().sub(start);
  const len = dir.length();
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, len, opts.segments || 8), material);
  mesh.position.copy(mid);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  mesh.castShadow = opts.cast ?? true;
  mesh.receiveShadow = opts.receive ?? true;
  parent.add(mesh);
  return mesh;
}

export function roundedBox(parent, w, h, d, radius, material, x = 0, y = 0, z = 0, opts = {}) {
  const geo = new RoundedBoxGeometry(w, h, d, opts.segments || 3, radius);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(x, y, z);
  if (opts.rot) mesh.rotation.set(opts.rot[0] || 0, opts.rot[1] || 0, opts.rot[2] || 0);
  mesh.castShadow = opts.cast ?? true;
  mesh.receiveShadow = opts.receive ?? true;
  if (opts.edges) edges(mesh, opts.edgeOpacity ?? 0.36, 40);
  parent.add(mesh);
  return mesh;
}

export function addGlowSprite(parent, color, x, y, z, scale = 3, opacity = 0.4) {
  const material = new THREE.SpriteMaterial({
    map: TEX.glow,
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: true,
  });
  const sprite = new THREE.Sprite(material);
  sprite.position.set(x, y, z);
  sprite.scale.set(scale, scale, 1);
  sprite.renderOrder = 5;
  parent.add(sprite);
  return sprite;
}

export function addPool(parent, color, w, d, x, z, opacity = 0.5, y = 0.035, rot = 0) {
  const mat = new THREE.MeshBasicMaterial({
    map: TEX.pool,
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.rotation.z = rot;
  mesh.position.set(x, y, z);
  mesh.renderOrder = 3;
  parent.add(mesh);
  return mesh;
}

export function addStreak(parent, color, w, d, x, z, opacity = 0.5, y = 0.045, rot = 0) {
  const mat = new THREE.MeshBasicMaterial({
    map: TEX.streak,
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.rotation.z = rot;
  mesh.position.set(x, y, z);
  mesh.renderOrder = 4;
  parent.add(mesh);
  return mesh;
}

export function addLabelPlane(parent, texture, w, h, x, y, z, opts = {}) {
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
    side: opts.doubleSide ? THREE.DoubleSide : THREE.FrontSide,
    depthWrite: opts.depthWrite ?? true,
    blending: opts.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    toneMapped: opts.toneMapped ?? false,
  });
  const mesh = plane(parent, w, h, mat, x, y, z, {
    rot: opts.rot,
    renderOrder: opts.renderOrder ?? 0,
    receive: false,
  });
  return mesh;
}

/* ------------------------------------------------------------------ */
/*  Assembly manager                                                   */
/* ------------------------------------------------------------------ */

const assemblyParts = [];
export const assemblyState = { time: 0, finished: false };

export function part(delay, opts = {}) {
  const group = new THREE.Group();
  group.visible = false;
  world.add(group);
  const defaultFrom = [0, -2.6, 0];
  const from = opts.from || defaultFrom;
  assemblyParts.push({
    group,
    delay,
    duration: opts.duration ?? 1.05,
    from: new THREE.Vector3(from[0], from[1], from[2]),
    rotFrom: new THREE.Euler(...(opts.rotFrom || [0, 0, 0])),
    scaleFrom: opts.scaleFrom ?? 1,
    bounce: opts.bounce ?? 0,
    finalPos: null,
    finalRot: null,
    finalScale: null,
    alive: false,
  });
  return group;
}

export function finalizeAssembly() {
  for (const p of assemblyParts) {
    p.finalPos = p.group.position.clone();
    p.finalRot = p.group.rotation.clone();
    p.finalScale = p.group.scale.clone();
  }
}

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export function updateAssembly(time) {
  assemblyState.time = time;
  let allDone = true;
  for (const p of assemblyParts) {
    const local = (time - p.delay) / p.duration;
    if (local <= 0) {
      p.group.visible = false;
      allDone = false;
      continue;
    }
    p.group.visible = true;
    const raw = Math.min(local, 1);
    if (raw < 1) allDone = false;
    const e = p.bounce > 0 && raw > 0.72
      ? 1 - (1 - raw) * Math.cos((raw - 0.72) * 12) * (1 - raw)
      : easeOutCubic(raw);
    const k = 1 - e;
    p.group.position.set(
      p.finalPos.x + p.from.x * k,
      p.finalPos.y + p.from.y * k,
      p.finalPos.z + p.from.z * k
    );
    p.group.rotation.set(
      p.finalRot.x + p.rotFrom.x * k,
      p.finalRot.y + p.rotFrom.y * k,
      p.finalRot.z + p.rotFrom.z * k
    );
    const s = p.scaleFrom + (1 - p.scaleFrom) * e;
    p.group.scale.set(p.finalScale.x * s, p.finalScale.y * s, p.finalScale.z * s);
  }
  assemblyState.finished = allDone;
}

export function assemblyTotalTime() {
  return assemblyParts.reduce((max, p) => Math.max(max, p.delay + p.duration), 0);
}

/* ------------------------------------------------------------------ */
/*  Camera controls — drag, wheel, pinch, pan. No visible UI.           */
/* ------------------------------------------------------------------ */

export class DioramaControls {
  constructor(cam, dom) {
    this.camera = cam;
    this.dom = dom;
    this.defaultTarget = new THREE.Vector3(0.9, 1.55, -1.3);
    this.target = this.defaultTarget.clone();
    this.desiredTarget = this.defaultTarget.clone();
    this.radius = 32.1;
    this.theta = -0.7;
    this.phi = 1.22;
    this.desiredRadius = this.radius;
    this.desiredTheta = this.theta;
    this.desiredPhi = this.phi;
    this.minRadius = 14;
    this.maxRadius = 48;
    this.pointers = new Map();
    this.mode = 'idle';
    this.lastPinch = 0;
    this.lastMid = new THREE.Vector2();
    this.dragging = false;
    this.introing = true;
    this.introTime = 0;
    this.introDuration = 3.1;
    this.introStart = {
      radius: 41,
      theta: -0.3,
      phi: 1.16,
    };
    this.velTheta = 0;
    this.velPhi = 0;
    this.bind();
  }

  setDefaultView(radius, theta, phi, target) {
    this.radius = radius;
    this.theta = theta;
    this.phi = phi;
    this.desiredRadius = radius;
    this.desiredTheta = theta;
    this.desiredPhi = phi;
    if (target) {
      this.defaultTarget.copy(target);
      this.target.copy(target);
      this.desiredTarget.copy(target);
    }
  }

  bind() {
    const dom = this.dom;
    dom.style.touchAction = 'none';

    dom.addEventListener('pointerdown', (e) => {
      if (e.button === 2) return;
      this.introing = false;
      dom.setPointerCapture(e.pointerId);
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      this.dragging = true;
      document.body.classList.add('dragging');
      if (this.pointers.size === 1) {
        this.mode = (e.button === 1 || e.shiftKey) ? 'pan' : 'orbit';
      } else if (this.pointers.size === 2) {
        this.mode = 'pinch';
        const pts = [...this.pointers.values()];
        this.lastPinch = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        this.lastMid.set((pts[0].x + pts[1].x) / 2, (pts[0].y + pts[1].y) / 2);
      }
    });

    dom.addEventListener('pointermove', (e) => {
      if (!this.pointers.has(e.pointerId)) return;
      const prev = this.pointers.get(e.pointerId);
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (this.mode === 'orbit' && this.pointers.size === 1) {
        this.desiredTheta -= dx * 0.0052;
        this.desiredPhi -= dy * 0.0043;
        this.desiredPhi = THREE.MathUtils.clamp(this.desiredPhi, 0.28, 1.43);
        this.velTheta = -dx * 0.0052;
        this.velPhi = -dy * 0.0043;
      } else if (this.mode === 'pan' && this.pointers.size === 1) {
        this.panBy(dx, dy);
      } else if (this.mode === 'pinch' && this.pointers.size === 2) {
        const pts = [...this.pointers.values()];
        const pinch = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const mid = new THREE.Vector2((pts[0].x + pts[1].x) / 2, (pts[0].y + pts[1].y) / 2);
        if (this.lastPinch > 0) {
          const factor = this.lastPinch / Math.max(1, pinch);
          this.desiredRadius = THREE.MathUtils.clamp(this.desiredRadius * factor, this.minRadius, this.maxRadius);
        }
        this.panBy(mid.x - this.lastMid.x, mid.y - this.lastMid.y);
        this.lastPinch = pinch;
        this.lastMid.copy(mid);
      }
    });

    const end = (e) => {
      this.pointers.delete(e.pointerId);
      if (this.pointers.size === 0) {
        this.mode = 'idle';
        this.dragging = false;
        document.body.classList.remove('dragging');
      } else if (this.pointers.size === 1) {
        this.mode = 'orbit';
        const p = [...this.pointers.values()][0];
        this.lastPinch = 0;
        this.lastMid.set(p.x, p.y);
      }
      try { dom.releasePointerCapture(e.pointerId); } catch (_) { /* noop */ }
    };
    dom.addEventListener('pointerup', end);
    dom.addEventListener('pointercancel', end);


    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.introing = false;
      const delta = Math.max(-140, Math.min(140, e.deltaY));
      this.desiredRadius = THREE.MathUtils.clamp(
        this.desiredRadius * Math.exp(delta * 0.00115),
        this.minRadius,
        this.maxRadius
      );
    }, { passive: false });

    dom.addEventListener('contextmenu', (e) => e.preventDefault());
    dom.addEventListener('dblclick', () => {
      this.introing = false;
      this.desiredTarget.copy(this.defaultTarget);
      this.desiredRadius = 32.1;
      this.desiredTheta = this.nearestTheta(-0.7);
      this.desiredPhi = 1.22;
    });
  }

  nearestTheta(base) {
    const turns = Math.round((this.desiredTheta - base) / (Math.PI * 2));
    return base + turns * Math.PI * 2;
  }

  panBy(dx, dy) {
    const scale = this.radius * Math.tan(THREE.MathUtils.degToRad(this.camera.fov * 0.5)) * 2 / this.dom.clientHeight;
    const right = new THREE.Vector3();
    const up = new THREE.Vector3();
    this.camera.matrixWorld.extractBasis(right, up, new THREE.Vector3());
    this.desiredTarget.addScaledVector(right, -dx * scale);
    this.desiredTarget.addScaledVector(up, dy * scale);
    this.desiredTarget.x = THREE.MathUtils.clamp(this.desiredTarget.x, -6.5, 6.5);
    this.desiredTarget.z = THREE.MathUtils.clamp(this.desiredTarget.z, -6.5, 6.5);
    this.desiredTarget.y = THREE.MathUtils.clamp(this.desiredTarget.y, 0.4, 5.2);
  }

  update(dt) {
    if (this.introing) {
      this.introTime += dt;
      const u = Math.min(1, this.introTime / this.introDuration);
      const e = 1 - Math.pow(1 - u, 4);
      this.radius = THREE.MathUtils.lerp(this.introStart.radius, 32.1, e);
      this.theta = THREE.MathUtils.lerp(this.introStart.theta, -0.7, e);
      this.phi = THREE.MathUtils.lerp(this.introStart.phi, 1.22, e);
      this.target.lerp(this.defaultTarget, 0.025);
      this.desiredRadius = this.radius;
      this.desiredTheta = this.theta;
      this.desiredPhi = this.phi;
      this.desiredTarget.copy(this.target);
      if (u >= 1) this.introing = false;
    } else {
      const damp = 1 - Math.exp(-dt * 9.5);
      this.radius += (this.desiredRadius - this.radius) * damp;
      this.theta += (this.desiredTheta - this.theta) * damp;
      this.phi += (this.desiredPhi - this.phi) * damp;
      this.target.lerp(this.desiredTarget, 1 - Math.exp(-dt * 8));
    }

    const sinPhi = Math.sin(this.phi);
    const x = this.radius * sinPhi * Math.sin(this.theta);
    const y = this.radius * Math.cos(this.phi);
    const z = this.radius * sinPhi * Math.cos(this.theta);
    this.camera.position.set(this.target.x + x, this.target.y + y, this.target.z + z);
    this.camera.lookAt(this.target);
  }
}

export const controls = new DioramaControls(camera, renderer.domElement);

/* ------------------------------------------------------------------ */
/*  Resize                                                             */
/* ------------------------------------------------------------------ */

let resizeQueued = false;
export function resize() {
  if (resizeQueued) return;
  resizeQueued = true;
  requestAnimationFrame(() => {
    resizeQueued = false;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.85);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h);
    composer.setPixelRatio(dpr);
    composer.setSize(w, h);
    bloomPass.setSize(w * dpr, h * dpr);
  });
}

window.addEventListener('resize', resize);

export { renderer, scene, camera, composer, bloomPass, stage };
