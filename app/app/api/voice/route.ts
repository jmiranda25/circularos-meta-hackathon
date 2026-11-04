import { isAllowedOrigin } from '../../../lib/circular/origin';
import { env } from '@circularos/runtime';
import { guidanceInput,guidanceText } from '../../../lib/circular/guidance';
import { reserveInference } from '../../../lib/circular/quota';
export async function POST(request:Request){
 try{
  if(!isAllowedOrigin(request,(env as unknown as Record<string,string>).APP_ORIGIN))return Response.json({error:'Origin not allowed.'},{status:403});
  const body=await request.text();if(body.length>2000)return Response.json({error:'Request is too large.'},{status:413});
  let decoded:unknown;try{decoded=JSON.parse(body);}catch{return Response.json({error:'Invalid JSON request.'},{status:400});}
  const parsed=guidanceInput.safeParse(decoded);if(!parsed.success)return Response.json({error:'Invalid guidance request.'},{status:400});
  const secrets=env as unknown as Record<string,string>;
  if(!secrets.ELEVENLABS_API_KEY||!secrets.ELEVENLABS_VOICE_ID)return Response.json({error:'Natural voice guidance is not configured yet. The written guide remains available.'},{status:503});
  const voiceId=parsed.data.language==='es'?(secrets.ELEVENLABS_VOICE_ID_ES||secrets.ELEVENLABS_VOICE_ID):secrets.ELEVENLABS_VOICE_ID;
  const quota=await reserveInference(env.DB,Date.now(),'voice',6,80);if(!quota.allowed)return Response.json({error:'Voice guidance is temporarily unavailable. Use the written guide or try again later.'},{status:quota.reason==='unavailable'?503:429});
  const response=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,{method:'POST',headers:{'xi-api-key':secrets.ELEVENLABS_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({text:guidanceText(parsed.data),model_id:'eleven_multilingual_v2',voice_settings:{stability:.55,similarity_boost:.75,style:.15,use_speaker_boost:true,speed:.95}}),signal:AbortSignal.timeout(30000)});
  if(!response.ok)return Response.json({error:'Natural voice could not be generated. The written guide remains available.'},{status:502});
  return new Response(response.body,{headers:{'Content-Type':'audio/mpeg','Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Voice guidance could not be completed. Please use the written guide.'},{status:502});}
}
