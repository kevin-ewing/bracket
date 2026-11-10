// Deliberate whitelist: no old generated family survives by default.
const familiarSolids=new Set([12,13,14,22,24,26,28,29,30,47,50,74,78,79,82]);
export function qualityReview(original){
 const q={...original,review:{...original.review}};let keep=false,reason;
 if(q.id.startsWith('wb-'))reason='Reject: a national statistic or a statistic disguised by one arithmetic operation. Obscure population, GDP and internet inputs are not reconstructible from ordinary experience.';
 else if(q.id.startsWith('case-'))reason='Reject: generated business/personal-behaviour rates are either hidden discretionary choices or, once supplied, a fully specified arithmetic word problem.';
 else if(q.id.startsWith('model-'))reason='Reject: the old template either selects an arbitrary personal schedule, hands over the calculation, or offers an exact combinatorics exercise rather than an empirical estimation target.';
 else if(q.id.startsWith('gutenberg-'))reason='Reject: reading-speed, bytes-per-word and words-per-page assumptions define an artificial target. Replaced with an actual counted text and an estimation route from the work’s scale.';
 else if(q.id.startsWith('reasoning-wd-'))reason='Reject: invented weekly journals/newspapers turn historical dates into a conversion exercise; they do not ask a meaningful historical estimation question.';
 else if(/^nasa-[^-]+-(light|volume)$/.test(q.id)&&q.id!=='nasa-earth-volume'){
  keep=true;reason='Retain: estimate astronomical distance or relative radius, then use travel time or cubic scaling. A physical target, no discretionary visit/speed assumption, and no numerical source inputs given for free.';
  q.entity=q.entity.replace('nasa-','planet-');
  q.reasoningPath=q.id.endsWith('light')?'Estimate orbital distance in Earth–Sun distances, convert to distance, then divide by the speed of light.':'Estimate the radius relative to Earth, then cube the ratio; distinguish volume from a one-dimensional size ratio.';
 }
 else if(/^element-\d+-cube$/.test(q.id)&&familiarSolids.has(Number(q.id.split('-')[1]))){
  keep=true;reason='Retain familiar materials only: infer the block’s volume and estimate material density from familiar weights. The physical reference target is defined; no density is supplied in the prompt.';
  q.reasoningPath='Estimate volume from a 10 cm cube, estimate material density relative to water, then convert the mass to kilograms.';
 }
 else reason='Reject: direct recall, an obscure scientific property, unclear measurement, trivial identity, or no accessible multi-component estimation route.';
 q.review={...q.review,status:keep?'approved':'excluded',kind:keep?'estimation':'rejected-quality',reason,editorialChecks:{estimableComponents:keep,noCompleteCalculationInPrompt:keep,noPrivateBehaviourRate:keep,definedTarget:keep}};
 return q;
}
