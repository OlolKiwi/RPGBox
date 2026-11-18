const http=require("http"),fs=require("fs"),path=require("path"),crypto=require("crypto");
const {WebSocketServer}=require("ws");
const PORT=+process.env.PORT||8080;
const ROOT=path.resolve(process.env.ROOT||path.join(__dirname,"public"));
const DATA_DIR=path.resolve(process.env.DATA_DIR||path.join(__dirname,"data"));try{fs.mkdirSync(DATA_DIR,{recursive:true})}catch(e){}
const MIME={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".ico":"image/x-icon"};

const share=require("./compartilhar")();

const server=http.createServer((req,res)=>{
  if(share.handle(req,res))return;
 if(req.method!=="GET"&&req.method!=="HEAD"){res.writeHead(405);return res.end()}
 let p;try{p=decodeURIComponent(new URL(req.url,"http://x").pathname)}catch(e){res.writeHead(400);return res.end()}
 if(p.endsWith("/"))p+="index.html";
 const f=path.normalize(path.join(ROOT,p));
 if(!f.startsWith(ROOT+path.sep)){res.writeHead(403);return res.end()}
 fs.readFile(f,(err,buf)=>{
  if(err){res.writeHead(404,{"Content-Type":"text/plain; charset=utf-8"});return res.end("Não encontrado")}
  res.writeHead(200,{"Content-Type":MIME[path.extname(f).toLowerCase()]||"application/octet-stream","Cache-Control":"no-cache","X-Content-Type-Options":"nosniff"});
  res.end(req.method==="HEAD"?undefined:buf);
 });
});

const wss=new WebSocketServer({noServer:true,maxPayload:30*1024*1024});
server.on("upgrade",(req,socket,head)=>{
 wss.handleUpgrade(req,socket,head,ws=>wss.emit("connection",ws,req));
});
const rooms=new Map(),AL="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
try{fs.readdirSync(DATA_DIR).forEach(function(f){if(!/^room_[A-Z0-9]{6}\.json$/.test(f))return;var r=loadRoom(f.slice(5,-5));if(r)rooms.set(r.code,r)})}catch(e){}
const MAX_ROOMS=30,MAX_PLAYERS=12,MAX_ASSET=12e6,MAX_ROOM_BYTES=80e6,TTL=15*60e3;
const send=(ws,o)=>{if(ws&&ws.readyState===1)ws.send(JSON.stringify(o))};
const cname=s=>String(s||"").replace(/[\u0000-\u001f<>]/g,"").trim().slice(0,20);
const RX=/^[A-Z0-9]{6}$/;
const MASTER=String(process.env.MASTER_CODE||"");
const S_=(v,n)=>String(v==null?"":v).replace(/[\u0000-\u001f<>]/g,"").slice(0,n);
const I_=(v,a,b)=>{v=parseInt(v,10);return Math.max(a,Math.min(b,isNaN(v)?0:v))};
function cleanFs(f){
 if(!f||typeof f!=="object")return null;
 return{name:S_(f.name,60)||"Sem nome",info:(Array.isArray(f.info)?f.info:[]).slice(0,3).map(x=>S_(x,120)),
  bars:(Array.isArray(f.bars)?f.bars:[]).slice(0,8).map(b=>{b=b||{};const m=I_(b.m,0,99999);return{n:S_(b.n,40),m,c:Math.min(m,I_(b.c,0,99999)),col:/^#[0-9a-f]{6}$/i.test(b.col)?b.col:"#2fa56b"}})};
}
if(!MASTER)console.log("ATENÇÃO: MASTER_CODE não definido, ninguém consegue criar sala.");
const sign=c=>crypto.createHmac("sha256",MASTER||"x").update(c).digest("hex").slice(0,24);
const same=(a,b)=>{const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&crypto.timingSafeEqual(x,y)};
const fails=new Map();
const blocked=ip=>{const f=fails.get(ip);return!!f&&f.n>=5&&Date.now()-f.t<15*60e3};
const fail=ip=>{if(fails.size>500)fails.clear();const f=fails.get(ip);if(!f||Date.now()-f.t>15*60e3)fails.set(ip,{n:1,t:Date.now()});else{f.n++;f.t=Date.now()}};
const DEFP={add:false,edit:false,move:false,ptr:true};
const permsFor=(r,n)=>Object.assign({},DEFP,r.perms[String(n).toLowerCase()]||{});
function newCode(){let c;do{c="";for(let i=0;i<6;i++)c+=AL[crypto.randomInt(AL.length)]}while(rooms.has(c));return c}

function roomFile(code){return path.join(DATA_DIR,"room_"+code+".json")}
function saveRoom(r){
 if(!r||!r.code)return;
 try{
  const data={code:r.code,key:r.key,hostName:r.hostName,perms:r.perms||{},camp:r.camp||{notes:"",rolls:[],sheets:[],docs:[],board:{nodes:[],edges:[]}},scene:r.scene||null};
  const tmp=roomFile(r.code)+".tmp";
  fs.writeFileSync(tmp,JSON.stringify(data));
  try{fs.renameSync(tmp,roomFile(r.code))}catch(e){fs.writeFileSync(roomFile(r.code),JSON.stringify(data))}
  console.log("saveRoom OK",r.code);
 }catch(e){console.error("saveRoom FAIL",r.code,e&&e.message)}
}
function loadRoom(code){
 try{
  const buf=fs.readFileSync(roomFile(code));
  const d=JSON.parse(buf.toString());
  console.log("loadRoom OK",code);
  if(!d||!d.code)return null;
  return {code:d.code,key:d.key,host:null,hostName:d.hostName||"Mestre",players:new Map(),scene:d.scene||null,assets:new Map(),bytes:0,timer:null,perms:d.perms||{},camp:d.camp||{notes:"",rolls:[],sheets:[],docs:[],board:{nodes:[],edges:[]}}};
 }catch(e){return null}
}

function list(r){const l=[];if(r.host)l.push({n:r.hostName,gm:true});r.players.forEach(p=>l.push({n:p.name,gm:false}));return l}
function toPlayers(r,o){r.players.forEach(p=>send(p.ws,o))}
function toAll(r,o,except){if(r.host&&r.host!==except)send(r.host,o);r.players.forEach(p=>{if(p.ws!==except)send(p.ws,o)})}
function filt(sc){return sc?Object.assign({},sc,{tokens:(sc.tokens||[]).filter(t=>t&&!t.hid)}):null}

function handle(ws,m,raw){
 const r=ws.room;
 switch(m.t){
  case "pg":{if(typeof m.ts==="number")send(ws,{t:"pg",ts:m.ts});return}
   case "snd":{
  if(!r||!ws.gm)return;
  const a=m.a;
  if(a!=="play"&&a!=="stop"&&a!=="stopall"&&a!=="loop"&&a!=="vol")return;
  const o={t:"snd",a};
  if(typeof m.h==="string"&&/^[a-z0-9]{3,24}$/.test(m.h))o.h=m.h;
  if(m.l===true)o.l=true;
  if(Number.isFinite(m.v))o.v=Math.max(0,Math.min(1,m.v));
  if(a==="play"&&Array.isArray(m.to)){
   const set=new Set(m.to.slice(0,12).map(n=>String(n).toLowerCase().slice(0,20)));
   r.players.forEach((p,k)=>{if(set.has(k))send(p.ws,o)});
   return;
  }
  toPlayers(r,o);return;
 }
  case "pos":{
  if(!r||!ws.gm||!r.scene||!Array.isArray(m.p)||m.p.length>300)return;
  const hid=new Set((r.scene.tokens||[]).filter(t=>t&&t.hid).map(t=>t.id)),pm=new Map();
  for(const e of m.p)if(Array.isArray(e)&&typeof e[0]==="string"&&Number.isFinite(e[1])&&Number.isFinite(e[2]))pm.set(e[0],[e[1],e[2]]);
  for(const t of r.scene.tokens||[]){const q=t&&pm.get(t.id);if(q){t.x=q[0];t.y=q[1]}}
  toPlayers(r,{t:"pos",p:m.p.filter(e=>Array.isArray(e)&&!hid.has(e[0]))});return;
 }
  case "fs":{
  if(!r||ws.gm)return;
  const p=r.players.get(ws.name.toLowerCase());if(!p||p.ws!==ws)return;
  p.fs=cleanFs(m.f);
  if(r.host)send(r.host,{t:"fs",by:ws.name,f:p.fs});return;
 }
 case "rl":{
  if(!r||ws.gm||!r.host)return;
  const l=S_(m.l,60);if(!l)return;
  send(r.host,{t:"rl",by:ws.name,c:S_(m.c,60),l,x:S_(m.x,200),ts:Date.now()});return;
 }
 case "create":{
  if(r)return;
  const name=cname(m.name);if(!name)return send(ws,{t:"error",m:"Digite um nome."});
  const want=typeof m.room==="string"&&RX.test(m.room)?m.room:null;
  let room=want?rooms.get(want):null;
  if(room&&!same(room.key,m.key))return send(ws,{t:"error",m:"Essa sala já existe com outro mestre."});
  if(!room){
       if(!(want&&typeof m.key==="string"&&same(m.key,sign(want)))){
    if(blocked(ws.ip))return send(ws,{t:"error",m:"Muitas tentativas. Aguarde alguns minutos."});
    if(!MASTER||!same(m.mc||"",MASTER)){fail(ws.ip);return send(ws,{t:"error",m:"Código de mestre inválido."})}
   }
   if(rooms.size>=MAX_ROOMS)return send(ws,{t:"error",m:"O servidor está com salas demais. Tente mais tarde."});
   const code=want||newCode();
   room={code,key:sign(code),host:null,hostName:name,players:new Map(),scene:null,assets:new Map(),bytes:0,timer:null,perms:{},camp:{name:"Campanha",notes:"",rolls:[],sheets:[],docs:[],board:{nodes:[],edges:[]},wallpaper:"",theme:null}}
   rooms.set(code,room);
  }
  const old=room.host;room.host=ws;
  if(old&&old!==ws){try{old.close()}catch(e){}}
  if(room.timer){clearTimeout(room.timer);room.timer=null}
  room.hostName=name;ws.room=room;ws.name=name;ws.gm=true;
  if(m.cname)room.camp.name=cname(m.cname);
  send(ws,{t:"joined",room:room.code,key:room.key,role:"gm",name});
  if(room.camp)send(ws,{t:"campstate",d:room.camp});
  room.players.forEach(p=>{if(p.fs)send(ws,{t:"fs",by:p.name,f:p.fs})});
  toPlayers(room,{t:"host",on:true});toAll(room,{t:"list",l:list(room)});
  return;
 }
 case "join":{
  if(r)return;
  const room=rooms.get(String(m.room||"").toUpperCase());
  if(!room)return send(ws,{t:"error",m:"Sala não encontrada."});
  const name=cname(m.name);if(!name)return send(ws,{t:"error",m:"Digite um nome."});
  const sid=/^[a-f0-9]{8,32}$/.test(m.sid||"")?m.sid:"",k=name.toLowerCase();
  if(room.hostName.toLowerCase()===k)return send(ws,{t:"error",m:"Esse nome é do mestre."});
  const ex=room.players.get(k);
  if(ex){if(sid&&ex.sid===sid){try{ex.ws.close()}catch(e){}}else return send(ws,{t:"error",m:"Já existe alguém com esse nome na sala."})}
  else if(room.players.size>=MAX_PLAYERS)return send(ws,{t:"error",m:"A sala está cheia."});
  room.players.set(k,{ws,name,sid});ws.room=room;ws.name=name;ws.gm=false;
  send(ws,{t:"joined",room:room.code,role:"player",name});
  for(const [h,src] of room.assets)send(ws,{t:"asset",h,src});
  if(room.scene)send(ws,{t:"scene",d:filt(room.scene)});
  send(ws,{t:"host",on:!!room.host});
  if(room.camp)send(ws,{t:"campstate",d:room.camp});
send(ws,{t:"me",p:permsFor(room,name)});
  toAll(room,{t:"list",l:list(room)});
  return;
 }
 case "asset":{
  if(!r||!ws.gm)return;
  if(typeof m.h!=="string"||!/^[a-z0-9]{3,24}$/.test(m.h)||typeof m.src!=="string"||m.src.length>MAX_ASSET||!/^data:(image\/(webp|png|jpeg)|audio\/[a-z0-9.+-]{2,20});base64,/.test(m.src.slice(0,64)))return;
  if(r.assets.has(m.h))return;
  if(r.bytes+m.src.length>MAX_ROOM_BYTES)return send(ws,{t:"error",m:"Limite de imagens da sala atingido."});
  r.assets.set(m.h,m.src);r.bytes+=m.src.length;
  toPlayers(r,{t:"asset",h:m.h,src:m.src});return;
 }
 case "scene":{
  if(!r||!ws.gm||!m.d||typeof m.d!=="object"||raw.length>4e6)return;
  r.scene=m.d;toPlayers(r,{t:"scene",d:filt(m.d)});return;
 }
 case "mv":{
  if(!r||ws.gm||!r.host||!r.scene)return;
  const t=(r.scene.tokens||[]).find(t=>t&&t.id===m.id);
  if(!t||t.hid||!Number.isFinite(m.x)||!Number.isFinite(m.y))return;
  if(t.own!==ws.name&&!permsFor(r,ws.name).move)return;
  send(r.host,{t:"mv",id:m.id,x:m.x,y:m.y,by:ws.name});return;
 }
 case "ping":{
  if(!r||!Number.isFinite(m.x)||!Number.isFinite(m.y))return;
  if(!ws.gm&&!permsFor(r,ws.name).ptr)return;
  toAll(r,{t:"ping",x:m.x,y:m.y,by:ws.name},ws);return;
 }
 case "perms":{
  if(!r||!ws.gm||!m.p||typeof m.p!=="object")return;
  const np={};
  for(const k of Object.keys(m.p).slice(0,40)){
   const v=m.p[k];if(!v||typeof v!=="object")continue;
   np[String(k).toLowerCase().slice(0,20)]={add:v.add===true,edit:v.edit===true,move:v.move===true,ptr:v.ptr!==false};
  }
  r.perms=np;
  r.players.forEach(p=>send(p.ws,{t:"me",p:permsFor(r,p.name)}));
  return;
 }
 case "op":{
  if(!r||ws.gm||!r.host||!m.o||typeof m.o!=="object"||raw.length>300000)return;
  const P=permsFor(r,ws.name),k=m.o.k;
  const ok=(k==="add"&&P.add)||((k==="upd"||k==="img"||k==="del")&&P.edit);
  if(!ok)return;
  send(r.host,{t:"op",by:ws.name,o:m.o});return;
 }
  case "campact":{
   if(!r||ws.gm||!r.host)return;
   if(!m.a||typeof m.a!=="string")return;
   send(r.host,{t:"campact",by:ws.name,a:m.a,d:m.d});return;
  }
  case "campstate":{
   if(!r||!ws.gm)return;
   if(!m.d||typeof m.d!=="object")return;
   r.camp=m.d;
   saveRoom(r);
   toPlayers(r,{t:"campstate",d:m.d});return;
  }
 }
}
function leave(ws){
 const r=ws.room;if(!r)return;
 if(ws.gm){
  if(r.host!==ws)return;
  r.host=null;toPlayers(r,{t:"host",on:false});toAll(r,{t:"list",l:list(r)});
  r.timer=setTimeout(()=>{rooms.delete(r.code);r.players.forEach(p=>{try{p.ws.close()}catch(e){}})},TTL);
 }else{
  const k=ws.name.toLowerCase(),p=r.players.get(k);
  if(!p||p.ws!==ws)return;
  r.players.delete(k);toAll(r,{t:"list",l:list(r)});
 }
}
wss.on("connection",(ws,req)=>{
 ws.ip=String(req.headers["cf-connecting-ip"]||req.socket.remoteAddress||"");
 ws.room=null;ws.name="";ws.gm=false;ws.n=0;ws.t=Date.now();ws.dead=false;
 ws.on("pong",()=>{ws.dead=false});
 ws.on("message",(data,isBin)=>{
  if(isBin)return;
  const now=Date.now();if(now-ws.t>5000){ws.t=now;ws.n=0}
  if(++ws.n>400)return;
  const raw=data.toString();let m;
  try{m=JSON.parse(raw)}catch(e){return}
  if(m&&typeof m.t==="string")handle(ws,m,raw);
 });
 ws.on("close",()=>leave(ws));
 ws.on("error",()=>{});
});
setInterval(()=>{wss.clients.forEach(ws=>{if(ws.dead)return ws.terminate();ws.dead=true;try{ws.ping()}catch(e){}})},30000);
server.listen(PORT,"0.0.0.0",()=>console.log("RPGBox rodando em http://localhost:"+PORT+" (site em "+ROOT+")"));