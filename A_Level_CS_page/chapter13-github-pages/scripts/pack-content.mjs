import fs from 'node:fs/promises';
import path from 'node:path';
import {webcrypto as crypto} from 'node:crypto';
const args=process.argv.slice(2);
const source=args[args.indexOf('--source')+1];
const codesFile=args.includes('--codes-file')?args[args.indexOf('--codes-file')+1]:null;
if(!args.includes('--source')||!source)throw Error('Use --source /private/path/to/data, with code environment variables or --codes-file /private/path.');
const settings={...process.env};
if(codesFile){for(const line of (await fs.readFile(codesFile,'utf8')).split(/\r?\n/)){const at=line.indexOf('=');if(at>0)settings[line.slice(0,at).trim()]=line.slice(at+1).trim().replace(/^"|"$/g,'')}}
const course=JSON.parse(await fs.readFile(path.join(source,'curriculum.json'),'utf8'));
const scripts=JSON.parse(await fs.readFile(path.join(source,'teacher-scripts.vi.json'),'utf8'));
if(course.lessons.length!==39||course.visuals.length!==66||Object.keys(scripts).length!==39)throw Error('Incomplete chapter content.');
const out=path.resolve('public/content');await fs.mkdir(out,{recursive:true});
for(const role of ['student','teacher']){
  const code=settings[role.toUpperCase()+'_CODE'];
  if(!/^\d{4}$/.test(code||''))throw Error('Missing four-digit code for '+role);
  const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),iterations=600000;
  const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(code),'PBKDF2',false,['deriveKey']);
  const key=await crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt,iterations},material,{name:'AES-GCM',length:256},false,['encrypt']);
  const payload=role==='teacher'?{role,course,scripts}:{role,course};
  const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode(`algocore.chapter13.v1:${role}`),tagLength:128},key,new TextEncoder().encode(JSON.stringify(payload)));
  const b64=bytes=>Buffer.from(bytes).toString('base64');
  await fs.writeFile(path.join(out,role+'.json'),JSON.stringify({version:1,algorithm:'AES-GCM',kdf:'PBKDF2-SHA256',iterations,salt:b64(salt),iv:b64(iv),ciphertext:b64(ciphertext)})+'\n');
}
console.log('Packed 39 lessons and 39 teaching scripts into two encrypted classroom packages.');
