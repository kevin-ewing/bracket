// Guesses are saved before this visual sequence starts.
export async function revealGuess({form,stillCurrent,render,focus,points,caught,format}){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const previous=form.closest('.question-card');
 form.setAttribute('aria-busy','true');form.querySelectorAll('input,button').forEach(el=>el.disabled=true);
 form.querySelector('.primary-button span').textContent='Locked';
 if(!reduced){
  const curtain=document.createElement('div');curtain.className='guess-curtain';curtain.setAttribute('role','status');
  curtain.innerHTML='<span class="lock-caption">INTERVAL LOCKED</span><svg viewBox="0 0 320 150" aria-hidden="true"><path class="lock-axis" d="M16 100H304M40 95v10m40-10v10m40-10v10m40-10v10m40-10v10m40-10v10m40-10v10"/><rect class="lock-band" x="66" y="60" width="188" height="70"/><path class="lock-left" d="M84 50H64v90h20"/><path class="lock-right" d="M236 50h20v90h-20"/><path class="lock-scan" d="M0 40v110"/></svg><strong>Revealing the answer</strong>';
  previous.append(curtain);previous.classList.add('is-locking');
  await new Promise(resolve=>setTimeout(resolve,720));
 }
 if(!stillCurrent())return;
 render();focus();
 const card=document.querySelector('.question-card');if(!card||reduced)return;
 card.classList.add('reveal-enter',caught?'reveal-hit':'reveal-miss');
 setTimeout(()=>card.classList.remove('reveal-enter','reveal-hit','reveal-miss'),1600);
 const counter=card.querySelector('[data-score-count]');if(!counter)return;
 const start=performance.now();
 function tick(now){if(!counter.isConnected)return;const t=Math.min(1,(now-start)/950);counter.textContent='+'+format(Math.round(points*(1-(1-t)**3)));if(t<1)requestAnimationFrame(tick);}
 requestAnimationFrame(tick);
}
