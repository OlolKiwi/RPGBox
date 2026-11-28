import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { collection, doc, getDocs, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const TS = "vtt-nuvem-ts", DEL = "vtt-nuvem-del", MAXJ = 900000, DAY = 864e5;
let uid = null, silent = false;
const timers = {};

const rd = (k, f) => { try { return JSON.parse(localStorage.getItem(k)) || f } catch { return f } };
const wr = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} };
const stamp = (id, t) => { const m = rd(TS, {}); m[id] = t; wr(TS, m) };
const unstamp = id => { const m = rd(TS, {}); delete m[id]; wr(TS, m) };
const ref = id => doc(db, "users", uid, "fichas", id);

/* remove da lista local sem avisar o hook (senão viraria uma nova exclusão) */
function silentRm(id) { silent = true; try { FICHAS.remove(id) } finally { silent = false } }

async function up(id) {
  if (!uid) return;
  const d = FICHAS.read(id);
  if (!d) return;
  const json = JSON.stringify(d);
  if (json.length > MAXJ) { console.warn("Ficha grande demais para a nuvem (reduza as imagens):", id); return }
  const ts = rd(TS, {})[id] || Date.now();
  try {
    await setDoc(ref(id), { name: String(d.name || "Sem nome").slice(0, 60), json, updatedAt: ts });
    stamp(id, ts);
  } catch (e) { console.warn("nuvem:", e.code || e) }
}

function later(id) {
  clearTimeout(timers[id]);
  timers[id] = setTimeout(() => { delete timers[id]; up(id) }, 4000);
}

/* a exclusão vira um marcador na nuvem, para os outros aparelhos saberem que a ficha foi apagada */
async function tomb(id) {
  try {
    await setDoc(ref(id), { deleted: true, updatedAt: Date.now() });
    wr(DEL, rd(DEL, []).filter(x => x !== id));
    return true;
  } catch (e) { console.warn("nuvem:", e.code || e); return false }
}

FICHAS.on((t, id) => {
  if (silent) return;
  if (t === "w") { stamp(id, Date.now()); if (uid) later(id) }
  else if (t === "d") {
    unstamp(id); clearTimeout(timers[id]); delete timers[id];
    const l = rd(DEL, []); if (!l.includes(id)) { l.push(id); wr(DEL, l) }
    if (uid) tomb(id);
  }
});

addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "hidden") return;
  for (const id of Object.keys(timers)) { clearTimeout(timers[id]); delete timers[id]; up(id) }
});

async function sync() {
  let snap;
  try { snap = await getDocs(collection(db, "users", uid, "fichas")) }
  catch (e) { console.warn("nuvem:", e.code || e); return }
  const cloud = {};
  snap.forEach(s => cloud[s.id] = s.data());

  /* exclusões feitas offline ou que não chegaram a subir */
  const pend = new Set(rd(DEL, []));
  for (const id of pend) {
    const ok = await Promise.race([tomb(id), new Promise(r => setTimeout(() => r(false), 8000))]);
    if (ok) cloud[id] = { deleted: true, updatedAt: Date.now() };
  }

  const ts = rd(TS, {}), localIds = FICHAS.list().map(f => f.id), now = Date.now();
  let changed = false, reload = false;
  const openId = new URLSearchParams(location.search).get("id");

  for (const id of Object.keys(cloud)) {
    if (pend.has(id) && !cloud[id].deleted) continue;  /* apagada aqui, ainda não confirmada na nuvem */
    const c = cloud[id], lt = ts[id] || 0;

    if (c.deleted) {
      if (localIds.includes(id)) {
        if (lt > c.updatedAt) await up(id);                 /* editada depois de apagada: restaura */
        else { silentRm(id); unstamp(id); changed = true }  /* apagada em outro aparelho */
      } else if (now - c.updatedAt > 30 * DAY) deleteDoc(ref(id)).catch(() => {});  /* limpa marcador antigo */
      continue;
    }

    if (localIds.includes(id) && lt >= c.updatedAt) { if (lt > c.updatedAt) await up(id); continue }
    let d; try { d = JSON.parse(c.json) } catch { continue }
    if (FICHAS.put(id, d)) { stamp(id, c.updatedAt); changed = true; if (id === openId) reload = true }
  }
  for (const id of localIds) if (!cloud[id]) await up(id);

  if (changed) dispatchEvent(new Event("fichas-sync"));
  if (reload) location.reload();
}

onAuthStateChanged(auth, u => { uid = u ? u.uid : null; if (u) sync() });
