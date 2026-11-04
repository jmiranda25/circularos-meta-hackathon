import { makePlan, planInput } from '../../../lib/circular/domain';
export async function POST(request:Request) {
  try {
    if(Number(request.headers.get('content-length'))>100000) return Response.json({error:'Solicitud demasiado grande.'},{status:413});
    const body=await request.text();
    if(body.length>100000) return Response.json({error:'Solicitud demasiado grande.'},{status:413});
    const input=planInput.safeParse(JSON.parse(body));
    if(!input.success) return Response.json({error:'Revisa los objetos y el contexto.'},{status:400});
    if(new Set(input.data.items.map(x=>x.id)).size!==input.data.items.length) return Response.json({error:'Los identificadores deben ser únicos.'},{status:400});
    return Response.json(makePlan(input.data),{headers:{'Cache-Control':'no-store'}});
  } catch { return Response.json({error:'Solicitud inválida.'},{status:400}); }
}
