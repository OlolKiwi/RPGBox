// Compartilhamento de fichas por link. Uso no server.js:
//   const share=require("./compartilhar")();      (antes do http.createServer)
//   e, como PRIMEIRA linha do tratador de requisições:  if(share.handle(req,res))return;
const fs=require("fs"),path=require("path"),crypto=require("crypto");

module.exports=function(){
 const FILE=path.join(__dirname,"data","compartilhadas.json"),AL="abcdefghjkmnpqrstuvwxyz23456789";
 const TTL=30*864e5,MAXN=500,MAXB=450000,MAXTOT=60e6;
 const AV=/^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+\/=]+$/;
 let DB={};try{DB=JSON.parse(fs.readFileSync(FILE,"utf8"))}catch(e){}
 let tm=null;
 const save=()=>{clearTimeout(tm);tm=setTimeout(()=>{try{fs.mkdirSync(path.dirname(FILE),{recursive:true});fs.writeFileSync(FILE+".tmp",JSON.stringify(DB));fs.renameSync(FILE+".tmp",FILE)}catch(e){console.log("compartilhadas: erro ao salvar:",e.message)}},800)};
 const total=()=>Object.keys(DB).reduce((a,k)=>a+DB[k].s.length,0);
 const clean=()=>{const n=Date.now();let ch=false;Object.keys(DB).forEach(k=>{if(n-DB[k].ts>TTL){delete DB[k];ch=true}});if(ch)save()};
 clean();setInterval(clean,36e5).unref();
 const hits=new Map();
 const ok=(ip,k,max,win)=>{
  const key=k+ip,n=Date.now();let h=hits.get(key);
  if(!h||n-h.t>win){h={t:n,c:0};hits.set(key,h)}
  if(hits.size>3000)hits.clear();
  return ++h.c<=max;
 };
 const json=(res,code,o)=>{
  const b=JSON.stringify(o);
  res.writeHead(code,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"});
  res.end(b);
 };
 const newId=()=>{let s;do{s="";for(let i=0;i<10;i++)s+=AL[crypto.randomInt(AL.length)]}while(DB[s]);return s};

 function handle(req,res){
  const u=(req.url||"").split("?")[0],ip=String(req.headers["cf-connecting-ip"]||req.socket.remoteAddress||"");
  const m=/^\/api\/ficha\/([a-z0-9]{10})$/.exec(u);
  if(u==="/api/ficha"){
   if(req.method!=="POST"){json(res,405,{erro:"Use POST."});return true}
   if(!ok(ip,"p",20,36e5)){json(res,429,{erro:"Muitos compartilhamentos. Tente mais tarde."});return true}
   let n=0,done=false;const ch=[];
   req.on("data",c=>{
    if(done)return;
    n+=c.length;
    if(n>MAXB+4000){done=true;json(res,413,{erro:"Ficha grande demais."});req.destroy();return}
    ch.push(c);
   });
   req.on("end",()=>{
    if(done)return;
    done=true;
    let d;try{d=JSON.parse(Buffer.concat(ch).toString("utf8"))}catch(e){return json(res,400,{erro:"JSON inválido."})}
    if(!d||typeof d!=="object"||Array.isArray(d))return json(res,400,{erro:"Ficha inválida."});
    if(d.sys!==undefined&&!/^[a-z0-9_-]{1,20}$/.test(String(d.sys)))return json(res,400,{erro:"Tipo de ficha inválido."});
    if(d.avatar!==undefined&&!(typeof d.avatar==="string"&&d.avatar.length<400000&&AV.test(d.avatar)))delete d.avatar;
    const s=JSON.stringify(d);
    if(s.length>MAXB)return json(res,413,{erro:"Ficha grande demais."});
    clean();
    if(Object.keys(DB).length>=MAXN||total()+s.length>MAXTOT)return json(res,507,{erro:"O servidor está cheio de fichas compartilhadas. Tente mais tarde."});
    const id=newId();
    DB[id]={s,ts:Date.now()};save();
    json(res,200,{id,dias:30});
   });
   req.on("error",()=>{});
   return true;
  }
  if(m){
   if(req.method!=="GET"){json(res,405,{erro:"Use GET."});return true}
   if(!ok(ip,"g",200,6e5)){json(res,429,{erro:"Muitas consultas."});return true}
   const x=DB[m[1]];
   if(!x||Date.now()-x.ts>TTL){if(x){delete DB[m[1]];save()}json(res,404,{erro:"Link inválido ou expirado."});return true}
   let d;try{d=JSON.parse(x.s)}catch(e){json(res,500,{erro:"Erro ao ler a ficha."});return true}
   json(res,200,{d,ts:x.ts});
   return true;
  }
  return false;
 }
 return{handle};
};
