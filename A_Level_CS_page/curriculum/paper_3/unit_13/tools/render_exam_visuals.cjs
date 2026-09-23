const fs=require('fs'),path=require('path');
const sharp=require('C:/Users/Nguyen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'../exam_visuals');
(async()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'visual_manifest.json'),'utf8'));
 for(let i=0;i<manifest.visuals.length;i+=4){
  await Promise.all(manifest.visuals.slice(i,i+4).map(v=>sharp(path.join(root,v.svg),{density:144}).png().toFile(path.join(root,v.png))));
 }
 console.log(JSON.stringify({png:manifest.visual_count,scale:2,background:'transparent'}));
})().catch(e=>{console.error(e);process.exit(1)});
