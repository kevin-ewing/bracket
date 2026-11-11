const familiarBooks=new Set([84,1661,345,43,145,2554,1260,37106,1184,2641,174,98,1727,74,23,25344,55,1400,4300,2591,161,76,768,41,844,120,45]);
// Each previously playable entry is reconsidered; no template gets automatic admission.
const retained=new Map([
 ['nasa-earth-light','A familiar distance and light speed make a useful first astronomical scale.'],
 ['nasa-jupiter-volume','One volume-scaling question: a familiar giant planet makes cubic growth surprising.'],
 ['nasa-mars-light','Travel-time intuition for a familiar exploration destination.'],
 ['fermi-text-1342','Recognisable full novel; measured text, no invented page count.'],
 ['fermi-text-11','Recognisable short children’s novel provides a different scale.'],
 ['fermi-text-2701','Recognisable unusually long novel contrasts with the short work.'],
 ['fermi-text-1513','A familiar play can be estimated from acts, scenes and dialogue.'],
 ['fermi-text-64317','Widely known short novel, actual measured English text.'],
 ['fermi-text-2600','A recognisably very long translated work; the exact linked edition is specified.'],
 ['fermi-orbit-speed-earth','Connects a familiar year with the size of Earth’s orbit.'],
 ['fermi-radio-mars-farthest','Communication delay explains why remote space control differs from local control.'],
 ['fermi-rain-court-football','One familiar area-and-depth estimate reveals the surprising mass of rain.'],
 ['fermi-pack-golf-suitcase','One packing estimate; a familiar container requires allowance for gaps.'],
 ['fermi-cash-notes-mass','A memorable physical scale for a billion dollars.'],
 ['fermi-cash-stack-height','A linear accumulation contrasts with mass; shared entity prevents same-day repetition.'],
 ['fermi-ocean-global-layer','A familiar geographical proportion produces a surprising planet-wide depth.'],
 ['fermi-earth-belt','A single counterintuitive geometry puzzle; radius cancels rather than needing an obscure fact.'],
 ['fermi-earth-rotation-film','Connects everyday time to otherwise unnoticed planetary motion.'],
 ['fermi-audio-cd','One data-rate reconstruction, grounded in a familiar medium.'],
 ['fermi-video-minute-4k','One video estimate reveals why compression matters; no resolution variants.'],
 ['fermi-pyramid-volume','A familiar historical structure supports a visible geometric estimate.']
]);
export function worldReview(q){
 if(q.id.startsWith('world-'))return q;
 if(q.id==='nasa-jupiter-volume')q={...q,answer:143128/108.321,context:'Compare the planets’ volumes, not their masses or the packing of intact spheres.'};
 let reason=retained.get(q.id);
 if(q.id.startsWith('fermi-text-') && familiarBooks.has(Number(q.id.slice(11)))) {
  reason='Recognisable complete public-domain work. Estimate reading scale from comparable editions, then use the frozen token count as the reference.';
 }
 const keep=Boolean(reason);
 if(!keep){
  if(/^element-|^fermi-(sheet|golf-solid)-/.test(q.id))reason='Reject: contrived material substitution. The main unknown is an unmemorable density; changing the element does not create a new insight.';
  else if(/^nasa-|^fermi-(orbit-speed|horizon|surface|penny-scale|radio)-/.test(q.id))reason='Reject: repeated planet substitution or artificial smooth-sphere/coin scaling. Keep only a small set of familiar astronomical scales and communication delay.';
  else if(q.id.startsWith('fermi-text-'))reason='Reject: repetitive word-count mechanism, less familiar work, translation/annotation scope or overlapping anthology. Keep familiar, complete works with a useful scale comparison.';
  else if(/^fermi-(paper-court|air-court|rain-court|pack|ball-marathon|coins-marathon|million-cash|coin-cube|water-heat|frame|video-minute)-/.test(q.id))reason='Reject: repeated geometry, contrived conversion, discretionary packing variation or classroom-style formula substitution. Retain only selected questions that reveal a useful real-world scale.';
  else if(q.id==='fermi-ocean-moon-layer')reason='Reject: physically artificial transfer to the Moon, with a thin-shell approximation that is unnecessarily awkward to define.';
  else if(q.id==='fermi-ocean-pressure')reason='Reject: an obscure mean-depth/density/pressure conversion with weak everyday anchors.';
  else if(q.id==='fermi-ocean-salt-layer')reason='Reject: compounds obscure seawater and dry-salt properties with artificial redistribution; too much hidden reference machinery.';
  else if(q.id==='fermi-washington-envelope')reason='Reject: detailed frustum dimensions dominate; the pyramid is a clearer historical geometry challenge.';
  else return q; // Already excluded historical candidates preserve their original specific review.
 }
 return {...q,review:{...q.review,status:keep?'approved':'excluded',kind:keep?'estimation':'rejected-quality',reason:`${reason} Reviewed target: ${q.question} Reference: ${q.answer} ${q.unitLabel||q.unit}.`,editorialChecks:{estimableComponents:keep,noCompleteCalculationInPrompt:keep,noPrivateBehaviourRate:keep,definedTarget:keep}}};
}
