import { z } from 'zod';

export const materials = ['plastic', 'paper', 'glass', 'metal', 'organic', 'electronic', 'hazardous', 'unknown'] as const;
export const materialLabels: Record<string,string> = {plastic:'Plástico',paper:'Papel / cartón',glass:'Vidrio',metal:'Metal',organic:'Orgánico',electronic:'Electrónico',hazardous:'Peligroso',unknown:'Por confirmar'};
export const itemSchema = z.object({
  id:z.string().min(1).max(80), name:z.string().min(1).max(120), material:z.enum(materials),
  confidence:z.number().min(0).max(1), evidence:z.string().max(600),
  condition:z.enum(['clean','dirty','reusable','unknown']),
  confirmed:z.boolean().default(false),
});
export const contextSchema = z.object({
  setting:z.enum(['home','business']), city:z.string().min(1).max(100),
  collection:z.array(z.enum(materials)).max(8), compost:z.boolean(), reuse:z.boolean(),
});
export const planInput = z.object({items:z.array(itemSchema).min(1).max(12),context:contextSchema});
export type Item = z.infer<typeof itemSchema>;
export type Context = z.infer<typeof contextSchema>;
export type Decision = {itemId:string;name:string;action:string;rule:string;reason:string;steps:string[];status:'ready'|'review';owner:string};
export const RULE_VERSION = 'circularos-general-2026-11-04.1';

// General decision policy, not a claim about a municipality's acceptance rules.
// Collection channels are explicitly declared by the user, never inferred from city.
export function decide(item:Item, context:Context):Decision {
  const base = {itemId:item.id,name:item.name,owner:context.setting==='business'?'Responsable de residuos':'Persona del hogar'};
  const result = (action:string,rule:string,reason:string,steps:string[],status:'ready'|'review'='ready'):Decision => ({...base,action,rule,reason,steps,status});
  if (['hazardous','electronic'].includes(item.material)) return result('Gestión especializada','SAFE-01','Este material necesita un canal especializado; no va al reciclaje común.', ['Separar sin abrir, perforar ni desmontar.','Confirmar un gestor autorizado y sus condiciones de recepción.'], 'review');
  if (item.material==='unknown' || !item.confirmed) return result('Confirmar antes de separar','VERIFY-01','La percepción es una hipótesis. Falta confirmar el material y el estado.', ['Revisar etiquetas y composición.','Corregir y confirmar el objeto en la lista.'],'review');
  if(item.condition==='unknown') return result('Revisar el estado','VERIFY-02','El material está confirmado, pero falta saber si está limpio, sucio o es reutilizable.', ['Seleccionar el estado observado antes de elegir un destino.'],'review');
  if(item.condition==='reusable' && context.reuse) return result('Reutilizar primero','REUSE-01','El objeto sigue siendo útil y declaraste que puedes reutilizarlo.', ['Reservar para un uso concreto o donación.','Si no se reutiliza, volver a evaluar su destino.']);
  if(item.material==='organic') return context.compost ? result('Compostaje condicionado','BIO-01','Declaraste acceso a compostaje; la aceptación depende del sistema.', ['Confirmar que este residuo es aceptado en tu compostera.','Separar envases y materiales no orgánicos.'],'review') : result('Buscar salida para orgánicos','BIO-02','No declaraste acceso a compostaje.', ['Consultar un programa local de orgánicos.','Mientras tanto, seguir el servicio local de residuos.'],'review');
  if(!context.collection.includes(item.material)) return result('Confirmar un canal de recepción','CHANNEL-01','No declaraste un canal que acepte este material.', ['Guardar separado si es seguro.','Consultar al operador antes de entregarlo.'],'review');
  if(item.condition==='dirty') return result('Preparar y verificar aceptación','PREP-01','La suciedad puede impedir el aprovechamiento; el canal declarado debe confirmar la preparación.', ['Retirar contenido y separar componentes cuando sea seguro.','Consultar si el operador acepta este material en su estado actual.'],'review');
  return result('Separar para entrega','RECYCLE-01','Material y estado confirmados, con un canal declarado disponible.', ['Mantener separado y seco.','Verificar con el operador su aceptación y horario antes de entregar.',...(context.setting==='business'?['Registrar cantidad y comprobante de entrega en el control interno.']:[])]);
}

export function makePlan(input:z.infer<typeof planInput>) {
  return {id:crypto.randomUUID(),createdAt:new Date().toISOString(),ruleVersion:RULE_VERSION,context:input.context,items:input.items,decisions:input.items.map(item=>decide(item,input.context)),policy:'Guía general. Canales declarados por el usuario; aceptación local no verificada.'};
}

export const demoItems:Item[] = [
  {id:'bottle',name:'Botella de bebida',material:'plastic',confidence:0.91,evidence:'Ejemplo preparado: envase plástico transparente. No es una inferencia en vivo.',condition:'clean',confirmed:false},
  {id:'box',name:'Caja con restos de comida',material:'paper',confidence:0.87,evidence:'Ejemplo preparado: cartón con manchas visibles.',condition:'dirty',confirmed:false},
  {id:'battery',name:'Pila usada',material:'hazardous',confidence:0.96,evidence:'Ejemplo preparado: pila doméstica.',condition:'unknown',confirmed:false},
];
