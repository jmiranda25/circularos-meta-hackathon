import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { reserveInference } from '../lib/circular/quota.ts';
function database(){
 const sql=new DatabaseSync(':memory:');sql.exec('CREATE TABLE inference_quota (bucket TEXT PRIMARY KEY, count INTEGER NOT NULL)');
 return {prepare(query:string){return {bind(...values:(string|number)[]){return {async first<T>(){return (sql.prepare(query).get(...values) as T)??null;}};}};}};
}
test('quota fails closed without durable storage',async()=>{assert.deepEqual(await reserveInference(undefined),{allowed:false,reason:'unavailable'});});
test('atomic SQLite counter admits six per minute and rejects the seventh',async()=>{const db=database(),now=Date.UTC(2026,10,4,15);const results=await Promise.all(Array.from({length:12},()=>reserveInference(db,now)));assert.equal(results.filter(x=>x.allowed).length,6);assert.equal((await reserveInference(db,now+60000)).allowed,true);});
test('daily quota survives minute changes and resets on next UTC day',async()=>{const db=database(),now=Date.UTC(2026,10,4,15);for(let i=0;i<120;i++)assert.equal((await reserveInference(db,now+i*60000)).allowed,true);assert.deepEqual(await reserveInference(db,now+121*60000),{allowed:false,reason:'day'});assert.equal((await reserveInference(db,now+24*3600000)).allowed,true);});
