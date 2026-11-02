// Cross-device sync (hub page only). End-to-end encrypted: the server stores ciphertext only.
// Merge is a three-way merge against the last synced snapshot, so edits made on two devices combine instead of overwriting.
'use strict';
const SYNC = { code: null, st: 'off', msg: '', last: null, busy: false, timer: null, url: new URL('sync.php', location.href).href };
const enc = new TextEncoder(), dec = new TextDecoder();
const b64 = buf => { let s = ''; new Uint8Array(buf).forEach(c => s += String.fromCharCode(c)); return btoa(s); };
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const rd = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const isObj = x => x && typeof x === 'object' && !Array.isArray(x);

async function derive(code) {
  const norm = code.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const km = await crypto.subtle.importKey('raw', enc.encode(norm), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: enc.encode('cfa3-sync-salt-v1'), iterations: 150000, hash: 'SHA-256' }, km, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  const h = new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode('cfa3-id:' + norm)));
  return { key, id: Array.from(h).map(x => x.toString(16).padStart(2, '0')).join('') };
}
async function seal(key, obj) { const iv = crypto.getRandomValues(new Uint8Array(12)); const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(obj))); return { v: 1, iv: b64(iv), ct: b64(ct) }; }
async function open_(key, blob) { const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(blob.iv) }, key, unb64(blob.ct)); return JSON.parse(dec.decode(pt)); }

function newCode() { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', r = crypto.getRandomValues(new Uint8Array(25)); let s = ''; r.forEach((x, i) => { s += A[x % 32]; if (i % 5 === 4 && i < 24) s += '-'; }); return s; }

// ── three-way merge ──
function akey(x) { return x && typeof x === 'object' && x.id !== undefined ? 'i' + x.id : 'j' + JSON.stringify(x); }
function sortByDate(a) { if (a.length > 1 && a.every(x => x && typeof x === 'object' && (typeof x.date === 'string' || typeof x.d === 'string'))) a.sort((p, q) => String(p.date || p.d) < String(q.date || q.d) ? -1 : 1); return a; }
function mergeArr(b, l, r, lNewer) {
  const mk = a => { const m = new Map(); a.forEach(x => m.set(akey(x), x)); return m; }, B = mk(b || []), L = mk(l), R = mk(r), out = [], keys = [...L.keys(), ...[...R.keys()].filter(k => !L.has(k))];
  keys.forEach(k => {
    const bi = B.get(k), li = L.get(k), ri = R.get(k);
    if (li !== undefined && ri !== undefined) out.push(same(li, ri) ? li : same(bi, li) ? ri : same(bi, ri) ? li : merge3(bi, li, ri, lNewer));
    else if (li !== undefined) { if (bi === undefined || !same(bi, li)) out.push(li); }      // remote deleted it: honour unless we edited it
    else if (ri !== undefined) { if (bi === undefined || !same(bi, ri)) out.push(ri); }      // local deleted it: honour unless remote edited it
  });
  return sortByDate(out);
}
function merge3(b, l, r, lNewer) {
  if (same(l, r)) return l;
  if (same(b, l)) return r;
  if (same(b, r)) return l;
  if (Array.isArray(l) && Array.isArray(r)) return mergeArr(Array.isArray(b) ? b : [], l, r, lNewer);
  if (isObj(l) && isObj(r)) { const o = {}; new Set([...Object.keys(l), ...Object.keys(r)]).forEach(k => { const v = merge3(isObj(b) ? b[k] : undefined, l[k], r[k], lNewer); if (v !== undefined) o[k] = v; }); return o; }
  return lNewer ? l : r;
}

function collect() { const d = {}; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf('cfa3_') === 0 && !window.__syncSkip.test(k)) { try { d[k] = JSON.parse(localStorage.getItem(k)); } catch (e) {} } } } catch (e) {} return d; }

async function api(id, method, body) {
  const r = await fetch(SYNC.url + '?id=' + id, { method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' });
  const t = await r.text(); let j; try { j = JSON.parse(t); } catch (e) { throw new Error(r.status === 404 ? 'sync.php not found on this server' : 'Server did not return JSON. Is PHP enabled here?'); }
  if (r.status === 409) return { conflict: true, cur: j };
  if (!r.ok) throw new Error(j.error || ('HTTP ' + r.status));
  return j;
}

async function syncNow() {
  if (!SYNC.code || SYNC.busy) return; SYNC.busy = true; setStatus('syncing');
  try {
    const { key, id } = await derive(SYNC.code);
    let cur = await api(id, 'GET');
    for (let attempt = 0; attempt < 4; attempt++) {
      const remote = cur.blob ? await open_(key, cur.blob) : { data: {}, meta: {} };
      const local = collect(), base = rd('cfa3_sync_base', {}), lm = rd('cfa3_meta', {}), merged = {}, meta = Object.assign({}, remote.meta || {}), changed = [];
      new Set([...Object.keys(local), ...Object.keys(remote.data || {})]).forEach(k => {
        const lNewer = (lm[k] || 0) > ((remote.meta || {})[k] || 0);
        const v = merge3(base[k], local[k], (remote.data || {})[k], lNewer);
        if (v !== undefined) merged[k] = v;
        if (!same(v, local[k])) { changed.push(k); if (v === undefined) window.__rawRemove(k); else window.__rawSet(k, JSON.stringify(v)); }
        if (!same(v, (remote.data || {})[k])) meta[k] = Date.now(); else if (lm[k]) meta[k] = Math.max(lm[k], meta[k] || 0);
      });
      const newLm = Object.assign({}, lm); changed.forEach(k => newLm[k] = meta[k] || Date.now()); window.__rawSet('cfa3_meta', JSON.stringify(newLm));
      if (same(merged, remote.data || {}) && cur.blob) { window.__rawSet('cfa3_sync_base', JSON.stringify(merged)); SYNC.last = Date.now(); SYNC.lastRev = cur.rev; setStatus('ok'); afterApply(changed); break; }
      const res = await api(id, 'POST', { baseRev: cur.rev || 0, blob: await seal(key, { data: merged, meta, t: Date.now() }) });
      if (res.conflict) { cur = res.cur; continue; }
      window.__rawSet('cfa3_sync_base', JSON.stringify(merged)); SYNC.last = Date.now(); SYNC.lastRev = res.rev; setStatus('ok'); afterApply(changed); break;
    }
  } catch (e) { setStatus(navigator.onLine ? 'error' : 'offline', e.message); }
  SYNC.busy = false;
}
function afterApply(changed) {
  if (!changed.length) return;
  document.querySelectorAll('iframe.fr').forEach(f => { if (f.getAttribute('src') && f.contentWindow) { try { f.contentWindow.location.reload(); } catch (e) {} } });
  const act = document.querySelector('.view.active'), v = act && act.id.slice(2);
  if (['dashboard', 'plan', 'syllabus', 'errors', 'sessions', 'ethics'].includes(v)) VIEWS[v]();
}
function schedulePush() { if (!SYNC.code) return; clearTimeout(SYNC.timer); SYNC.timer = setTimeout(syncNow, 4000); }

function setStatus(st, msg) {
  SYNC.st = st; SYNC.msg = msg || ''; const b = $('sync-btn'); if (!b) return;
  const t = { off: '☁ Sync off', syncing: '☁ Syncing…', ok: '☁ Synced ' + (SYNC.last ? new Date(SYNC.last).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''), error: '☁ Sync problem', offline: '☁ Offline' }[st];
  b.textContent = t; b.title = msg || ''; b.dataset.st = st; renderSyncPanel();
}
async function syncEnable(code) {
  if (!window.crypto || !crypto.subtle) { setStatus('error', 'This browser has no encryption support (needs https).'); return; }
  const c = (code || '').trim(); if (c.replace(/[^A-Za-z0-9]/g, '').length < 25) { SYNC.msg = 'A sync code has 25 characters.'; renderSyncPanel(); return; }
  SYNC.code = c.toUpperCase(); window.__rawSet('cfa3_sync_code', SYNC.code); window.__rawRemove('cfa3_sync_base'); await syncNow();
}
function syncCreate() { syncEnable(newCode()); }
function syncConnect() { syncEnable($('sy-code').value); }
function syncOff() { SYNC.code = null; window.__rawRemove('cfa3_sync_code'); window.__rawRemove('cfa3_sync_base'); SYNC.last = null; setStatus('off'); }
function syncReveal() { SYNC.show = !SYNC.show; renderSyncPanel(); }
function renderSyncPanel() {
  const el = $('sync-panel'); if (!el) return;
  const err = SYNC.st === 'error' || SYNC.st === 'offline';
  el.innerHTML = SYNC.code
    ? '<h4>Cross-device sync is on</h4><p>Status: <b>' + SYNC.st + '</b>' + (SYNC.last ? ' · last synced ' + new Date(SYNC.last).toLocaleString() : '') + '</p>' + (err ? '<p class="warn">' + esc(SYNC.msg || 'Could not reach the sync server. Changes stay on this device and sync when it is back.') + '</p>' : '') +
      '<p>Your sync code: <code>' + (SYNC.show ? esc(SYNC.code) : '•••••-•••••-•••••-•••••-•••••') + '</code> <button class="mini" onclick="syncReveal()">' + (SYNC.show ? 'Hide' : 'Show') + '</button> <button class="mini" onclick="copyText(SYNC.code,this)">Copy</button></p>' +
      '<div class="row"><button class="btn" onclick="syncNow()">Sync now</button><button class="mini no" onclick="syncOff()">Turn off on this device</button></div>' +
      '<p class="mut">On your other device open this hub, go to Exports and backup and paste the code. Everything is encrypted in your browser before upload. Anyone with the code can read and change your data, and if you lose it the cloud copy cannot be recovered (your local data stays).</p>'
    : '<h4>Cross-device sync</h4><p class="mut">Keeps progress, errors, sessions, mocks and plan settings in step across phone and laptop. Encrypted end to end. Needs the sync server (<code>sync.php</code>) deployed next to this page.</p>' +
      (SYNC.msg ? '<p class="warn">' + esc(SYNC.msg) + '</p>' : '') +
      '<div class="row"><button class="btn" onclick="syncCreate()">Create a sync code</button></div><p class="mut">Already have a code from another device?</p><div class="row"><input id="sy-code" placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX" style="width:280px"><button class="btn" onclick="syncConnect()">Connect</button></div>';
}
(function boot() {
  const c = rd('cfa3_sync_code', null); if (c) SYNC.code = c;
  window.addEventListener('cfa3-change', schedulePush);
  window.addEventListener('storage', e => { if (e.key === 'cfa3_meta') schedulePush(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && SYNC.code) syncNow(); });
  window.addEventListener('online', () => SYNC.code && syncNow());
  setInterval(() => { if (SYNC.code && !document.hidden) syncNow(); }, 60000);
  const origDl = VIEWS.downloads; VIEWS.downloads = () => { origDl(); renderSyncPanel(); };
  setStatus(SYNC.code ? 'syncing' : 'off'); if (SYNC.code) setTimeout(syncNow, 800);
})();
