// REZONANT instrument: one shared mapping from seed and frequency to figure.
// Day figure: mode pair and frequency derive from the UTC date seed.
// Manual tuning: the visitor drives the plate by frequency; figures lock at
// the centre of each resonance band and soften at the edges, as sand does.
(function () {
  var MODES = [[2,3],[2,4],[2,5],[3,4],[3,5],[3,6],[4,5],[4,6],[4,7],[5,6],[5,7],[6,7]];
  var HZ_MIN = 120, HZ_MAX = 980;

  function daySeed(offset) {
    var d = new Date();
    return Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 86400000) + (offset || 0);
  }
  function pairForSeed(seed) { return MODES[Math.abs(seed) % MODES.length]; }
  function hzForSeed(seed) { return 148 + (Math.abs(seed * 53) % 760); }
  function bandOf(hz) { return (hz - HZ_MIN) / (HZ_MAX - HZ_MIN) * MODES.length; }
  function pairForHz(hz) {
    var i = Math.floor(bandOf(hz));
    if (i < 0) i = 0; if (i >= MODES.length) i = MODES.length - 1;
    return MODES[i];
  }
  function lockOf(hz) { // 1 at band centre, 0 at edges
    var b = bandOf(hz), frac = b - Math.floor(b);
    return 1 - Math.abs(frac - 0.5) * 2;
  }

  // ---------- Plate canvas ----------
  var cv = document.getElementById("plate");
  var hz = hzForSeed(daySeed());
  var form = 0, formTarget = 1;
  if (cv) {
    var ctx = cv.getContext("2d");
    var N = 176;
    cv.width = N; cv.height = N;
    var img = ctx.createImageData(N, N);
    var slider = document.getElementById("hz");
    var hzVal = document.getElementById("hz-val");
    var modeVal = document.getElementById("mode-val");
    var lockVal = document.getElementById("lock-val");
    if (slider) { slider.value = hz; }
    function syncReadout() {
      var p = pairForHz(hz);
      if (hzVal) hzVal.textContent = Math.round(hz) + " HZ";
      if (modeVal) modeVal.textContent = "MODE " + p[0] + " · " + p[1];
      if (lockVal) lockVal.textContent = lockOf(hz) > 0.72 ? "FIGURE LOCKED" : "SAND SETTLING";
    }
    syncReadout();
    if (slider) slider.addEventListener("input", function () {
      hz = parseFloat(slider.value); form = Math.min(form, 0.25); syncReadout();
      if (listening && osc) osc.frequency.setTargetAtTime(hz, actx.currentTime, 0.03);
    });
    var actx = null, osc = null, ogain = null, listening = false;
    var listenBtn = document.getElementById("listen");
    if (listenBtn) listenBtn.addEventListener("click", function () {
      if (!listening) {
        if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
        actx.resume();
        osc = actx.createOscillator(); ogain = actx.createGain();
        osc.type = "sine"; osc.frequency.value = hz;
        ogain.gain.setValueAtTime(0, actx.currentTime);
        ogain.gain.linearRampToValueAtTime(0.055, actx.currentTime + 0.4);
        osc.connect(ogain); ogain.connect(actx.destination); osc.start();
        listening = true; listenBtn.textContent = "Stop";
      } else {
        ogain.gain.linearRampToValueAtTime(0, actx.currentTime + 0.25);
        var o = osc; setTimeout(function () { try { o.stop(); } catch (e) {} }, 300);
        listening = false; listenBtn.textContent = "Listen";
      }
    });
    var strike = document.getElementById("strike");
    if (strike) strike.addEventListener("click", function () {
      hz = HZ_MIN + Math.random() * (HZ_MAX - HZ_MIN);
      if (slider) slider.value = hz;
      form = 0; syncReadout();
    });
    function frame() {
      form += (formTarget - form) * 0.045;
      var lock = lockOf(hz);
      var sharp = 10 + 150 * form * (0.35 + 0.65 * lock);
      var p = pairForHz(hz), n = p[0], m = p[1], PI = Math.PI;
      var data = img.data;
      for (var y = 0; y < N; y++) {
        var yy = y / (N - 1);
        for (var x = 0; x < N; x++) {
          var xx = x / (N - 1);
          var f = Math.cos(n * PI * xx) * Math.cos(m * PI * yy) - Math.cos(m * PI * xx) * Math.cos(n * PI * yy);
          var line = Math.exp(-f * f * sharp);
          var i = (y * N + x) * 4;
          data[i] = 14 + (236 - 14) * line;
          data[i + 1] = 13 + (230 - 13) * line;
          data[i + 2] = 12 + (216 - 12) * line;
          data[i + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
      if (lockVal && frameCount % 20 === 0) syncReadout();
      frameCount++;
      requestAnimationFrame(frame);
    }
    var frameCount = 0;
    requestAnimationFrame(frame);
var tunables = document.querySelectorAll(".tunable");
    for (var t = 0; t < tunables.length; t++) {
      tunables[t].addEventListener("click", function () {
        var parts = this.getAttribute("data-pair").split(",");
        var want = [parseInt(parts[0], 10), parseInt(parts[1], 10)];
        for (var mi = 0; mi < MODES.length; mi++) {
          if (MODES[mi][0] === want[0] && MODES[mi][1] === want[1]) {
            hz = HZ_MIN + (mi + 0.5) / MODES.length * (HZ_MAX - HZ_MIN);
            if (slider) slider.value = hz;
            form = 0; syncReadout();
            if (listening && osc) osc.frequency.setTargetAtTime(hz, actx.currentTime, 0.03);
            cv.scrollIntoView({ behavior: "smooth", block: "center" });
            break;
          }
        }
      });
    }
  }

  // ---------- Seed explorer ----------
  var seedIn = document.getElementById("seed-in");
  if (seedIn) {
    var sm = document.getElementById("seed-mode");
    var sh = document.getElementById("seed-hz");
    var sc = document.getElementById("seed-class");
    function runSeed() {
      var v = Math.abs(Math.floor(Number(seedIn.value) || 0));
      var p = pairForHz(hzForSeed(v));
      sm.textContent = p[0] + " · " + p[1];
      sh.textContent = hzForSeed(v) + " Hz";
      var perfect = v % 1000 >= 970;
      sc.textContent = perfect ? "Perfect Resonance" : "Standard figure";
      sc.style.color = perfect ? "#C9A227" : "";
    }
    seedIn.addEventListener("input", runSeed); runSeed();
  }

  // ---------- Seal countdown + day window progress ----------
  var cd = document.getElementById("seal-countdown");
  var chip = document.getElementById("seal-chip");
  var bar = document.getElementById("day-progress");
  var barLabel = document.getElementById("day-progress-label");
  function tick() {
    var now = new Date();
    var start = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 5, 0, 0);
    if (now.getTime() < start) start -= 86400000;
    var seal = start + 86400000;
    var s = Math.floor((seal - now.getTime()) / 1000);
    var hh = String(Math.floor(s / 3600)).padStart(2, "0");
    var mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    var ss = String(s % 60).padStart(2, "0");
    if (cd) cd.textContent = hh + ":" + mm + ":" + ss;
    if (chip) chip.textContent = "Seals in " + hh + ":" + mm + ":" + ss;
    var pct = Math.min(100, Math.max(0, (now.getTime() - start) / 864000));
    if (bar) bar.style.width = pct.toFixed(1) + "%";
    if (barLabel) barLabel.textContent = pct.toFixed(1) + "% OF THE DAY PLAYED";
  }
  tick(); setInterval(tick, 1000);

  // ---------- Verdict simulator ----------
  var sim = document.getElementById("sim-agents");
  if (sim) {
    var out = document.getElementById("sim-out");
    var name = document.getElementById("sim-name");
    var per = document.getElementById("sim-per");
    function runSim() {
      var a = parseInt(sim.value, 10);
      out.textContent = a + (a === 1 ? " AGENT" : " AGENTS");
      if (a < 25) { name.textContent = "Damped"; per.textContent = "2,500 $REZ per Wave"; }
      else if (a <= 100) { name.textContent = "Resonant"; per.textContent = "12,500 $REZ per Wave"; }
      else { name.textContent = "Sympathetic"; per.textContent = "60,000 $REZ per Wave"; }
    }
    sim.addEventListener("input", runSim); runSim();
  }

  // ---------- Rehearsal log: last 7 days of figures ----------
  var log = document.getElementById("rehearsal-log");
  if (log) {
    var rows = "";
    for (var k = 0; k >= -6; k--) {
      var seed = daySeed(k);
      var p = pairForHz(hzForSeed(seed));
      var d = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()) + k * 86400000);
      var label = d.toISOString().slice(0, 10);
      rows += "<tr><td class='mono nw'>" + label + "</td><td class='mono nw'>" + p[0] + " · " + p[1] + "</td><td class='mono nw'>" + hzForSeed(seed) + " Hz</td><td>" + (k === 0 ? "On the plate now" : "Rehearsal figure") + "</td></tr>";
    }
    log.innerHTML = rows;
  }
})();
