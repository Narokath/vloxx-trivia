import {QUESTIONS, VERSION} from './questions.js';
export const KEY='vloxx-mechanics-attempt-v1', HOUR=3600000;
export const CATEGORIES=[...new Set(QUESTIONS.map(q=>q.category))];
export const PER_CATEGORY=3, ROUND_SIZE=CATEGORIES.length*PER_CATEGORY;
export function shuffle(items,random=Math.random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function createAttempt(name,now=Date.now()){
 const selected=shuffle(CATEGORIES.flatMap(c=>shuffle(QUESTIONS.filter(q=>q.category===c)).slice(0,PER_CATEGORY)));
 return {version:VERSION,id:crypto.randomUUID(),name:name.trim().slice(0,40)||'Anonymous raider',startedAt:now,unlockAt:now+HOUR,completedAt:null,items:selected.map(q=>({id:q.id,order:shuffle([0,1,2]),answer:null})),index:0};
}
function validStructure(a,size){
 return !!(a&&typeof a.name==='string'&&a.name.length<=40&&typeof a.id==='string'&&Number.isFinite(a.startedAt)&&a.unlockAt===a.startedAt+HOUR&&Array.isArray(a.items)&&a.items.length===size&&a.items.every(i=>i&&typeof i.id==='string'&&Array.isArray(i.order)&&i.order.length===3&&[...i.order].sort().join('')==='012'&&(i.answer===null||[0,1,2].includes(i.answer)))&&new Set(a.items.map(i=>i.id)).size===size&&Number.isInteger(a.index)&&a.index>=0&&a.index<size&&(a.completedAt===null||(Number.isFinite(a.completedAt)&&a.index===size-1&&a.items.every(i=>i.answer!==null)))&&a.items.every((i,n)=>n<a.index?i.answer!==null:n>a.index?i.answer===null:true));
}
export function validAttempt(a){return validStructure(a,ROUND_SIZE)&&a.version===VERSION&&a.items.every(i=>QUESTIONS.some(q=>q.id===i.id))&&breakdown(a).every(t=>t.total===PER_CATEGORY);}
// Old IDs may have been removed or reassigned. Never apply old answers to new questions.
export function upgradeAttempt(a){
 if(!['2026-11-02.1','2026-11-02.2','2026-11-02.3','2026-11-02.4'].includes(a?.version)||!validStructure(a,15))return a;
 return {...createAttempt(a.name,a.startedAt),bankUpdated:true};
}
export function score(a){return a.items.filter(i=>i.answer===0).length;}
export function breakdown(a){return CATEGORIES.map(category=>{const items=a.items.filter(i=>QUESTIONS.find(q=>q.id===i.id)?.category===category);return {category,correct:items.filter(i=>i.answer===0).length,total:items.length};});}
export function answer(a,displayedIndex){const item=a.items[a.index];if(a.completedAt!==null||item.answer!==null||![0,1,2].includes(displayedIndex))return false;item.answer=item.order[displayedIndex];return true;}
export function advance(a,now=Date.now()){if(a.completedAt!==null||a.items[a.index].answer===null)return false;if(a.index===a.items.length-1)a.completedAt=now;else a.index++;return true;}
export function resultTier(n,total=ROUND_SIZE){
 const ratio=n/total;
 return ratio===1?'Flawless. Mechanics mastered.':ratio>=0.85?'Mechanics enjoyer. Your squad can trust you with a green.':ratio>=0.65?'There’s a raider in there. A little homework, then back to the pull.':ratio>=0.45?'A few pulls from ready. The mechanics guide is calling.':'DPS monkey detected. The golem never taught you this.';
}
export function resultText(name,n,total,url){return name+' scored '+n+'/'+total+' on the Vloxx Mechanics Check.\n'+resultTier(n,total)+(url?'\n'+url:'');}
export function shareData(a){return {v:2,name:a.name,score:score(a),total:ROUND_SIZE,date:new Date(a.completedAt).toISOString(),topics:breakdown(a).map(t=>t.correct)};}
function validShare(s,v,total,count){return s?.v===v&&typeof s.name==='string'&&s.name.length<=40&&Number.isInteger(s.score)&&s.score>=0&&s.score<=total&&s.total===total&&typeof s.date==='string'&&Number.isFinite(Date.parse(s.date))&&Array.isArray(s.topics)&&s.topics.length===count&&s.topics.every(n=>Number.isInteger(n)&&n>=0&&n<=3)&&s.topics.reduce((a,b)=>a+b,0)===s.score;}
// Compact payload: version, six-byte timestamp, two-byte topic scores, UTF-8 name.
export function encodeShare(s){
 if(!validShare(s,2,18,6))throw Error('Invalid result');
 const bytes=new Uint8Array(9+new TextEncoder().encode(s.name).length);bytes[0]=2;
 let time=Date.parse(s.date);if(time<0||time>281474976710655)throw Error('Invalid date');
 for(let i=6;i>=1;i--){bytes[i]=time%256;time=Math.floor(time/256);}
 const bits=s.topics.reduce((b,n,i)=>b|(n<<(i*2)),0);bytes[7]=bits>>8;bytes[8]=bits&255;bytes.set(new TextEncoder().encode(s.name),9);
 return '#s='+btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
}
export function readShare(hash){
 if(!hash.startsWith('#score=')&&!hash.startsWith('#s='))return null;
 try{
  if(hash.startsWith('#score=')){if(hash.length>1800)throw Error();const s=JSON.parse(decodeURIComponent(hash.slice(7)));return validShare(s,1,15,5)?s:false;}
  const encoded=hash.slice(3);if(encoded.length>226||!/^[A-Za-z0-9_-]+$/.test(encoded)||encoded.length%4===1)throw Error();
  const bytes=Uint8Array.from(atob(encoded.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0));
  if(bytes.length<9||bytes[0]!==2||(bytes[7]&240))throw Error();
  let time=0;for(let i=1;i<=6;i++)time=time*256+bytes[i];
  const bits=(bytes[7]<<8)|bytes[8],topics=Array.from({length:6},(_,i)=>(bits>>(i*2))&3);
  const s={v:2,name:new TextDecoder('utf-8',{fatal:true}).decode(bytes.slice(9)),score:topics.reduce((a,b)=>a+b,0),total:18,date:new Date(time).toISOString(),topics};
  return validShare(s,2,18,6)&&encodeShare(s)===hash?s:false;
 }catch{return false;}
}
