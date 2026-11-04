import test from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedOrigin } from '../lib/circular/origin.ts';
const request=(origin?:string)=>new Request('http://0.0.0.0:3000/api/perceive',{headers:origin?{origin}:undefined});
test('Railway accepts the configured public HTTPS origin despite its internal request URL',()=>assert.equal(isAllowedOrigin(request('https://circularos.circulapp.la'),'https://circularos.circulapp.la'),true));
test('origin checks reject unrelated sites, suffix attacks, insecure origins and malformed values',()=>{for(const origin of ['https://attacker.example','https://circularos.circulapp.la.attacker.example','http://circularos.circulapp.la','null'])assert.equal(isAllowedOrigin(request(origin),'https://circularos.circulapp.la'),false);});
test('forwarded host headers cannot expand configured origins',()=>{const r=request('https://attacker.example');r.headers.set('x-forwarded-host','attacker.example');assert.equal(isAllowedOrigin(r,'https://circularos.circulapp.la'),false);});
test('Sites defaults to its own request origin and non-browser callers still need quota',()=>{const r=new Request('https://example.test/api/perceive',{headers:{origin:'https://example.test'}});assert.equal(isAllowedOrigin(r),true);assert.equal(isAllowedOrigin(request()),true);});
