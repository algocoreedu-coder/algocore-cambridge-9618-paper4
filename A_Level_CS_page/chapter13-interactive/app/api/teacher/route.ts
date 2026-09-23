import {getSession} from '@/lib/class-auth';
import scripts from '@/data/teacher-scripts.vi.json';
export const dynamic='force-dynamic';
export async function GET(request:Request){const session=await getSession(request);if(session?.role!=='teacher')return Response.json({error:'Teacher access is required.'},{status:session?403:401,headers:{'Cache-Control':'no-store'}});const id=new URL(request.url).searchParams.get('lesson')||'';const script=scripts[id as keyof typeof scripts];if(!script)return Response.json({error:'Lesson not found.'},{status:404,headers:{'Cache-Control':'no-store'}});return Response.json(script,{headers:{'Cache-Control':'private, no-store','Vary':'Cookie'}})}
