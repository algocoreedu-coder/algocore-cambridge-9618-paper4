import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

for(const role of ['student','teacher']){
  const content=JSON.parse(fs.readFileSync(`public/content/${role}.json`,'utf8'));
  assert.deepEqual(Object.keys(content).sort(),['version','algorithm','kdf','iterations','salt','iv','ciphertext'].sort());
  assert.equal(content.version,1);assert.equal(content.algorithm,'AES-GCM');assert.equal(content.iterations,600000);
  assert.equal(Buffer.from(content.salt,'base64').length,16);assert.equal(Buffer.from(content.iv,'base64').length,12);
  assert.ok(Buffer.from(content.ciphertext,'base64').length>10000);
}
assert.equal(fs.readdirSync('public/visuals').filter(n=>n.endsWith('.svg')).length,66);
assert.equal(fs.readdirSync('public/papers').filter(n=>n.endsWith('.pdf')).length,30);
const files=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(['node_modules','dist','.git','.qa','.private'].includes(e.name))continue;const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else files.push(p)}}
walk('.');
for(const file of files){
  const name=path.basename(file);
  assert.ok(!['teacher-scripts.vi.json','curriculum.json','.dev.vars'].includes(name),`Plaintext source must stay outside the public project: ${file}`);
  if(!/\.(ts|tsx|mjs|html|css|json|yml|md)$/.test(file)||file.startsWith(path.join('public','content')))continue;
  const text=fs.readFileSync(file,'utf8');
  const forbiddenHost=['nguyenhuynh','chatgpt','site'].join('.');
  assert.ok(!text.includes(forbiddenHost),`Old hosting reference in ${file}`);
  assert.ok(!/gh[pousr]_[A-Za-z0-9]{20,}/.test(text),`Credential-like value in ${file}`);
}
console.log('Package checks passed: encrypted content only, 66 visuals, 30 PDFs, no old hosting dependency.');
