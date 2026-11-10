import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const out=new URL('../dist/',import.meta.url);
const html=await fs.readFile(new URL('index.html',out),'utf8');
const checked=new Set();
async function checkAsset(ref,parent=out){
 const url=new URL(ref,parent);url.search='';url.hash='';
 const path=fileURLToPath(url);if(checked.has(path))return;checked.add(path);
 const content=await fs.readFile(url);
 if(path.endsWith('.js'))for(const match of content.toString().matchAll(/from\s*['"](\.\/[^'"]+)['"]/g))await checkAsset(match[1],url);
}
for(const match of html.matchAll(/(?:href|src)="(\.\/[^"?]+(?:\?[^" ]+)?)"/g))if(match[1]!=='./')await checkAsset(match[1]);
const image=await fs.readFile(new URL('social-card.png',out));
if(image.toString('hex',0,8)!=='89504e470d0a1a0a'||image.readUInt32BE(16)!==1200||image.readUInt32BE(20)!==630)throw Error('Sharing image must be a 1200 × 630 PNG.');
const bank=await import(new URL('src/bank.js',out));
if(bank.default.some(q=>!q.explanation||/^case-|^wb-|^model-/.test(q.id)))throw Error('Build contains retired or unexplained questions.');
console.log(`Verified ${checked.size} linked assets, ${bank.default.length} explained questions, and the sharing image.`);
