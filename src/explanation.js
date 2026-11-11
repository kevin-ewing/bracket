import {unitExplanation} from './units.js';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function explanationView(q,system='metric'){
 const e=q.explanation,unitNote=unitExplanation(q,system);
 return `<section class="worked-explanation">${unitNote?`<p class="unit-explanation">${escape(unitNote)}</p>`:''}<h4>How to estimate it</h4><p class="estimation-route">${escape(e.approach)}</p>${e.reference?`<h4>One possible estimate</h4><p>${escape(e.example)}</p><h4>Published reference</h4><p>${escape(e.reference)}</p><h4>What changes your intuition</h4><p>${escape(e.insight)}</p>`:`<h4>Reference calculation</h4><ol>${e.steps.map(step=>`<li>${escape(step)}</li>`).join('')}</ol>`}<div class="reference-assumptions"><h4>What the reference assumes</h4><p>${escape(e.assumptions)}</p></div><h4>Sources</h4><ul class="explanation-sources">${e.sources.map(source=>`<li><a class="source-link" href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.name)} ↗</a><p>${escape(source.supports)}</p></li>`).join('')}</ul></section>`;
}
