// CFA L3 hub — views: notes, formulas, IPS studio, CR trainer, ethics drill, error log, sessions, downloads, explainers.
'use strict';
const arr = x => Array.isArray(x) ? x : (x ? [x] : []);
const list = x => '<ul>' + arr(x).map(i => '<li>' + i + '</li>').join('') + '</ul>';
const copyText = (txt, btn) => {
  const done = () => { if (btn) { const o = btn.textContent; btn.textContent = 'Copied'; setTimeout(() => btn.textContent = o, 1200); } };
  try { navigator.clipboard.writeText(txt).then(done, () => {}); } catch (e) {}
};
function download(name, text, type) {
  const b = new Blob([text], { type: type || 'text/plain' }), a = document.createElement('a');
  a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function topicChips(id, cur, fn) {
  return '<button class="chip" aria-pressed="' + (cur === 'all') + '" onclick="' + fn + '(\'all\')">All</button>' +
    TOPICS3.map(t => '<button class="chip" aria-pressed="' + (cur === t.id) + '" onclick="' + fn + '(\'' + t.id + '\')">' + t.icon + ' ' + esc(t.short) + '</button>').join('');
}
function topicOptions(sel) { return TOPICS3.map(t => '<option value="' + t.id + '"' + (t.id === sel ? ' selected' : '') + '>' + esc(t.label) + '</option>').join(''); }

// lazy iframes for tracker / qbank / glossary
function lazyFrame(name, src) {
  const f = $('fr-' + name); if (f && !f.getAttribute('src')) f.setAttribute('src', src);
}
VIEWS.tracker = () => lazyFrame('tracker', 'tracker.html');
VIEWS.qbank = () => lazyFrame('qbank', 'qbank.html');
VIEWS.glossary = () => lazyFrame('glossary', 'glossary.html');

// ───── notes navigator (concept cards) ─────
let nsTopic = UI.get('nsTopic', 'all'), nsQ = UI.get('nsQ', ''), nsType = UI.get('nsType', 'all');
function nsFilter(t) { nsTopic = t; UI.set('nsTopic', t === 'all' ? null : t); if ($('v-notes').classList.contains('active')) buildNsIndex(); }
function nsType_(t) { nsType = t; UI.set('nsType', t === 'all' ? null : t); buildNsIndex(); }
function nsSearch_(v) { nsQ = v.toLowerCase(); UI.set('nsQ', nsQ); renderNsCards(); }
function buildNsIndex() {
  $('ns-chips').innerHTML = topicChips('ns', nsTopic, 'nsFilter') +
    '<span class="sep"></span>' + ['all', 'concept', 'formula', 'exam'].map(x => '<button class="chip" aria-pressed="' + (nsType === x) + '" onclick="nsType_(\'' + x + '\')">' + (x === 'all' ? 'Any type' : x) + '</button>').join('');
  $('ns-q').value = nsQ; renderNsCards();
}
function renderNsCards() {
  const fil = INDEX.filter(c => (nsTopic === 'all' || c.topic === nsTopic) && (nsType === 'all' || arr(c.type).includes(nsType)) &&
    (!nsQ || (c.name + ' ' + c.concept + ' ' + (c.formula || '') + ' ' + (c.examTip || '')).toLowerCase().includes(nsQ)));
  $('ns-count').textContent = fil.length + ' of ' + INDEX.length + ' concept cards';
  $('ns-cards').innerHTML = fil.map(c => {
    const t = topic(c.topic), id = 'nc-' + c.id, pg = (PAGE_IMAGES[c.id] || (c.pages || []).map(p => PAGE_IMAGES[p]).filter(Boolean));
    return '<article class="card" style="--c:' + t.color + '"><button class="card-h" aria-expanded="false" onclick="this.setAttribute(\'aria-expanded\',this.getAttribute(\'aria-expanded\')!==\'true\');$(\'' + id + '\').hidden=!$(\'' + id + '\').hidden"><span class="ci">' + c.icon + '</span><span class="cn">' + esc(c.name) + '</span><span class="cb">' + esc(t.short) + '</span></button><div id="' + id + '" hidden class="card-b"><div>' + c.concept + '</div>' +
      (c.formula ? '<pre class="fx">' + esc(c.formula) + '</pre>' : '') + (c.examTip ? '<div class="tip">Exam tip · ' + esc(c.examTip) + '</div>' : '') +
      (pg && pg.length ? '<div class="pgs">' + arr(pg).map(s => '<img loading="lazy" src="' + esc(s) + '" alt="Note page">').join('') + '</div>' : '') + '</div></article>';
  }).join('') || '<div class="note">No cards match.</div>';
}

// ───── formulas ─────
let fmTopic = UI.get('fmTopic', 'all'), fmQ = UI.get('fmQ', '');
function fmFilter(t) { fmTopic = t; UI.set('fmTopic', t === 'all' ? null : t); renderFormulas(); }
function renderFormulas() {
  $('fm-chips').innerHTML = topicChips('fm', fmTopic, 'fmFilter');
  const fil = FORMULAS.filter(f => (fmTopic === 'all' || f.t === fmTopic) && (!fmQ || (f.n + f.f + (f.note || '')).toLowerCase().includes(fmQ)));
  $('fm-count').textContent = fil.length + ' of ' + FORMULAS.length + ' formulas';
  $('fm-list').innerHTML = fil.map((f, i) => '<div class="fm" style="--c:' + topic(f.t).color + '"><div class="fn">' + esc(f.n) + '</div><pre class="fx">' + esc(f.f) + '</pre>' + (f.note ? '<div class="mut">' + esc(f.note) + '</div>' : '') + '<button class="mini" onclick="copyText(' + "FORMULAS_VIS[" + i + "]" + ',this)">Copy</button></div>').join('');
  window.FORMULAS_VIS = fil.map(f => f.n + ': ' + f.f);
}

// ───── IPS studio ─────
let ipsId = UI.get('ipsId', 'indiv');
function renderIps() {
  $('ips-tabs').innerHTML = IPS.map(i => '<button class="chip" aria-pressed="' + (i.id === ipsId) + '" onclick="ipsId=\'' + i.id + '\';UI.set(\'ipsId\',ipsId);renderIps()">' + i.icon + ' ' + esc(i.label) + '</button>').join('');
  const a = IPS.find(i => i.id === ipsId), notes = LS.get(K.ips, {})[ipsId] || {};
  const rows = [['ret', 'Return objective'], ['risk', 'Risk objective'], ['time', 'Time horizon'], ['liq', 'Liquidity'], ['tax', 'Taxes'], ['legal', 'Legal and regulatory'], ['unique', 'Unique circumstances']];
  $('ips-body').innerHTML = '<div class="grid2">' + rows.map(r => '<div class="panel ips-r"><h4>' + r[1] + '</h4><div>' + a[r[0]] + '</div><textarea placeholder="Your own note or example from a mock" oninput="ipsSave(\'' + r[0] + '\',this.value)">' + esc(notes[r[0]] || '') + '</textarea></div>').join('') + '</div>' +
    '<div class="grid2"><div class="panel"><h4>Clues in the case that point here</h4>' + list(a.clues) + '</div><div class="panel warnbox"><h4>Typical mistakes</h4>' + list(a.mistakes) + '</div></div>';
}
function ipsSave(k, v) { const all = LS.get(K.ips, {}); all[ipsId] = all[ipsId] || {}; all[ipsId][k] = v; LS.set(K.ips, all); }

// ───── constructed-response trainer ─────
let crTopic = UI.get('crTopic', 'all'), crCmd = UI.get('crCmd', 'all'), crCur = null, crTimer = null, crLeft = 0;
function crSetT(t) { crTopic = t; UI.set('crTopic', t === 'all' ? null : t); renderCr(); }
function crSetC(c) { crCmd = c; UI.set('crCmd', c === 'all' ? null : c); renderCr(); }
function renderCr() {
  const hist = LS.get(K.cr, {});
  $('cr-chips').innerHTML = topicChips('cr', crTopic, 'crSetT') + '<span class="sep"></span><select onchange="crSetC(this.value)" aria-label="Command word"><option value="all">Any command word</option>' + COMMAND_WORDS.map(c => '<option' + (c.w === crCmd ? ' selected' : '') + '>' + c.w + '</option>').join('') + '</select>';
  const fil = CR_DRILLS.filter(d => (crTopic === 'all' || d.t === crTopic) && (crCmd === 'all' || d.cmd === crCmd));
  $('cr-list').innerHTML = fil.map(d => {
    const h = hist[d.id]; return '<button class="crow" onclick="crOpen(\'' + d.id + '\')"><span class="dot" style="background:' + topic(d.t).color + '"></span><span class="cw">' + d.cmd + '</span><span class="cq">' + esc(d.q.slice(0, 90)) + '…</span><span class="cm">' + d.pts + ' pts · ' + d.min + ' min' + (h ? ' · last ' + h.score + '/' + d.pts : '') + '</span></button>';
  }).join('') || '<div class="note">No drills for this filter.</div>';
  $('cr-words').innerHTML = COMMAND_WORDS.map(c => '<tr><td><b>' + c.w + '</b></td><td>' + esc(c.d) + '</td><td>' + esc(c.how) + '</td></tr>').join('');
  const done = Object.keys(hist).length, tot = Object.values(hist).reduce((s, h) => s + h.score, 0), mx = Object.keys(hist).reduce((s, id) => s + CR_DRILLS.find(d => d.id === id).pts, 0);
  $('cr-sum').textContent = done ? done + ' of ' + CR_DRILLS.length + ' drills attempted · latest scores total ' + Math.round(tot * 10) / 10 + ' of ' + mx + ' (' + Math.round(tot / mx * 100) + '%)' : 'No drills attempted yet.';
}
function crOpen(id) {
  crCur = CR_DRILLS.find(d => d.id === id); clearInterval(crTimer);
  $('cr-work').hidden = false; $('cr-reveal').hidden = true;
  $('cr-q').innerHTML = '<div class="meta"><span class="pill">' + crCur.cmd + '</span><span class="pill">' + crCur.pts + ' points</span><span class="pill">' + topic(crCur.t).short + ' · LM ' + crCur.lm + '</span></div><p>' + esc(crCur.q) + '</p>';
  $('cr-ans').value = UI.get('crDraft_' + id, ''); crLeft = Math.round(crCur.min * 60); crTick();
  crTimer = setInterval(crTick, 1000);
  $('cr-work').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function crTick() { const m = Math.floor(Math.abs(crLeft) / 60), s = Math.abs(crLeft) % 60; $('cr-time').textContent = (crLeft < 0 ? '+' : '') + m + ':' + String(s).padStart(2, '0'); $('cr-time').className = 'timer' + (crLeft < 0 ? ' over' : ''); crLeft--; }
function crShow() {
  clearInterval(crTimer);
  $('cr-reveal').hidden = false;
  $('cr-model').innerHTML = '<ol>' + crCur.model.map(m => '<li>' + esc(m) + '</li>').join('') + '</ol><div class="tip">' + esc(crCur.tip) + '</div>';
  const s = $('cr-score'); s.max = crCur.pts; s.step = 0.5; s.value = '';
  $('cr-sl').textContent = 'Points you earned (out of ' + crCur.pts + ')';
}
function crSave() {
  const v = parseFloat($('cr-score').value); if (isNaN(v)) return;
  const h = LS.get(K.cr, {}); h[crCur.id] = { score: Math.min(crCur.pts, Math.max(0, v)), date: isoOf(todayMs()) }; LS.set(K.cr, h);
  if (v < crCur.pts * 0.7) addError({ t: crCur.t, lm: crCur.lm, desc: 'CR drill ' + crCur.id + ': ' + crCur.q.slice(0, 80), cause: 'Scored ' + v + '/' + crCur.pts });
  UI.set('crDraft_' + crCur.id, null);
  $('cr-work').hidden = true; renderCr();
}
function crDraft(v) { if (crCur) UI.set('crDraft_' + crCur.id, v); }

// ───── ethics drill ─────
let ethCur = null, ethAns = null;
function renderEthics() {
  const st = LS.get(K.eth, {}), n = Object.keys(st).length, ok = Object.values(st).filter(Boolean).length;
  $('eth-sum').textContent = n ? ok + ' of ' + n + ' cases answered correctly (' + Math.round(ok / n * 100) + '%) out of ' + ETHICS_CASES.length + ' cases' : ETHICS_CASES.length + ' cases. Decide: violation or not.';
  $('eth-std').innerHTML = STANDARDS.map(s => '<tr><td><b>' + s.c + '</b></td><td>' + esc(s.n) + '</td><td>' + esc(s.k) + '</td></tr>').join('');
  if (!ethCur) ethNext();
}
function ethNext() {
  const st = LS.get(K.eth, {}), pool = ETHICS_CASES.map((c, i) => i).filter(i => st[i] !== true);
  const pick = (pool.length ? pool : ETHICS_CASES.map((c, i) => i));
  ethCur = pick[Math.floor(Math.random() * pick.length)]; ethAns = null;
  const c = ETHICS_CASES[ethCur];
  $('eth-case').innerHTML = '<div class="pill">Standard ' + esc(c.s) + '</div><p>' + esc(c.q) + '</p>';
  $('eth-fb').hidden = true; $('eth-btns').hidden = false;
}
function ethGuess(g) {
  const c = ETHICS_CASES[ethCur], right = g === c.v, st = LS.get(K.eth, {}); st[ethCur] = right; LS.set(K.eth, st);
  $('eth-btns').hidden = true; $('eth-fb').hidden = false;
  $('eth-fb').innerHTML = '<div class="verdict ' + (right ? 'ok' : 'no') + '">' + (right ? 'Correct' : 'Not quite') + ' · this is ' + (c.v === 'violation' ? 'a violation' : 'compliant') + '</div><p>' + esc(c.w) + '</p><button class="btn" onclick="ethNext();renderEthics()">Next case</button>';
  if (!right) addError({ t: 'eth', lm: 19, desc: 'Ethics ' + c.s + ': ' + c.q.slice(0, 80), cause: 'Judged ' + g + ', answer was ' + c.v });
  $('eth-sum').textContent = '';
}

// ───── error log with spaced repetition ─────
const BOXES = [1, 3, 7, 16, 35];
function addError(e) {
  const all = LS.get(K.err, []), today = isoOf(todayMs());
  all.push({ id: Date.now() + Math.random(), date: today, t: e.t, lm: e.lm || null, desc: e.desc, cause: e.cause || '', box: 0, due: isoOf(todayMs() + DAY), mastered: false });
  LS.set(K.err, all);
}
let erFilter = UI.get('erFilter', 'due');
function erSet(f) { erFilter = f; UI.set('erFilter', f === 'due' ? null : f); renderErrors(); }
function renderErrors() {
  const all = LS.get(K.err, []), today = isoOf(todayMs());
  $('er-t').innerHTML = topicOptions('aa');
  const due = all.filter(e => !e.mastered && e.due <= today).length, open = all.filter(e => !e.mastered).length;
  $('er-sum').textContent = due + ' due today · ' + open + ' open · ' + (all.length - open) + ' mastered';
  $('er-chips').innerHTML = [['due', 'Due today'], ['open', 'All open'], ['mastered', 'Mastered']].map(x => '<button class="chip" aria-pressed="' + (erFilter === x[0]) + '" onclick="erSet(\'' + x[0] + '\')">' + x[1] + '</button>').join('');
  const fil = all.filter(e => erFilter === 'due' ? !e.mastered && e.due <= today : erFilter === 'open' ? !e.mastered : e.mastered).sort((a, b) => a.due < b.due ? -1 : 1);
  $('er-list').innerHTML = fil.map(e => '<div class="er" style="--c:' + topic(e.t).color + '"><div><b>' + esc(topic(e.t).short) + (e.lm ? ' · LM ' + e.lm : '') + '</b> <span class="mut">logged ' + e.date + ' · box ' + (e.box + 1) + '/5 · next ' + e.due + '</span></div><div>' + esc(e.desc) + '</div>' + (e.cause ? '<div class="mut">Cause: ' + esc(e.cause) + '</div>' : '') +
    (e.mastered ? '<button class="mini" onclick="erAct(\'' + e.id + '\',\'reopen\')">Reopen</button>' : '<div class="row"><button class="mini ok" onclick="erAct(\'' + e.id + '\',\'got\')">Got it right</button><button class="mini no" onclick="erAct(\'' + e.id + '\',\'miss\')">Missed again</button><button class="mini" onclick="erAct(\'' + e.id + '\',\'del\')">Delete</button></div>') + '</div>').join('') || '<div class="note">Nothing here. Log every wrong answer with its cause, then review it on schedule.</div>';
}
function erAdd() {
  const d = $('er-d').value.trim(); if (!d) return;
  addError({ t: $('er-t').value, lm: parseInt($('er-lm').value) || null, desc: d, cause: $('er-c').value.trim() });
  ['er-d', 'er-lm', 'er-c'].forEach(i => $(i).value = ''); renderErrors();
}
function erAct(id, a) {
  let all = LS.get(K.err, []); const e = all.find(x => String(x.id) === String(id)); if (!e) return;
  if (a === 'got') { e.box++; if (e.box >= BOXES.length) { e.mastered = true; e.box = BOXES.length - 1; } else e.due = isoOf(todayMs() + BOXES[e.box] * DAY); }
  else if (a === 'miss') { e.box = 0; e.due = isoOf(todayMs() + DAY); }
  else if (a === 'reopen') { e.mastered = false; e.box = 0; e.due = isoOf(todayMs() + DAY); }
  else if (a === 'del') all = all.filter(x => x !== e);
  LS.set(K.err, all); renderErrors();
}

// ───── session logger ─────
function renderSessions() {
  const s = LS.get(K.sess, []); $('ss-t').innerHTML = topicOptions(UI.get('ssTopic', 'aa')); if (!$('ss-d').value) $('ss-d').value = isoOf(todayMs());
  const now = todayMs(), wk = isoOf(now - 6 * DAY), tot = s.reduce((a, x) => a + x.mins, 0), wkm = s.filter(x => x.date >= wk).reduce((a, x) => a + x.mins, 0);
  const days = {}; s.forEach(x => days[x.date] = 1); let streak = 0; for (let t = now; days[isoOf(t)]; t -= DAY) streak++;
  $('ss-sum').innerHTML = stat('TOTAL LOGGED', hh(tot / 60), s.length + ' sessions') + stat('LAST 7 DAYS', hh(wkm / 60), 'target ' + hh(2 * 5 + 8)) + stat('STREAK', streak + 'd', 'consecutive study days');
  const by = TOPICS3.map(t => ({ t, m: s.filter(x => x.t === t.id).reduce((a, x) => a + x.mins, 0) })), mx = Math.max(1, ...by.map(b => b.m));
  $('ss-bars').innerHTML = by.map(b => '<div class="bar"><span>' + esc(b.t.short) + '</span><div><i style="width:' + (b.m / mx * 100) + '%;background:' + b.t.color + '"></i></div><em>' + hh(b.m / 60) + '</em></div>').join('');
  $('ss-list').innerHTML = s.slice().reverse().slice(0, 40).map((x, i) => '<div class="er" style="--c:' + topic(x.t).color + '"><b>' + x.date + '</b> · ' + esc(topic(x.t).short) + ' · ' + x.mins + ' min' + (x.note ? ' · ' + esc(x.note) : '') + ' <button class="mini" onclick="ssDel(' + (s.length - 1 - i) + ')">Delete</button></div>').join('');
}
function ssAdd() {
  const m = parseInt($('ss-m').value); if (!m || m < 1) return;
  const s = LS.get(K.sess, []); s.push({ date: $('ss-d').value || isoOf(todayMs()), t: $('ss-t').value, mins: m, note: $('ss-n').value.trim() });
  UI.set('ssTopic', $('ss-t').value); s.sort((a, b) => a.date < b.date ? -1 : 1); LS.set(K.sess, s); $('ss-m').value = ''; $('ss-n').value = ''; renderSessions();
}
function ssDel(i) { const s = LS.get(K.sess, []); s.splice(i, 1); LS.set(K.sess, s); renderSessions(); }

// ───── downloads: backup + exports ─────
function renderDownloads() { $('dl-msg').textContent = ''; }
function exportBackup() {
  const out = {}; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf('cfa3_') === 0) out[k] = localStorage.getItem(k); } } catch (e) {}
  download('cfa-l3-backup-' + isoOf(todayMs()) + '.json', JSON.stringify(out, null, 1), 'application/json');
}
function importBackup(inp) {
  const f = inp.files[0]; if (!f) return; const r = new FileReader();
  r.onload = () => { try { const o = JSON.parse(r.result); Object.keys(o).filter(k => k.indexOf('cfa3_') === 0).forEach(k => localStorage.setItem(k, o[k])); $('dl-msg').textContent = 'Backup restored. Reload to refresh every view.'; } catch (e) { $('dl-msg').textContent = 'That file is not a valid backup.'; } };
  r.readAsText(f);
}
function exportPlanCsv() {
  const p = plan(), rows = [['Date', 'Day', 'Hours', 'Topic', 'Task', 'Stage']];
  p.days.forEach(d => { if (d.buffer) rows.push([isoOf(d.t), WD[d.dow], d.cap, '', 'Buffer day', '']); else d.tasks.forEach(t => rows.push([isoOf(d.t), WD[d.dow], t.hrs, topic(t.t).label, t.text, t.stage || ''])); });
  download('cfa-l3-plan.csv', rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\r\n'), 'text/csv');
}
function exportPlanIcs() {
  const p = plan(), ymd = t => isoOf(t).replace(/-/g, ''), L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CFA L3 Hub//EN'];
  p.days.forEach(d => {
    if (d.buffer) return; const nx = isoOf(d.t + DAY).replace(/-/g, '');
    L.push('BEGIN:VEVENT', 'UID:l3-' + ymd(d.t) + '@studyhub', 'DTSTAMP:' + ymd(todayMs()) + 'T000000Z', 'DTSTART;VALUE=DATE:' + ymd(d.t), 'DTEND;VALUE=DATE:' + nx,
      'SUMMARY:CFA L3 · ' + d.tasks.map(t => t.lm ? 'LM' + t.lm : t.text.split(':')[0]).filter((v, i, a) => a.indexOf(v) === i).join(', '),
      'DESCRIPTION:' + d.tasks.map(t => t.text + (t.stage ? ' (' + t.stage + ')' : '') + ' ' + hh(t.hrs)).join('\\n'), 'END:VEVENT');
  });
  L.push('END:VCALENDAR'); download('cfa-l3-plan.ics', L.join('\r\n'), 'text/calendar');
}
function exportFlashcards() {
  download('cfa-l3-flashcards.csv', TERMS3.map(t => '"' + t.n.replace(/"/g, '""') + '","' + t.s.replace(/"/g, '""') + '"').join('\r\n'), 'text/csv');
}

// ───── explainers (seeded HTML explainers) ─────
let expCur = null;
function expInit() {
  const list = (window.SEED_EXPLAINERS || []);
  $('exp-list').innerHTML = list.length ? list.map(e => '<button class="crow" onclick="expOpen(\'' + e.id + '\')"><span class="dot" style="background:' + topic(e.topic).color + '"></span><span class="cw">' + esc(topic(e.topic).short) + '</span><span class="cq">' + esc(e.title) + '</span></button>').join('') : '<div class="note">No explainers yet. Ask Claude to build one and add it to assets/seed_explainers.js.</div>';
  if (!expCur && list.length) expOpen(list[0].id);
}
function expOpen(id) { const e = (window.SEED_EXPLAINERS || []).find(x => x.id === id); if (!e) return; expCur = id; $('exp-frame').srcdoc = e.html; $('exp-title').textContent = e.title; }
