import test from 'node:test';
import assert from 'node:assert/strict';
import {QUESTIONS,VERSION} from '../dist/questions.js';
import {createAttempt,validAttempt,upgradeAttempt,answer,advance,score,breakdown,shareData,readShare,HOUR,encodeShare,resultText,resultTier,ROUND_SIZE} from '../dist/engine.js';
test('distinct complete questions with three unique choices each',()=>{assert.ok(QUESTIONS.length>=15);assert.equal(new Set(QUESTIONS.map(q=>q.prompt)).size,QUESTIONS.length);for(const q of QUESTIONS){assert.equal(new Set(q.choices).size,3);assert.ok(q.explanation&&q.source);}});
test('each round balances 18 unique questions across six topics, with stable choices after persistence',()=>{for(let i=0;i<100;i++){const a=createAttempt('Raider',1000);assert.ok(validAttempt(a));assert.equal(a.unlockAt,1000+HOUR);assert.deepEqual(breakdown(a).map(t=>t.total),[3,3,3,3,3,3]);assert.deepEqual(JSON.parse(JSON.stringify(a)),a);}});
test('first answer wins; unanswered questions cannot advance; full round scores and completes',()=>{const a=createAttempt('Raider',1000);assert.equal(advance(a),false);for(let n=0;n<18;n++){const item=a.items[n];const correct=n%2===0;const displayed=item.order.indexOf(correct?0:1);assert.ok(answer(a,displayed));assert.equal(answer(a,(displayed+1)%3),false);assert.ok(advance(a,2000+n));assert.ok(validAttempt(a));}assert.equal(score(a),9);assert.equal(a.completedAt,2017);assert.equal(advance(a),false);assert.equal(answer(a,0),false);});
test('compact results round-trip Unicode, timestamps and every topic score',()=>{
 for(const name of ['Raider','機械 <raider>','😀'.repeat(20),'Anonymous raider'])for(let bits=0;bits<4096;bits++){
  const topics=Array.from({length:6},(_,i)=>(bits>>(i*2))&3),data={v:2,name,score:topics.reduce((a,b)=>a+b,0),total:18,date:'2026-11-02T01:02:03.456Z',topics};
  const hash=encodeShare(data);assert.deepEqual(readShare(hash),data);
  assert.ok(hash.length<('#score='+encodeURIComponent(JSON.stringify(data))).length/2);
 }
 const a=createAttempt('Raider',1000);for(let i=0;i<ROUND_SIZE;i++){answer(a,a.items[i].order.indexOf(0));advance(a,2000);}assert.equal(shareData(a).score,18);assert.deepEqual(readShare(encodeShare(shareData(a))),shareData(a));
 for(const bad of ['#s=','#s=aaaaa','#s=%%%%','#s=AAAAAAAAAAAA','#score=%zz','#score=null'])assert.equal(readShare(bad),false);
 assert.equal(readShare('#other'),null);
 const legacy={v:1,name:'Old raider',score:12,total:15,date:'2026-10-30T12:00:00.000Z',topics:[3,3,2,2,2]};
 assert.deepEqual(readShare('#score='+encodeURIComponent(JSON.stringify(legacy))),legacy);
 assert.equal(readShare('#score='+encodeURIComponent(JSON.stringify({...legacy,score:16}))),false);
 assert.throws(()=>encodeShare({...shareData(a),topics:[0,0,0,0,0,0]}));
});
test('copy text includes the score, matching tier and one short link',()=>{
 const ranges=[[0,8,'DPS monkey'],[9,11,'A few pulls'],[12,15,'There’s a raider'],[16,17,'Mechanics enjoyer'],[18,18,'Flawless']];
 for(const [low,high,label] of ranges)for(let score=low;score<=high;score++){
  assert.ok(resultTier(score).startsWith(label));const text=resultText('Raider',score,18,'https://example.test/#s=abc');assert.ok(text.includes(score+'/18'));assert.ok(text.includes(resultTier(score)));assert.equal(text.split('https://').length,2);assert.equal(text.split('\n').length,3);
 }
});
test('malformed attempt cannot silently reset a stored attempt',()=>{const a=createAttempt('Test');assert.equal(validAttempt({...a,unlockAt:0}),false);const bad=structuredClone(a);bad.items[1].id=bad.items[0].id;assert.equal(validAttempt(bad),false);const future=structuredClone(a);future.items[5].answer=0;assert.equal(validAttempt(future),false);});
test('question bank excludes squad-specific strategies',()=>{for(const q of QUESTIONS)assert.doesNotMatch([q.prompt,...q.choices,q.explanation].join(' '),/WRDL|floater|Bunker|Boneskinner|crossover|formation|baiter|back left|back right|melee left|ranged right/i);});
test('legacy 15-question attempts restart without changing the hourly cooldown, including removed IDs',()=>{
 for(const version of ['2026-11-02.1','2026-11-02.2','2026-11-02.3','2026-11-02.4'])for(const complete of [false,true]){
  const old={...createAttempt('Raider',1000),version,index:complete?14:0,completedAt:complete?2000:null,items:Array.from({length:15},(_,i)=>({id:'removed-'+i,order:[0,1,2],answer:complete?0:null}))};
  const saved=structuredClone(old),updated=upgradeAttempt(old);assert.ok(validAttempt(updated));assert.equal(updated.version,VERSION);assert.equal(updated.items.length,18);assert.equal(updated.startedAt,old.startedAt);assert.equal(updated.unlockAt,old.unlockAt);assert.equal(updated.completedAt,null);assert.equal(updated.index,0);assert.ok(updated.items.every(i=>i.answer===null));assert.equal(updated.bankUpdated,true);assert.deepEqual(old,saved);assert.equal(upgradeAttempt(updated),updated);
  const invalid={...old,unlockAt:0};assert.equal(upgradeAttempt(invalid),invalid);
 }
});

test('P2 opener distractors use the same four P2 mechanics in distinct orders',()=>{const q=QUESTIONS.find(q=>q.id==='4-2');const steps=q.choices.map(choice=>choice.split(' → '));assert.equal(new Set(q.choices).size,3);for(const order of steps)assert.deepEqual([...order].sort(),['Greens','Charge','Red lines','Spears'].sort());assert.deepEqual(steps[0],['Greens','Charge','Red lines','Spears']);});
