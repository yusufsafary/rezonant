// Live on-chain ledger for rezonant.digital. Read-only eth_call, RPC race.
(function () {
  var WAVES = "0xAaEe81500638e3399f14cc067D5DDB5e429Bd57E";
  var CLAIM = "0x607B2F0bCe1b70a75daeB6349dc705B64Dce49Bd";
  var RPCS = [
    "https://bsc-dataseed.binance.org",
    "https://bsc-dataseed1.defibit.io",
    "https://bsc.publicnode.com",
    "https://bsc-dataseed.bnbchain.org"
  ];
  var SEL = {
    currentWave: "0x86b46694",
    participantsOf: "0xe200c857",
    unitsInWave: "0x7db32969",
    verdictOf: "0xbcaa6cf7",
    totalClaimed: "0xd54ad2a1",
    poolBalance: "0x96365d44"
  };
  var BANDS = [
    { name: "Damped", per: "2,500" },
    { name: "Resonant", per: "12,500" },
    { name: "Sympathetic", per: "60,000" }
  ];
  function arg(n) {
    var h = n.toString(16);
    while (h.length < 64) h = "0" + h;
    return h;
  }
  function callOne(rpc, to, data) {
    var ctrl = new AbortController();
    var t = setTimeout(function () { ctrl.abort(); }, 4000);
    return fetch(rpc, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to: to, data: data }, "latest"] }),
      signal: ctrl.signal
    }).then(function (r) { return r.json(); }).then(function (j) {
      clearTimeout(t);
      if (!j || !j.result || j.result === "0x") throw new Error("bad");
      return BigInt(j.result);
    });
  }
  function call(to, data) {
    return Promise.any(RPCS.map(function (rpc) { return callOne(rpc, to, data); }));
  }
  function fmt(n) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function set(id, txt) { var el = document.getElementById(id); if (el) el.textContent = txt; }
  function bandOf(p) { return p < 25n ? 0 : (p <= 100n ? 1 : 2); }
  function refresh() {
    call(WAVES, SEL.currentWave).then(function (wave) {
      var w = Number(wave);
      set("lv-wave", "Nº " + String(w).padStart(3, "0"));
      return Promise.all([
        call(WAVES, SEL.participantsOf + arg(w)),
        call(WAVES, SEL.unitsInWave + arg(w)),
        w > 1 ? call(WAVES, SEL.participantsOf + arg(w - 1)) : Promise.resolve(null),
        w > 1 ? call(WAVES, SEL.verdictOf + arg(w - 1)) : Promise.resolve(null),
        call(CLAIM, SEL.totalClaimed),
        call(CLAIM, SEL.poolBalance)
      ]).then(function (r) {
        var p = r[0], u = r[1], band = BANDS[bandOf(p)];
        set("lv-agents", fmt(p));
        set("lv-units", fmt(u));
        set("lv-verdict", band.name);
        set("lv-per", band.per + " $REZ per unit at seal");
        if (r[2] !== null && r[3] !== null) {
          var lb = BANDS[Number(r[3])] || BANDS[bandOf(r[2])];
          set("lv-sealed", "Wave " + (w - 1) + " · " + fmt(r[2]) + " agents · " + lb.name);
          set("lv-sealed-per", lb.per + " $REZ per unit · claims open");
        } else {
          set("lv-sealed", "First seal today 05:00 UTC");
          set("lv-sealed-per", "Claims open at the seal");
        }
        set("lv-claimed", fmt(r[4] / 1000000000000000000n) + " $REZ");
        set("lv-pool", fmt(r[5] / 1000000000000000000n) + " $REZ in pool");
        var dot = document.getElementById("lv-dot");
        if (dot) dot.textContent = "Live · BSC";
      });
    }).catch(function () { /* keep last good values */ });
  }
  refresh();
  setInterval(refresh, 30000);
})();
