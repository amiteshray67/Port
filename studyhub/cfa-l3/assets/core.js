// CFA L3 hub — core: storage, scheduler, dashboard, daily plan, syllabus.
'use strict';
const $ = id => document.getElementById(id);
const DAY = 86400000;
const K = { done: 'cfa3_done', cfg: 'cfa3_cfg', err: 'cfa3_errors', sess: 'cfa3_sessions', cr: 'cfa3_cr', eth: 'cfa3_eth', tracker: 'cfa3_tracker_v1', ips: 'cfa3_ips', qb: 'cfa3_qb' };
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const WD = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const todayMs = () => { const n = new Date(); return Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()); };
const parseISO = s => { const p = s.split('-').map(Number); return Date.UTC(p[0], p[1] - 1, p[2]); };
const isoOf = t => new Date(t).toISOString().slice(0, 10);
const fshort = t => { const d = new Date(t); return d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); };
const fday = t => { const d = new Date(t); return WD[d.getUTCDay()] + ' ' + d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()]; };
const hh = x => (Math.round(x * 10) / 10) + 'h';
const half = x => Math.round(x * 2) / 2;
const addMonths = (ms, k) => { const d = new Date(ms); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + k, d.getUTCDate()); };
const topic = id => TOPICS3.find(t => t.id === id) || { color: '#6c5ce7', label: '', short: '' };
const modOf = lm => MODULES.find(m => m.lm === lm);

// ───── planner config ─────
function getCfg() { return Object.assign({ start: EXAM.start, wd: 2, sat: 4, sun: 4, depth: 1.8, months: 2 }, LS.get(K.cfg, {})); }
function saveCfg(c) { LS.set(K.cfg, c); }

// ───── scheduler ─────
function stageOf(f) { return f < 0.6 ? 'Learn' : f < 0.9 ? 'Practice questions' : 'Recap and flashcards'; }
function pieces(a, b, H) {
  const cuts = [half(0.6 * H), half(0.9 * H)].filter(c => c > a + 1e-6 && c < b - 1e-6);
  const pts = [a].concat(cuts, [b]), out = [];
  for (let i = 0; i < pts.length - 1; i++) out.push({ stage: stageOf((pts[i] + pts[i + 1]) / 2 / H), hrs: pts[i + 1] - pts[i] });
  return out;
}
function buildPlan(cfg) {
  const items = [];
  STUDY_ORDER3.forEach(e => {
    if (e === 'o') items.push({ kind: 'orient', t: 'path', label: 'Orientation: exam format, curriculum download, flashcard deck and error log', h: 1 });
    else if (Array.isArray(e)) e.forEach(lm => { const m = modOf(lm); items.push({ kind: 'mod', t: m.t, lm, label: m.n, h: Math.max(1, half(m.h * cfg.depth)) }); });
    else { const p = e.split(':'); items.push({ kind: 'cp', t: p[1], label: p[2], h: 3 }); }
  });
  const start = parseISO(cfg.start), exam = parseISO(EXAM.date), deadline = addMonths(exam, -cfg.months);
  const days = []; let qi = 0, used = 0, capHours = 0;
  for (let t = start; t < deadline; t += DAY) {
    const dow = new Date(t).getUTCDay(), cap = dow === 6 ? cfg.sat : dow === 0 ? cfg.sun : cfg.wd;
    capHours += cap;
    const day = { t, dow, cap, tasks: [] }; let free = cap;
    if (dow === 0 && t !== start && free >= 2) { day.tasks.push({ kind: 'recap', t: 'path', text: 'Weekly recap: flashcards, error log and redo missed questions', hrs: 1 }); free -= 1; }
    while (free > 1e-6 && qi < items.length) {
      const it = items[qi], take = Math.min(free, it.h - used);
      if (it.start == null) it.start = t;
      if (it.kind === 'mod') pieces(used, used + take, it.h).forEach(p => day.tasks.push({ kind: 'mod', t: it.t, lm: it.lm, text: 'LM ' + it.lm + ' · ' + it.label, stage: p.stage, hrs: p.hrs }));
      else day.tasks.push({ kind: it.kind, t: it.t, text: it.label, hrs: take });
      used += take; free -= take;
      if (used >= it.h - 1e-6) { it.end = t; qi++; used = 0; }
    }
    day.buffer = day.tasks.length === 0;
    days.push(day);
  }
  const need = items.reduce((s, i) => s + i.h, 0) + days.filter(d => d.tasks.some(x => x.kind === 'recap')).length;
  const done = qi >= items.length, finish = done ? items[items.length - 1].end : null;
  return { items, days, start, exam, deadline, capHours, need, done, finish,
    slackDays: done ? Math.round((deadline - DAY - finish) / DAY) : 0,
    slackHours: days.filter(d => d.t > (finish || 0)).reduce((s, d) => s + d.cap, 0),
    remaining: done ? 0 : items.slice(qi).reduce((s, i) => s + i.h, 0) - used };
}
let PLAN = null;
function plan() { PLAN = buildPlan(getCfg()); return PLAN; }

// ───── view switching ─────
const VIEWS = {
  dashboard: () => renderDash(), plan: () => renderPlan(), syllabus: () => renderSyllabus(), notes: () => buildNsIndex(),
  formulas: () => renderFormulas(), explainers: () => expInit(), labs: () => renderLabs(), ips: () => renderIps(), cr: () => renderCr(),
  ethics: () => renderEthics(), errors: () => renderErrors(), sessions: () => renderSessions(), downloads: () => renderDownloads()
};
function switchView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.sb-item').forEach(i => i.classList.toggle('active', i.dataset.view === name));
  const v = $('v-' + name); if (v) v.classList.add('active');
  if (VIEWS[name]) VIEWS[name]();
  document.body.classList.remove('nav-open');
  try { history.replaceState(null, '', '#' + name); } catch (e) {}
}
function toggleTheme() {
  const html = document.documentElement, nt = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', nt); try { localStorage.setItem('theme', nt); } catch (e) {} updateThemeButton();
}
function updateThemeButton() { const b = document.querySelector('.theme-toggle'); if (b) b.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙'; }
function loadTheme() { let t = 'dark'; try { t = localStorage.getItem('theme') || 'dark'; } catch (e) {} document.documentElement.setAttribute('data-theme', t); updateThemeButton(); }

// ───── dashboard ─────
function doneMap() { return LS.get(K.done, {}); }
function topicStats() {
  const d = doneMap();
  return TOPICS3.map(t => {
    const ms = MODULES.filter(m => m.t === t.id), n = ms.filter(m => d[m.lm]).length;
    return { t, total: ms.length, n, hrs: ms.reduce((s, m) => s + m.h, 0), hdone: ms.filter(m => d[m.lm]).reduce((s, m) => s + m.h, 0) };
  });
}
function renderDash() {
  const p = plan(), now = todayMs(), exam = parseISO(EXAM.date), ts = topicStats();
  const dLeft = Math.ceil((exam - now) / DAY), dSyl = Math.ceil((p.deadline - DAY - now) / DAY);
  const nDone = ts.reduce((s, x) => s + x.n, 0), covered = ts.reduce((s, x) => s + (x.total ? x.n / x.total : 0) * x.t.mid, 0);
  // pace: modules planned to be finished by today vs ticked
  const planned = p.items.filter(i => i.kind === 'mod' && i.end != null && i.end < now).length;
  const pace = nDone - planned;
  const paceTxt = now < p.start ? 'Plan starts ' + fshort(p.start) : pace >= 0 ? (pace === 0 ? 'On pace' : pace + ' module' + (pace > 1 ? 's' : '') + ' ahead') : Math.abs(pace) + ' module' + (Math.abs(pace) > 1 ? 's' : '') + ' behind';
  const errs = LS.get(K.err, []), due = errs.filter(e => e.due <= isoOf(now) && !e.mastered).length;
  const ses = LS.get(K.sess, []), wkStart = isoOf(now - 6 * DAY), wkMin = ses.filter(s => s.date >= wkStart).reduce((a, s) => a + s.mins, 0);
  $('db-stats').innerHTML =
    stat('DAYS TO EXAM', dLeft > 0 ? dLeft : 0, fshort(exam)) + stat('SYLLABUS DEADLINE', dSyl > 0 ? dSyl + 'd' : 'passed', fshort(p.deadline - DAY)) +
    stat('MODULES DONE', nDone + '/36', paceTxt) + stat('EXAM WEIGHT COVERED', Math.round(covered) + '%', 'by module completion') +
    stat('REVIEWS DUE', due, 'error-log items today') + stat('LAST 7 DAYS', hh(wkMin / 60), 'logged study time');
  // today
  const day = p.days.find(d => d.t === now);
  let tb;
  if (now < p.start) tb = '<div class="note">Your plan begins on ' + fshort(p.start) + '. Use the time to set up your notes and tools.</div>';
  else if (!day) tb = '<div class="note">The syllabus window has ended. You are in the revision and mock phase. Work from the Progress Tracker and Error Log.</div>';
  else if (day.buffer) tb = '<div class="note">Buffer day. Catch up on slipped modules, redo weak questions, or start revision early.</div>';
  else tb = day.tasks.map(t => taskHtml(t)).join('');
  $('db-today').innerHTML = '<div class="section-hdr"><h2>Today · ' + fday(now) + '</h2><a class="link" onclick="switchView(\'plan\')">Open daily plan →</a></div><div class="panel"><div class="tasks">' + tb + '</div></div>';
  $('db-topics').innerHTML = ts.map(x => '<div class="topic-card has-notes" onclick="nsFilter(\'' + x.t.id + '\');switchView(\'notes\')" style="border-top:3px solid ' + x.t.color + '"><div class="tc-icon">' + x.t.icon + '</div><div class="tc-name">' + esc(x.t.short) + '</div><div class="tc-weight">' + x.t.weight + '</div><div class="meter" style="--c:' + x.t.color + '"><i style="width:' + (x.total ? x.n / x.total * 100 : 0) + '%"></i></div><div class="tc-status">' + x.n + '/' + x.total + ' modules · ' + INDEX.filter(c => c.topic === x.t.id).length + ' concepts</div></div>').join('');
  // weakest topics from error log
  const by = {}; errs.filter(e => !e.mastered).forEach(e => by[e.t] = (by[e.t] || 0) + 1);
  const weak = Object.keys(by).sort((a, b) => by[b] - by[a]).slice(0, 3);
  $('db-weak').innerHTML = weak.length ? weak.map(w => '<span class="chip2" style="border-color:' + topic(w).color + '">' + topic(w).icon + ' ' + esc(topic(w).short) + ' · ' + by[w] + ' open errors</span>').join('') : '<span class="note">No open errors yet. Log misses in the Error Log and weak topics appear here.</span>';
}
const stat = (l, v, s) => '<div class="stat-card"><div class="stat-lbl">' + l + '</div><div class="stat-val">' + v + '</div><div class="stat-sub">' + esc(s) + '</div></div>';
function taskHtml(t) {
  const c = topic(t.t).color;
  return '<div class="t" style="--c:' + c + '"><span class="x">' + esc(t.text) + (t.stage ? ' <span class="mut">· ' + esc(t.stage) + '</span>' : '') + '</span><em>' + hh(t.hrs) + '</em></div>';
}

// ───── daily plan ─────
let planMonth = 'all';
function renderPlan() {
  const c = getCfg(); ['start','wd','sat','sun','depth','months'].forEach(k => { const el = $('pl-' + k); if (el && document.activeElement !== el) el.value = c[k]; });
  $('pl-depthv').textContent = Number(c.depth).toFixed(1) + 'x';
  const p = plan();
  let pill, line;
  if (p.done) {
    pill = p.slackDays >= 21 ? '<span class="pill good">On track with room to spare</span>' : p.slackDays >= 7 ? '<span class="pill warn">On track, thin cushion</span>' : '<span class="pill warn">On track, almost no cushion</span>';
    line = '<div class="big">Syllabus done by ' + fshort(p.finish) + '</div><div class="note">' + p.slackDays + ' days (about ' + Math.round(p.slackHours) + ' hours) before the deadline of ' + fshort(p.deadline - DAY) + '.</div>';
  } else { pill = '<span class="pill bad">Short by ' + Math.round(p.remaining) + ' hours</span>'; line = '<div class="big">Not finished by the deadline</div><div class="note">Add hours, lower the depth multiplier, or move the deadline closer to the exam.</div>'; }
  const free = Math.max(0, p.capHours - p.need);
  $('pl-verdict').innerHTML = pill + line + '<div class="legend"><span><b style="background:var(--accent)"></b>Planned ' + Math.round(p.need) + 'h</span><span><b style="background:var(--surface2);border:1px solid var(--border)"></b>Spare ' + Math.round(free) + 'h</span><span>Available ' + Math.round(p.capHours) + 'h</span></div><div class="hrbar"><i style="width:' + Math.min(100, p.need / p.capHours * 100) + '%"></i></div>';
  // phases
  const exam = p.exam, dl = p.deadline, first = p.done ? p.finish + DAY : dl, rev = Math.round((exam - dl) / DAY), r1 = Math.round(rev * .4), mk = Math.round(rev * .45);
  const seg = [
    { n: 'First pass', a: p.start, b: first, c: '#6aa7ff', d: 'Every module once with questions and constructed-response practice.' },
    { n: 'Buffer', a: first, b: dl, c: '#64748b', d: 'Open days for slips, travel and early revision.' },
    { n: 'Revision 1', a: dl, b: dl + r1 * DAY, c: '#4fc9c0', d: 'Topic by topic. Formulas, IPS drills, error log.' },
    { n: 'Mocks', a: dl + r1 * DAY, b: dl + (r1 + mk) * DAY, c: '#ee73a0', d: 'Full timed mocks with a review day after each.' },
    { n: 'Final stretch', a: dl + (r1 + mk) * DAY, b: exam, c: '#f2b84b', d: 'Ethics, weak topics, light formula review, sleep.' }
  ].filter(s => s.b > s.a);
  const tot = exam - p.start;
  $('pl-tl').innerHTML = seg.map(s => '<div style="width:' + ((s.b - s.a) / tot * 100) + '%;background:' + s.c + '">' + ((s.b - s.a) / tot > .09 ? s.n : '') + '</div>').join('');
  $('pl-phases').innerHTML = seg.map(s => '<div class="phase" style="--c:' + s.c + '"><h3>' + s.n + '</h3><span class="d">' + fshort(s.a) + ' → ' + fshort(s.b - DAY) + ' · ' + Math.round((s.b - s.a) / DAY) + ' days</span><p>' + s.d + '</p></div>').join('');
  // month chips and list
  const months = []; p.days.forEach(d => { const dt = new Date(d.t), k = dt.getUTCFullYear() + '-' + dt.getUTCMonth(); if (!months.find(m => m.k === k)) months.push({ k, l: MONTHS[dt.getUTCMonth()] + ' ' + dt.getUTCFullYear() }); });
  $('pl-chips').innerHTML = '<button class="chip" onclick="planMonth=\'all\';renderPlan()" aria-pressed="' + (planMonth === 'all') + '">All</button>' + months.map(m => '<button class="chip" onclick="planMonth=\'' + m.k + '\';renderPlan()" aria-pressed="' + (planMonth === m.k) + '">' + m.l + '</button>').join('');
  const now = todayMs(); let html = '', lastW = null;
  p.days.forEach(d => {
    const dt = new Date(d.t); if (planMonth !== 'all' && planMonth !== dt.getUTCFullYear() + '-' + dt.getUTCMonth()) return;
    const mon = d.t - ((d.dow + 6) % 7) * DAY; if (mon !== lastW) { lastW = mon; html += '<div class="wk">Week of ' + fshort(mon) + '</div>'; }
    html += '<div class="day' + (d.dow === 0 || d.dow === 6 ? ' we' : '') + (d.t === now ? ' today' : '') + '"><div class="dt">' + fday(d.t) + '<small>' + dt.getUTCFullYear() + '</small></div><div class="hr">' + hh(d.cap) + '</div><div class="tasks">' + (d.buffer ? '<div class="t buf"><span class="x">Buffer day. Catch up, redo weak questions, or start revision early.</span></div>' : d.tasks.map(taskHtml).join('')) + '</div></div>';
  });
  $('pl-list').innerHTML = html;
}
function planInput() {
  const n = id => parseFloat($('pl-' + id).value);
  const c = { start: $('pl-start').value || EXAM.start, wd: n('wd') || 0, sat: n('sat') || 0, sun: n('sun') || 0, depth: n('depth') || 1.8, months: isNaN(n('months')) ? 2 : n('months') };
  if (parseISO(c.start) >= parseISO(EXAM.date)) return;
  saveCfg(c); renderPlan();
}
function planToday() { const el = document.querySelector('#pl-list .day.today'); if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }

// ───── syllabus (book by book) ─────
function renderSyllabus() {
  const p = plan(), d = doneMap();
  const nDone = MODULES.filter(m => d[m.lm]).length;
  $('sy-pct').textContent = Math.round(nDone / 36 * 100) + '%';
  $('sy-bar').style.width = (nDone / 36 * 100) + '%';
  $('sy-note').textContent = nDone + ' of 36 modules done. Ticks are saved in this browser and shared with the Progress Tracker.';
  const stars = n => '●'.repeat(n) + '○'.repeat(3 - n);
  $('sy-books').innerHTML = TOPICS3.map(t => {
    const ms = MODULES.filter(m => m.t === t.id).sort((a, b) => STUDY_ORDER3.flat().indexOf(a.lm) - STUDY_ORDER3.flat().indexOf(b.lm));
    const rows = ms.map(m => {
      const it = p.items.find(i => i.kind === 'mod' && i.lm === m.lm), cc = INDEX.filter(c => c.topic === t.id).length;
      return '<tr><td class="chk"><input type="checkbox" ' + (d[m.lm] ? 'checked ' : '') + 'onchange="toggleMod(' + m.lm + ',this.checked)" aria-label="Module ' + m.lm + ' done"></td><td class="n">' + m.lm + '</td><td>' + esc(m.n) + '</td><td class="n" title="How often this appears as constructed response">' + stars(m.cr) + '</td><td class="n">' + hh(it ? it.h : m.h) + '</td><td class="n">' + (it && it.start ? fshort(it.start) + (it.end && it.end !== it.start ? ' → ' + fshort(it.end) : '') : '—') + '</td></tr>';
    }).join('');
    const hrs = ms.reduce((s, m) => s + (p.items.find(i => i.kind === 'mod' && i.lm === m.lm) || { h: m.h }).h, 0);
    return '<div class="vol" style="--c:' + t.color + '"><div class="vh"><h3>' + t.icon + ' ' + esc(t.label) + '</h3><span class="w">' + t.vol + ' · ' + t.weight + ' of exam · ' + ms.length + ' modules · ' + hh(hrs) + '</span></div><div class="tw"><table><thead><tr><th></th><th class="n">LM</th><th>Learning module</th><th class="n">CR</th><th class="n">Hours</th><th class="n">Window</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
  }).join('');
}
function toggleMod(lm, on) { const d = doneMap(); if (on) d[lm] = isoOf(todayMs()); else delete d[lm]; LS.set(K.done, d); renderSyllabus(); }
