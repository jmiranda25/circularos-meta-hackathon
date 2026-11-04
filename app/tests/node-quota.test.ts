import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

test('Railway quota survives a process restart on persistent storage',()=>{
 const folder=mkdtempSync(join(tmpdir(),'circularos-quota-'));
 const source=`import {quotaDatabase} from './lib/platform/node.ts'; import {reserveInference} from './lib/circular/quota.ts'; const db=quotaDatabase(); const results=[]; for(let i=0;i<6;i++)results.push((await reserveInference(db,1793818800000)).allowed); console.log(JSON.stringify(results));`;
 try{
  const run=()=>spawnSync(process.execPath,['--experimental-strip-types','--input-type=module','-e',source],{cwd:new URL('..',import.meta.url),env:{...process.env,QUOTA_DB_PATH:join(folder,'quota.sqlite')},encoding:'utf8'});
  const first=run();assert.equal(first.status,0,first.stderr);assert.deepEqual(JSON.parse(first.stdout),Array(6).fill(true));
  const restarted=run();assert.equal(restarted.status,0,restarted.stderr);assert.deepEqual(JSON.parse(restarted.stdout),Array(6).fill(false));
 }finally{rmSync(folder,{recursive:true,force:true});}
});
