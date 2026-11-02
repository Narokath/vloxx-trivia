import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist');
http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');let filename=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(filename===root)filename=path.join(root,'index.html');if(!filename.startsWith(root+path.sep))throw Error();const data=await readFile(filename);res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png'})[path.extname(filename)]||'application/octet-stream');res.end(data);}catch{res.statusCode=404;res.end('Not found');}}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
