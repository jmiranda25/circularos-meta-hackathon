import { z } from 'zod';
export const JOURNEY=['Identify','Review','Prepare','Choose a receiving point','Deliver and weigh','Partner verifies receipt','Record compensation'] as const;
// Public sources establish past programmes, not current acceptance or partnership.
export const publicReferences=[
 {name:'Lince municipal Ecotrueque',status:'Past event · current availability unverified',description:'A municipal announcement describes a January 24, 2025 exchange event near Mercado Risso. It is historical evidence of a local programme, not a current booking or payment offer.',source:'https://www.gob.pe/institucion/munilince/noticias/1094440-municipalidad-de-lince-organiza-jornada-ecotrueque',date:'2025-01-20'},
 {name:'Tapas que transforman · Lince',status:'Announced programme · receiving details unverified',description:'MINAM reports a plastic-cap collection initiative involving Lince. Confirm current receiving arrangements with the municipality. This is not a CircularOS partner or a verified cash offer.',source:'https://www.gob.pe/institucion/minam/noticias/1408668-tapas-que-transforman-municipalidad-de-lince-se-suma-a-campana-impulsada-por-el-minam',date:'Source reviewed 2026-11-04'},
];
export const handoffSchema=z.object({material:z.enum(['plastic','paper','glass','metal']),transport:z.enum(['self','assisted','pickup']),preference:z.enum(['cash','goods']),estimatedKg:z.number().positive().max(1000).optional()});
export function createHandoff(input:z.infer<typeof handoffSchema>){return {kind:'non-binding-handoff-draft',pilot:'Lince, Lima, Peru',createdAt:new Date().toISOString(),...input,status:'partner_required',verifiedWeightKg:null,partnerReceiptId:null,confirmedCompensationPEN:null,terms:'No receiving partner, tariff, pickup, delivery, payment or redeemable credit is confirmed by this draft.'};}
export type ReceiptFacts={partnerVerified:boolean;deliveryVerified:boolean;weightKg:number|null;ratePEN:number|null;receiptId:string|null};
export function compensationStatus(facts:ReceiptFacts){
 if(!facts.partnerVerified)return {status:'partner_required',amountPEN:null};
 if(!facts.deliveryVerified||!facts.receiptId?.trim()||!facts.weightKg||!Number.isFinite(facts.weightKg)||facts.weightKg<=0)return {status:'receipt_required',amountPEN:null};
 if(facts.ratePEN===null||!Number.isFinite(facts.ratePEN)||facts.ratePEN<=0)return {status:'terms_required',amountPEN:null};
 return {status:'eligible_for_partner_settlement',amountPEN:Math.round(facts.weightKg*facts.ratePEN*100)/100};
}
