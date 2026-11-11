import fs from 'node:fs/promises';
import {VERSION} from '../src/core.js';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const out=new URL('../dist/',import.meta.url);
await fs.rm(out,{recursive:true,force:true});await fs.mkdir(out,{recursive:true});
await fs.copyFile(new URL('index.html',root),new URL('index.html',out));
await fs.cp(new URL('public/',root),out,{recursive:true});
await fs.mkdir(new URL('src/',out),{recursive:true});
const files=['app.js','core.js','questions.js','bank.js','config.js','style.css','interface.css','workspace.js','theme.js','visuals.js','score-style.js','reveal-layout.js','brand.js','calculator.js','explanation.js','units.js','year-questions.js'];
// One deterministic fingerprint keeps cached modules from mixing different editions.
const contents=await Promise.all(files.map(file=>fs.readFile(new URL('src/'+file,root),'utf8')));
const html=await fs.readFile(new URL('index.html',root),'utf8');
const favicon=await fs.readFile(new URL('public/favicon.svg',root),'utf8');
const revision=createHash('sha256').update([...contents,html,favicon].join('\0')).digest('hex').slice(0,12);
for(let i=0;i<files.length;i++){
 const content=files[i].endsWith('.js')?contents[i].replace(/(from\s*['"])(\.\/[a-z-]+\.js)(['"])/g,`$1$2?v=${revision}$3`):contents[i];
 await fs.writeFile(new URL('src/'+files[i],out),content);
}
await fs.writeFile(new URL('index.html',out),html.replace(/(href|src)="(\.\/(?:src\/[^"?]+|favicon\.svg))"/g,`$1="$2?v=${revision}"`));
await fs.writeFile(new URL('release.json',out),JSON.stringify({edition:VERSION,revision})+'\n');
await fs.writeFile(new URL('.nojekyll',out),'');
const stat=await fs.stat(new URL('src/bank.js',out));
console.log('Built dist/ — fully static; works at a domain root or repository subpath.');
console.log('Frozen bank:',(stat.size/1024/1024).toFixed(2),'MB before compression. No runtime dependencies.');
await import('./check-build.mjs');
