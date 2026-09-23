import assert from 'node:assert/strict';
import {signed,decoded,encode,isNormal,bitsOf,tiesEven} from '../lib/number-model.ts';
let count=0;
for(const[m,e,value]of [['01101000','0011',6.5],['10011000','0011',-6.5],['10110000','1110',-.15625],['10000000','1111',-.5],['01100110','1101',.099609375]]){assert.equal(decoded(m,e),value);const r=encode(value);assert.equal(r.m,m);assert.equal(r.e,e);count++}
for(const[x,m,e,rule,want]of [[13.375,6,4,'truncate',13],[13.375,6,4,'nearest',13.5],[113.75,8,8,'truncate',113],[113.75,8,8,'nearest',114],[-5.38,10,6,'nearest',-5.375],[-5.38,10,6,'truncate',-5.390625],[2.88,10,6,'nearest',2.8828125],[.298828125,8,4,'nearest',.296875]]){assert.equal(encode(x,m,e,rule).stored,want);count++}
assert.match(encode(200).error,/Overflow/);assert.match(encode(1/1024).error,/Underflow/);assert.equal(encode(0).stored,0);
// Exhaust all non-zero normalised M8/E4 values, checking exact encode/decode round trips.
for(let i=-128;i<=127;i++){const m=bitsOf(i,8);if(!isNormal(m))continue;for(let e=-8;e<=7;e++){const eb=bitsOf(e,4),x=decoded(m,eb),r=encode(x);assert.deepEqual([r.m,r.e,r.stored],[m,eb,x]);count++}}
for(const before of ['00101000','11101000','00011000']){let m=before,e=5;const value=decoded(m,bitsOf(e,4));while(!isNormal(m)){m=m.slice(1)+'0';e--}assert.equal(decoded(m,bitsOf(e,4)),value);count++}
assert.equal(tiesEven(76.5),76);assert.equal(tiesEven(-76.5),-76);
console.log(`${count} number-model checks passed`);
