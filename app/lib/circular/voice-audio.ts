import type {GuidanceInput} from './guidance';
const cache=new Map<string,Blob>();
export const guidanceKey=(input:GuidanceInput)=>JSON.stringify([input.step,input.language,input.objectCount,input.reviewCount]);
export function cachedAudio(input:GuidanceInput){return cache.get(guidanceKey(input));}
export async function prepareAudio(input:GuidanceInput,signal?:AbortSignal){
 const key=guidanceKey(input),cached=cache.get(key);if(cached)return cached;
 const response=await fetch('/api/voice',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input),signal});
 if(!response.ok){const data=await response.json() as {error?:string};throw Error(data.error||'Audio is unavailable.');}
 const blob=await response.blob();if(signal?.aborted)throw new DOMException('Aborted','AbortError');
 if(!blob.size)throw Error('Audio is empty.');
 if(cache.size>=12)cache.delete(cache.keys().next().value!);cache.set(key,blob);return blob;
}
