import {env} from 'cloudflare:workers';
type Role='student'|'teacher';
const settings=()=>env as unknown as Record<string,string>;
const encoder=new TextEncoder();
async function key(){const s=settings().SESSION_SECRET;if(!s)throw Error('Classroom access is not configured.');return crypto.subtle.importKey('raw',encoder.encode(s),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
function b64(a:Uint8Array){return btoa(String.fromCharCode(...a)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function bytes(s:string){return Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));}
export async function makeSession(role:Role){const payload=b64(encoder.encode(JSON.stringify({role,exp:Date.now()+8*60*60*1000,nonce:crypto.randomUUID()})));const signature=b64(new Uint8Array(await crypto.subtle.sign('HMAC',await key(),encoder.encode(payload))));return `${payload}.${signature}`;}
export async function getSession(request:Request):Promise<{role:Role}|null>{try{const value=request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith('chapter13_session='))?.split('=')[1];if(!value)return null;const [payload,signature]=value.split('.');if(!payload||!signature||!await crypto.subtle.verify('HMAC',await key(),bytes(signature),encoder.encode(payload)))return null;const d=JSON.parse(new TextDecoder().decode(bytes(payload)));return d.exp>Date.now()&&['student','teacher'].includes(d.role)?{role:d.role}:null;}catch{return null}}
export function cookie(request:Request,value:string,maxAge=28800){return `chapter13_session=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${new URL(request.url).protocol==='https:'?'; Secure':''}`;}
export function validOrigin(request:Request){const origin=request.headers.get('origin');return !origin||origin===new URL(request.url).origin;}
export async function matchesCode(role:Role,code:string){const expected=settings()[role==='teacher'?'TEACHER_CODE':'STUDENT_CODE'];if(!expected)throw Error('Classroom access is not configured.');const a=new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(code))),b=new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(expected)));let delta=0;for(let i=0;i<a.length;i++)delta|=a[i]^b[i];return delta===0;}
