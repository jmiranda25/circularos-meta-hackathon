import type {Item} from './domain.ts';
export const MAX_OBJECTS=8;
export type SessionItem=Item & {sourcePhotoId?:string};
// Append atomically: a failed/over-capacity photo never destroys prior reviews.
export function appendPhotoItems(existing:SessionItem[],detected:Item[],photoId:string):SessionItem[]{
 if(!detected.length)throw Error('No objects were identified. Try a closer photo.');
 if(existing.length+detected.length>MAX_OBJECTS)throw Error(`This photo contains ${detected.length} objects, but only ${MAX_OBJECTS-existing.length} spaces remain. Photograph fewer objects or remove an existing object first. Nothing was replaced.`);
 return [...existing,...detected.map((item,index)=>({...item,id:`${photoId}-${index+1}`,sourcePhotoId:photoId,confirmed:false}))];
}
export function completionSummary(items:Item[],decisions:{itemId:string;status:string}[],done:string[]){
 const eligible=decisions.filter(d=>d.status==='ready'&&items.some(i=>i.id===d.itemId&&i.confirmed));
 return {pendingReview:items.filter(i=>!i.confirmed).length,pendingChecks:decisions.filter(d=>d.status==='review').length,eligible:eligible.length,completed:eligible.filter(d=>done.includes(d.itemId)).length};
}
