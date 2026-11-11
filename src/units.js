import {parseNumber,formatNumber} from './core.js';
// Exact international definitions. “Imperial” UI uses explicitly labelled US liquid/weight units.
const alternatives={
 kilograms:['pounds',.45359237],
 'metric tonnes':['US short tons',.90718474],
 metres:['feet',.3048],
 centimetres:['inches',2.54],
 kilometres:['miles',1.609344],
 litres:['US gallons',3.785411784],
 'cubic metres':['cubic yards',.9144**3],
 'kilometres per second':['miles per second',1.609344],
 'square kilometres':['square miles',1.609344**2],
 'square metres':['square feet',.3048**2],
 hectares:['acres',.40468564224],
 'kilograms per person':['pounds per person',.45359237],
 'kilograms per hectare':['pounds per acre',.45359237/.40468564224]
};
export function unitSpec(q,system='metric'){
 const pair=alternatives[q.unit];
 return {convertible:Boolean(pair),system:system==='imperial'?'imperial':'metric',label:system==='imperial'&&pair?pair[0]:q.unitLabel||q.unit,factor:system==='imperial'&&pair?1/pair[1]:1,canonicalFactor:system==='imperial'&&pair?pair[1]:1};
}
export const displayValue=(value,q,system)=>value*unitSpec(q,system).factor;
export const canonicalValue=(value,q,system)=>value*unitSpec(q,system).canonicalFactor;
const variants={
 'fermi-earth-belt':{question:'If a belt around Earth were lifted one metre (about 3.28 feet) off the ground everywhere, how much longer would it need to be?'},
 'fermi-rain-court-football':{question:'How heavy would one centimetre (about 0.394 inches) of rainwater on a FIFA-recommended football pitch be?',hint:'Estimate the pitch area and multiply by the water depth. Reference pitch: about 344.5 × 223.1 feet; water: about 62.4 pounds per cubic foot. The fixed depth is 1 cm, not a rounded number of inches.'},
 'fermi-pack-golf-suitcase':{question:'How many regulation golf balls would fill a 60-litre suitcase (about 15.85 US gallons)?',hint:'Estimate a ball’s volume and allow for gaps. Reference ball diameter 1.68 inches; suitcase volume about 3,661 cubic inches; bulk packing reference 64%. This is a packing model, not an exact count in every suitcase.'},
 'fermi-cash-notes-mass':{hint:'Estimate the number of $100 notes needed, then their weight. The reference weight is about 0.0353 ounces per note; 2,000 pounds make a US short ton.'},
 'fermi-cash-stack-height':{hint:'Estimate the note count, then paper thickness. Reference note thickness about 0.00433 inches. Divide stack height in inches by twelve for feet.'},
 'fermi-ocean-global-layer':{hint:'Estimate Earth’s surface area and ocean volume, then divide. Reference radius about 3,959 miles; ocean volume about 321 million cubic miles.'},
 'fermi-earth-rotation-film':{hint:'Estimate Earth’s circumference and the fraction of a day in two hours. Reference radius about 3,959 miles; rotation period 24 hours.'},
 'fermi-orbit-speed-earth':{hint:'Estimate the circumference of Earth’s orbit and divide by a year. Reference orbit radius about 93 million miles and period 365.2 days.'},
 'fermi-pyramid-volume':{hint:'Estimate the square base and original height. A pyramid takes up one-third of the corresponding box. Reference base about 755.6 feet square and original height 480.6 feet.'}
};
export function questionInUnits(q,system){
 const spec=unitSpec(q,system),variant=system==='imperial'?variants[q.id]:null;
 return {...q,...variant,unit:spec.label,unitLabel:spec.label,answer:displayValue(q.answer,q,system)};
}
// Keep original canonical numbers alongside display strings. Never accumulate
// rounding drift by converting already converted strings on each toggle.
export function captureDraft(previous,lower,upper,q,system){
 const result={questionId:q.id,system,lower,upper,canonical:{}};
 for(const key of ['lower','upper']){
  const raw=result[key],unchanged=previous?.questionId===q.id&&previous.system===system&&previous[key]===raw;
  const old=previous?.canonical?.[key];
  result.canonical[key]=unchanged&&Number.isFinite(old)?old:canonicalValue(parseNumber(raw),q,system);
 }
 return result;
}
export function switchDraft(draft,q,system){
 if(draft?.questionId&&draft.questionId!==q.id)return {questionId:q.id,system,lower:'',upper:'',canonical:{}};
 const old=captureDraft(draft,draft?.lower||'',draft?.upper||'',q,draft?.system||'metric');
 // Invalid partial input has no unambiguous quantity. Keep it in its original
 // unit and let the caller explain, rather than silently relabelling it.
 if(['lower','upper'].some(k=>old[k].trim()&&!Number.isFinite(old.canonical[k])))return null;
 if(old.system===system||!unitSpec(q).convertible)return {...old,system};
 const shown=value=>String(Number(displayValue(value,q,system).toPrecision(8)));
 return {...old,system,lower:old.lower.trim()?shown(old.canonical.lower):'',upper:old.upper.trim()?shown(old.canonical.upper):''};
}
export function unitExplanation(q,system){
 const spec=unitSpec(q,system);
 if(spec.factor===1)return '';
 const singular={kilograms:'kilogram','metric tonnes':'metric tonne',metres:'metre',centimetres:'centimetre',kilometres:'kilometre',litres:'litre','cubic metres':'cubic metre','kilometres per second':'kilometre per second','square kilometres':'square kilometre','square metres':'square metre',hectares:'hectare','kilograms per person':'kilogram per person','kilograms per hectare':'kilogram per hectare'};
 return `Answer in your selected unit: ${formatNumber(displayValue(q.answer,q,system))} ${spec.label}. The source and worked estimates below retain their labelled original units; 1 ${singular[q.unit]||q.unit} = ${Number(spec.factor.toPrecision(8))} ${spec.label}.`;
}
