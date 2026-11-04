import { isAllowedOrigin } from '../../../lib/circular/origin';
import { perceive, segment, PerceptionError } from '../../../lib/circular/perception';
import { env } from '@circularos/runtime';
import { reserveInference } from '../../../lib/circular/quota';
export async function POST(request:Request) {
  try {
    if(!isAllowedOrigin(request,(env as unknown as Record<string,string>).APP_ORIGIN)) return Response.json({error:'Origin not allowed.'},{status:403});
    if(Number(request.headers.get('content-length'))>6_000_000) return Response.json({error:'Image is too large.'},{status:413});
    const text=await request.text();
    if(text.length>6_000_000) return Response.json({error:'Image is too large.'},{status:413});
    const {image,mode,label}=JSON.parse(text);
    if(typeof image!=='string' || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image)) return Response.json({error:'Use a JPG, PNG or WebP image.'},{status:400});
    const key=(env as unknown as Record<string,string>).MODEL_API_KEY || process.env.MODEL_API_KEY;
    if(!key) return Response.json({error:'Meta is not configured on this server. Try the prepared example or add objects manually.',code:'META_NOT_CONFIGURED'},{status:503});
    if(mode==='segment' && (typeof label!=='string'||label.length<1||label.length>120)) return Response.json({error:'Select an object.'},{status:400});
    const quota=await reserveInference(env.DB);
    if(!quota.allowed) return Response.json({error:quota.reason==='unavailable'?'Usage protection is unavailable. Please try later.':quota.reason==='day'?'The daily demo limit has been reached. You can still use the prepared example.':'The demo is busy. Wait a minute and try again.'},{status:quota.reason==='unavailable'?503:429,headers:{'Retry-After':quota.reason==='day'?'3600':'60'}});
    const result=mode==='segment'?await segment(image,label,key):await perceive(image,key);
    return Response.json(result,{headers:{'Cache-Control':'no-store'}});
  } catch(error) {
    // Never forward provider response bodies, headers, or credentials to clients/logs.
    if(error instanceof PerceptionError) return Response.json({error:error.message,code:error.code},{status:error.code==='NO_OBJECTS'?422:502});
    const status=(error as {status?:number}).status;
    return Response.json({error:status===401?'Meta did not accept the server credential.':status===429?'Meta reached its usage limit. Please try later.':'Perception could not be completed. Check the image and try again.'},{status:502});
  }
}
