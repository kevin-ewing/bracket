export function calculatorDisplay(value) {
 if(!Number.isFinite(value))return '—';
 if(value!==0&&(Math.abs(value)<1e-6||Math.abs(value)>=1e13))return value.toExponential(8).replace(/0+e/,'e').replace(/\.e/,'e');
 return new Intl.NumberFormat('en-US',{maximumSignificantDigits:12}).format(value);
}
export function insertAtSelection(text,insert,start=text.length,end=start) {
 return {text:text.slice(0,start)+insert+text.slice(end),cursor:start+insert.length};
}
export function deleteAtSelection(text,start=text.length,end=start) {
 if(start!==end)return {text:text.slice(0,start)+text.slice(end),cursor:start};
 return {text:text.slice(0,Math.max(0,start-1))+text.slice(end),cursor:Math.max(0,start-1)};
}
export const canUseBound = n => Number.isFinite(n)&&n>=1e-9&&n<=1e18;
export function noteMetrics(text) {return {words:(text.trim().match(/\S+/g)||[]).length,characters:text.length};}
