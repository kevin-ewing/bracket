import { getQuestions } from '../src/questions.js';
import { today, VERSION, validateInterval, scoreInterval } from '../src/core.js';
export function validateSubmission(body, now = new Date()) {
 if(!body || body.version!==VERSION)throw Error('This edition has changed. Reload the game.');
 if(body.date!==today(now))throw Error('Only the current UTC daily puzzle can be submitted.');
 if(typeof body.clientId!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.clientId))throw Error('A valid anonymous device ID is required.');
 if(!Array.isArray(body.guesses)||body.guesses.length!==5)throw Error('Finish all five questions first.');
 for(const guess of body.guesses)if(!guess || typeof guess.lower!=='number'||typeof guess.upper!=='number'||(guess.hinted!==undefined&&typeof guess.hinted!=='boolean')||validateInterval(guess.lower,guess.upper))throw Error('Every question needs a valid interval.');
 const questions=getQuestions(body.date);
 return body.guesses.reduce((score,g,i)=>score+scoreInterval(g.lower,g.upper,questions[i].answer,g.hinted),0);
}
export function statistics(rows, score) {
 const bins=Array(10).fill(0);let players=0,lower=0;
 for(const row of rows){const count=Number(row.n);players+=count;if(row.score<score)lower+=count;bins[Math.min(9,Math.floor(row.score/500))]+=count;}
 // Strictly lower, including your own submitted score in the comparison pool.
 return {players,percentile:players?Math.round(lower/players*100):0,bins,score};
}
async function digest(value){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return [...new Uint8Array(bytes)].map(n=>n.toString(16).padStart(2,'0')).join('');}
function reply(data,status,origin){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':origin,'Vary':'Origin','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
async function readSmallJSON(request){const reader=request.body?.getReader();if(!reader)throw Error('Missing submission.');let bytes=0,parts=[];while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>4096){await reader.cancel();throw Error('Submission is too large.');}parts.push(value);}const merged=new Uint8Array(bytes);let at=0;for(const part of parts){merged.set(part,at);at+=part.byteLength;}try{return JSON.parse(new TextDecoder().decode(merged));}catch{throw Error('Invalid JSON submission.');}}
export default {
 async fetch(request,env){
  const origin=request.headers.get('Origin');
  if(!env.ALLOWED_ORIGIN||origin!==env.ALLOWED_ORIGIN)return new Response('Origin not allowed',{status:403});
  const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'86400','Vary':'Origin'};
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(new URL(request.url).pathname!=='/submit')return reply({error:'Not found.'},404,origin);
  if(request.method!=='POST')return reply({error:'Use POST.'},405,origin);
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return reply({error:'Use application/json.'},415,origin);
  if(!env.DB||!env.RATE_SALT)return reply({error:'Leaderboard setup is incomplete.'},503,origin);
  let body,calculated;
  try{body=await readSmallJSON(request);calculated=validateSubmission(body);}catch(e){return reply({error:e.message},400,origin);}
  try{
   const id=await digest(env.RATE_SALT+':device:'+body.clientId);
   let existing=await env.DB.prepare('SELECT score FROM submissions WHERE puzzle_date = ? AND edition = ? AND device_id = ?').bind(body.date,VERSION,id).first();
   if(!existing){
    const ip=request.headers.get('CF-Connecting-IP');
    if(!ip)return reply({error:'Network identity unavailable. Try again later.'},503,origin);
    const network=await digest(env.RATE_SALT+':'+body.date+':'+ip);
    const budget=await env.DB.prepare('INSERT INTO budgets (puzzle_date, network, attempts) VALUES (?, ?, 1) ON CONFLICT(puzzle_date, network) DO UPDATE SET attempts = attempts + 1 RETURNING attempts').bind(body.date,network).first();
    if(budget.attempts>100)return reply({error:'Daily submission limit reached for this network. Your local score is safe.'},429,origin);
    // First score wins. Race-safe unique key prevents overwrites and duplicate votes.
    await env.DB.prepare('INSERT OR IGNORE INTO submissions (puzzle_date, edition, device_id, score) VALUES (?, ?, ?, ?)').bind(body.date,VERSION,id,calculated).run();
    existing=await env.DB.prepare('SELECT score FROM submissions WHERE puzzle_date = ? AND edition = ? AND device_id = ?').bind(body.date,VERSION,id).first();
   }
   const {results}=await env.DB.prepare('SELECT score, COUNT(*) AS n FROM submissions WHERE puzzle_date = ? AND edition = ? GROUP BY score').bind(body.date,VERSION).all();
   return reply(statistics(results,existing.score),200,origin);
  }catch{return reply({error:'The leaderboard is temporarily unavailable. Your local score is safe.'},503,origin);}
 },
 async scheduled(_event,env){const now=Date.now();await env.DB.batch([
  env.DB.prepare('DELETE FROM budgets WHERE puzzle_date < ?').bind(today(new Date(now-7*86400000))),
  env.DB.prepare('DELETE FROM submissions WHERE puzzle_date < ?').bind(today(new Date(now-90*86400000)))
 ]);}
};
