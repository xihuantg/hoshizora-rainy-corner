import fs from 'node:fs';

const css = fs.readFileSync('style.css', 'utf8');
const js = fs.readFileSync('app.js', 'utf8');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace('<link rel="stylesheet" href="style.css">', `<style>\n${css}\n</style>`);
html = html.replace('<script src="app.js"></script>', `<script>\n${js}\n</script>`);
html = html.replace(
  '<meta property="og:image" content="https://xihuantg.github.io/hoshizora-rainy-corner/preview.png">',
  '<meta property="og:image" content="preview.png">'
);
fs.writeFileSync('雨夜便利店街角.html', html);
console.log(`standalone written: ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB`);
