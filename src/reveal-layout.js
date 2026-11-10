// Logarithmic coordinates keep a 1–10 guess and a 1m–10m guess comparable.
export function revealLayout(lower,upper,answer){
 if(![lower,upper,answer].every(n=>Number.isFinite(n)&&n>0)||upper<=lower)throw Error('Invalid reveal interval');
 const min=Math.log(Math.min(lower,answer)),max=Math.log(Math.max(upper,answer));
 const pad=Math.max(.2,(max-min)*.16),start=min-pad,end=max+pad;
 const position=n=>22+(Math.log(n)-start)/(end-start)*456;
 return {lower:position(lower),upper:position(upper),answer:position(answer),caught:answer>=lower&&answer<=upper,direction:answer<lower?'below':answer>upper?'above':'inside'};
}

// One small overshoot around the actual answer, then a smooth stop.
// The same SVG transform owns the whole motion, including its final frame.
export function revealPosition(progress,layout){
 const t=Math.max(0,Math.min(1,progress)),target=layout.answer;
 const direction=target>=250?-1:1;
 const room=direction<0?target-22:478-target;
 const oppositeRoom=direction<0?478-target:target-22;
 const offset=direction*Math.min(170,room,oppositeRoom*8);
 return target+offset*(1-t)**3*Math.cos(1.5*Math.PI*t);
}
