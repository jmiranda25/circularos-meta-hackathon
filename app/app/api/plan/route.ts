import { makePlan, planInput } from '../../../lib/circular/domain';
export async function POST(request:Request) {
  try {
    if(Number(request.headers.get('content-length'))>100000) return Response.json({error:'Request is too large.'},{status:413});
    const body=await request.text();
    if(body.length>100000) return Response.json({error:'Request is too large.'},{status:413});
    const input=planInput.safeParse(JSON.parse(body));
    if(!input.success) return Response.json({error:'Check your objects and context.'},{status:400});
    if(new Set(input.data.items.map(x=>x.id)).size!==input.data.items.length) return Response.json({error:'Object IDs must be unique.'},{status:400});
    return Response.json(makePlan(input.data),{headers:{'Cache-Control':'no-store'}});
  } catch { return Response.json({error:'Invalid request.'},{status:400}); }
}
