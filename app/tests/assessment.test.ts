import {test} from 'node:test';
import assert from 'node:assert/strict';
import {appendPhotoItems,completionSummary,type SessionItem} from '../lib/circular/assessment.ts';
import {demoItems,makePlan} from '../lib/circular/domain.ts';
import {planSections} from '../lib/circular/plan-document.ts';
test('additional photos preserve reviewed items and disambiguate repeated provider ids',()=>{
 const first=appendPhotoItems([],demoItems.slice(0,1),'photo-a');first[0].confirmed=true;
 const second=appendPhotoItems(first,demoItems.slice(0,1),'photo-b');
 assert.equal(second.length,2);assert.equal(second[0].confirmed,true);assert.notEqual(second[0].id,second[1].id);
 assert.equal(second[0].sourcePhotoId,'photo-a');assert.equal(second[1].sourcePhotoId,'photo-b');assert.equal(second[1].confirmed,false);
});
test('capacity failure is atomic and the eighth object is allowed',()=>{
 let items:SessionItem[]=[];for(let n=0;n<8;n++)items=appendPhotoItems(items,demoItems.slice(0,1),`photo-${n}`);
 assert.throws(()=>appendPhotoItems(items,demoItems.slice(0,1),'overflow'),/Nothing was replaced/);assert.equal(items.length,8);
});
test('unreviewed and pending specialist decisions cannot inflate completion',()=>{
 const items=[demoItems[0],{...demoItems[2],confirmed:true}];
 const progress=completionSummary(items,[{itemId:items[0].id,status:'review'},{itemId:items[1].id,status:'review'}],items.map(x=>x.id));
 assert.equal(progress.pendingReview,1);assert.equal(progress.completed,0);assert.equal(progress.eligible,0);
});
test('readable export retains pending reviews and exact policy steps',()=>{
 const plan=makePlan({items:[demoItems[0]],context:{setting:'home',city:'Lince',collection:['plastic'],compost:false,reuse:true}});
 const sections=planSections(plan,[demoItems[0].id]);const text=JSON.stringify(sections);
 assert.match(text,/Still needed/);assert.match(text,/not proof of delivery/);
 for(const step of plan.decisions[0].steps)assert.ok(text.includes(step));
});
