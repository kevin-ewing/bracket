import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreInterval, potentialScore, validateInterval, parseNumber, dayNumber, today, random, evaluate, streak, shareText, VERSION } from '../src/core.js';
import { getQuestions, questionCount, categoryCounts } from '../src/questions.js';
import bank from '../src/bank.js';
import { validateSubmission, statistics } from '../leaderboard/worker.js';

test('Scoring catches endpoints, zeros misses, and rewards relative precision',()=>{
 assert.equal(scoreInterval(100,200,100),707);assert.equal(scoreInterval(100,200,200),707);
 assert.equal(scoreInterval(100,200,99.9999),0);assert.equal(scoreInterval(100,200,200.0001),0);
 assert.equal(scoreInterval(450,550,500),905);assert.equal(scoreInterval(100,1000,500),316);
 assert.equal(scoreInterval(1,2,1.5),scoreInterval(1e12,2e12,1.5e12));
 assert.equal(scoreInterval(1,1,1),0);assert.equal(scoreInterval(0,1,.5),0);
 assert.equal(scoreInterval(NaN,2,1),0);assert.equal(potentialScore(10,100),316);
 assert.equal(scoreInterval(1e-9,1e18,1),0); // whole-point rounding for extremely wide bounds
});
test('Input accepts deliberate numeric forms and rejects accidental nonnumbers',()=>{
 for(const [raw,n] of [['1,200',1200],['1.5k',1500],['2M',2e6],['1e9',1e9],['.5b',5e8],['1 t',1e12]])assert.equal(parseNumber(raw),n);
 for(const raw of ['','-2','Infinity','1/2','2kk','<script>','0x10'])assert.ok(Number.isNaN(parseNumber(raw)));
 assert.ok(validateInterval(1,1));assert.ok(validateInterval(10,5));assert.ok(validateInterval(0,100));assert.ok(validateInterval(1,1e19));assert.equal(validateInterval(1,10),'');
});
test('Daily schedule is date-only, mixed, stable, and excludes duplicate entities',()=>{
 assert.equal(dayNumber('2026-11-10'),1);assert.equal(dayNumber('2026-11-11'),2);
 assert.equal(today(new Date('2026-11-11T00:01:00+09:00')),'2026-11-10');
 assert.ok(getQuestions('2026-11-10').every(q=>!q.id.startsWith('wb-')&&!q.id.startsWith('case-')));
 for(let d=0;d<2000;d++){
  const date=new Date(Date.UTC(2026,10,10+d)).toISOString().slice(0,10),qs=getQuestions(date);
  assert.equal(qs.length,5);assert.equal(new Set(qs.map(q=>q.id)).size,5);assert.equal(new Set(qs.map(q=>q.category)).size,5);assert.equal(new Set(qs.map(q=>q.entity)).size,5);
  assert.deepEqual(qs.map(q=>q.id),getQuestions(date).map(q=>q.id));
 }
 const subjects=new Set(Array.from({length:60},(_,i)=>getQuestions(new Date(Date.UTC(2026,10,10+i)).toISOString().slice(0,10))).flat().map(q=>q.category));assert.equal(subjects.size,10);
 assert.deepEqual(getQuestions('2026-11-10','practice1').map(q=>q.id),getQuestions('2026-11-10','practice2').map(q=>q.id));
});
test('Frozen bank contains screened estimation questions across ten subjects',()=>{
 assert.ok(questionCount>=200);assert.equal(Object.keys(categoryCounts).length,10);
 assert.equal(new Set(bank.map(q=>q.id)).size,bank.length);
 for(const q of bank){assert.ok(Number.isFinite(q.answer)&&q.answer>=1e-9&&q.answer<=1e18,q.id);assert.ok(q.source.url.startsWith('https://'),q.id);assert.ok(q.source.name&&q.clue&&q.unit&&q.prompt&&q.entity,q.id);assert.ok(q.steps.length>=2,q.id);assert.equal(scoreInterval(q.answer*.9,q.answer*1.1,q.answer),905,q.id);}
});
test('Reference calculations agree with independently checked source records',()=>{
 const find=id=>bank.find(q=>q.id===id);
 assert.equal(find('fermi-text-1342').answer,126909);
 assert.equal(find('fermi-cash-notes-mass').answer,10);
 assert.equal(find('fermi-video-minute-4k').answer,44.78976);
 assert.equal(find('fermi-rain-court-football').answer,71.4);
 assert.equal(find('nasa-mars-light').answer,228/18);
 assert.equal(find('fermi-earth-belt').answer,2*Math.PI);
});
test('Calculator handles arithmetic without eval or scripts',()=>{
 assert.equal(evaluate('365 * 24 * 60'),525600);assert.equal(evaluate('(2+3)*4'),20);assert.equal(evaluate('2^3^2'),512);assert.equal(evaluate('-4+10/2'),1);assert.equal(evaluate('1e3/2'),500);assert.equal(evaluate('-2^2'),-4);assert.equal(evaluate('2^-2'),0.25);
 for(const raw of ['alert(1)','1/0','2+','(2+3','2 3','Infinity','2;4'])assert.throws(()=>evaluate(raw));
});
test('Streak survives a still-unplayed current day; gaps end it',()=>{
 assert.equal(streak(['2026-11-10','2026-11-11'],'2026-11-12'),2);assert.equal(streak(['2026-11-10'],'2026-11-12'),0);assert.equal(streak(['2026-11-12'],'2026-11-12'),1);
});
test('Sharing contains no question answers or bounds',()=>{
 const qs=getQuestions('2026-11-10'),guesses=qs.map(q=>({lower:q.answer*.9,upper:q.answer*1.1})),text=shareText('2026-11-10',guesses,qs);
 assert.ok(text.includes('4,525 / 5,000'));assert.ok(text.includes('5/5 caught'));assert.ok(!text.includes(qs[0].title));
});
test('Leaderboard recomputes scores and rejects invalid or mismatched submissions',()=>{
 const date='2026-11-10',qs=getQuestions(date),body={date,version:VERSION,clientId:'12345678-1234-4234-8234-123456789abc',guesses:qs.map(q=>({lower:q.answer*.9,upper:q.answer*1.1}))};
 assert.equal(validateSubmission({...body,score:5000},new Date(date)),4525);
 for(const invalid of [{...body,version:VERSION+1},{...body,date:'2026-11-09'},{...body,clientId:'bad'},{...body,guesses:[]},{...body,guesses:qs.map(()=>({lower:'1',upper:10}))}])assert.throws(()=>validateSubmission(invalid,new Date(date)));
 const stats=statistics([{score:0,n:2},{score:1000,n:1},{score:4525,n:2},{score:5000,n:1}],4525);
 assert.equal(stats.players,6);assert.equal(stats.percentile,50);assert.equal(stats.bins.reduce((n,x)=>n+x,0),6);assert.equal(stats.bins[9],3);
});

test('Hints halve rounded scores and server results, including shared totals',()=>{
 assert.equal(scoreInterval(100,200,150,true),354);
 assert.equal(scoreInterval(450,550,500,true),453);
 assert.equal(scoreInterval(450,550,600,true),0);
 assert.equal(potentialScore(450,550,true),453);
 const date='2026-11-10',qs=getQuestions(date),guesses=qs.map(q=>({lower:q.answer*.9,upper:q.answer*1.1,hinted:true}));
 const payload={date,version:VERSION,clientId:'12345678-1234-4234-8234-123456789abc',guesses};
 assert.equal(validateSubmission(payload,new Date(date)),2265);
 assert.ok(shareText(date,guesses,qs).includes('2,265 / 5,000'));
 assert.throws(()=>validateSubmission({...payload,guesses:guesses.map(g=>({...g,hinted:'false'}))},new Date(date)));
});
test('Every question has one concise question and an assumption hint',()=>{
 for(const q of bank){assert.ok(q.question&&q.question.endsWith('?'),q.id);assert.ok(!q.question.includes('undefined'),q.id);assert.ok(q.hint&&q.hint.length>15,q.id);}
 const book=bank.find(q=>q.id==='fermi-text-1342');assert.ok(book.question.includes('How many words'));assert.ok(!book.question.includes('126909'));assert.ok(book.hint);
});
