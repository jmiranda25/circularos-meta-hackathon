import {materialLabels,type makePlan} from './domain.ts';
import {completionSummary} from './assessment.ts';
type Plan=ReturnType<typeof makePlan>;
// A readable view of the exact policy output; no second model generation.
export function planSections(plan:Plan,done:string[]){
 const progress=completionSummary(plan.items,plan.decisions,done);
 return [
 {title:'My circular plan',lines:[`${plan.context.city} | ${plan.context.setting==='home'?'Household':'Business'}`,`Created: ${new Date(plan.createdAt).toISOString().replace('T',' ').slice(0,16)} UTC`,`${progress.pendingReview} objects need your review. ${progress.pendingChecks} decisions need further checking.`,progress.eligible?`${progress.completed} of ${progress.eligible} ready tasks marked done by you. This is not proof of delivery.`:'Complete the pending checks first. Task checkmarks are not proof of delivery.']},
 ...plan.decisions.map((d,index)=>{const item=plan.items.find(i=>i.id===d.itemId)!;return {title:`${index+1}. ${d.name}`,lines:[`Material: ${materialLabels[item.material]}. Condition: ${item.condition}.`,`Your review: ${item.confirmed?'Reviewed':'Still needed'}.`,d.action,d.reason,...d.steps.map((s,i)=>`${i+1}. ${s}`),`Task: ${d.status==='review'?'Further checking needed':done.includes(d.itemId)?'Marked done by you':'To do'}.`,`Why this advice: ${item.evidence}`,`Rule: ${d.rule}`]};}),
 {title:'Before you deliver',lines:[plan.policy,'A photo does not verify weight, acceptance, payment or completed recycling.',`Reference: ${plan.id}`,`Policy version: ${plan.ruleVersion}`]},
 ];
}
export async function createPlanPdf(plan:Plan,done:string[]){
 const {jsPDF}=await import('jspdf');const pdf=new jsPDF({unit:'mm',format:'a4'});const margin=18,width=174;let y=22;
 function page(){pdf.addPage();y=22;}
 for(const section of planSections(plan,done)){
  if(y>245)page();pdf.setFont('helvetica','bold');pdf.setFontSize(17);pdf.setTextColor(30,75,51);
  for(const line of pdf.splitTextToSize(section.title,width) as string[]){if(y>275)page();pdf.text(line,margin,y);y+=8;}
  y+=3;pdf.setFont('helvetica','normal');pdf.setFontSize(12);pdf.setTextColor(45,55,45);
  for(const text of section.lines){for(const line of pdf.splitTextToSize(text,width) as string[]){if(y>275)page();pdf.text(line,margin,y);y+=6;}y+=3;}y+=7;
 }
 const pages=pdf.getNumberOfPages();for(let n=1;n<=pages;n++){pdf.setPage(n);pdf.setFontSize(9);pdf.setTextColor(100);pdf.text(`CircularOS | Personal guidance | ${n} / ${pages}`,margin,288);}
 return pdf;
}
