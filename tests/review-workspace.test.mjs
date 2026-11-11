import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import bank from '../src/bank.js';
import { evaluate, VERSION } from '../src/core.js';
import { calculatorDisplay, insertAtSelection, deleteAtSelection, canUseBound, noteMetrics } from '../src/workspace.js';

test('Every source entry has a recorded editorial disposition; only reasoning is playable',()=>{
 const audit=JSON.parse(fs.readFileSync(new URL('../data/question-review.json',import.meta.url),'utf8'));
 assert.equal(audit.sourceReviewed,3905);assert.equal(audit.externalScreened,867);assert.equal(audit.entries.length,audit.reviewed);assert.equal(new Set(audit.entries.map(q=>q.id)).size,audit.reviewed);assert.equal(audit.approved,bank.length);
 for(const q of audit.entries){assert.ok(q.context&&q.unit&&q.family&&q.reason,q.id);assert.ok(['approved','excluded'].includes(q.status),q.id);}
 for(const q of bank){assert.equal(q.review.kind,'estimation',q.id);assert.ok(q.context.length>20,q.id);assert.ok(q.unitLabel,q.id);assert.ok(!/^wb-pop-|^nobel-|^wd-/.test(q.id),q.id);}
 assert.ok(!bank.some(q=>/^wb-|^case-|^model-|^reasoning-wd-/.test(q.id)));assert.equal(VERSION,5);
});
test('Calculator supports scientific-sized napkin math, percentages, and meaningful precision',()=>{
 assert.equal(evaluate('40e6 * 20 / (24*60*60) / 500'),18.51851851851852);
 assert.equal(evaluate('250 * 15%'),37.5);assert.equal(evaluate('(100+50)%'),1.5);assert.equal(evaluate('2^(-3)'),.125);
 assert.equal(calculatorDisplay(.000000025),'2.5e-8');assert.equal(calculatorDisplay(1/3),'0.333333333333');assert.equal(calculatorDisplay(2e15),'2e+15');
 assert.equal(canUseBound(0),false);assert.equal(canUseBound(-3),false);assert.equal(canUseBound(Infinity),false);assert.equal(canUseBound(null),false);assert.equal(canUseBound(1/3),true);
});
test('Keypad edits a selected expression rather than blindly appending',()=>{
 assert.deepEqual(insertAtSelection('12+34','9',3,5),{text:'12+9',cursor:4});
 assert.deepEqual(insertAtSelection('12+34','*',2,3),{text:'12*34',cursor:3});
 assert.deepEqual(deleteAtSelection('12+34',3,5),{text:'12+',cursor:3});
 assert.deepEqual(deleteAtSelection('12+34',2,2),{text:'1+34',cursor:1});
 assert.deepEqual(deleteAtSelection('',0,0),{text:'',cursor:0});
});
test('Notes metrics handle empty, multiline, and Unicode working',()=>{
 assert.deepEqual(noteMetrics(' \n '),{words:0,characters:3});assert.deepEqual(noteMetrics('Area = πr²\nvolume = area × height'),{words:8,characters:33});
});

test('There is exactly one shared practice set per date, distinct from the main daily',async()=>{
 const {getQuestions}=await import('../src/questions.js');
 for(let i=0;i<365;i++){
  const date=new Date(Date.UTC(2026,10,10+i)).toISOString().slice(0,10),daily=getQuestions(date),practice=getQuestions(date,'practice');
  assert.equal(practice.length,5);assert.equal(new Set(practice.map(q=>q.id)).size,5);assert.equal(new Set(practice.map(q=>q.category)).size,5);
  assert.deepEqual(practice.map(q=>q.id),getQuestions(date,'arbitrary-random-seed').map(q=>q.id));
  assert.ok(practice.every(q=>!daily.some(d=>d.entity===q.entity)));
 }
 assert.notDeepEqual(getQuestions('2026-11-10','practice').map(q=>q.id),getQuestions('2026-11-11','practice').map(q=>q.id));
});

test('Scientific calculator supports estimation functions and rejects unsafe or unbounded expressions',()=>{
 assert.equal(evaluate('sqrt(144)+2^3'),20);assert.equal(evaluate('√(81)'),9);
 assert.equal(evaluate('log(1000)'),3);assert.equal(evaluate('ln(e)'),1);assert.equal(evaluate('2pi'),2*Math.PI);
 assert.equal(evaluate('2(3+4)'),14);assert.equal(evaluate('2m/500k'),4);assert.equal(evaluate('3.'),3);
 assert.equal(evaluate('1/(4+1)'),.2);assert.equal(evaluate('50%*80'),40);
 for(const input of ['sqrt(-1)','log(0)','1e','2 3','2..3','process.exit()','constructor(1)','1+'.repeat(2000)])assert.throws(()=>evaluate(input),input);
});
test('Every playable explanation avoids programming-style rounding notation',()=>{
 for(const q of bank)for(const step of q.steps)assert.ok(!/\b(?:ceil|floor|round)\(/i.test(step),q.id+': '+step);
 const book=bank.find(q=>q.id==='fermi-text-1342');assert.ok(book.steps.some(s=>s.includes('126,909')));
});

test('Editorial rules remove the rejected statistical and word-problem families',()=>{
 assert.ok(!bank.some(q=>/^wb-|^case-|^model-|^reasoning-wd-/.test(q.id)));
 for(const q of bank){assert.ok(q.reasoningPath,q.id);assert.ok(q.review.editorialChecks.estimableComponents,q.id);assert.ok(q.review.editorialChecks.noPrivateBehaviourRate,q.id);assert.ok(q.review.editorialChecks.noCompleteCalculationInPrompt,q.id);}
});

test('Guess reveal geometry changes with each interval and distinguishes both miss directions',async()=>{
 const {revealLayout}=await import('../src/reveal-layout.js');
 const hit=revealLayout(80,120,100),below=revealLayout(120,160,100),above=revealLayout(40,80,100);
 assert.equal(hit.direction,'inside');assert.ok(hit.answer>=hit.lower&&hit.answer<=hit.upper);
 assert.equal(below.direction,'below');assert.ok(below.answer<below.lower);
 assert.equal(above.direction,'above');assert.ok(above.answer>above.upper);
 assert.notEqual(revealLayout(90,110,100).upper-revealLayout(90,110,100).lower,revealLayout(1,1000,100).upper-revealLayout(1,1000,100).lower);
 assert.equal(revealLayout(1,100,1).caught,true);assert.equal(revealLayout(1,100,100).caught,true);
 for(const n of Object.values(revealLayout(1e-9,1e18,1)).filter(v=>typeof v==='number'))assert.ok(Number.isFinite(n));
});
test('Score palette grades tight and broad hits distinctly with a continuous ramp',async()=>{
 const {scoreStyle}=await import('../src/score-style.js');
 assert.notEqual(scoreStyle(200).color,scoreStyle(900).color);assert.notEqual(scoreStyle(800).color,scoreStyle(950).color);
 assert.notEqual(scoreStyle(650).color,scoreStyle(700).color);assert.equal(scoreStyle(1000).label,'Exceptional');
 assert.equal(scoreStyle(0,false).label,'Miss');assert.notEqual(scoreStyle(0,false).color,scoreStyle(0,true).color);
});

test('Reveal makes one gentle pass around the answer and stops without a final jump',async()=>{
 const {revealLayout,revealPosition}=await import('../src/reveal-layout.js');
 for(const layout of [revealLayout(80,120,100),revealLayout(120,160,100),revealLayout(40,80,100),revealLayout(1e-9,1e18,1)]){
  const positions=Array.from({length:1001},(_,i)=>revealPosition(i/1000,layout));
  assert.equal(positions.at(-1),layout.answer);
  assert.ok(Math.abs(positions.at(-2)-layout.answer)<.001,'No end-frame snap');
  assert.ok(positions.every(x=>Number.isFinite(x)&&x>=22&&x<=478),'Stay on the ruler');
  const sides=positions.slice(0,-1).map(x=>Math.sign(x-layout.answer)).filter(Boolean);
  assert.ok(sides.slice(1).filter((s,i)=>s!==sides[i]).length<=1,'At most one crossing of the answer');
  assert.ok(Math.abs(positions[0]-layout.answer)>20,'Visible anticipation');
 }
});
