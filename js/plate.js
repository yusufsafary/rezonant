// REZONANT live plate: today's Chladni figure, drawn from the day seed.
// Mode pair derives from the UTC date; the figure forms, holds, and re-forms.
(function () {
  var cv = document.getElementById("plate");
  if (!cv) return;
  var ctx = cv.getContext("2d");
  var N = 176; // grid resolution
  cv.width = N; cv.height = N;

  function daySeed() {
    var d = new Date();
    return Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 86400000);
  }
  var seed = daySeed();
  var modes = [[2,3],[2,4],[2,5],[3,4],[3,5],[3,6],[4,5],[4,6],[4,7],[5,6],[5,7],[6,7]];
  var pair = modes[seed % modes.length];
  var capEl = document.getElementById("plate-mode");
  if (capEl) capEl.textContent = "MODE " + pair[0] + " · " + pair[1] + " — FIGURE OF THE DAY";

  var img = ctx.createImageData(N, N);
  var start = performance.now();
  function frame(now) {
    var t = (now - start) / 1000;
    // formation cycle: 14s form, hold, dissolve slightly, reform
    var cyc = (t % 16) / 16;
    var form = cyc < 0.3 ? cyc / 0.3 : (cyc > 0.85 ? Math.max(0.25, 1 - (cyc - 0.85) / 0.15 * 0.75) : 1);
    var sharp = 14 + 130 * form * form;
    var n = pair[0], m = pair[1], PI = Math.PI;
    var data = img.data;
    for (var y = 0; y < N; y++) {
      var yy = y / (N - 1);
      for (var x = 0; x < N; x++) {
        var xx = x / (N - 1);
        var f = Math.cos(n * PI * xx) * Math.cos(m * PI * yy) - Math.cos(m * PI * xx) * Math.cos(n * PI * yy);
        var line = Math.exp(-f * f * sharp);
        var i = (y * N + x) * 4;
        data[i]     = 14 + (236 - 14) * line;
        data[i + 1] = 13 + (230 - 13) * line;
        data[i + 2] = 12 + (216 - 12) * line;
        data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Countdown to the next daily seal, 05:00 UTC.
  var cd = document.getElementById("seal-countdown");
  function tick() {
    var now = new Date();
    var seal = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 5, 0, 0);
    if (now.getTime() >= seal) seal += 86400000;
    var s = Math.floor((seal - now.getTime()) / 1000);
    var hh = String(Math.floor(s / 3600)).padStart(2, "0");
    var mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    var ss = String(s % 60).padStart(2, "0");
    if (cd) cd.textContent = hh + ":" + mm + ":" + ss;
  }
  tick(); setInterval(tick, 1000);
})();
