import {revealLayout,revealPosition} from './reveal-layout.js';
const compact=n=>new Intl.NumberFormat('en-US',{notation:n>=1e6?'compact':'standard',maximumSignificantDigits:5}).format(n);
function wait(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
async function drumroll(marker,layout,current,reduced){
 const begin=performance.now(),curtain=marker.closest('.guess-curtain');let settling=false;
 return new Promise(resolve=>{
  function frame(now){
   if(!current()||!marker.isConnected){resolve(false);return;}
   if(reduced.matches){resolve(true);return;}
   const t=Math.min(1,(now-begin)/1450);
   marker.setAttribute('transform',`translate(${revealPosition(t,layout)} 0)`);
   if(t>=.75&&!settling){settling=true;curtain.classList.add('drum-landing');}
   if(t<1)requestAnimationFrame(frame);else resolve(true);
  }
  requestAnimationFrame(frame);
 });
}
// Commit first: a reload or navigation cannot undo the interval during the reveal.
export async function revealGuess({form,stillCurrent,render,focus,points,caught,format,lower,upper,answer,unit}){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const previous=form.closest('.question-card');
 form.setAttribute('aria-busy','true');form.querySelectorAll('input,button').forEach(el=>el.disabled=true);
 form.querySelector('.primary-button span').textContent='Locked';
 if(!reduced.matches){
  const layout=revealLayout(lower,upper,answer),curtain=document.createElement('div');
  curtain.className='guess-curtain personalised-reveal';curtain.setAttribute('role','group');curtain.setAttribute('aria-label','Revealing your interval');
  const left=layout.lower,right=layout.upper;
  curtain.innerHTML=`<div class="drum-content"><span class="lock-caption">YOUR INTERVAL IS LOCKED</span><div class="drum-bounds"><div><span>LOWER</span><strong>${compact(lower)}</strong></div><span aria-hidden="true">—</span><div><span>UPPER</span><strong>${compact(upper)}</strong></div></div><p class="drum-unit"></p><svg class="drum-ruler" viewBox="0 0 500 150" aria-hidden="true"><path class="lock-axis" d="M22 90H478M50 84v12m50-12v12m50-12v12m50-12v12m50-12v12m50-12v12m50-12v12m50-12v12m50-12v12"/><rect class="drum-band" x="${left}" y="58" width="${right-left}" height="64"/><path class="drum-bracket" d="M${left+9} 49H${left}v82h9M${right-9} 49h9v82h-9"/><g class="drum-marker" transform="translate(${revealPosition(0,layout)} 0)"><path d="M0 29v95"/><path d="m-8 23 8 11 8-11Z"/><circle cy="90" r="8"/></g></svg><strong class="drum-title">Where will it land?</strong><div class="drum-answer" aria-hidden="true"><span>THE ANSWER</span><strong>—</strong><p></p></div><div class="drum-beats" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div></div>`;
  curtain.querySelector('.drum-unit').textContent=unit;
  curtain.querySelector('.drum-answer p').textContent=unit;
  previous.append(curtain);previous.classList.add('is-locking');
  const content=curtain.querySelector('.drum-content'),rect=content.getBoundingClientRect();
  if(rect.top<25||rect.bottom>innerHeight-50)content.scrollIntoView({behavior:'smooth',block:'center'});
  const marker=curtain.querySelector('.drum-marker');
  if(!await drumroll(marker,layout,stillCurrent,reduced))return;
  if(!stillCurrent())return;
  if(!reduced.matches){
   curtain.classList.add(caught?'drum-hit':'drum-miss');curtain.querySelector('.drum-title').textContent=layout.direction==='inside'?'Inside your interval':layout.direction==='below'?'Below your lower bound':'Above your upper bound';
   const result=curtain.querySelector('.drum-answer');result.querySelector('strong').textContent=compact(answer);result.setAttribute('aria-hidden','false');curtain.classList.add('drum-resolved');
   await wait(750);
  }
 }
 if(!stillCurrent())return;
 render();focus();
 const card=document.querySelector('.question-card');if(!card||reduced.matches)return;
 card.classList.add('reveal-enter',caught?'reveal-hit':'reveal-miss');
 setTimeout(()=>card.classList.remove('reveal-enter','reveal-hit','reveal-miss'),1600);
 const counter=card.querySelector('[data-score-count]');if(!counter)return;
 const start=performance.now();
 function tick(now){if(!counter.isConnected)return;const t=Math.min(1,(now-start)/950);counter.textContent='+'+format(Math.round(points*(1-(1-t)**3)));if(t<1)requestAnimationFrame(tick);}
 requestAnimationFrame(tick);
}
