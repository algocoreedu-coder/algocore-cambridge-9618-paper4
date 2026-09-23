const fs = require('fs');
const path = require('path');
const sharp = require('C:/Users/Nguyen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root = path.resolve(__dirname, '..');
fs.mkdirSync(path.join(root, 'png'), {recursive: true});
(async () => {
  const files = fs.readdirSync(path.join(root, 'svg')).filter(f => f.endsWith('.svg'));
  for(let i=0; i<files.length; i+=4) {
    await Promise.all(files.slice(i,i+4).map(f => sharp(path.join(root,'svg',f), {density:144}).png().toFile(path.join(root,'png',f.replace('.svg','.png')))));
  }
  console.log(`Rendered ${files.length} transparent PNGs at 2x SVG dimensions`);
})();
