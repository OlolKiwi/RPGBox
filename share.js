// Botão "Compartilhar" para qualquer ficha. Basta incluir depois do fichas.js:
//   <script src="share.js"></script>
(function(){
 var id=new URLSearchParams(location.search).get("id");
 if(!id||typeof FICHAS==="undefined"||!FICHAS.has(id))return;
 var btn=null;

 function toast(t,ms){
  var b=document.getElementById("shtoast");
  if(!b){
   b=document.createElement("div");b.id="shtoast";b.setAttribute("role","status");
   b.style.cssText="position:fixed;left:50%;bottom:18px;transform:translateX(-50%);max-width:calc(100% - 28px);padding:9px 16px;border-radius:14px;background:rgba(20,16,30,.94);color:#fff;border:1px solid rgba(255,255,255,.25);z-index:9999;font-size:.9rem;text-align:center;overflow-wrap:anywhere;transition:opacity .3s;opacity:0;pointer-events:none";
   document.body.appendChild(b);
  }
  b.textContent=t;b.style.opacity="1";
  clearTimeout(toast.t);toast.t=setTimeout(function(){b.style.opacity="0"},ms||4500);
 }
 function copy(url){
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(url).then(function(){toast("Link copiado: "+url,7000)},function(){prompt("Copie o link:",url)});
  else prompt("Copie o link:",url);
 }
 function deliver(url,name){
  if(navigator.share){
   navigator.share({title:"Ficha de "+name,text:"Ficha de "+name+" no RPGBox",url:url}).catch(function(e){if(!e||e.name!=="AbortError")copy(url)});
   return;
  }
  copy(url);
 }
 function share(){
  var d=FICHAS.read(id);
  if(!d){toast("Ficha não encontrada.");return}
  try{
   if(!localStorage.getItem("vtt-share-ok")){
    if(!confirm("Compartilhar envia uma cópia desta ficha pro servidor por 30 dias. Quem tiver o link poderá ver e copiar a ficha. Continuar?"))return;
    localStorage.setItem("vtt-share-ok","1");
   }
  }catch(e){}
  btn.disabled=true;btn.textContent="Gerando…";
  fetch("/api/ficha",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)})
   .then(function(r){return r.json().then(function(j){return{ok:r.ok,j:j}},function(){return{ok:false,j:{}}})})
   .then(function(x){
    if(!x.ok||!x.j.id)throw new Error((x.j&&x.j.erro)||"o servidor não respondeu");
    deliver(location.origin+"/receber.html?s="+x.j.id,String(d.name||"personagem"));
   })
   .catch(function(e){toast("Não foi possível compartilhar: "+e.message,6000)})
   .then(function(){if(btn){btn.disabled=false;btn.textContent="Compartilhar"}});
 }
 function add(){
  if(document.getElementById("shbtn"))return;
  btn=document.createElement("button");
  btn.type="button";btn.id="shbtn";btn.className="btn";btn.textContent="Compartilhar";
  btn.title="Gerar um link desta ficha para enviar a alguém";
  btn.addEventListener("click",share);
  var hd=document.querySelector("header"),tp=document.querySelector(".top span:last-child");
  if(hd)hd.appendChild(btn);
  else if(tp)tp.appendChild(btn);
  else{btn.style.cssText="position:fixed;top:10px;right:10px;z-index:30";document.body.appendChild(btn)}
  return hd;
 }
 function init(){
  var hd=add();
  if(hd&&window.MutationObserver)new MutationObserver(function(){if(!document.getElementById("shbtn"))add()}).observe(hd,{childList:true});
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
