import { z } from 'zod';

export const materials = ['plastic', 'paper', 'glass', 'metal', 'organic', 'textile', 'mixed', 'electronic', 'hazardous', 'unknown'] as const;
export const materialLabels: Record<string,string> = {plastic:'Plastic',paper:'Paper / cardboard',glass:'Glass',metal:'Metal',organic:'Organic',textile:'Textile / fabric',mixed:'Mixed materials',electronic:'Electronic / e-waste',hazardous:'Hazardous',unknown:'Unknown'};
export const itemSchema = z.object({
  id:z.string().min(1).max(80), name:z.string().min(1).max(120), material:z.enum(materials),
  confidence:z.number().min(0).max(1), evidence:z.string().max(600),
  condition:z.enum(['clean','dirty','reusable','unknown']),
  confirmed:z.boolean().default(false),
  visibleText:z.string().max(800).optional(),
  groundingPrompt:z.string().min(1).max(120).optional(),
});
export const contextSchema = z.object({
  setting:z.enum(['home','business']), city:z.string().min(1).max(100),
  collection:z.array(z.enum(materials)).max(10), compost:z.boolean(), reuse:z.boolean(),
});
export const planInput = z.object({items:z.array(itemSchema).min(1).max(12),context:contextSchema});
export type Item = z.infer<typeof itemSchema>;
export type Context = z.infer<typeof contextSchema>;
export type Decision = {itemId:string;name:string;action:string;rule:string;reason:string;steps:string[];status:'ready'|'review';owner:string};
export const RULE_VERSION = 'circularos-general-2026-11-04.3';

// General decision policy, not a claim about a municipality's acceptance rules.
// Collection channels are explicitly declared by the user, never inferred from city.
export function decide(item:Item, context:Context):Decision {
  const base = {itemId:item.id,name:item.name,owner:context.setting==='business'?'Waste coordinator':'Household member'};
  const result = (action:string,rule:string,reason:string,steps:string[],status:'ready'|'review'='ready'):Decision => ({...base,action,rule,reason,steps,status});
  if (['hazardous','electronic'].includes(item.material)) return result('Specialized handling','SAFE-01','This material requires a specialist channel, not ordinary recycling.', ['Keep separate. Do not open, puncture or dismantle.','Confirm an authorized operator and its receiving conditions.'], 'review');
  if (item.material==='unknown' || !item.confirmed) return result('Review before sorting','VERIFY-01','Perception is a hypothesis. Material and condition still need human review.', ['Check labels and composition.','Correct and confirm the object in the list.'],'review');
  if(item.condition==='unknown') return result('Check the condition','VERIFY-02','Material is reviewed, but its condition is still unknown.', ['Choose the observed condition before selecting a destination.'],'review');
  if(item.condition==='reusable' && context.reuse) return result('Reuse first','REUSE-01','The object is still useful and you declared access to reuse.', ['Set aside for a specific use or donation.','If it is not reused, reassess its destination.']);
  if(['textile','mixed'].includes(item.material)) return result('Check a dedicated receiving channel','MATERIAL-01','Textiles and mixed products cannot be assumed acceptable in ordinary material recycling.', ['Consider repair or reuse first.','Check composition labels and ask a dedicated receiving operator what it accepts.'],'review');
  if(item.material==='organic') return context.compost ? result('Conditional composting','BIO-01','You declared composting access; acceptance depends on the system.', ['Confirm that your composting system accepts this item.','Remove packaging and non-organic materials.'],'review') : result('Find an organics channel','BIO-02','You did not declare composting access.', ['Ask a local organics programme.','Meanwhile, follow local waste-service instructions.'],'review');
  if(!context.collection.includes(item.material)) return result('Confirm a receiving channel','CHANNEL-01','You did not declare a channel that accepts this material.', ['Keep separate if safe.','Check with the operator before delivery.'],'review');
  if(item.condition==='dirty') return result('Prepare and check acceptance','PREP-01','Residue can prevent recovery; confirm preparation requirements with the receiving operator.', ['Remove contents and separate components when safe.','Ask whether the operator accepts this material in its current condition.'],'review');
  return result('Separate for delivery','RECYCLE-01','Material and condition reviewed, with a declared receiving channel available.', ['Keep separate and dry.','Verify acceptance and opening hours with the operator before delivery.',...(context.setting==='business'?['Record quantity and proof of delivery in your internal log.']:[])]);
}

export function makePlan(input:z.infer<typeof planInput>) {
  return {id:crypto.randomUUID(),createdAt:new Date().toISOString(),ruleVersion:RULE_VERSION,context:input.context,items:input.items,decisions:input.items.map(item=>decide(item,input.context)),policy:'General guidance. User-declared channels; local acceptance is not independently verified.'};
}

export const demoItems:Item[] = [
  {id:'bottle',name:'Drink bottle',material:'plastic',confidence:0.91,evidence:'Prepared example: clear plastic container. Not a live inference.',condition:'clean',confirmed:false},
  {id:'box',name:'Box with food residue',material:'paper',confidence:0.87,evidence:'Prepared example: visibly stained cardboard.',condition:'dirty',confirmed:false},
  {id:'battery',name:'Used battery',material:'hazardous',confidence:0.96,evidence:'Prepared example: household battery.',condition:'unknown',confirmed:false},
];
