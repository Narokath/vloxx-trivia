import {QUESTIONS, VERSION} from './questions.js';
export const KEY = 'vloxx-mechanics-attempt-v1';
export const HOUR = 3600000;
export function shuffle(items, random = Math.random) {
  const a = [...items];
  for (let i=a.length-1;i>0;i--) {const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}
export function createAttempt(name, now=Date.now()) {
  const categories=[...new Set(QUESTIONS.map(q=>q.category))];
  const selected=shuffle(categories.flatMap(c=>shuffle(QUESTIONS.filter(q=>q.category===c)).slice(0,3)));
  return {version:VERSION,id:crypto.randomUUID(),name:name.trim().slice(0,40)||'Anonymous raider',startedAt:now,unlockAt:now+HOUR,completedAt:null,items:selected.map(q=>({id:q.id,order:shuffle([0,1,2]),answer:null})),index:0};
}
export function validAttempt(a) {
  return a && a.version===VERSION && typeof a.name==='string' && a.name.length<=40 && typeof a.id==='string' && Number.isFinite(a.startedAt) && a.unlockAt===a.startedAt+HOUR && Array.isArray(a.items) && a.items.length===15 && new Set(a.items.map(i=>i.id)).size===15 && a.items.every(i=>QUESTIONS.some(q=>q.id===i.id)&&Array.isArray(i.order)&&[...i.order].sort().join('')==='012'&&(i.answer===null||[0,1,2].includes(i.answer))) && Number.isInteger(a.index)&&a.index>=0&&a.index<15 && (a.completedAt===null || (Number.isFinite(a.completedAt)&&a.items.every(i=>i.answer!==null))) && a.items.every((i,n)=>n<a.index?i.answer!==null:n>a.index?i.answer===null||a.completedAt!==null:true);
}
// Old answers must never be interpreted against replacement questions with reused IDs.
export function upgradeAttempt(a) {
  if(!['2026-11-02.1','2026-11-02.2','2026-11-02.3'].includes(a?.version) || !validAttempt({...a,version:VERSION}))return a;
  return {...createAttempt(a.name,a.startedAt),bankUpdated:true};
}
export function score(a) {return a.items.filter(i=>i.answer===0).length;}
export function breakdown(a) {return [...new Set(QUESTIONS.map(q=>q.category))].map(category=>{const items=a.items.filter(i=>QUESTIONS.find(q=>q.id===i.id).category===category);return {category,correct:items.filter(i=>i.answer===0).length,total:items.length};});}
export function answer(a, displayedIndex) {
  const item=a.items[a.index];
  if(a.completedAt || item.answer!==null || ![0,1,2].includes(displayedIndex)) return false;
  item.answer=item.order[displayedIndex]; return true;
}
export function advance(a, now=Date.now()) {
  if(a.completedAt || a.items[a.index].answer===null) return false;
  if(a.index===14)a.completedAt=now;else a.index++;
  return true;
}
export function shareData(a) {return {v:1,name:a.name,score:score(a),total:15,date:new Date(a.completedAt).toISOString(),topics:breakdown(a).map(t=>t.correct)};}
export function readShare(hash) {
  if(!hash.startsWith('#score='))return null;
  try {
    if(hash.length>1800)throw Error();
    const s=JSON.parse(decodeURIComponent(hash.slice(7)));
    if(s.v!==1||typeof s.name!=='string'||s.name.length>40||!Number.isInteger(s.score)||s.score<0||s.score>15||s.total!==15||!Number.isFinite(Date.parse(s.date))||!Array.isArray(s.topics)||s.topics.length!==5||!s.topics.every(n=>Number.isInteger(n)&&n>=0&&n<=3)||s.topics.reduce((a,b)=>a+b,0)!==s.score)throw Error();
    return s;
  }catch{return false;}
}
