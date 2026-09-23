import {cookie,getSession,makeSession,matchesCode,validOrigin} from '@/lib/class-auth';
export const dynamic='force-dynamic';
const attempts=new Map<string,{count:number,until:number}>();
function response(body:unknown,status=200,headers:Record<string,string>={}){return Response.json(body,{status,headers:{'Cache-Control':'no-store',...headers}})}
export async function GET(request:Request){return response({session:await getSession(request)})}
export async function DELETE(request:Request){if(!validOrigin(request))return response({error:'Request not allowed.'},403);return response({session:null},200,{'Set-Cookie':cookie(request,'',0)})}
export async function POST(request:Request){
 if(!validOrigin(request))return response({error:'Request not allowed.'},403);
 const ip=request.headers.get('cf-connecting-ip')||'local';const now=Date.now();for(const[k,v]of attempts)if(v.until<now)attempts.delete(k);
 const failed=attempts.get(ip);if(failed&&failed.count>=8)return response({error:'Too many attempts. Try again in 10 minutes.'},429);
 let input:{role?:unknown;code?:unknown}|null;try{input=await request.json() as typeof input}catch{return response({error:'Enter a valid class code.'},400)}
 try{const role=input?.role,code=input?.code;if((role!=='student'&&role!=='teacher')||typeof code!=='string'||!/^\d{4}$/.test(code))return response({error:'Choose a role and enter four digits.'},400);
 if(!await matchesCode(role,code)){attempts.set(ip,{count:(failed?.count||0)+1,until:failed?.until||now+600000});return response({error:'That code does not match this role. Please try again.'},401)}
 attempts.delete(ip);return response({session:{role}},200,{'Set-Cookie':cookie(request,await makeSession(role))});
 }catch{return response({error:'Classroom access is temporarily unavailable. Please try again.'},503)}
}
