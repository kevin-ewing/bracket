// Original geometric topic artwork. Decorative; never encodes an answer.
const scenes={
 'Space':'<ellipse cx="64" cy="36" rx="48" ry="17" transform="rotate(-22 64 36)"/><circle cx="64" cy="36" r="22" fill="var(--red)" stroke="none"/><path d="m102 8 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="var(--yellow)" stroke="none"/>',
 'Literature':'<path d="M20 14q24-6 44 8v43q-20-14-44-8Zm88 0q-24-6-44 8v43q20-14 44-8Z" fill="var(--blue-soft)"/><path d="M64 22v43M29 29l24 6m-24 5 24 6m22-11 23-6m-23 17 23-6"/><path d="M88 12v24l6-5 6 2V10" fill="var(--red)" stroke="none"/>',
 'Technology':'<rect x="36" y="12" width="56" height="50" rx="5" fill="var(--blue-soft)"/><path d="M47 25h34v24H47ZM27 22h9m-9 15h9m-9 15h9m56-30h9m-9 15h9m-9 15h9M48 4v8M64 4v8M80 4v8M48 62v8m16-8v8m16-8v8"/><circle cx="64" cy="37" r="8" fill="var(--red)" stroke="none"/>',
 'Science & nature':'<ellipse cx="64" cy="37" rx="43" ry="15"/><ellipse cx="64" cy="37" rx="43" ry="15" transform="rotate(60 64 37)"/><ellipse cx="64" cy="37" rx="43" ry="15" transform="rotate(120 64 37)"/><circle cx="64" cy="37" r="9" fill="var(--red)" stroke="none"/><circle cx="101" cy="30" r="5" fill="var(--yellow)" stroke="none"/>',
 'World & geography':'<circle cx="64" cy="37" r="30" fill="var(--blue-soft)"/><ellipse cx="64" cy="37" rx="13" ry="30"/><path d="M34 37h60M39 21h50M39 53h50"/><circle cx="90" cy="18" r="9" fill="var(--red)" stroke="none"/>',
 'Business & economics':'<path d="M22 63h87M32 59V42h16v17m10 0V29h16v30m10 0V13h16v46" fill="var(--blue-soft)"/><path d="m26 29 29-14 20 3L101 5" stroke="var(--red)"/><circle cx="101" cy="5" r="4" fill="var(--red)" stroke="none"/>',
 'People & history':'<path d="M37 8h54M37 66h54M43 8c0 15 7 21 21 29-14 8-21 14-21 29m42-58c0 15-7 21-21 29 14 8 21 14 21 29"/><path d="m49 59 15-15 15 15Z" fill="var(--yellow)" stroke="none"/><circle cx="64" cy="29" r="5" fill="var(--red)" stroke="none"/>',
 'Art & culture':'<circle cx="41" cy="29" r="21" fill="var(--red)" stroke="none"/><path d="m64 61 26-45 26 45Z" fill="var(--yellow)" stroke="none"/><path d="M39 38h40v29H39Z" fill="var(--blue)" stroke="none"/>',
 'Sports & everyday':'<circle cx="64" cy="37" r="30" fill="var(--yellow)" stroke="none"/><path d="M34 37h60M64 7v60M43 15c28 10 28 34 0 44m42-44c-28 10-28 34 0 44"/>',
 'Consulting & logic':'<rect x="29" y="10" width="28" height="28" fill="var(--blue-soft)"/><circle cx="85" cy="24" r="15" fill="var(--red)" stroke="none"/><path d="m63 66 22-27 22 27Z" fill="var(--yellow)" stroke="none"/><path d="M43 45v19h14M64 24h-7"/>'
};
export function topicArt(category){return `<svg class="topic-art" viewBox="0 0 128 76" aria-hidden="true" fill="none" stroke="var(--blue)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${scenes[category]||scenes['Consulting & logic']}</svg>`;}
export function topicHeader(q){return `<div class="topic-header"><div class="question-category"><span class="category-square" aria-hidden="true"></span>${q.category.replaceAll('&','&amp;')}</div>${topicArt(q.category)}</div>`;}
// A saved guess is committed before its brief visual reveal; refresh cannot undo it.
export async function revealGuess({form,stillCurrent,render,focus,points,format}){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 form.setAttribute('aria-busy','true');
 form.querySelectorAll('input,button').forEach(el=>el.disabled=true);
 form.classList.add('is-locking');
 form.querySelector('.primary-button span').textContent='Locked';
 if(!reduced)await new Promise(resolve=>setTimeout(resolve,280));
 if(!stillCurrent())return;
 render();focus();
 const card=document.querySelector('.question-card');
 if(!card||reduced)return;
 card.classList.add('reveal-enter');
 setTimeout(()=>card.classList.remove('reveal-enter'),1000);
 const counter=card.querySelector('[data-score-count]');
 if(!counter)return;
 const start=performance.now();
 function tick(now){if(!counter.isConnected)return;const t=Math.min(1,(now-start)/620);counter.textContent='+'+format(Math.round(points*(1-(1-t)**3)));if(t<1)requestAnimationFrame(tick);}
 requestAnimationFrame(tick);
}
