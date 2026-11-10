const stops=[[0,'#d86969'],[250,'#eaa09b'],[500,'#fccbcb'],[750,'#78b3d6'],[1000,'#4f7969']];
const rgb=h=>h.match(/[a-f\d]{2}/gi).map(v=>parseInt(v,16));
export function scoreStyle(points,caught=true){
 const score=Math.max(0,Math.min(1000,Number(points)||0));
 let color='#dee3e2';
 if(caught){const i=Math.min(3,Math.floor(score/250)),a=stops[i],b=stops[i+1],t=(score-a[0])/250;const start=rgb(a[1]),end=rgb(b[1]);color='#'+start.map((v,k)=>Math.round(v+(end[k]-v)*t).toString(16).padStart(2,'0')).join('');}
 const channels=rgb(color).map(v=>{const n=v/255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;});const luminance=channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;
 const text=luminance<.24?'#ffffff':'#172d25';
 const label=!caught?'Miss':score>=950?'Exceptional':score>=800?'Precise':score>=650?'Strong':score>=450?'Moderate':score>=250?'Broad':'Very broad';
 return {color,text,label,emoji:!caught?'⬜':score>=950?'🟩':score>=800?'🟦':score>=650?'🟨':score>=450?'🟧':'🟥'};
}
export const scoreLegend=()=>'<div class="score-key"><span>Broad hit</span><div aria-hidden="true"></div><span>Tight hit</span></div>';
