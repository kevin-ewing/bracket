import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import bank from '../src/bank.js';
import { evaluate, VERSION } from '../src/core.js';
import { calculatorDisplay, insertAtSelection, deleteAtSelection, canUseBound, noteMetrics } from '../src/workspace.js';

test('Every source entry has a recorded editorial disposition; only reasoning is playable',()=>{
 const audit=JSON.parse(fs.readFileSync(new URL('../data/question-review.json',import.meta.url),'utf8'));
 assert.equal(audit.reviewed,3905);assert.equal(audit.entries.length,3905);assert.equal(new Set(audit.entries.map(q=>q.id)).size,3905);assert.equal(audit.approved,bank.length);
 for(const q of audit.entries){assert.ok(q.context&&q.unit&&q.family&&q.reason,q.id);assert.ok(['approved','excluded'].includes(q.status),q.id);}
 for(const q of bank){assert.equal(q.review.kind,'estimation',q.id);assert.ok(q.context.length>20,q.id);assert.ok(q.unitLabel,q.id);assert.ok(!/^wb-pop-|^nobel-|^wd-/.test(q.id),q.id);}
 const density=bank.find(q=>q.id==='wb-density-MRT');assert.ok(density.context.includes('2023'));assert.ok(density.hint.includes('residents'));assert.ok(density.hint.includes('kilometres'));
 const history=bank.find(q=>q.id==='reasoning-wd-Q362-duration');assert.equal(history.unit,'issues');assert.ok(history.context.includes('1939'));assert.ok(history.context.includes('1945'));assert.equal(history.answer,312);
 assert.equal(VERSION,2);
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
 const book=bank.find(q=>q.id==='gutenberg-1342-pages');assert.ok(book.steps.some(s=>s.includes('≈ 424')));
});

test('Prompts withhold numerical source clues and define subjective viewing sessions',()=>{
 for(const q of bank.filter(q=>q.id.startsWith('wb-square-'))){assert.ok(!q.context.includes('thousand'));assert.ok(q.hint.includes('square kilometres'));}
 for(const q of bank.filter(q=>q.id.startsWith('case-museum-'))){assert.ok(q.question.includes('30 seconds'));assert.ok(q.question.includes('five-hour'));}
});
