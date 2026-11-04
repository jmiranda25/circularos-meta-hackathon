import { z } from 'zod';
export const guidanceInput=z.object({
  step:z.number().int().min(1).max(4),language:z.enum(['en','es']).default('en'),
  objectCount:z.number().int().min(0).max(12).default(0),
  reviewCount:z.number().int().min(0).max(12).default(0),
}).strict().refine(input=>input.reviewCount<=input.objectCount,{message:'Review count cannot exceed object count.'});
export type GuidanceInput=z.infer<typeof guidanceInput>;
export function guidanceText(input:GuidanceInput){
 const {step,language,objectCount,reviewCount}=input;
 const en=[
  'Welcome to Circular OS. Take a photo or choose one from your device. Check the image, then select Analyze. Your photo is sent to Meta only when you request analysis. You can also explore the prepared example.',
  `There ${objectCount===1?'is one object':`are ${objectCount} objects`} to review. Check each material and condition, then mark the review box. Appearance does not prove composition. You can add or remove objects. Select Add context when you are ready.`,
  'Choose household or business, and enter your district. Select only the receiving channels you have confirmed with an operator. You can also tell us about reuse and composting. Select Build my circular plan to see your next steps.',
  `Your circular plan is ready. ${reviewCount===1?'One decision needs':`${reviewCount} decisions need`} further checking. Read the reasons and next steps. You can export the plan or explore the Lince community pilot. Money is never confirmed from a photo; a receiving partner must verify the delivery and weight.`,
 ];
 const es=[
  'Bienvenido a Circular OS. Toma una foto o elige una de tu dispositivo. Revisa la imagen y selecciona analizar. Tu foto se envía a Meta solo cuando solicitas el análisis. También puedes explorar el ejemplo preparado.',
  `Hay ${objectCount} objetos para revisar. Comprueba el material y el estado de cada objeto y marca la casilla de revisión. La apariencia no demuestra la composición. Puedes agregar o quitar objetos. Cuando termines, selecciona añadir contexto.`,
  'Elige hogar o empresa e indica tu distrito. Marca únicamente los canales de recepción que hayas confirmado con un operador. También puedes indicar si tienes acceso a reutilización o compostaje. Después genera tu plan circular.',
  `Tu plan está listo. Hay ${reviewCount} decisiones que necesitan verificación. Revisa los motivos y los próximos pasos. Puedes exportar el plan o explorar el piloto de Lince. Una fotografía no confirma dinero: un aliado receptor debe verificar la entrega y el peso.`,
 ];
 return (language==='es'?es:en)[step-1];
}
export type VoiceCommand='next'|'back'|'repeat'|'stop'|'analyze'|'camera'|'unknown';
export function parseVoiceCommand(text:string):VoiceCommand {
 const normalized=text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z ]/g,'').trim().replace(/\s+/g,' ');
 const commands:Record<string,VoiceCommand>={next:'next',continue:'next',siguiente:'next',continuar:'next',back:'back','go back':'back',atras:'back',volver:'back',repeat:'repeat','repeat guidance':'repeat',repite:'repeat',repetir:'repeat',stop:'stop',pause:'stop',parar:'stop',detener:'stop',analyze:'analyze','analyze photo':'analyze',analizar:'analyze',camera:'camera','open camera':'camera',camara:'camera'};
 return commands[normalized]??'unknown';
}
