import {test} from 'node:test';
import assert from 'node:assert/strict';
import {prepareAudio,cachedAudio} from '../lib/circular/voice-audio.ts';
test('prepared audio is reused only for the same step, language and counts',async()=>{
 const original=globalThis.fetch;let calls=0;
 globalThis.fetch=async()=>{calls++;return new Response(new Blob(['test audio'],{type:'audio/mpeg'}),{headers:{'Content-Type':'audio/mpeg'}});};
 try{const input={step:4,language:'en' as const,objectCount:2,reviewCount:1};
  const first=await prepareAudio(input);assert.equal(await prepareAudio(input),first);assert.equal(calls,1);assert.equal(cachedAudio({reviewCount:1,objectCount:2,language:'en',step:4}),first);
  assert.equal(cachedAudio({...input,reviewCount:2}),undefined);assert.equal(cachedAudio({...input,language:'es'}),undefined);
  await prepareAudio({...input,reviewCount:2});assert.equal(calls,2);
 }finally{globalThis.fetch=original;}
});
test('failed voice requests are not cached and can be retried',async()=>{
 const original=globalThis.fetch;const input={step:3,language:'es' as const,objectCount:3,reviewCount:0};
 globalThis.fetch=async()=>new Response(JSON.stringify({error:'Voice is unavailable.'}),{status:503,headers:{'Content-Type':'application/json'}});
 try{await assert.rejects(prepareAudio(input),/Voice is unavailable/);assert.equal(cachedAudio(input),undefined);}finally{globalThis.fetch=original;}
});
