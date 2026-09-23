import {getSession} from '@/lib/class-auth';
import course from '@/data/curriculum.json';
export const dynamic='force-dynamic';
export async function GET(request:Request){if(!await getSession(request))return Response.json({error:'Please sign in to your classroom.'},{status:401,headers:{'Cache-Control':'no-store'}});return Response.json(course,{headers:{'Cache-Control':'private, no-store'}})}
