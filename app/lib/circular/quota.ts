export const QUOTA_SQL=`INSERT INTO inference_quota (bucket, count) VALUES (?, 1)
ON CONFLICT(bucket) DO UPDATE SET count = count + 1
WHERE count < ? RETURNING count`;
type QuotaDB={prepare(sql:string):{bind(...values:(string|number)[]):{first<T>():Promise<T|null>}}};
// Atomic counters survive Worker restarts. Fail closed if D1 is unavailable.
export async function reserveInference(db:QuotaDB|undefined,now=Date.now(),kind='meta',perMinute=6,perDay=120) {
  if(!db) return {allowed:false,reason:'unavailable'} as const;
  const day=new Date(now).toISOString().slice(0,10);
  const minute=Math.floor(now/60000);
  const minuteSlot=await db.prepare(QUOTA_SQL).bind(`${kind}:minute:${minute}`,perMinute).first<{count:number}>();
  if(!minuteSlot)return {allowed:false,reason:'minute'} as const;
  const daySlot=await db.prepare(QUOTA_SQL).bind(`${kind}:day:${day}`,perDay).first<{count:number}>();
  if(!daySlot)return {allowed:false,reason:'day'} as const;
  return {allowed:true,remainingToday:perDay-daySlot.count} as const;
}
