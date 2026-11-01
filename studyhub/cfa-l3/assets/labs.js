// CFA L3 hub — 7 live calculators.
'use strict';
const num = (id) => { const v = parseFloat($(id).value); return isNaN(v) ? 0 : v; };
const f2 = (x, d) => (isFinite(x) ? x.toLocaleString('en-US', { minimumFractionDigits: d == null ? 2 : d, maximumFractionDigits: d == null ? 2 : d }) : '—');
const pc = (x, d) => f2(x * 100, d == null ? 2 : d) + '%';
function fld(id, label, val, step) { return '<label class="f"><span>' + label + '</span><input id="' + id + '" type="number" step="' + (step || 'any') + '" value="' + val + '" oninput="LABS[curLab].run()"></label>'; }
function out(rows) { return '<table class="kv">' + rows.map(r => '<tr><td>' + r[0] + '</td><td class="n"><b>' + r[1] + '</b></td></tr>').join('') + '</table>'; }
function svgLines(series, xs, o) {
  o = o || {}; const W = 520, H = 240, m = { l: 46, r: 12, t: 12, b: 28 };
  const ally = series.flatMap(s => s.y), x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
  let y0 = Math.min.apply(null, ally), y1 = Math.max.apply(null, ally); if (y0 === y1) { y0 -= 1; y1 += 1; }
  const px = x => m.l + (x - x0) / (x1 - x0 || 1) * (W - m.l - m.r), py = y => H - m.b - (y - y0) / (y1 - y0) * (H - m.t - m.b);
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="chart" role="img" aria-label="' + (o.label || 'chart') + '">';
  for (let i = 0; i <= 4; i++) { const v = y0 + (y1 - y0) * i / 4, y = py(v); s += '<line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + y + '" y2="' + y + '" class="gl"/><text x="' + (m.l - 6) + '" y="' + (y + 4) + '" text-anchor="end" class="ax">' + (o.yfmt ? o.yfmt(v) : f2(v, 1)) + '</text>'; }
  for (let i = 0; i <= 4; i++) { const v = x0 + (x1 - x0) * i / 4; s += '<text x="' + px(v) + '" y="' + (H - 8) + '" text-anchor="middle" class="ax">' + (o.xfmt ? o.xfmt(v) : f2(v, 1)) + '</text>'; }
  if (y0 < 0 && y1 > 0) s += '<line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + py(0) + '" y2="' + py(0) + '" class="zero"/>';
  series.forEach(se => { s += se.dots ? se.x.map((x, i) => '<circle cx="' + px(x) + '" cy="' + py(se.y[i]) + '" r="4.5" fill="' + se.c + '"/>').join('') : '<polyline fill="none" stroke="' + se.c + '" stroke-width="2.2" stroke-dasharray="' + (se.dash || '') + '" points="' + (se.x || xs).map((x, i) => px(x) + ',' + py(se.y[i])).join(' ') + '"/>'; });
  return s + '</svg>';
}

const LABS = {
  opt: { name: 'Option strategy payoff', note: 'Profit at expiry for common overlays. Premiums are per share.',
    html: () => '<label class="f"><span>Strategy</span><select id="o-s" onchange="LABS.opt.run()"><option value="cc">Covered call</option><option value="pp">Protective put</option><option value="col">Collar</option><option value="bcs">Bull call spread</option><option value="lc">Long call</option><option value="str">Long straddle</option></select></label>' + fld('o-s0', 'Spot / purchase price', 100) + fld('o-k1', 'Strike 1 (put or long call)', 95) + fld('o-k2', 'Strike 2 (short call)', 110) + fld('o-p1', 'Premium 1', 2.5) + fld('o-p2', 'Premium 2', 3),
    run() {
      const st = $('o-s').value, S0 = num('o-s0'), K1 = num('o-k1'), K2 = num('o-k2'), p1 = num('o-p1'), p2 = num('o-p2');
      const call = (S, K) => Math.max(S - K, 0), put = (S, K) => Math.max(K - S, 0);
      const pay = S => ({ cc: (S - S0) - call(S, K2) + p2, pp: (S - S0) + put(S, K1) - p1, col: (S - S0) + put(S, K1) - p1 - call(S, K2) + p2, bcs: call(S, K1) - p1 - call(S, K2) + p2, lc: call(S, K1) - p1, str: call(S, K1) + put(S, K1) - p1 - p2 })[st];
      const xs = []; for (let S = S0 * 0.6; S <= S0 * 1.4 + 1e-9; S += S0 * 0.01) xs.push(S);
      const ys = xs.map(pay), lo = Math.min.apply(null, ys), hi = Math.max.apply(null, ys), be = [];
      for (let i = 1; i < xs.length; i++) if ((ys[i - 1] < 0) !== (ys[i] < 0) && ys[i - 1] !== 0) be.push(xs[i - 1] + (xs[i] - xs[i - 1]) * (-ys[i - 1]) / (ys[i] - ys[i - 1]));
      const unl = st === 'lc' || st === 'str' || st === 'pp';
      $('lab-out').innerHTML = svgLines([{ x: xs, y: ys, c: '#6c5ce7' }, { x: xs, y: xs.map(S => S - S0), c: '#64748b', dash: '4 4' }], xs, { label: 'Payoff', yfmt: v => f2(v, 0), xfmt: v => f2(v, 0) }) +
        out([['Max loss (in range)', f2(lo)], ['Max gain (in range)', st === 'lc' || st === 'str' ? 'Unlimited (' + f2(hi) + ' at range edge)' : st === 'pp' ? 'Unlimited (' + f2(hi) + ' at range edge)' : f2(hi)], ['Break-even(s)', be.length ? be.map(b => f2(b)).join(' and ') : 'none in range'], ['Dashed line', 'Unhedged stock P&L']]);
    } },
  is: { name: 'Implementation shortfall', note: 'Buy order. Splits the cost of trading into delay, impact, explicit and opportunity cost.',
    html: () => fld('i-dec', 'Decision price', 50) + fld('i-arr', 'Arrival price (when order released)', 50.2) + fld('i-avg', 'Average execution price', 50.5) + fld('i-close', 'Closing price (end of horizon)', 51) + fld('i-q', 'Shares ordered', 10000, 1) + fld('i-qe', 'Shares executed', 8000, 1) + fld('i-c', 'Commission per share', 0.02),
    run() {
      const d = num('i-dec'), a = num('i-arr'), v = num('i-avg'), c = num('i-close'), q = num('i-q'), qe = Math.min(num('i-qe'), q), cm = num('i-c');
      const delay = (a - d) * qe, imp = (v - a) * qe, exp = cm * qe, opp = (c - d) * (q - qe), tot = delay + imp + exp + opp, paper = d * q;
      $('lab-out').innerHTML = out([['Delay cost', '$' + f2(delay)], ['Trading / market impact', '$' + f2(imp)], ['Explicit costs', '$' + f2(exp)], ['Missed-trade opportunity cost', '$' + f2(opp)], ['Total implementation shortfall', '$' + f2(tot)], ['As % of paper value ($' + f2(paper, 0) + ')', f2(tot / paper * 10000, 1) + ' bps'], ['Fill rate', pc(qe / q, 1)]]) +
        '<p class="mut">Delay = (arrival − decision) × executed. Impact = (average − arrival) × executed. Opportunity = (close − decision) × unexecuted. A fast, aggressive trade raises impact; a slow, patient one raises delay and opportunity cost.</p>';
    } },
  br: { name: 'Brinson attribution', note: 'Allocation, selection and interaction by sector (Brinson-Fachler allocation).',
    html: () => '<table class="grid"><thead><tr><th>Sector</th><th>Port wt %</th><th>Bench wt %</th><th>Port ret %</th><th>Bench ret %</th></tr></thead><tbody>' +
      [['Equity', 60, 50, 9, 8], ['Bonds', 30, 40, 3, 4], ['Alts', 10, 10, 6, 5]].map((r, i) => '<tr><td>' + r[0] + '</td>' + r.slice(1).map((v, j) => '<td><input id="b-' + i + '-' + j + '" type="number" step="any" value="' + v + '" oninput="LABS.br.run()"></td>').join('') + '</tr>').join('') + '</tbody></table>',
    run() {
      const rows = [0, 1, 2].map(i => [0, 1, 2, 3].map(j => num('b-' + i + '-' + j) / 100)), names = ['Equity', 'Bonds', 'Alts'];
      const Rb = rows.reduce((s, r) => s + r[1] * r[3], 0), Rp = rows.reduce((s, r) => s + r[0] * r[2], 0);
      let A = 0, S = 0, I = 0; const body = rows.map((r, i) => { const a = (r[0] - r[1]) * (r[3] - Rb), s = r[1] * (r[2] - r[3]), x = (r[0] - r[1]) * (r[2] - r[3]); A += a; S += s; I += x; return '<tr><td>' + names[i] + '</td><td class="n">' + pc(a, 3) + '</td><td class="n">' + pc(s, 3) + '</td><td class="n">' + pc(x, 3) + '</td><td class="n">' + pc(a + s + x, 3) + '</td></tr>'; }).join('');
      const w = rows.reduce((s, r) => s + r[0], 0), wb = rows.reduce((s, r) => s + r[1], 0);
      $('lab-out').innerHTML = '<table class="grid"><thead><tr><th>Sector</th><th>Allocation</th><th>Selection</th><th>Interaction</th><th>Total</th></tr></thead><tbody>' + body + '<tr class="tot"><td>Total</td><td class="n">' + pc(A, 3) + '</td><td class="n">' + pc(S, 3) + '</td><td class="n">' + pc(I, 3) + '</td><td class="n">' + pc(A + S + I, 3) + '</td></tr></tbody></table>' +
        out([['Portfolio return', pc(Rp, 3)], ['Benchmark return', pc(Rb, 3)], ['Active return', pc(Rp - Rb, 3)], ['Check: sum of effects', pc(A + S + I, 3)]]) + (Math.abs(w - 1) > 1e-6 || Math.abs(wb - 1) > 1e-6 ? '<p class="warn">Weights should each sum to 100% (portfolio ' + pc(w, 1) + ', benchmark ' + pc(wb, 1) + ').</p>' : '');
    } },
  fx: { name: 'Currency hedging', note: 'Covered interest parity forward, hedged return and minimum-variance hedge ratio. Quote is domestic per 1 foreign.',
    html: () => fld('x-s', 'Spot (domestic per foreign)', 1.1) + fld('x-rd', 'Domestic rate % (annual)', 4) + fld('x-rf', 'Foreign rate % (annual)', 2) + fld('x-d', 'Horizon (days)', 90, 1) + fld('x-ra', 'Foreign asset local return % (period)', 3) + fld('x-sa', 'Asset local-return volatility %', 12) + fld('x-sx', 'Currency volatility %', 8) + fld('x-rho', 'Correlation (asset vs currency)', 0.3),
    run() {
      const S = num('x-s'), rd = num('x-rd') / 100, rf = num('x-rf') / 100, d = num('x-d'), t = d / 360, F = S * (1 + rd * t) / (1 + rf * t), ra = num('x-ra') / 100, sa = num('x-sa') / 100, sx = num('x-sx') / 100, rho = num('x-rho');
      const prem = F / S - 1;
      const h = rho * sa / sx;
      $('lab-out').innerHTML = out([['Forward rate (CIP)', f2(F, 4)], ['Forward points (× 10,000)', f2((F - S) * 10000, 1)], ['Forward premium / (discount) on foreign currency', pc(prem, 3)], ['Hedged domestic return ≈ local + (r_d − r_f)·t', pc(ra + (rd - rf) * t, 3)], ['Hedged domestic return (exact, asset value hedged at F)', pc((1 + ra) * F / S - 1, 3)], ['Min-variance hedge ratio = ρ·σ_asset / σ_fx', f2(h, 2)]]) +
        '<p class="mut">If the domestic rate is above the foreign rate the foreign currency trades at a forward premium, so hedging <i>adds</i> roughly the rate gap to the hedged return. If it is below, hedging costs you the gap. A hedge ratio above 1 means the asset is itself currency sensitive (asset and currency move together).</p>';
    } },
  ra: { name: 'Risk-adjusted metrics and Fundamental Law', note: 'Sharpe, Treynor, M², Jensen, Sortino, Information ratio, then IR from the Fundamental Law.',
    html: () => fld('r-rp', 'Portfolio return %', 9) + fld('r-rf', 'Risk-free %', 2) + fld('r-sd', 'Portfolio volatility %', 14) + fld('r-b', 'Beta', 1.1) + fld('r-rm', 'Market return %', 7.5) + fld('r-sm', 'Market volatility %', 12) + fld('r-dd', 'Downside deviation % (vs MAR)', 8) + fld('r-mar', 'MAR %', 2) + fld('r-rb', 'Benchmark return %', 8) + fld('r-te', 'Tracking error %', 3.5) + '<hr>' + fld('r-ic', 'Information coefficient', 0.06) + fld('r-br', 'Breadth (independent bets/yr)', 80, 1) + fld('r-tc', 'Transfer coefficient', 0.75) + fld('r-ar', 'Target active risk %', 4),
    run() {
      const rp = num('r-rp') / 100, rf = num('r-rf') / 100, sd = num('r-sd') / 100, b = num('r-b'), rm = num('r-rm') / 100, sm = num('r-sm') / 100, dd = num('r-dd') / 100, mar = num('r-mar') / 100, rb = num('r-rb') / 100, te = num('r-te') / 100, ic = num('r-ic'), br = num('r-br'), tc = num('r-tc'), ar = num('r-ar') / 100;
      const sh = (rp - rf) / sd, m2 = sh * sm + rf, ir = (rp - rb) / te, fl = ic * Math.sqrt(br) * tc;
      $('lab-out').innerHTML = out([['Sharpe', f2(sh, 3)], ['Treynor', pc((rp - rf) / b, 2)], ['M² (return at market risk)', pc(m2, 2) + ' (vs market ' + pc(rm, 2) + ')'], ['Jensen alpha', pc(rp - (rf + b * (rm - rf)), 2)], ['Sortino', f2((rp - mar) / dd, 3)], ['Information ratio', f2(ir, 3)], ['Active return', pc(rp - rb, 2)]]) +
        '<h4>Fundamental Law</h4>' + out([['Expected IR = IC·√BR·TC', f2(fl, 3)], ['Expected active return at target risk', pc(fl * ar, 2)], ['Ex-ante IR with TC = 1', f2(ic * Math.sqrt(br), 3)], ['Breadth needed for IR 0.5 (same IC, TC)', f2(Math.pow(0.5 / (ic * tc), 2), 0)]]);
    } },
  ef: { name: 'Efficient frontier and CAL', note: 'Two risky assets plus a risk-free asset. Finds the minimum-variance and tangency portfolios and the optimal mix for your risk aversion.',
    html: () => fld('e-e1', 'Asset 1 expected return %', 8) + fld('e-s1', 'Asset 1 volatility %', 15) + fld('e-e2', 'Asset 2 expected return %', 4) + fld('e-s2', 'Asset 2 volatility %', 6) + fld('e-r', 'Correlation', 0.2) + fld('e-rf', 'Risk-free %', 2) + fld('e-a', 'Risk aversion A (U = E − ½Aσ²)', 4),
    run() {
      const e1 = num('e-e1') / 100, s1 = num('e-s1') / 100, e2 = num('e-e2') / 100, s2 = num('e-s2') / 100, r = Math.max(-1, Math.min(1, num('e-r'))), rf = num('e-rf') / 100, A = num('e-a') || 1;
      const pt = w => { const v = w * w * s1 * s1 + (1 - w) * (1 - w) * s2 * s2 + 2 * w * (1 - w) * r * s1 * s2; return { e: w * e1 + (1 - w) * e2, s: Math.sqrt(v) }; };
      const gmv = (s2 * s2 - r * s1 * s2) / (s1 * s1 + s2 * s2 - 2 * r * s1 * s2);
      const x1 = e1 - rf, x2 = e2 - rf, wt = (x1 * s2 * s2 - x2 * r * s1 * s2) / (x1 * s2 * s2 + x2 * s1 * s1 - (x1 + x2) * r * s1 * s2);
      const T = pt(wt), G = pt(gmv), sr = (T.e - rf) / T.s, y = (T.e - rf) / (A * T.s * T.s), O = { e: rf + y * (T.e - rf), s: y * T.s };
      const ws = []; for (let w = -0.5; w <= 1.5001; w += 0.02) ws.push(w); const fr = ws.map(pt), sx = fr.map(p => p.s * 100), sy = fr.map(p => p.e * 100), smax = Math.max.apply(null, sx);
      const cx = [0, smax], cy = [rf * 100, (rf + sr * smax / 100) * 100];
      $('lab-out').innerHTML = svgLines([{ x: sx, y: sy, c: '#6c5ce7' }, { x: cx, y: cy, c: '#f2b84b', dash: '5 4' }, { x: [T.s * 100], y: [T.e * 100], c: '#ee73a0', dots: true }, { x: [G.s * 100], y: [G.e * 100], c: '#4fc9c0', dots: true }, { x: [O.s * 100], y: [O.e * 100], c: '#fff', dots: true }], [0, smax], { label: 'Efficient frontier', xfmt: v => f2(v, 0) + '%', yfmt: v => f2(v, 0) + '%' }) +
        '<p class="legend2"><b style="background:#6c5ce7"></b>Frontier <b style="background:#f2b84b"></b>CAL <b style="background:#ee73a0"></b>Tangency <b style="background:#4fc9c0"></b>Min-variance <b style="background:#cbd5e1"></b>Your optimum</p>' +
        out([['Min-variance weight in asset 1', pc(gmv, 1)], ['Min-variance return / risk', pc(G.e, 2) + ' / ' + pc(G.s, 2)], ['Tangency weight in asset 1', pc(wt, 1)], ['Tangency return / risk', pc(T.e, 2) + ' / ' + pc(T.s, 2)], ['Maximum Sharpe ratio', f2(sr, 3)], ['Optimal weight in risky portfolio y* = (E−rf)/(Aσ²)', pc(y, 1) + (y > 1 ? ' (leveraged)' : '')], ['Optimal complete portfolio return / risk', pc(O.e, 2) + ' / ' + pc(O.s, 2)]]);
    } },
  ldi: { name: 'Liability-driven investing', note: 'Funded status, duration gap, surplus sensitivity and the futures overlay that closes the gap.',
    html: () => fld('l-a', 'Asset value ($m)', 1000) + fld('l-l', 'Liability PV ($m)', 1100) + fld('l-da', 'Asset duration', 6) + fld('l-dl', 'Liability duration', 12) + fld('l-dy', 'Parallel rate change (bp)', -100, 1) + fld('l-df', 'Futures modified duration', 7) + fld('l-fp', 'Futures price per contract ($)', 120000, 1),
    run() {
      const A = num('l-a'), L = num('l-l'), Da = num('l-da'), Dl = num('l-dl'), dy = num('l-dy') / 10000, Df = num('l-df') || 1, Fp = num('l-fp') || 1;
      const gap = Da - Dl * L / A, dA = -Da * A * dy, dL = -Dl * L * dy, dS = dA - dL, need = (Dl * L - Da * A) * 1e6 / (Df * Fp);
      $('lab-out').innerHTML = out([['Funded ratio', pc(A / L, 1)], ['Surplus', '$' + f2(A - L, 1) + 'm'], ['Duration gap = D_A − D_L·(L/A)', f2(gap, 2) + ' years'], ['Asset change for ' + f2(dy * 10000, 0) + ' bp', '$' + f2(dA, 1) + 'm'], ['Liability change', '$' + f2(dL, 1) + 'm'], ['Surplus change', '$' + f2(dS, 1) + 'm'], ['DV01 assets / liabilities', '$' + f2(Da * A * 0.0001, 3) + 'm / $' + f2(Dl * L * 0.0001, 3) + 'm'], ['Futures to close the gap', (need >= 0 ? 'Buy ' : 'Sell ') + f2(Math.abs(need), 0) + ' contracts']]) +
        '<p class="mut">An underfunded plan with shorter-duration assets loses surplus when rates fall, because liabilities rise faster. Lengthen asset duration or buy futures to match DV01, or hold cash-flow-matched bonds for full immunization. Duration matching only covers parallel shifts, so check key-rate durations too.</p>';
    } }
};
let curLab = 'opt';
function renderLabs() {
  $('lab-tabs').innerHTML = Object.keys(LABS).map(k => '<button class="chip" aria-pressed="' + (k === curLab) + '" onclick="curLab=\'' + k + '\';renderLabs()">' + LABS[k].name + '</button>').join('');
  $('lab-note').textContent = LABS[curLab].note; $('lab-in').innerHTML = LABS[curLab].html(); LABS[curLab].run();
}
