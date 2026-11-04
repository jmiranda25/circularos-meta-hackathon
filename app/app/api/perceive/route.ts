import { perceive, segment } from '../../../lib/circular/perception';
import { env } from 'cloudflare:workers';
export async function POST(request:Request) {
  try {
    if(request.headers.get('origin') && new URL(request.headers.get('origin')!).host!==new URL(request.url).host) return Response.json({error:'Origen no permitido.'},{status:403});
    if(Number(request.headers.get('content-length'))>6_000_000) return Response.json({error:'Imagen demasiado grande.'},{status:413});
    const text=await request.text();
    if(text.length>6_000_000) return Response.json({error:'Imagen demasiado grande.'},{status:413});
    const {image,mode,label}=JSON.parse(text);
    if(typeof image!=='string' || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image)) return Response.json({error:'Usa una imagen JPG, PNG o WebP.'},{status:400});
    const key=(env as unknown as Record<string,string>).MODEL_API_KEY || process.env.MODEL_API_KEY;
    if(!key) return Response.json({error:'La API de Meta aún no está configurada en el servidor. Puedes usar el ejemplo preparado o agregar objetos manualmente.',code:'META_NOT_CONFIGURED'},{status:503});
    if(mode==='segment' && (typeof label!=='string'||label.length<1||label.length>120)) return Response.json({error:'Selecciona un objeto.'},{status:400});
    const result=mode==='segment'?await segment(image,label,key):await perceive(image,key);
    return Response.json(result,{headers:{'Cache-Control':'no-store'}});
  } catch(error) {
    // Never forward provider response bodies, headers, or credentials to clients/logs.
    const status=(error as {status?:number}).status;
    return Response.json({error:status===401?'La credencial de Meta no fue aceptada. Revisa la configuración del servidor.':status===429?'Meta alcanzó su límite de uso. Espera y vuelve a intentar.':'No se pudo completar la percepción. Revisa la imagen e intenta nuevamente.'},{status:502});
  }
}
