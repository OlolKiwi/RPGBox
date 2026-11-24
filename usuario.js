import { auth, db, ERR, letterAvatar, okUrl } from "./firebase.js";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const header = document.getElementById("top") || document.querySelector("header");
if (header) {
  const st = document.createElement("style");
  st.textContent = `
  #ubtn img{width:28px;height:28px;border-radius:50%;object-fit:cover;display:block}
  #upanel{width:min(320px,calc(100vw - 24px))}
  #upanel *{box-sizing:border-box}
  #upanel .u-out,#upanel .u-on{display:grid;gap:10px}
  #upanel h2{margin:0 0 2px}
  #upanel [hidden]{display:none!important}
  #upanel input{width:100%;background:#0003;border:1px solid #fff2;border-radius:10px;padding:10px 12px;font:inherit;color:inherit}
  #upanel input::placeholder{color:#fff7}
  .u-seg{display:grid;grid-template-columns:1fr 1fr;background:#0003;border-radius:10px;padding:3px}
  .u-seg button{background:none;border:0;border-radius:8px;padding:8px;cursor:pointer;font:inherit;color:inherit;opacity:.7}
  .u-seg button[aria-pressed=true]{background:#fff2;opacity:1;font-weight:700}
  .u-btn{display:block;text-align:center;text-decoration:none;background:hsl(var(--h,265) 85% 68%);color:#10091c;border:0;border-radius:10px;padding:10px 14px;font:inherit;font-weight:700;cursor:pointer}
  .u-btn.g{background:#fff1;color:inherit;border:1px solid #fff2}
  .u-err{margin:0;color:#ff8f8f;font-size:.85rem;min-height:1.1em}
  .u-lnk{background:none;border:0;padding:0;font:inherit;font-size:.85rem;color:inherit;opacity:.7;text-decoration:underline;cursor:pointer;justify-self:start}
  .u-or{text-align:center;opacity:.6;font-size:.85rem}
  .u-me{display:flex;gap:12px;align-items:center}
  .u-me img{width:48px;height:48px;border-radius:50%;object-fit:cover}
  .u-me small{display:block;opacity:.65}`;
  document.head.appendChild(st);

  const userSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>';
  const btn = document.createElement("button");
  btn.className = "gear"; btn.id = "ubtn"; btn.type = "button";
  btn.setAttribute("aria-label", "Conta"); btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", "upanel");
  btn.innerHTML = userSvg;
  const gear = document.getElementById("gear");
  if (gear) gear.before(btn); else header.appendChild(btn);

  const pan = document.createElement("div");
  pan.className = "panel glass"; pan.id = "upanel"; pan.setAttribute("role", "dialog"); pan.setAttribute("aria-label", "Conta");
  pan.innerHTML = `
  <div class="u-out" hidden>
    <h2 id="u-title">Entre na mesa</h2>
    <div class="u-seg"><button type="button" id="u-mi" aria-pressed="true">Entrar</button><button type="button" id="u-mu" aria-pressed="false">Criar conta</button></div>
    <input id="u-name" type="text" maxlength="24" placeholder="Seu nome" autocomplete="nickname" hidden>
    <input id="u-mail" type="email" placeholder="E-mail" autocomplete="email">
    <input id="u-pass" type="password" placeholder="Senha (mínimo 6 caracteres)" autocomplete="current-password">
    <p class="u-err" id="u-err" role="alert"></p>
    <button class="u-btn" type="button" id="u-go">Entrar</button>
    <button class="u-lnk" type="button" id="u-forgot">Esqueci minha senha</button>
    <div class="u-or">ou</div>
    <button class="u-btn g" type="button" id="u-google">Entrar com Google</button>
  </div>
  <div class="u-on" hidden>
    <div class="u-me"><img id="u-img" alt=""><div><b id="u-n"></b><small id="u-h"></small></div></div>
    <a class="u-btn" href="perfil.html">Ver perfil</a>
    <button class="u-btn g" type="button" id="u-out">Sair</button>
  </div>`;
  (document.getElementById("panel") || header).after(pan);
  const $ = id => pan.querySelector("#" + id);
  const err = m => $("u-err").textContent = m || "";

  /* abrir / fechar */
  const toggle = open => { pan.classList.toggle("open", open); btn.setAttribute("aria-expanded", String(open)); };
  btn.addEventListener("click", e => {
    e.stopPropagation();
    const g = document.getElementById("panel"); if (g) g.classList.remove("open");
    toggle(!pan.classList.contains("open"));
  });
  document.addEventListener("click", e => { if (!pan.contains(e.target)) toggle(false) });
  document.addEventListener("keydown", e => { if (e.key === "Escape") toggle(false) });
  if (gear) gear.addEventListener("click", () => toggle(false));

  /* entrar / criar conta */
  let mode = "in";
  const setMode = m => {
    mode = m; const up = m === "up";
    $("u-mi").setAttribute("aria-pressed", !up); $("u-mu").setAttribute("aria-pressed", up);
    $("u-name").hidden = !up; $("u-forgot").hidden = up;
    $("u-go").textContent = up ? "Criar conta" : "Entrar";
    $("u-title").textContent = up ? "Crie sua conta" : "Entre na mesa";
    $("u-pass").autocomplete = up ? "new-password" : "current-password"; err("");
  };
  $("u-mi").onclick = () => setMode("in"); $("u-mu").onclick = () => setMode("up");
  $("u-go").onclick = async () => {
    const name = $("u-name").value.trim(), mail = $("u-mail").value.trim(), pass = $("u-pass").value;
    if (mode === "up" && !name) return err("Digite seu nome.");
    if (!mail || !pass) return err("Preencha e-mail e senha.");
    err("");
    try {
      if (mode === "up") { const c = await createUserWithEmailAndPassword(auth, mail, pass); await updateProfile(c.user, { displayName: name }); show(c.user) }
      else await signInWithEmailAndPassword(auth, mail, pass);
    } catch (e) { err(ERR[e.code] || "Não foi possível entrar. Tente de novo."); console.error(e) }
  };
  $("u-google").onclick = async () => {
    err("");
    try { await signInWithPopup(auth, new GoogleAuthProvider()) }
    catch (e) { if (e.code !== "auth/popup-closed-by-user") err("Não foi possível entrar com o Google."); console.error(e) }
  };
  $("u-forgot").onclick = async () => {
    const m = $("u-mail").value.trim(); if (!m) return err("Digite seu e-mail acima e toque de novo.");
    try { await sendPasswordResetEmail(auth, m); err("Enviamos um link de redefinição para o seu e-mail.") }
    catch (e) { err(ERR[e.code] || "Não foi possível enviar o e-mail.") }
  };
  $("u-out").onclick = async () => { await signOut(auth); toggle(false) };

  /* estado logado */
  async function show(u) {
    pan.querySelector(".u-out").hidden = !!u; pan.querySelector(".u-on").hidden = !u;
    if (!u) { btn.innerHTML = userSvg; return }
    let d = {};
    try { const s = await getDoc(doc(db, "users", u.uid)); if (s.exists()) d = s.data() } catch (e) { console.warn(e) }
    const name = d.name || u.displayName || "Player";
    const src = okUrl(d.avatar) ? d.avatar : (u.photoURL || letterAvatar(name));
    $("u-n").textContent = name; $("u-h").textContent = d.handle ? "@" + d.handle : (u.email || "");
    $("u-img").src = src;
    btn.innerHTML = ""; const im = document.createElement("img"); im.src = src; im.alt = ""; btn.appendChild(im);
    btn.setAttribute("aria-label", "Conta de " + name);
  }
  onAuthStateChanged(auth, u => show(u));
  window.addEventListener("perfil-atualizado", () => show(auth.currentUser));
}
