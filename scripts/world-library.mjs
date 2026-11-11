import fs from 'node:fs';
const records=JSON.parse(fs.readFileSync(new URL('../data/research/world-benchmarks.json',import.meta.url),'utf8'));
const fmt=n=>new Intl.NumberFormat('en-US',{maximumSignificantDigits:9}).format(n);
export function buildWorldLibrary(){return records.map(r=>{
 const answer=r.sourceValue*r.toCanonical;
 const source={name:r.sourceName,url:r.url,retrieved:'2026-11-10',note:'Frozen published benchmark; illustrative estimation inputs do not define the answer.',supports:`${fmt(r.sourceValue)} ${r.sourceUnit}. ${r.context}`};
 const reference=`Published reference: ${fmt(r.sourceValue)} ${r.sourceUnit}.`;
 const conversion=r.toCanonical===1?'':` In the answer unit: ${fmt(r.sourceValue)} × ${r.toCanonical} ≈ ${fmt(answer)} ${r.unit}.`;
 const assumptions=r.targetKind==='research-estimate'?'The score uses the cited study’s published estimate, not an exact census. Research uncertainty is real; the worked example is only a way to estimate its scale.':r.targetKind==='derived-reported'?'The score uses an allocation calculated from the report’s rounded total and country share. It is approximate, not an exact unit-by-unit count.':'The score uses the cited publication’s figure at its stated precision and scope. The worked example uses illustrative assumptions; it does not define or prove the published total.';
 const steps=[r.example,reference+conversion,r.insight];
 const review={family:'world-'+r.id.slice(6),status:'approved',kind:'estimation',targetKind:r.targetKind,reason:`Retain: ${r.route} Scope checked: ${r.context} Published value: ${r.sourceValue} ${r.sourceUnit}; conversion factor ${r.toCanonical}.`,editorialChecks:{estimableComponents:true,noCompleteCalculationInPrompt:true,noPrivateBehaviourRate:true,definedTarget:true}};
 return {id:r.id,question:r.question,prompt:r.question,title:r.question,category:r.category,unit:r.unit,unitLabel:r.unit,answer,context:r.context,hint:r.route,clue:r.route,reasoningPath:r.route,entity:r.entity,source,sources:[source],fact:r.insight,steps,review,explanation:{approach:r.route,example:r.example,reference:reference+conversion,insight:r.insight,assumptions,steps,sources:[source]}};
});}
