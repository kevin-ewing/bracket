import test from 'node:test';
import assert from 'node:assert/strict';
import bank from '../src/bank.js';
import {unitSpec,displayValue,canonicalValue,captureDraft,switchDraft,questionInUnits,unitExplanation} from '../src/units.js';
import {scoreInterval} from '../src/core.js';
test('Physical units use explicit US gallons and short tons; counts remain counts',()=>{
 assert.equal(displayValue(1,{unit:'kilograms'},'imperial'),1/.45359237);
 assert.equal(canonicalValue(1,{unit:'litres'},'imperial'),3.785411784);
 assert.equal(unitSpec({unit:'metric tonnes'},'imperial').label,'US short tons');
 assert.equal(unitSpec({unit:'pairs'},'imperial').convertible,false);
 assert.equal(unitSpec({unit:'metres'},'invalid').label,'metres');
});
test('Repeated unit switches and reloads preserve exact canonical bounds and hinted scores',()=>{
 for(const q of bank.filter(q=>unitSpec(q).convertible)){
  const lo=q.answer,hi=q.answer*1.5;
  let d=captureDraft({},String(lo),String(hi),q,'metric');
  for(let i=0;i<50;i++){
   const system=i%2?'metric':'imperial';
   d=switchDraft(JSON.parse(JSON.stringify(d)),q,system);
   d=captureDraft(d,d.lower,d.upper,q,system);
   assert.equal(d.canonical.lower,lo,q.id);assert.equal(d.canonical.upper,hi,q.id);
   for(const hinted of [false,true])assert.equal(scoreInterval(d.canonical.lower,d.canonical.upper,q.answer,hinted),scoreInterval(lo,hi,q.answer,hinted),q.id);
  }
 }
});
test('Editing one converted bound changes only that bound; partial entries cannot be silently relabelled',()=>{
 const q={id:'mass',unit:'kilograms'};
 let d=switchDraft(captureDraft({},'10','20',q,'metric'),q,'imperial');
 d=captureDraft(d,'5',d.upper,q,'imperial');
 assert.equal(d.canonical.lower,5*.45359237);assert.equal(d.canonical.upper,20);
 assert.equal(switchDraft(captureDraft({},'1e','',q,'metric'),q,'imperial'),null);
 assert.equal(switchDraft({},q,'imperial').lower,'');
 assert.equal(switchDraft(d,{id:'different',unit:'metres'},'metric').lower,'');
});
test('Imperial prompts keep the same physical target and explanations label original source units',()=>{
 const q=bank.find(q=>q.id==='fermi-earth-belt');
 const v=questionInUnits(q,'imperial');
 assert.match(v.question,/one metre.*3.28 feet/);assert.equal(v.unit,'feet');assert.equal(v.answer,q.answer/.3048);
 assert.match(unitExplanation(q,'imperial'),/original units/);
 for(const q of bank.filter(q=>unitSpec(q).convertible))assert.ok(unitExplanation(q,'imperial').includes(unitSpec(q,'imperial').label));
});
import {getQuestions,coverageDays} from '../src/questions.js';
test('The entire opening year is unique across daily and practice',()=>{
 const ids=new Set(), wording=new Set(), countries=new Set();
 for(let day=0;day<coverageDays;day++){
  const date=new Date(Date.UTC(2026,10,10+day)).toISOString().slice(0,10);
  const daily=getQuestions(date),practice=getQuestions(date,'practice');
  assert.equal(daily.length,5,date);assert.equal(practice.length,5,date);
  const entities=new Set(), topics=new Set();
  for(const round of [daily,practice]){
   assert.equal(new Set(round.map(q=>q.category)).size,5,date);
   assert.ok(round.filter(q=>q.id.startsWith('year-')||q.id.startsWith('world-')).length>=3,date);
   assert.ok(round.filter(q=>q.id.startsWith('fermi-text-')).length<=1,date);
   assert.ok(round.filter(q=>['qcl','fbs'].includes(q.dataset)).length<=3,date);
   for(const q of round){
    const normalized=q.question.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
    assert.ok(!ids.has(q.id),date+' repeated '+q.id);
    assert.ok(!wording.has(normalized),date+' repeated wording');
    assert.ok(!entities.has(q.entity),date+' repeated entity');
    assert.ok(!topics.has(q.topic??q.entity),date+' repeated topic');
    ids.add(q.id);wording.add(normalized);entities.add(q.entity);topics.add(q.topic??q.entity);
    if(q.entity.startsWith('country-'))countries.add(q.entity);
   }
  }
 }
 assert.ok(coverageDays>=366);
 assert.equal(ids.size,coverageDays*10);
 assert.equal(ids.size,bank.length);
 assert.ok(countries.size>=90);
 assert.ok(getQuestions('2026-11-11').some(q=>q.id==='world-vietnam-adidas'));
});
