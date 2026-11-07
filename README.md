# 雨夜便利店 · 星夜町

一座可以自由观看的雨夜日式便利店街角微缩模型。

- **拖拽**：环绕旋转
- **滚轮 / 双指捏合**：缩放
- **右键 / Shift + 拖拽**：平移视角
- **双击**：回到初始视角

打开页面后会自动播放建筑自下而上的组装动画。场景没有人物，也没有任何界面控件；店内灯光、货架、冷柜、杂志架、收银台与热食柜都透过大面积玻璃橱窗可见。

## 本地打开

直接双击 `index.html`，或双击 `雨夜便利店街角.html`（单文件版本）。

## 线上访问

GitHub Pages：https://xihuantg.github.io/hoshizora-rainy-corner/

## 技术说明

- Three.js（本地打包，无外部 CDN）
- 纯静态页面，包含程序化贴图、卡通材质、轮廓线、雨滴粒子、地面反射与分阶段装配动画
- `src/` 为源码，`app.js` 为构建产物
- 重新构建：`npm install`（或复用 `node_modules`），再执行 `npm run build`

---

A rainy-night Japanese convenience-store corner, built as a collectible miniature diorama. Drag to orbit, scroll to zoom, double-click to reset. The building assembles itself from the ground up on load.
