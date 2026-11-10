import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url))),port=Number(process.env.PORT||4173);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.txt':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
 try{
  const raw=new URL(req.url,'http://localhost').pathname;
  let name=decodeURIComponent(raw);
  // /bracket/ is also served in development to test GitHub project-page paths.
  if(name.startsWith('/bracket/'))name=name.slice(8);
  if(name==='/')name='/index.html';
  if(name==='/favicon.svg')name='/public/favicon.svg';
  const resolved=path.resolve(root,'.'+name);
  if(!resolved.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
  const data=await fs.readFile(resolved);res.writeHead(200,{'Content-Type':mime[path.extname(resolved)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);
 }catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Bracket is ready at http://127.0.0.1:${port}\nProject subpath preview: http://127.0.0.1:${port}/bracket/`));
