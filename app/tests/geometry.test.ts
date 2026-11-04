import test from 'node:test';
import assert from 'node:assert/strict';
import { maskTransform } from '../lib/circular/geometry.ts';
test('a cropped raster mask is translated to the detected object, not the image origin',()=>{assert.equal(maskTransform({left:200,top:300,right:600,bottom:500},400,200),'translate(200 300) scale(1 1)');});
test('mask raster size is scaled to its source-pixel bounds',()=>{assert.equal(maskTransform({left:10,top:20,right:510,bottom:270},100,100),'translate(10 20) scale(5 2.5)');});
test('invalid mask geometry cannot produce infinite SVG transforms',()=>{assert.throws(()=>maskTransform({left:0,top:0,right:10,bottom:10},0,10));});
