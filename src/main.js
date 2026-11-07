import {
  THREE, renderer, scene, camera, composer, controls,
  world, updateAssembly, finalizeAssembly, assemblyTotalTime,
} from './core.js';
import { buildEnvironment, updateRipples } from './environment.js';
import { buildStore, storeLights } from './store.js';
import { buildProps, streetLights } from './props.js';
import { buildEffects } from './effects.js';
import { interiorLights } from './interior.js';

/* ------------------------------------------------------------------ */
/*  Assemble the world                                                 */
/* ------------------------------------------------------------------ */

buildEnvironment();
buildStore();
buildProps();
finalizeAssembly();

const effects = buildEffects();
const totalTime = assemblyTotalTime();

const clock = new THREE.Clock();
let elapsed = 0;
let paused = false;

function smooth(x, a, b) {
  return THREE.MathUtils.smoothstep(x, a, b);
}

function setLighting(time) {
  const interior = smooth(time, 3.65, 5.6);
  const shopOutside = smooth(time, 4.9, 6.35);
  const street = smooth(time, 5.9, 7.25);

  for (const { light, baseIntensity } of interiorLights) {
    light.intensity = baseIntensity * interior;
  }
  for (const { light, baseIntensity } of storeLights) {
    light.intensity = baseIntensity * shopOutside;
  }
  for (const { light, baseIntensity } of streetLights) {
    light.intensity = baseIntensity * street;
  }
}

function tick() {
  requestAnimationFrame(tick);
  const rawDt = Math.min(clock.getDelta(), 0.25);
  const dt = Math.min(rawDt, 0.05);
  if (!paused) {
    elapsed += rawDt;
    updateAssembly(elapsed);
    updateRipples(elapsed);
    effects.update(dt, elapsed);
    setLighting(elapsed);
    controls.update(dt);
  }
  composer.render();
}

setLighting(0);
updateAssembly(0);
controls.update(0);
tick();

/* ------------------------------------------------------------------ */
/*  A tiny, deliberately invisible debug surface for capture tools.    */
/* ------------------------------------------------------------------ */

window.__DIORAMA__ = {
  scene,
  camera,
  renderer,
  controls,
  get time() { return elapsed; },
  get totalTime() { return totalTime; },
  play() { paused = false; clock.getDelta(); },
  pause() { paused = true; },
  seek(t) {
    paused = true;
    elapsed = Math.max(0, t);
    updateAssembly(elapsed);
    updateRipples(elapsed);
    effects.update(0, elapsed);
    setLighting(elapsed);
    controls.update(0);
    composer.render();
  },
  render() { composer.render(); },
  resetView() {
    controls.introing = false;
    controls.desiredRadius = 32.1;
    controls.desiredTheta = -0.7;
    controls.desiredPhi = 1.22;
    controls.desiredTarget.set(0.9, 1.55, -1.3);
  },
};

// Pause animation sheets when the tab is hidden, then resume cleanly.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) clock.getDelta();
});
