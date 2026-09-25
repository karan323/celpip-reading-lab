(function () {
'use strict';
var RS = window.RS || { p1: [], p2: [], p3: [], p4: [] };
['p1', 'p2', 'p3', 'p4'].forEach(function (k) { RS[k].sort(function (a, b) { return a.id < b.id ? -1 : 1; }); });

var PARTS = {
  1: { key: 'p1', name: 'Reading Correspondence', short: 'Correspondence', n: 11, min: 11 },
  2: { key: 'p2', name: 'Reading to Apply a Diagram', short: 'Diagram', n: 8, min: 9 },
  3: { key: 'p3', name: 'Reading for Information', short: 'Information', n: 9, min: 10 },
  4: { key: 'p4', name: 'Reading for Viewpoints', short: 'Viewpoints', n: 10, min: 13 }
};
var LV = { H: { name: 'Hard', note: 'CLB 10–11 level' }, M: { name: 'Moderate', note: 'Real-exam level, CLB 8–9' }, E: { name: 'Easy', note: 'Warm-up, CLB 6–7' } };
var GROUPS = {
  p1a: 'Part 1 · Letter questions (1–6)', p1b: 'Part 1 · Reply blanks (7–11)',
  p2a: 'Part 2 · Email blanks (1–5)', p2b: 'Part 2 · Email questions (6–8)',
  p3m: 'Part 3 · Paragraph matching (A–D)', p3e: 'Part 3 · Not given (E)',
  p4a: 'Part 4 · Article viewpoints (1–5)', p4b: 'Part 4 · Comment blanks (6–10)'
};
var SHORTG = { p1a: 'Letter question', p1b: 'Reply blank', p2a: 'Email blank', p2b: 'Email question', p3m: 'Paragraph match', p3e: 'Paragraph match', p4a: 'Viewpoint question', p4b: 'Comment blank' };
var TIPS = {
  1: ['Questions 1–6 follow the order of the letter. The right option paraphrases the letter; traps reuse its exact words.',
      'Questions 7–11: read the whole reply first. Check each blank for fact, then grammar, then tone.',
      'Read the sentence back with your answer in it. If it sounds wrong, it is wrong.'],
  2: ['Blanks 1–5: find what the writer needs, then find the matching detail in the diagram.',
      'Watch the conditions: dates, limits, "only", "not included", discounts that apply to some options only.',
      'Questions 6–8 are about the email itself: purpose, feelings, what happens next.'],
  3: ['Before the statements, label each paragraph in 3–4 words.',
      'Match the main subject of the statement first. Treat descriptive details as secondary.',
      'Choose E only when the key idea is missing from every paragraph, or when a paragraph says something close but different.'],
  4: ['Make a quick name → position map (3 words each) before answering.',
      'The top trap is the right idea but the wrong person. Check who said it.',
      'Comment blanks: the commenter agrees with some people and disagrees with others. Track which.']
};
var ICON = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
  redo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>'
};

/* ---------- storage (per-browser convenience; app works without it) ---------- */
var KEY = 'celpipReadingLab.v1';
function load() {
  try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && s.att) { s.mocks = s.mocks || {}; s.ui = s.ui || {}; return s; } } catch (e) {}
  return { att: {}, mocks: {}, timer: true, ui: {} };
}
var store = load();
function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} }

/* ---------- helpers ---------- */
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function order(id, n, len) { var r = rng(hash(id + '#' + n)), a = []; for (var i = 0; i < len; i++) a.push(i); for (var j = len - 1; j > 0; j--) { var k = Math.floor(r() * (j + 1)); var t = a[j]; a[j] = a[k]; a[k] = t; } return a; }
function mmss(s) { s = Math.max(0, Math.round(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
function pad2(n) { return String(n).padStart(2, '0'); }
function reduced() { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; }
function clb(raw) { return raw >= 37 ? 12 : raw >= 35 ? 11 : raw >= 33 ? 10 : raw >= 31 ? 9 : raw >= 28 ? 8 : raw >= 24 ? 7 : raw >= 19 ? 6 : raw >= 15 ? 5 : raw >= 10 ? 4 : 3; }
function pace(pct) { return pct >= 86.8 ? 'CLB 10+ pace' : pct >= 81.5 ? 'CLB 9 pace' : pct >= 73.6 ? 'CLB 8 pace' : pct >= 63 ? 'CLB 7 pace' : 'Below CLB 7 pace'; }
function tone(pct) { return pct >= 82 ? 'g' : pct >= 70 ? 'm' : 'b'; }
function sets(p) { return RS[PARTS[p].key]; }
function fmtDate(t) { var d = new Date(t); return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ', ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); }

function items(set, p) {
  var out = [];
  function mc(arr, start, g) { arr.forEach(function (q, i) { out.push({ n: start + i, k: 'mc', stem: q[0], o: q[1], ev: q[2], x: q[3], g: g }); }); }
  function bl(arr, start, g) { arr.forEach(function (b, i) { out.push({ n: start + i, k: 'bl', o: b[0], ev: b[1], x: b[2], g: g }); }); }
  if (p === 1) { mc(set.q, 1, 'p1a'); bl(set.b, 7, 'p1b'); }
  if (p === 2) { bl(set.b, 1, 'p2a'); mc(set.q, 6, 'p2b'); }
  if (p === 3) { set.st.forEach(function (s, i) { out.push({ n: i + 1, k: 'st', stem: s[0], c: s[1], ev: s[2], x: s[3], g: s[1] === 'E' ? 'p3e' : 'p3m' }); }); }
  if (p === 4) { mc(set.q, 1, 'p4a'); bl(set.b, 6, 'p4b'); }
  return out;
}
function right(it, a) { return it.k === 'st' ? a === it.c : a === 0; }
function ansText(it, a) { if (a === undefined || a === null) return '(no answer)'; if (it.k === 'st') return a === 'E' ? 'E (not given)' : a; return it.o[a]; }
function corText(it) { return it.k === 'st' ? (it.c === 'E' ? 'E (not given)' : it.c) : it.o[0]; }
function score(set, p, ans) { var its = items(set, p), s = 0; its.forEach(function (it) { if (right(it, ans[it.n])) s++; }); return { s: s, t: its.length }; }
function latest(id) { var a = store.att[id]; return a && a.length ? a[a.length - 1] : null; }
function best(id) { var a = store.att[id]; if (!a || !a.length) return null; return a.reduce(function (m, x) { return x.s > m.s ? x : m; }); }
function partOf(id) { return +id.charAt(1); }
function findSet(id) { var p = partOf(id); var arr = sets(p); for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return { set: arr[i], p: p, idx: i }; return null; }

/* evidence marking */
function evMap(its) { var m = new Map(), alias = {}; its.forEach(function (it) { if (!it.ev) return; if (!m.has(it.ev)) m.set(it.ev, 'ev-' + it.n); alias[it.n] = m.get(it.ev); }); return { m: m, alias: alias }; }
function mark(raw, evs) {
  if (!evs || !evs.size) return esc(raw);
  var ranges = [];
  evs.forEach(function (id, ev) { var i = raw.indexOf(ev); if (i >= 0) ranges.push([i, i + ev.length, id]); });
  ranges.sort(function (a, b) { return a[0] - b[0]; });
  var html = '', pos = 0;
  ranges.forEach(function (r) { if (r[0] < pos) return; html += esc(raw.slice(pos, r[0])) + '<mark class="ev" id="' + r[2] + '" tabindex="-1">' + esc(raw.slice(r[0], r[1])) + '</mark>'; pos = r[1]; });
  return html + esc(raw.slice(pos));
}
function paras(html) { return '<p>' + html.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>') + '</p>'; }

/* ---------- app state ---------- */
var ui = { view: 'home', tab: store.ui.tab || 'parts', part: store.ui.part || 1, lv: store.ui.lv || 'all' };
var cur = null;       // active test
var rv = null;        // active review
var mock = null;      // active mock run
var tick = null;
var app = document.getElementById('app');

function go(view) { if (view !== ui.view) ui.show = null; ui.view = view; store.ui = { tab: ui.tab, part: ui.part, lv: ui.lv }; save(); render(); window.scrollTo(0, 0); }

/* ---------- modal ---------- */
function ask(title, body, okLabel, cancelLabel) {
  return new Promise(function (res) {
    var m = document.getElementById('modal');
    m.innerHTML = '<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlgT"><h2 id="dlgT">' + esc(title) + '</h2><p class="muted">' + esc(body) + '</p><div class="row"><button class="btn" data-r="0">' + esc(cancelLabel) + '</button><button class="btn primary" data-r="1">' + esc(okLabel) + '</button></div></div>';
    m.hidden = false;
    var prev = document.activeElement;
    m.querySelector('[data-r="1"]').focus();
    function done(v) { m.hidden = true; m.innerHTML = ''; document.removeEventListener('keydown', onKey); if (prev && prev.focus) prev.focus(); res(v); }
    function onKey(e) { if (e.key === 'Escape') done(false); }
    document.addEventListener('keydown', onKey);
    m.onclick = function (e) { var b = e.target.closest('[data-r]'); if (b) done(b.dataset.r === '1'); else if (e.target === m) done(false); };
  });
}

/* ---------- HOME ---------- */
function statsHTML() {
  var total = 0, done = 0, recent = [];
  [1, 2, 3, 4].forEach(function (p) { sets(p).forEach(function (s) { total++; var a = store.att[s.id]; if (a && a.length) { done++; a.forEach(function (x) { recent.push(x); }); } }); });
  recent.sort(function (a, b) { return b.d - a.d; });
  var last = recent.slice(0, 10), avg = null;
  if (last.length) { var s = 0, t = 0; last.forEach(function (x) { s += x.s; t += x.t; }); avg = Math.round(100 * s / t); }
  var bestMock = null;
  Object.keys(store.mocks).forEach(function (k) { store.mocks[k].forEach(function (m) { if (!bestMock || m.raw > bestMock.raw) bestMock = m; }); });
  var g = groupStats(), weak = null;
  Object.keys(g).forEach(function (k) { if (g[k].t >= 5 && (!weak || g[k].s / g[k].t < weak.r)) weak = { k: k, r: g[k].s / g[k].t }; });
  return '<div class="stats">' +
    '<div class="stat"><b>' + done + '<span class="muted" style="font-size:15px">/' + total + '</span></b><span>Tests completed</span></div>' +
    '<div class="stat"><b>' + (avg === null ? '–' : avg + '%') + '</b><span>Accuracy, last 10 tests</span></div>' +
    '<div class="stat"><b>' + (bestMock ? 'CLB ' + bestMock.clb : '–') + '</b><span>' + (bestMock ? 'Best mock · ' + bestMock.raw + '/38' : 'Best full mock') + '</span></div>' +
    '<div class="stat"><b style="font-family:var(--sans);font-size:15px;font-weight:600;line-height:1.35;min-height:30px">' + (weak ? esc(SHORTG[weak.k] + (weak.k === 'p3e' ? ' (E)' : '')) + ' · ' + Math.round(weak.r * 100) + '%' : 'Not enough data') + '</b><span>Weakest question type</span></div>' +
    '</div>';
}
function groupStats() {
  var g = {};
  Object.keys(GROUPS).forEach(function (k) { g[k] = { s: 0, t: 0 }; });
  Object.keys(store.att).forEach(function (id) {
    var f = findSet(id), a = latest(id); if (!f || !a || !a.a) return;
    items(f.set, f.p).forEach(function (it) { g[it.g].t++; if (right(it, a.a[it.n])) g[it.g].s++; });
  });
  return g;
}
function homeHTML() {
  var h = '<div class="wrap"><header class="top"><div class="brand"><h1>CELPIP Reading Lab</h1><p>' +
    (RS.p1.length + RS.p2.length + RS.p3.length + RS.p4.length) + ' tests in the real exam format · Hard to Easy · target CLB 10</p></div>' +
    '<button class="btn" id="tmToggle" aria-pressed="' + (store.timer ? 'true' : 'false') + '">' + ICON.clock + (store.timer ? 'Exam timer on' : 'Calm mode (no timer)') + '</button></header>';
  h += statsHTML();
  h += '<div class="tabs" role="tablist">' +
    [['parts', 'Practice by part'], ['mocks', 'Full mock exams'], ['prog', 'Progress']].map(function (t) {
      return '<button class="tab" role="tab" data-tab="' + t[0] + '" aria-selected="' + (ui.tab === t[0]) + '">' + t[1] + '</button>';
    }).join('') + '</div>';
  if (ui.tab === 'parts') h += partsHTML();
  else if (ui.tab === 'mocks') h += mocksHTML();
  else h += progHTML();
  return h + '</div>';
}
function partsHTML() {
  var h = '<div class="parts">';
  [1, 2, 3, 4].forEach(function (p) {
    var P = PARTS[p], arr = sets(p), done = 0, s = 0, t = 0;
    arr.forEach(function (x) { var a = latest(x.id); if (a) { done++; s += a.s; t += a.t; } });
    var pct = arr.length ? Math.round(100 * done / arr.length) : 0;
    h += '<button class="pcard" data-part="' + p + '" aria-pressed="' + (ui.part === p) + '"><span class="eyebrow">Part ' + p + '</span><h3>' + P.name + '</h3>' +
      '<span class="meta">' + P.n + ' questions · ' + P.min + ' min</span><span class="bar"><i style="width:' + pct + '%"></i></span>' +
      '<span class="foot"><span>' + done + '/' + arr.length + ' done</span><span>' + (t ? Math.round(100 * s / t) + '% correct' : '') + '</span></span></button>';
  });
  h += '</div>';
  h += '<div class="tips"><h3>Part ' + ui.part + ' method</h3><ul>' + TIPS[ui.part].map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></div>';
  h += '<div class="filters" role="group" aria-label="Difficulty">' + [['all', 'All levels'], ['H', 'Hard'], ['M', 'Moderate'], ['E', 'Easy']].map(function (f) {
    return '<button class="chip" data-lv="' + f[0] + '" aria-pressed="' + (ui.lv === f[0]) + '">' + f[1] + '</button>';
  }).join('') + '</div>';
  var arr = sets(ui.part);
  if (!arr.length) return h + '<div class="empty">Tests for this part are being added.</div>';
  ['H', 'M', 'E'].forEach(function (lv) {
    if (ui.lv !== 'all' && ui.lv !== lv) return;
    var list = []; arr.forEach(function (s, i) { if (s.lv === lv) list.push([s, i]); });
    if (!list.length) return;
    h += '<section class="lvsec"><h2><span class="pill ' + lv + '">' + LV[lv].name + '</span><small>' + LV[lv].note + '</small></h2><div class="sets">';
    list.forEach(function (x) {
      var s = x[0], b = best(s.id), sc;
      if (b) { var pc = 100 * b.s / b.t; sc = '<span class="sc ' + tone(pc) + '">' + b.s + '/' + b.t + '</span>'; } else sc = '<span class="sc new">New</span>';
      h += '<button class="srow" data-start="' + s.id + '"><span class="no">' + pad2(x[1] + 1) + '</span><span class="tt">' + esc(s.tt) + '</span>' + sc + '</button>';
    });
    h += '</div></section>';
  });
  return h;
}
function mockCount() { return Math.min(RS.p1.length, RS.p2.length, RS.p3.length, RS.p4.length); }
function mocksHTML() {
  var n = mockCount();
  var h = '<div class="tips"><h3>How mocks work</h3><ul><li>Four parts in a row, 38 questions, with the real time limits: 11 + 9 + 10 + 13 minutes.</li><li>You see your answers only after Part 4, like the real test.</li><li>The CLB score uses an approximate raw-score table. Real results vary slightly from test to test.</li></ul></div>';
  if (!n) return h + '<div class="empty">Mocks appear once every part has tests.</div>';
  ['H', 'M', 'E'].forEach(function (lv) {
    var list = []; for (var i = 0; i < n; i++) if (RS.p1[i].lv === lv) list.push(i);
    if (!list.length) return;
    h += '<section class="lvsec"><h2><span class="pill ' + lv + '">' + LV[lv].name + '</span><small>' + LV[lv].note + '</small></h2><div class="sets">';
    list.forEach(function (i) {
      var r = store.mocks[i + 1], last = r && r.length ? r[r.length - 1] : null;
      var sc = last ? '<span class="sc ' + (last.clb >= 10 ? 'g' : last.clb >= 9 ? 'm' : 'b') + '">CLB ' + last.clb + ' · ' + last.raw + '/38</span>' : '<span class="sc new">New</span>';
      h += '<button class="srow" data-mock="' + (i + 1) + '"><span class="no">M' + pad2(i + 1) + '</span><span class="tt">Mock exam ' + (i + 1) + '</span>' + sc + '</button>';
    });
    h += '</div></section>';
  });
  return h;
}
function progHTML() {
  var g = groupStats(), h = '<div class="prog-grid"><section class="panel"><h2>Accuracy by question type</h2>';
  var any = false;
  Object.keys(GROUPS).forEach(function (k) {
    var x = g[k]; if (x.t) any = true;
    var pc = x.t ? Math.round(100 * x.s / x.t) : 0;
    h += '<div class="grow"><span>' + GROUPS[k] + '</span><span class="bar"><i class="' + (x.t ? tone(pc) : '') + '" style="width:' + (x.t ? pc : 0) + '%"></i></span><b>' + (x.t ? pc + '%' : '–') + '</b></div>';
  });
  if (!any) h += '<p class="muted" style="margin-top:8px">Finish a test to see where you lose marks.</p>';
  h += '<p class="muted" style="font-size:13px;margin-top:10px">Uses your latest attempt at each test. Green is CLB 9+ pace (82% or more).</p></section><section class="panel"><h2>Recent tests</h2><div class="hist">';
  var list = [];
  Object.keys(store.att).forEach(function (id) { store.att[id].forEach(function (a) { list.push({ id: id, a: a }); }); });
  list.sort(function (x, y) { return y.a.d - x.a.d; });
  if (!list.length) h += '<p class="muted">No tests yet.</p>';
  list.slice(0, 15).forEach(function (r) {
    var f = findSet(r.id); if (!f) return;
    var pc = 100 * r.a.s / r.a.t;
    h += '<div class="hrow"><span>Part ' + f.p + ' · ' + esc(f.set.tt) + '<br><span class="muted" style="font-size:13px">' + fmtDate(r.a.d) + ' · ' + mmss(r.a.sec || 0) + '</span></span><span class="mono sc ' + tone(pc) + '">' + r.a.s + '/' + r.a.t + '</span></div>';
  });
  h += '</div></section></div>';
  if (list.length) h += '<p style="margin-top:16px"><button class="btn sm" id="reset">Clear all progress</button></p>';
  return h;
}

/* ---------- TEST ---------- */
function start(id, mockN) {
  var f = findSet(id); if (!f) return;
  cur = { set: f.set, p: f.p, idx: f.idx, ans: {}, t0: Date.now(), mockN: mockN || null };
  go('test');
  startTimer();
}
function startTimer() {
  stopTimer();
  tick = setInterval(updTimer, 1000);
  updTimer();
}
function stopTimer() { if (tick) clearInterval(tick); tick = null; }
function elapsed() { return (Date.now() - cur.t0) / 1000; }
function updTimer() {
  var el = document.getElementById('tm'); if (!el || !cur) return;
  var lim = PARTS[cur.p].min * 60, e = elapsed(), lab = el.querySelector('span');
  el.className = 'timer';
  if (!store.timer) { el.classList.add('off'); lab.textContent = mmss(e); el.setAttribute('aria-label', 'Time used ' + mmss(e)); return; }
  var rem = lim - e;
  if (rem >= 0) { lab.textContent = mmss(rem); if (rem <= 120) el.classList.add('low'); el.setAttribute('aria-label', 'Time left ' + mmss(rem)); }
  else { lab.textContent = '+' + mmss(-rem); el.classList.add('over'); el.setAttribute('aria-label', 'Over time by ' + mmss(-rem)); }
}
function answered() { var its = items(cur.set, cur.p), n = 0; its.forEach(function (it) { var a = cur.ans[it.n]; if (a !== undefined && a !== null) n++; }); return n + '/' + its.length; }

function blankSel(it) {
  var o = order(cur.set.id, it.n, it.o.length), a = cur.ans[it.n];
  return '<span class="bl"><label class="sr" for="b' + it.n + '">Blank ' + it.n + '</label><span class="bn">' + it.n + '</span><select id="b' + it.n + '" data-n="' + it.n + '"' + (a !== undefined && a !== null ? ' class="set"' : '') + '><option value="">Select…</option>' +
    o.map(function (i) { return '<option value="' + i + '"' + (a === i ? ' selected' : '') + '>' + esc(it.o[i]) + '</option>'; }).join('') + '</select></span>';
}
function blankFill(it, ans) {
  var a = ans[it.n];
  if (right(it, a)) return '<span class="fill ok"><span class="bn">' + it.n + '</span>' + esc(it.o[0]) + '</span>';
  return '<span class="fill bad"><span class="bn">' + it.n + '</span>' + esc(a === undefined || a === null ? 'blank' : it.o[a]) + '</span> <span class="fill ok">' + esc(it.o[0]) + '</span>';
}
function withBlanks(raw, its, mode, ans, evs) {
  var byN = {}; its.forEach(function (it) { byN[it.n] = it; });
  var html = paras(mark(raw, evs));
  return html.replace(/\[\[(\d+)\]\]/g, function (m, n) { var it = byN[+n]; if (!it) return m; return mode === 'test' ? blankSel(it) : blankFill(it, ans); });
}
function mcHTML(it) {
  var o = order(cur.set.id, it.n, it.o.length), a = cur.ans[it.n];
  return '<fieldset class="mc"><legend><span class="qn">' + it.n + '</span><span>' + esc(it.stem) + '</span></legend>' +
    o.map(function (i) { return '<label class="opt"><input type="radio" name="q' + it.n + '" value="' + i + '" data-n="' + it.n + '"' + (a === i ? ' checked' : '') + '><span>' + esc(it.o[i]) + '</span></label>'; }).join('') + '</fieldset>';
}
function stHTML(it) {
  var a = cur.ans[it.n];
  return '<div class="stmt" role="radiogroup" aria-labelledby="stl' + it.n + '"><p id="stl' + it.n + '"><span class="qn">' + it.n + '</span><span>' + esc(it.stem) + '</span></p><div class="abcde">' +
    'ABCDE'.split('').map(function (L) { return '<label class="seg"><input type="radio" name="s' + it.n + '" value="' + L + '" data-n="' + it.n + '"' + (a === L ? ' checked' : '') + ' aria-label="Paragraph ' + L + '"><span>' + L + '</span></label>'; }).join('') + '</div></div>';
}
function msgBox(head, bodyHTML) {
  return '<div class="msg"><dl class="mh">' + head.map(function (h) { return '<dt>' + h[0] + '</dt><dd>' + esc(h[1]) + '</dd>'; }).join('') + '</dl><div class="mb doc">' + bodyHTML + '</div></div>';
}
function diagramHTML(dg, evs) {
  var h = '<div class="dg"><div class="dg-h">' + mark(dg.h, evs) + '</div>' + (dg.sub ? '<div class="dg-sub">' + mark(dg.sub, evs) + '</div>' : '');
  if (dg.items) {
    var nI = dg.items.length, cols = nI <= 3 ? nI : (nI % 3 === 0 ? 3 : nI % 2 === 0 ? 2 : 3);
    h += '<div class="dg-grid" style="--cols:' + cols + '">' + dg.items.map(function (it) {
      return '<div class="dg-item"><div class="dg-name">' + mark(it.n, evs) + '</div>' + (it.p ? '<div class="dg-price">' + mark(it.p, evs) + '</div>' : '') + '<ul>' + it.l.map(function (l) { return '<li>' + mark(l, evs) + '</li>'; }).join('') + '</ul></div>';
    }).join('') + '</div>';
  }
  if (dg.table) {
    h += '<div class="dg-tw"><table><thead><tr>' + dg.table.cols.map(function (c) { return '<th scope="col">' + mark(c, evs) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      dg.table.rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return i === 0 ? '<th scope="row">' + mark(c, evs) + '</th>' : '<td>' + mark(c, evs) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }
  if (dg.foot) h += '<div class="dg-foot">' + dg.foot.map(function (f) { return '<p>' + mark(f, evs) + '</p>'; }).join('') + '</div>';
  return h + '</div>';
}
var INSTR = {
  1: 'Read the message, then answer questions 1–6. Next, read the reply and choose the best option for each blank (7–11).',
  2: 'Read the diagram and the email. Choose the best option for each blank (1–5), then answer questions 6–8 about the email.',
  3: 'Read the passage. For each statement, decide which paragraph, A to D, has the information. Choose E if it is not given in any paragraph.',
  4: 'Read the article and answer questions 1–5. Then read the reader’s comment and choose the best option for each blank (6–10).'
};
// Build left (source) and right (tasks) panes. mode: 'test' or 'review'
function panes(set, p, mode, ans, evs) {
  var its = items(set, p), L = '', R = '';
  var mcs = its.filter(function (i) { return i.k === 'mc'; });
  if (p === 1) {
    L = '<p class="instr">' + INSTR[1] + '</p>' + msgBox([['From', set.from], ['To', set.to]], paras(mark(set.text, evs)));
    var reply = msgBox([['From', set.to], ['To', set.from]], withBlanks(set.reply, its, mode, ans, evs));
    if (mode === 'test') R = '<div class="sec"><h3>Questions 1–6</h3>' + mcs.map(mcHTML).join('') + '</div><div class="sec"><h3>Questions 7–11 · ' + esc(set.to) + '’s reply</h3>' + reply + '</div>';
    else L += '<div class="sec"><h3>' + esc(set.to) + '’s reply</h3>' + reply + '</div>';
  }
  if (p === 2) {
    L = '<p class="instr">' + INSTR[2] + '</p>' + diagramHTML(set.dg, evs);
    var email = msgBox([['From', set.em.from], ['To', set.em.to], ['Subject', set.em.subj]], withBlanks(set.em.body, its, mode, ans, evs));
    if (mode === 'test') R = '<div class="sec"><h3>Questions 1–5 · Email</h3>' + email + '</div><div class="sec"><h3>Questions 6–8</h3>' + mcs.map(mcHTML).join('') + '</div>';
    else L += '<div class="sec"><h3>Email</h3>' + email + '</div>';
  }
  if (p === 3) {
    L = '<p class="instr">' + INSTR[3] + '</p><div class="doc"><h2>' + esc(set.h) + '</h2></div>' + set.paras.map(function (t, i) { return '<div class="para"><span class="L">' + 'ABCD'[i] + '</span><div class="doc">' + paras(mark(t, evs)) + '</div></div>'; }).join('');
    if (mode === 'test') R = '<div class="sec"><h3>Statements 1–9</h3><p class="legendE">A–D = paragraph · E = not given in any paragraph</p>' + its.map(stHTML).join('') + '</div>';
  }
  if (p === 4) {
    L = '<p class="instr">' + INSTR[4] + '</p><div class="doc"><h2>' + esc(set.art.h) + '</h2>' + paras(mark(set.art.text, evs)) + '</div>';
    var cm = msgBox([['Comment by', set.cm.by]], withBlanks(set.cm.text, its, mode, ans, evs));
    if (mode === 'test') R = '<div class="sec"><h3>Questions 1–5</h3>' + mcs.map(mcHTML).join('') + '</div><div class="sec"><h3>Questions 6–10 · Reader comment</h3>' + cm + '</div>';
    else L += '<div class="sec"><h3>Reader comment</h3>' + cm + '</div>';
  }
  return { L: L, R: R };
}
function testHTML() {
  var P = PARTS[cur.p], s = cur.set, pn = panes(s, cur.p, 'test', cur.ans, null);
  var label = cur.mockN ? 'Mock ' + cur.mockN + ' · Part ' + cur.p + ' of 4' : 'Part ' + cur.p + ' · Test ' + pad2(cur.idx + 1) + ' · ' + LV[s.lv].name;
  return '<div class="tbar"><button class="btn ghost sm" id="exit" aria-label="Exit test">' + ICON.back + '<span class="hide-sm">Exit</span></button>' +
    '<div class="ttl"><b>' + esc(s.tt) + '</b><span>' + label + ' · ' + P.name + '</span></div>' +
    '<span class="count" id="cnt">' + answered() + ' answered</span>' +
    '<button class="timer" id="tm" title="Switch timer on or off"><span>--:--</span></button>' +
    '<button class="btn primary sm" id="submit">' + (cur.mockN && cur.p < 4 ? 'Next part' : 'Submit') + '</button></div>' +
    pswitch('Questions <span class="mono" id="cnt2">' + answered() + '</span>') + '<div class="split" data-show="' + (ui.show || 'L') + '"><section class="pane left" aria-label="Reading passage">' + pn.L + '</section><section class="pane right" aria-label="Questions">' + pn.R + '</section></div>';
}
function submit() {
  var its = items(cur.set, cur.p), missing = its.filter(function (it) { var a = cur.ans[it.n]; return a === undefined || a === null; }).length;
  var p = missing ? ask('Submit with ' + missing + ' unanswered?', 'Unanswered questions count as wrong. On the real test, always choose something: there is no penalty for guessing.', 'Submit anyway', 'Keep working') : Promise.resolve(true);
  p.then(function (ok) {
    if (!ok) return;
    stopTimer();
    var sc = score(cur.set, cur.p, cur.ans), sec = Math.round(elapsed());
    var rec = { s: sc.s, t: sc.t, d: Date.now(), sec: sec, a: cur.ans, timed: !!store.timer };
    (store.att[cur.set.id] = store.att[cur.set.id] || []).push(rec);
    if (store.att[cur.set.id].length > 8) store.att[cur.set.id].shift();
    save();
    if (cur.mockN) {
      mock.res.push({ id: cur.set.id, p: cur.p, s: sc.s, t: sc.t, sec: sec, a: cur.ans });
      if (cur.p < 4) { ui.between = true; go('between'); return; }
      var raw = mock.res.reduce(function (m, r) { return m + r.s; }, 0);
      var mr = { raw: raw, clb: clb(raw), d: Date.now(), parts: mock.res.map(function (r) { return r.s; }) };
      (store.mocks[mock.n] = store.mocks[mock.n] || []).push(mr); save();
      go('mockrev'); return;
    }
    rv = { set: cur.set, p: cur.p, idx: cur.idx, ans: cur.ans, sec: sec, from: 'part' };
    go('review');
  });
}

function pswitch(rLabel) {
  var sh = ui.show || (ui.view === 'review' ? 'R' : 'L');
  return '<div class="pswitch" role="tablist" aria-label="Show"><button role="tab" data-show="L" aria-selected="' + (sh === 'L') + '">Passage</button><button role="tab" data-show="R" aria-selected="' + (sh === 'R') + '">' + rLabel + '</button></div>';
}
function setShow(v) {
  ui.show = v;
  var sp = document.querySelector('.split'); if (sp) sp.dataset.show = v;
  document.querySelectorAll('.pswitch [data-show]').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.show === v); });
  window.scrollTo(0, 0);
}
/* ---------- REVIEW ---------- */
function reviewHTML() {
  var set = rv.set, p = rv.p, its = items(set, p), em = evMap(its), sc = score(set, p, rv.ans);
  var pn = panes(set, p, 'review', rv.ans, em.m), pct = 100 * sc.s / sc.t;
  var wrong = its.filter(function (it) { return !right(it, rv.ans[it.n]); });
  var only = rv.only !== undefined ? rv.only : wrong.length > 0;
  var back = rv.from === 'mock' ? 'Mock results' : 'All Part ' + p + ' tests';
  var h = '<div class="tbar"><button class="btn ghost sm" id="rvBack">' + ICON.back + '<span>' + back + '</span></button><div class="ttl"><b>' + esc(set.tt) + '</b><span>Part ' + p + ' · ' + LV[set.lv].name + ' · Review</span></div></div>';
  h += pswitch('Answers') + '<div class="split review" data-show="' + (ui.show || 'R') + '"><section class="pane left" aria-label="Passage with evidence">' + pn.L + '</section><section class="pane right" aria-label="Answers">';
  h += '<div class="score"><div class="big">' + sc.s + '<small>/' + sc.t + '</small></div>' +
    '<div class="kv"><span>Accuracy</span><b class="sc ' + tone(pct) + '">' + Math.round(pct) + '% · ' + pace(pct) + '</b></div>' +
    '<div class="kv"><span>Time</span><b class="mono">' + mmss(rv.sec) + ' <span class="muted">/ ' + PARTS[p].min + ':00</span></b></div></div>';
  h += '<div class="rtools"><div class="filters" style="margin:0" role="group" aria-label="Show"><button class="chip" data-only="1" aria-pressed="' + only + '">Wrong only (' + wrong.length + ')</button><button class="chip" data-only="0" aria-pressed="' + !only + '">All ' + its.length + '</button></div>';
  if (rv.from !== 'mock') h += '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" id="retry">' + ICON.redo + 'Retry</button>' + (rv.idx + 1 < sets(p).length ? '<button class="btn primary sm" id="nextSet">Next test' + ICON.next + '</button>' : '') + '</div>';
  h += '</div><div class="rlist">';
  var list = only ? wrong : its;
  if (!list.length) h += '<div class="empty">All correct. Try a harder test or a full mock.</div>';
  list.forEach(function (it) {
    var ok = right(it, rv.ans[it.n]), id = em.alias[it.n];
    var stem = it.k === 'bl' ? '' : '<p class="stem">' + esc(it.stem) + '</p>';
    h += '<article class="rc ' + (ok ? 'ok' : 'bad') + '"><header><span class="qn">' + it.n + '</span>' + (it.k === 'st' ? 'Statement' : SHORTG[it.g]) + '<span class="res">' + (ok ? ICON.check + 'Correct' : ICON.x + 'Wrong') + '</span></header>' + stem +
      '<dl>' + (ok ? '<dt>Answer</dt><dd class="cor">' + esc(corText(it)) + '</dd>' : '<dt>Yours</dt><dd class="you">' + esc(ansText(it, rv.ans[it.n])) + '</dd><dt>Correct</dt><dd class="cor">' + esc(corText(it)) + '</dd>') +
      '<dt>Why</dt><dd>' + esc(it.x) + '</dd>' +
      (it.ev ? '<dt>Proof</dt><dd class="evq">“' + esc(it.ev) + '”</dd>' : (it.k === 'st' ? '<dt>Proof</dt><dd class="evq">No paragraph states this.</dd>' : '')) + '</dl>' +
      (id ? '<div class="act"><button class="btn sm" data-ev="' + id + '">' + ICON.eye + 'Show in passage</button></div>' : '') + '</article>';
  });
  h += '</div></section></div>';
  return h;
}
function betweenHTML() {
  var last = mock.res[mock.res.length - 1], np = last.p + 1, P = PARTS[np];
  return '<div class="center"><span class="eyebrow">Mock ' + mock.n + ' · Part ' + last.p + ' finished</span><h1>Next: Part ' + np + '</h1>' +
    '<div class="nextpart"><b>' + P.name + '</b><p class="muted">' + P.n + ' questions · ' + P.min + ' minutes</p><ul style="margin:10px 0 0;padding-left:18px">' + TIPS[np].map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></div>' +
    '<p class="muted">Answers are shown after Part 4, as on the real test.</p><button class="btn primary" id="nextPart">Start Part ' + np + '</button></div>';
}
function mockRevHTML() {
  var raw = mock.res.reduce(function (m, r) { return m + r.s; }, 0), c = clb(raw);
  var h = '<div class="tbar"><button class="btn ghost sm" id="toHome">' + ICON.back + '<span>All mocks</span></button><div class="ttl"><b>Mock exam ' + mock.n + ' results</b><span>' + LV[RS.p1[mock.n - 1].lv].name + ' · 38 questions</span></div></div>';
  h += '<div class="wrap" style="max-width:760px"><div class="score"><div class="big">' + raw + '<small>/38</small></div><div class="kv"><span>Estimated level</span><b style="font-size:22px">CLB ' + c + '</b></div><div class="kv"><span>To reach CLB 10</span><b>' + (raw >= 33 ? 'Reached' : (33 - raw) + ' more correct') + '</b></div></div>';
  h += '<div class="mockrows">';
  mock.res.forEach(function (r, i) {
    var pc = 100 * r.s / r.t;
    h += '<div class="mrow"><span><b>Part ' + r.p + '</b> · ' + PARTS[r.p].short + '<br><span class="muted" style="font-size:13px">' + mmss(r.sec) + ' of ' + PARTS[r.p].min + ':00</span></span><span class="mono sc ' + tone(pc) + '">' + r.s + '/' + r.t + '</span><button class="btn sm" data-mrev="' + i + '">Review</button></div>';
  });
  h += '</div><p class="muted" style="font-size:13px;margin-top:14px">Approximate table: 33–34 = CLB 10, 31–32 = CLB 9, 28–30 = CLB 8, 24–27 = CLB 7. CELPIP adjusts slightly for each test form.</p></div>';
  return h;
}

/* ---------- render + events ---------- */
function render() {
  if (ui.view === 'home') app.innerHTML = homeHTML();
  else if (ui.view === 'test') { app.innerHTML = testHTML(); updTimer(); }
  else if (ui.view === 'review') app.innerHTML = reviewHTML();
  else if (ui.view === 'between') app.innerHTML = betweenHTML();
  else if (ui.view === 'mockrev') app.innerHTML = mockRevHTML();
}
app.addEventListener('change', function (e) {
  var t = e.target; if (!cur || ui.view !== 'test' || !t.dataset.n) return;
  var n = +t.dataset.n, v;
  if (t.type === 'radio') v = t.name.charAt(0) === 's' ? t.value : +t.value;
  else { v = t.value === '' ? null : +t.value; t.classList.toggle('set', v !== null); }
  cur.ans[n] = v;
  var c = document.getElementById('cnt'); if (c) c.textContent = answered() + ' answered';
  var c2 = document.getElementById('cnt2'); if (c2) c2.textContent = answered();
});
app.addEventListener('click', function (e) {
  var b = e.target.closest('button'); if (!b) return;
  if (b.dataset.tab) { ui.tab = b.dataset.tab; go('home'); return; }
  if (b.dataset.part) { ui.part = +b.dataset.part; go('home'); return; }
  if (b.dataset.lv) { ui.lv = b.dataset.lv; go('home'); return; }
  if (b.dataset.start) { mock = null; start(b.dataset.start); return; }
  if (b.dataset.mock) { var n = +b.dataset.mock; mock = { n: n, res: [] }; start(RS.p1[n - 1].id, n); return; }
  if (b.dataset.only !== undefined) { rv.only = b.dataset.only === '1'; var y = scrollState(); render(); restoreScroll(y); return; }
  if (b.dataset.show) { setShow(b.dataset.show); return; }
  if (b.dataset.ev) {
    var m = document.getElementById(b.dataset.ev); if (!m) return;
    if (window.matchMedia('(max-width:1023px)').matches) setShow('L');
    m.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' });
    m.classList.remove('flash'); void m.offsetWidth; m.classList.add('flash'); m.focus({ preventScroll: true });
    return;
  }
  if (b.dataset.mrev) { var r = mock.res[+b.dataset.mrev], f = findSet(r.id); rv = { set: f.set, p: f.p, idx: f.idx, ans: r.a, sec: r.sec, from: 'mock' }; go('review'); return; }
  switch (b.id) {
    case 'tmToggle': store.timer = !store.timer; save(); render(); break;
    case 'tm': store.timer = !store.timer; save(); updTimer(); break;
    case 'exit':
      ask(cur.mockN ? 'Leave this mock?' : 'Leave this test?', cur.mockN ? 'This mock will not be saved. Parts you already finished stay in your history.' : 'Your answers on this test will not be saved.', 'Leave', 'Keep working')
        .then(function (ok) { if (ok) { stopTimer(); cur = null; mock = null; go('home'); } });
      break;
    case 'submit': submit(); break;
    case 'rvBack': if (rv.from === 'mock') go('mockrev'); else { ui.tab = 'parts'; ui.part = rv.p; go('home'); } break;
    case 'retry': start(rv.set.id); break;
    case 'nextSet': start(sets(rv.p)[rv.idx + 1].id); break;
    case 'nextPart': var np = mock.res[mock.res.length - 1].p + 1; start(sets(np)[mock.n - 1].id, mock.n); break;
    case 'toHome': ui.tab = 'mocks'; mock = null; go('home'); break;
    case 'reset':
      ask('Clear all progress?', 'This deletes every score and mock result saved in this browser. This cannot be undone.', 'Clear everything', 'Cancel')
        .then(function (ok) { if (ok) { store = { att: {}, mocks: {}, timer: store.timer, ui: {} }; save(); render(); } });
      break;
  }
});
function scrollState() { var r = document.querySelector('.pane.right'); return { w: window.scrollY, r: r ? r.scrollTop : 0 }; }
function restoreScroll(s) { window.scrollTo(0, s.w); var r = document.querySelector('.pane.right'); if (r) r.scrollTop = s.r; }
window.addEventListener('beforeunload', function (e) { if (ui.view === 'test') { e.preventDefault(); e.returnValue = ''; } });
render();
})();
