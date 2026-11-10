// Every playable family needs an explicit explanation recipe. No generic fallback.
const f=n=>new Intl.NumberFormat('en-US',{maximumSignificantDigits:6}).format(n);
const source=(name,url,supports)=>({name,url,supports});
const paper=source('Cambridge · ISO paper sizes','https://www.cl.cam.ac.uk/~mgk25/iso-paper.html','A4 dimensions: 210 × 297 mm.');
const mint=source('U.S. Mint · coin specifications','https://www.usmint.gov/learn/coins-and-medals/circulating-coins/coin-specifications','Modern coin diameters, thicknesses and masses.');
const marathon=source('World Athletics · marathon','https://worldathletics.org/disciplines/roadrunning/marathon','The official course distance: 42.195 km.');
const nasa=source('NASA · planetary fact sheets','https://nssdc.gsfc.nasa.gov/planetary/factsheet/','Reference planetary diameters, orbital distances and periods.');
const golf=source('USGA · golf ball size','https://www.usopen.com/etc/designs/usga/content/rule-book/rule-book-2016/rule-14324.html','Minimum regulation diameter: 42.67 mm.');
const packing=source('Emory Weeks Lab · random close packing','https://faculty.college.emory.edu/sites/weeks/lab/rcp/index.html','The approximate 64% bulk packing fraction for equal spheres.');
const air=source('NASA · U.S. Standard Atmosphere','https://ntrs.nasa.gov/api/citations/20180006898/downloads/20180006898.pdf','Sea-level air density: 1.225 kg/m³ at 15°C.');

export function explainQuestion(original){
 const q={...original},id=q.id;
 let approach,note,supports,extra=[];
 if(/^element-\d+-cube$/.test(id)){
  const material=q.question.match(/cube of (.+) weigh/)[1];
  approach=`A 10 cm cube holds one litre. Compare the density of ${material} with water: a litre of water weighs about one kilogram.`;
  q.hint=`Find the cube’s volume, then multiply by density. Reference ${material} density: ${f(q.answer)} g/cm³.`;
  q.steps=['Volume = 10 × 10 × 10 = 1,000 cm³.',`Mass ≈ 1,000 × ${f(q.answer)} = ${f(q.answer*1000)} grams.`,`Divide by 1,000: ≈ ${f(q.answer)} kilograms.`];
  note='Pure solid material with no cavities. Density varies with temperature and composition; this target uses the frozen PubChem value.';
  supports=`The reference density of ${material}.`;
 }else if(/^nasa-.*-(light|volume)$/.test(id)){
  const volume=id.endsWith('volume');
  approach=volume?'Estimate the diameter compared with Earth, then cube that ratio. Doubling a diameter multiplies volume by eight.':'Estimate the Sun–body distance in Earth–Sun distances. Light takes roughly eight minutes to cross one Earth–Sun distance.';
  if(volume){const body=q.hint.match(/Diameters: ([\d,]+) km/);const diameter=Number(body?.[1].replaceAll(',',''));if(!diameter)throw Error('Missing diameter '+id);
   q.hint=`Estimate the diameter ratio and cube it. Reference diameters: ${f(diameter)} km for this body and 12,756 km for Earth.`;
   q.steps=[`Diameter ratio ≈ ${f(diameter)} ÷ 12,756 = ${f(diameter/12756)}.`,'For spheres, volume scales as diameter cubed.',`Volume ratio ≈ (${f(diameter/12756)})³ ≈ ${f(q.answer)} Earth volumes.`];
   note='A spherical volume comparison using the listed equatorial diameters. This does not describe packing intact Earth-sized spheres inside another planet.';
  }else{const km=q.answer*60*300000;
   q.hint=`Estimate distance and divide by light speed. Reference mean distance: ${f(km/1e6)} million km; light speed: about 300,000 km/s.`;
   q.steps=[`Mean Sun–body distance ≈ ${f(km/1e6)} million km.`,`One-way time ≈ ${f(km)} ÷ 300,000 ≈ ${f(km/300000)} seconds.`,`Convert seconds to minutes: ≈ ${f(q.answer)} minutes.`];
   note='One-way sunlight travel time at the mean distance from the Sun. Orbital motion makes the actual distance vary.';
  }
  supports='The listed planetary diameters and mean distances from the Sun.';
 }else if(id.startsWith('fermi-text-')){
  approach='Picture the length of this work in an ordinary printed edition. Estimate pages and words per page, multiply, then widen your interval for differences between editions.';
  note='The target is a measured word-token count of the linked English text, including its body headings and notes. A page estimate helps establish scale; it does not define the scored answer.';
  supports='The specific public-domain English text that was counted. Bracket calculated its word-token count.';
 }else if(id.startsWith('fermi-orbit-speed-')){
  approach='Picture a circular orbit. Estimate its radius in Earth–Sun distances, find its circumference, and divide by the planet’s orbital period.';
  note='A circular-orbit estimate using the mean orbital radius and period. Real speed changes around an elliptical orbit.';
  supports='Mean orbital distance and orbital period.';
 }else if(id.startsWith('fermi-horizon-')){
  approach='Draw a triangle joining the planet’s centre, the horizon, and the observer. The sightline is tangent to the sphere, so the triangle has a right angle.';
  note='Geometric line of sight on a smooth sphere, excluding terrain and atmospheric refraction. The diameter is the reference size of the body.';
  supports='The reference planetary diameter.';
 }else if(id.startsWith('fermi-surface-')){
  approach='Estimate the diameter ratio relative to Earth, then square it: surface area scales with length squared.';
  note='Smooth spherical surface areas using the listed equatorial diameters; rings and surface terrain are excluded.';
  supports='The two reference planetary diameters.';
 }else if(id.startsWith('fermi-penny-scale-')){
  approach='Estimate how many times wider the body is than Earth. Apply the same ratio to the width of a penny.';
  note='Both bodies use the same linear scale. A US penny is 19.05 mm across; the planet sizes use NASA’s listed diameters.';
  supports='The two reference planetary diameters.';extra=[mint];
 }else if(id.startsWith('fermi-radio-')){
  approach='At the nearest alignment, subtract orbital radii; at the farthest alignment, add them. Double the separation for a reply, then divide by light speed.';
  note='Circular, coplanar reference orbits and an immediate reply. Actual orbital eccentricity, signal routing and processing delays are excluded.';
  supports='Mean orbital distances from the Sun.';
 }else if(id.startsWith('fermi-sheet-')){
  approach='Estimate the area of a sheet of office paper. Multiply area by the metal thickness to obtain volume, then use density to find mass.';
  note='A solid 1 mm sheet with the A4 outline and no holes. The mass uses the pure element’s reference density.';
  supports='The material’s reference density.';extra=[paper];
 }else if(id.startsWith('fermi-golf-solid-')){
  approach='Estimate the ball’s radius, cube it in the sphere-volume formula, and multiply by material density. Check the scale against an equal volume of water.';
  note='A smooth, solid sphere 42.67 mm in diameter. Real golf-ball dimples and layered construction are excluded.';
  supports='The material’s reference density.';extra=[golf];
 }else if(id.startsWith('fermi-paper-court-')){
  approach='Estimate the playing surface’s length and width. Divide its area by the area of a sheet of office paper.';
  note='This compares areas; it does not solve an exact tiling arrangement or allow for trimming, overlap or gaps.';
  supports='The playing surface’s reference length and width.';extra=[paper];
 }else if(id.startsWith('fermi-rain-court-')){
  approach='Estimate the playing area, multiply by the water depth, then use one tonne per cubic metre of water.';
  note='An even one-centimetre layer over the full playing surface, with no drainage or runoff. Water density is rounded to 1,000 kg/m³.';
  supports='The playing surface’s reference length and width.';
 }else if(id.startsWith('fermi-air-court-')){
  approach='Estimate the playing area, multiply by ten metres to obtain the air volume, then multiply by sea-level air density.';
  note='Only the ten-metre column is counted. The air is at standard sea-level conditions, 15°C; this is not the mass of the whole atmosphere.';
  supports='The playing surface’s reference length and width.';extra=[air];
 }else if(id.startsWith('fermi-pack-')){
  approach='Estimate a ball’s diameter and spherical volume. Divide container volume by ball volume, then allow for air gaps between the balls.';
  note='The scoring reference uses 64% random close packing. Actual counts depend on packing technique and container boundaries, especially in smaller containers.';
  supports='The regulation ball diameter.';extra=[packing];
 }else if(id.startsWith('fermi-ball-marathon-')){
  approach='Convert the marathon distance to metres, estimate one ball’s diameter, and divide distance by diameter.';
  note='A straight chain of touching balls with no gaps. Unlike a runner’s step length, the ball diameter has a defined regulation reference.';
  supports='The regulation ball diameter.';extra=[marathon];
 }else if(id.startsWith('fermi-coins-marathon-')){
  approach='Estimate how many coin diameters span the course, then multiply that count by the weight of one coin.';
  note='Modern coins lie flat, edge to edge. The target uses the official marathon distance and the Mint’s nominal coin dimensions and mass.';
  supports='The modern coin diameter and nominal mass.';extra=[marathon];
 }else if(id.startsWith('fermi-million-cash-')){
  approach='Find how many coins make one million dollars, then multiply by the mass of a coin. Keep face value separate from metal value.';
  note='Modern circulating coin specifications, without packaging. Older compositions and collectible values are excluded.';
  supports='The modern coin denomination and nominal mass.';
 }else if(id.startsWith('fermi-coin-cube-')){
  approach='Estimate one coin’s diameter and thickness to obtain its cylindrical volume. Find how many coin volumes make a cubic metre, then multiply by face value.';
  note='One cubic metre of metal-volume equivalents, excluding air gaps. A real box of coins would contain fewer because of packing gaps.';
  supports='The modern coin diameter, thickness and face value.';
 }else if(id==='fermi-cash-notes-mass'){
  approach='Divide the dollar amount by the denomination, then estimate the mass of one banknote. Convert the total from grams to tonnes.';
  note='A banknote weighs approximately one gram, regardless of denomination. Straps, boxes and pallets are excluded.';
  supports='Approximate mass per US banknote.';
 }else if(id==='fermi-cash-stack-height'){
  approach='Divide the amount by the denomination to get the note count. Multiply by the thickness of one sheet of banknote paper.';
  note='The reference thickness is rounded to 0.11 mm. Compression, wear and packaging change the height of a real stack.';
  supports='The published mile-high banknote-stack comparison used to estimate note thickness.';
 }else if(id==='fermi-ocean-global-layer'||id==='fermi-ocean-moon-layer'){
  approach='Estimate the total volume of ocean water. Divide by the area of the smooth sphere it would cover.';
  note=id.includes('moon')?'This uses the thin-layer approximation, volume divided by the Moon’s surface area. A full spherical-shell calculation gives a slightly smaller depth. Gravity and the ability to retain the ocean are outside the model.':'The reference smooths away all land and seabed relief and divides ocean volume by the entire Earth’s surface area.';
  supports='The reference ocean-water volume.';extra=[nasa];
 }else if(id==='fermi-ocean-pressure'){
  approach='Estimate average ocean depth from water volume divided by ocean area. Hydrostatic pressure grows with water density, gravity and depth.';
  note='Gauge pressure from seawater alone, using constant density 1,025 kg/m³ and gravity 9.80665 m/s². The atmosphere above the water is excluded.';
  supports='The reference ocean volume and surface area.';
 }else if(id==='fermi-ocean-salt-layer'){
  approach='Estimate ocean mass, take its salt fraction, and turn that mass into a solid volume. Divide by the whole Earth’s surface area.';
  note='Treat all dissolved salts as dry crystalline salt with density 2,160 kg/m³. Seawater is 1,025 kg/m³ with a 3.5% salt mass fraction. This is a simplified composition model.';
  supports='The reference ocean volume and salinity.';extra=[nasa,source('University of Kansas · halite','https://geokansas.ku.edu/halite-salt','The rounded solid-salt density.')];
 }else if(id==='fermi-earth-belt'){
  approach='Compare the old and new circumferences algebraically. Both include the same Earth-radius term, which cancels out.';
  note='A circular belt raised one metre radially everywhere above a spherical Earth. The result depends only on the lift height, not the size of Earth.';
  q.source=source('OpenStax · circular motion','https://openstax.org/books/college-physics/pages/6-1-rotation-angle-and-angular-velocity','The circumference relation C = 2πr.');supports=q.source.supports;
 }else if(id==='fermi-earth-rotation-film'){
  approach='Estimate Earth’s circumference, then take the fraction of a rotation represented by two hours.';
  note='Use a 24-hour rotation and the 6,371 km mean Earth radius. Count motion around Earth’s axis only; orbital motion is excluded.';
  supports='The reference mean Earth radius.';
 }else if(id.startsWith('fermi-water-heat-')){
  approach='Convert water volume to mass, find the temperature rise, then multiply mass × specific heat × temperature rise.';
  note='Heat water from 20°C to the onset of boiling at 100°C. Ignore the container and heat losses; energy to turn water into steam is excluded.';
  supports='The reference specific heat of liquid water, about 4.186 kJ/(kg·°C).';
 }else if(id==='fermi-audio-cd'){
  approach='Reconstruct a second of audio from samples per second, bits per sample and stereo channels. Convert bits to bytes and seconds to an hour.';
  note='Raw 44.1 kHz, 16-bit stereo PCM samples. Decimal megabytes; no compression, headers or metadata.';
  q.source=source('Sony · digital audio guide','https://www.sony.com/electronics/support/articles/00165079','CD audio sampling rate and bit depth.');
  supports='CD audio sampling rate (44.1 kHz) and bit depth (16 bits).';
 }else if(id.startsWith('fermi-frame-')||id.startsWith('fermi-video-minute-')){
  approach=id.includes('video-minute')?'Estimate pixels per frame and bytes per pixel, then multiply by the frame count in one minute.':'Estimate pixels across and down, multiply to get the pixel count, then allow three bytes for each RGB pixel.';
  note='UHD 4K is 3840 × 2160, UHD 8K is 7680 × 4320, and Full HD is 1920 × 1080. The model uses 24-bit RGB, decimal storage units, and no compression or overhead.';
  if(id.endsWith('-hd'))q.source=source('ITU · HDTV image formats','https://www.itu.int/rec/R-REC-BT.709/en','Full HD image dimensions.');
  supports=id.endsWith('-hd')?'Full HD image dimensions: 1920 × 1080 pixels.':'UHD television image dimensions.';
 }else if(id==='fermi-pyramid-volume'){
  approach='Estimate the side of the square base and the original height. A pyramid occupies one-third of the enclosing box.';
  note='The original complete external envelope, using a 230.3 m base side and 146.5 m height. Interior chambers are not subtracted.';
  supports='The approximate original height of the complete Great Pyramid.';
  extra=[source('Harvard Giza archive · Magli (2009)','https://gizamedia.rc.fas.harvard.edu/documents/magli_nexus_11_2009.pdf','The approximate 230.3 m base side.')];
 }else if(id==='fermi-washington-envelope'){
  approach='Split the monument into a tapering square shaft and a pyramid at the top. Estimate the dimensions of each, calculate their volumes, and add them.';
  note='The outer geometric envelope includes hollow interior space. The survey dimensions are approximated as a square frustum topped by a square pyramid.';
  supports='Survey dimensions of the shaft, base, shoulder and top pyramid.';
 }else throw Error('No reviewed explanation recipe: '+id);
 q.reasoningPath=approach;q.fact=note;
 const primary={...q.source,supports};
 q.sources=[primary,...extra].filter((s,i,all)=>all.findIndex(t=>t.url===s.url)===i);
 q.explanation={approach,assumptions:note,steps:q.steps,sources:q.sources};
 return q;
}
