// Logarithmic coordinates keep a 1–10 guess and a 1m–10m guess comparable.
export function revealLayout(lower,upper,answer){
 if(![lower,upper,answer].every(n=>Number.isFinite(n)&&n>0)||upper<=lower)throw Error('Invalid reveal interval');
 const min=Math.log(Math.min(lower,answer)),max=Math.log(Math.max(upper,answer));
 const pad=Math.max(.2,(max-min)*.16),start=min-pad,end=max+pad;
 const position=n=>22+(Math.log(n)-start)/(end-start)*456;
 return {lower:position(lower),upper:position(upper),answer:position(answer),caught:answer>=lower&&answer<=upper,direction:answer<lower?'below':answer>upper?'above':'inside'};
}
