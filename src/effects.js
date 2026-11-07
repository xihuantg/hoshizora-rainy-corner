import {
  THREE, C, MAT, TEX, world,
  canvasTexture, plane,
} from './core.js';
import { STORE } from './config.js';

function makeRainLayer(count, { minY = 0.4, maxY = 14.5, speedMin = 8.5, speedMax = 13.5, lengthMin = 0.32, lengthMax = 0.7 }) {
  const positions = new Float32Array(count * 6);
  const colors = new Float32Array(count * 6);
  const drops = [];
  const color = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const x = -12.8 + Math.random() * 25.6;
    const z = -12.8 + Math.random() * 25.6;
    const y = minY + Math.random() * (maxY - minY);
    const speed = speedMin + Math.random() * (speedMax - speedMin);
    const len = lengthMin + Math.random() * (lengthMax - lengthMin);
    const warm = x > 1 && x < 11 && z > -1 && z < 5.5;
    color.setHex(warm ? 0xffd7a0 : 0xa9cef1);
    if (warm) color.multiplyScalar(1.1);
    const o = i * 6;
    positions[o] = x;
    positions[o + 1] = y;
    positions[o + 2] = z;
    positions[o + 3] = x + 0.025;
    positions[o + 4] = y + len;
    positions[o + 5] = z + 0.012;
    colors[o] = color.r;
    colors[o + 1] = color.g;
    colors[o + 2] = color.b;
    colors[o + 3] = color.r * 0.58;
    colors[o + 4] = color.g * 0.58;
    colors[o + 5] = color.b * 0.58;
    drops.push({ x, z, y, speed, len });
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const mesh = new THREE.LineSegments(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 8;
  world.add(mesh);
  return {
    mesh,
    mat,
    drops,
    positions,
    count,
    update(dt) {
      for (let i = 0; i < count; i++) {
        const d = drops[i];
        d.y -= d.speed * dt;
        d.x -= 0.16 * dt;
        if (d.y < minY) {
          d.y = maxY - Math.random() * 4.5;
          d.x = -12.8 + Math.random() * 25.6;
          d.z = -12.8 + Math.random() * 25.6;
        }
        // Rain above the roof only; drops disappear through the shop otherwise.
        if (
          d.x > STORE.x0 - 0.2 && d.x < STORE.x1 + 0.2 &&
          d.z > STORE.z0 - 0.2 && d.z < STORE.z1 + 0.2 &&
          d.y < 5.7
        ) {
          d.y = 10.5 + Math.random() * 4;
          d.x = -12.8 + Math.random() * 25.6;
          d.z = -12.8 + Math.random() * 25.6;
        }
        const o = i * 6;
        positions[o] = d.x;
        positions[o + 1] = d.y;
        positions[o + 2] = d.z;
        positions[o + 3] = d.x + 0.025;
        positions[o + 4] = d.y + d.len;
        positions[o + 5] = d.z + 0.012;
      }
      geo.attributes.position.needsUpdate = true;
    },
  };
}

function makeDripTexture() {
  return canvasTexture(64, 512, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(210,235,255,0)');
    g.addColorStop(0.18, 'rgba(210,235,255,0.72)');
    g.addColorStop(0.34, 'rgba(210,235,255,0.04)');
    g.addColorStop(0.55, 'rgba(210,235,255,0.52)');
    g.addColorStop(0.82, 'rgba(210,235,255,0.12)');
    g.addColorStop(1, 'rgba(210,235,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(w * 0.34, 0, w * 0.22, h);
    ctx.fillStyle = 'rgba(220,245,255,0.7)';
    for (let i = 0; i < 7; i++) {
      ctx.fillRect(w * 0.4, Math.random() * h, 3, 11 + Math.random() * 18);
    }
  }, { clamp: true });
}

function addAwningDrips() {
  const dripTex = makeDripTexture();
  const dripMat = new THREE.MeshBasicMaterial({
    map: dripTex,
    transparent: true,
    opacity: 0.25,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  for (const x of [6.43, 7.2, 8.55, 9.4]) {
    const drip = plane(world, 0.08, 3.0, dripMat, x, 1.95, 2.36, {
      renderOrder: 7,
    });
    drip.rotation.y = 0.02;
  }
  // A thin drip line from the roof edge on the side wall.
  for (const z of [-5.2, -2.7]) {
    plane(world, 0.07, 3.7, dripMat, 2.02, 2.3, z, {
      rot: [0, -Math.PI / 2, 0],
      renderOrder: 7,
    });
  }
}

function addMist() {
  const sprites = [];
  const positions = [
    [10.3, 1.3, 5.2, 7.5, 0.07, 0xffc78c],
    [-4.4, 1.2, 5.4, 8.0, 0.06, 0x9ec8f2],
    [7.8, 1.0, 2.6, 6.5, 0.055, 0xffd29a],
    [-8.6, 1.0, 8.4, 6.0, 0.04, 0x8db9e3],
  ];
  for (const [x, y, z, s, o, color] of positions) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: TEX.glow,
      color,
      transparent: true,
      opacity: o,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }));
    sprite.position.set(x, y, z);
    sprite.scale.set(s, s * 0.45, 1);
    world.add(sprite);
    sprites.push({ sprite, base: o, phase: Math.random() * 9 });
  }
  return sprites;
}

function addBokeh() {
  const group = new THREE.Group();
  world.add(group);
  const colors = [0xffb56f, 0x8bd4d0, 0xf17994, 0xffd49e, 0x72a9e1];
  const spots = [
    [-10.4, 4.2, -8.6], [11.6, 3.8, 7.8], [-8.4, 2.6, 8.9],
    [9.8, 4.9, -4.2], [-2.3, 4.6, -10.2], [4.2, 5.3, 7.6],
  ];
  const list = [];
  spots.forEach(([x, y, z], i) => {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: TEX.glow,
      color: colors[i % colors.length],
      transparent: true,
      opacity: 0.06 + Math.random() * 0.045,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }));
    sprite.position.set(x, y, z);
    const s = 0.35 + Math.random() * 0.7;
    sprite.scale.set(s, s, 1);
    group.add(sprite);
    list.push({ sprite, base: sprite.material.opacity, phase: Math.random() * 10, speed: 0.2 + Math.random() * 0.4 });
  });
  return list;
}

export function buildEffects() {
  const mainRain = makeRainLayer(950, {
    minY: 0.3, maxY: 14.5, speedMin: 8.5, speedMax: 14, lengthMin: 0.24, lengthMax: 0.52,
  });
  const nearRain = makeRainLayer(190, {
    minY: 0.3, maxY: 11, speedMin: 11, speedMax: 16, lengthMin: 0.45, lengthMax: 0.85,
  });
  nearRain.mat.blending = THREE.NormalBlending;
  nearRain.mat.opacity = 0;

  addAwningDrips();
  const mist = addMist();
  const bokeh = addBokeh();

  return {
    update(dt, time) {
      mainRain.update(dt);
      nearRain.update(dt);
      const rainOn = THREE.MathUtils.smoothstep(time, 6.5, 8.2);
      mainRain.mat.opacity = rainOn * 0.23;
      nearRain.mat.opacity = rainOn * 0.055;
      for (const m of mist) {
        m.sprite.material.opacity = m.base * (0.76 + Math.sin(time * 0.55 + m.phase) * 0.24) * rainOn;
      }
      for (const b of bokeh) {
        b.sprite.material.opacity = b.base * (0.7 + Math.sin(time * b.speed + b.phase) * 0.3) * rainOn;
      }
    },
  };
}
