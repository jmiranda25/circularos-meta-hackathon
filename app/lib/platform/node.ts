import { mkdirSync } from 'node:fs';
import { dirname, isAbsolute } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

// Railway must mount a persistent volume and set QUOTA_DB_PATH inside it.
// Without that path inference stays disabled; never reset budgets in memory.
let database: DatabaseSync | undefined;
export function quotaDatabase() {
 const path=process.env.QUOTA_DB_PATH;
 if(!path||!isAbsolute(path))return undefined;
 if(!database){
  mkdirSync(dirname(path),{recursive:true});
  const opened=new DatabaseSync(path);
  opened.exec('PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS inference_quota (bucket TEXT PRIMARY KEY, count INTEGER NOT NULL)');
  database=opened;
 }
 return {prepare(sql:string){return {bind(...values:(string|number)[]){return {async first<T>(){return (database!.prepare(sql).get(...values) as T)??null;}};}};}};
}
export const env={
 get DB(){return quotaDatabase();},
 get MODEL_API_KEY(){return process.env.MODEL_API_KEY;},
 get ELEVENLABS_API_KEY(){return process.env.ELEVENLABS_API_KEY;},
 get ELEVENLABS_VOICE_ID(){return process.env.ELEVENLABS_VOICE_ID;},
 get ELEVENLABS_VOICE_ID_ES(){return process.env.ELEVENLABS_VOICE_ID_ES;},
};
