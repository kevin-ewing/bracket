import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import worker from '../leaderboard/worker.js';
import { getQuestions } from '../src/questions.js';
import { today } from '../src/core.js';
function database(){
 const sql=new DatabaseSync(':memory:');sql.exec(fs.readFileSync(new URL('../leaderboard/schema.sql',import.meta.url),'utf8'));
 return {sql,prepare(query){let values=[];const stmt=sql.prepare(query);return {bind(...args){values=args;return this;},async first(){return stmt.get(...values)||null;},async run(){return stmt.run(...values);},async all(){return {results:stmt.all(...values)};}};},async batch(statements){return Promise.all(statements.map(s=>s.run()));}};
}
const origin='https://example.github.io';
function body(){const date=today();return {date,version:1,clientId:crypto.randomUUID(),guesses:getQuestions(date).map(q=>({lower:q.answer*.9,upper:q.answer*1.1}))};}
function request(payload,overrides={}){return new Request('https://leaderboard.example/submit',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','CF-Connecting-IP':'192.0.2.1',...overrides},body:JSON.stringify(payload)});}
test('Worker persists the first score, prevents double votes, and returns real aggregates',async()=>{
 const DB=database(),env={DB,ALLOWED_ORIGIN:origin,RATE_SALT:'unit-test-only'},payload=body();
 let response=await worker.fetch(request(payload),env);assert.equal(response.status,200);let result=await response.json();assert.equal(result.score,4525);assert.equal(result.players,1);assert.equal(result.percentile,0);
 // Submit different guesses with the same ID: the original score must stay.
 const changed={...payload,guesses:payload.guesses.map(()=>({lower:1e17,upper:1e18}))};
 response=await worker.fetch(request(changed),env);result=await response.json();assert.equal(result.score,4525);assert.equal(result.players,1);
 const second={...changed,clientId:crypto.randomUUID()};await worker.fetch(request(second),env);
 response=await worker.fetch(request(payload),env);result=await response.json();assert.equal(result.players,2);assert.equal(result.percentile,50);assert.equal(result.bins.reduce((a,b)=>a+b),2);
 assert.equal(DB.sql.prepare('SELECT attempts FROM budgets').get().attempts,2);DB.sql.close();
});
test('Worker validates origin, content type, payload size, and rate limits new devices',async()=>{
 const DB=database(),env={DB,ALLOWED_ORIGIN:origin,RATE_SALT:'unit-test-only'},payload=body();
 assert.equal((await worker.fetch(request(payload,{Origin:'https://attacker.example'}),env)).status,403);
 assert.equal((await worker.fetch(request(payload,{'Content-Type':'text/plain'}),env)).status,415);
 assert.equal((await worker.fetch(request({...payload,extra:'x'.repeat(5000)}),env)).status,400);
 assert.equal((await worker.fetch(request({...payload,guesses:[]}),env)).status,400);
 const preflight=await worker.fetch(new Request('https://leaderboard.example/submit',{method:'OPTIONS',headers:{Origin:origin}}),env);assert.equal(preflight.status,204);assert.equal(preflight.headers.get('Access-Control-Allow-Origin'),origin);
 await worker.fetch(request(payload),env);DB.sql.prepare('UPDATE budgets SET attempts=100').run();
 assert.equal((await worker.fetch(request({...payload,clientId:crypto.randomUUID()}),env)).status,429);
 // Existing devices may refresh after network capacity is exhausted.
 assert.equal((await worker.fetch(request(payload),env)).status,200);DB.sql.close();
});
test('Scheduled cleanup expires score records and network hashes',async()=>{
 const DB=database();DB.sql.prepare("INSERT INTO submissions VALUES ('2020-01-01', 'a', 100)").run();DB.sql.prepare("INSERT INTO budgets VALUES ('2020-01-01', 'b', 1)").run();await worker.scheduled({}, {DB});assert.equal(DB.sql.prepare('SELECT count(*) n FROM submissions').get().n,0);assert.equal(DB.sql.prepare('SELECT count(*) n FROM budgets').get().n,0);DB.sql.close();
});
