export const runtime = 'edge';
import { listWishes } from '../../../server/lib/store';
const json = (b:any,s=200)=>new Response(JSON.stringify(b),{status:s,headers:{'content-type':'application/json','cache-control':'no-store'}});
export async function GET() { return json({ wishes: await listWishes() }); }
