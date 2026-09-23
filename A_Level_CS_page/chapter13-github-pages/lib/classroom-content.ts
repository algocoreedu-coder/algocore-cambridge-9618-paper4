import type {Course,TeacherScript} from './course-types';
import {decryptContent,deriveContentKey,fromBase64,toBase64,type Envelope,type Role} from './content-crypto';

type Unlocked={role:Role;course:Course;scripts?:Record<string,TeacherScript>};
type SavedSession={role:Role;key:string;expires:number};
const SESSION='algocore-ch13-pages-session-v1';
const BASE=import.meta.env.BASE_URL;
let current:Unlocked|null=null;
let expiresAt=0;
let restoreInFlight:Promise<void>|null=null;

function response(value:unknown,status=200){return Response.json(value,{status});}
function mapCourse(course:Course):Course{
  const path=(url:string)=>url.startsWith('/')?BASE+url.slice(1):url;
  return {...course,visuals:course.visuals.map(v=>({...v,src:path(v.src)})),lessons:course.lessons.map(l=>({...l,examRefs:l.examRefs.map(r=>({...r,url:path(r.url)}))}))};
}
function accept(payload:Unlocked,role:Role,expiry:number){
  if(payload.role!==role||!Array.isArray(payload.course?.lessons)||payload.course.lessons.length!==39)throw Error('Invalid content package.');
  if(role==='teacher'&&Object.keys(payload.scripts||{}).length!==39)throw Error('Teaching scripts are incomplete.');
  current={...payload,course:mapCourse(payload.course)};expiresAt=expiry;
}
async function loadEnvelope(role:Role):Promise<Envelope>{
  const r=await fetch(`${BASE}content/${role}.json`,{cache:'no-cache'});
  if(!r.ok)throw Error('The lesson package could not be loaded. Check your connection and try again.');
  return r.json();
}
function clearSession(){current=null;expiresAt=0;try{sessionStorage.removeItem(SESSION)}catch{}}
async function restore(){
  if(current&&expiresAt>Date.now())return;
  if(restoreInFlight)return restoreInFlight;
  restoreInFlight=(async()=>{
    current=null;
    try{
      const stored=JSON.parse(sessionStorage.getItem(SESSION)||'null') as SavedSession|null;
      if(!stored||!['student','teacher'].includes(stored.role)||stored.expires<=Date.now()){clearSession();return}
      const key=await crypto.subtle.importKey('raw',fromBase64(stored.key),{name:'AES-GCM'},false,['decrypt']);
      const payload=await decryptContent<Unlocked>(stored.role,key,await loadEnvelope(stored.role));
      accept(payload,stored.role,stored.expires);
    }catch{clearSession()}
  })();
  try{await restoreInFlight}finally{restoreInFlight=null}
}

/** Local content gateway: GitHub Pages has no server authentication endpoints. */
export async function classroomRequest(path:string,options:RequestInit={}):Promise<Response>{
  const method=options.method||'GET';
  if(path==='/api/auth'&&method==='DELETE'){clearSession();return response({session:null})}
  if(path==='/api/auth'&&method==='POST'){
    if(!globalThis.crypto?.subtle)return response({error:'Open this classroom using HTTPS in a current browser.'},503);
    let input:{role?:unknown;code?:unknown};
    try{input=JSON.parse(String(options.body))}catch{return response({error:'Choose a role and enter four digits.'},400)}
    const {role,code}=input;
    if((role!=='student'&&role!=='teacher')||typeof code!=='string'||!/^\d{4}$/.test(code))return response({error:'Choose a role and enter four digits.'},400);
    let envelope:Envelope;
    try{envelope=await loadEnvelope(role)}catch(e){return response({error:(e as Error).message},503)}
    try{
      const key=await deriveContentKey(code,envelope);
      const payload=await decryptContent<Unlocked>(role,key,envelope);
      const expiry=Date.now()+8*60*60*1000;
      accept(payload,role,expiry);
      const saved:SavedSession={role,key:toBase64(await crypto.subtle.exportKey('raw',key)),expires:expiry};
      try{sessionStorage.setItem(SESSION,JSON.stringify(saved))}catch{/* The current tab still works when storage is disabled. */}
      return response({session:{role}});
    }catch{return response({error:'That code does not match this role. Please try again.'},401)}
  }
  await restore();
  if(path==='/api/auth')return response({session:current?{role:current.role}:null});
  if(!current)return response({error:'Please enter your classroom code.'},401);
  if(path==='/api/course')return response(current.course);
  if(path.startsWith('/api/teacher?')){
    if(current.role!=='teacher')return response({error:'Teacher access is required.'},403);
    const id=new URL(path,'https://classroom.invalid').searchParams.get('lesson')||'';
    const script=current.scripts?.[id];
    return script?response(script):response({error:'Lesson not found.'},404);
  }
  return response({error:'Unknown content request.'},404);
}
