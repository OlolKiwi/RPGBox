var FICHAS=(function(){
 var IDX="vtt-fichas",PRE="vtt-ficha:",LEG="vtt-ficha-universal",MAX=10,RX=/^f[a-z0-9]{6,14}$/;
 function rd(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}}
 function wr(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}
 function newId(){return "f"+Date.now().toString(36).slice(-6)+Math.random().toString(36).slice(2,6)}
 function list(){
  var a=rd(IDX);
  a=Array.isArray(a)?a.filter(function(x){return x&&typeof x.id==="string"&&RX.test(x.id)}).slice(0,MAX):[];
  if(!a.length){
   var old=rd(LEG);
   if(old&&typeof old==="object"){
    var id=newId();
    if(wr(PRE+id,old)){a=[{id:id,name:String(old.name||"Novo personagem").slice(0,60)}];if(wr(IDX,a)){try{localStorage.removeItem(LEG)}catch(e){}}}
   }
  }
  return a;
 }
 function has(id){return list().some(function(x){return x.id===id})}
 function read(id){return has(id)?rd(PRE+id):null}
 function write(id,S){
  if(!wr(PRE+id,S))return false;
  var a=list(),n=String(S&&S.name||"Sem nome").slice(0,60),i;
  for(i=0;i<a.length;i++)if(a[i].id===id&&a[i].name!==n){a[i].name=n;wr(IDX,a)}
  return true;
 }
 function create(data){
  var a=list();if(a.length>=MAX)return null;
  var id=newId(),d=data||{name:"Novo personagem"};
  if(!wr(PRE+id,d))return null;
  a.push({id:id,name:String(d.name||"Novo personagem").slice(0,60)});
  if(!wr(IDX,a)){try{localStorage.removeItem(PRE+id)}catch(e){}return null}
  return id;
 }
 function remove(id){
  var a=list().filter(function(x){return x.id!==id});
  try{localStorage.removeItem(PRE+id)}catch(e){}
  wr(IDX,a);
 }
 return{MAX:MAX,list:list,has:has,read:read,write:write,create:create,remove:remove};
})();