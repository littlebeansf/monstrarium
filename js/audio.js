/* ═══════════════════════════════════════════════════════════════
   Atmosphere — procedural ambient drone + page rustle (Web Audio)
   No external files: fully self-contained for GitHub Pages.
═══════════════════════════════════════════════════════════════ */

const Atmos = (() => {
  let ctx = null;
  let master = null;
  let droneOn = false;
  let droneNodes = [];

  function ensure() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.0;
    master.connect(ctx.destination);
  }

  // Low, slow, dark-ambient drone built from detuned oscillators + slow LFO.
  function startDrone() {
    ensure();
    if (ctx.state === "suspended") ctx.resume();
    if (droneOn) return;
    droneOn = true;

    const base = 55; // A1
    const freqs = [base, base * 1.5, base * 2.0, base * 0.5];
    const gains = [0.5, 0.22, 0.12, 0.4];

    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.16;
    droneGain.connect(master);

    // gentle low-pass to keep it warm
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 420;
    lp.Q.value = 0.6;
    lp.connect(droneGain);

    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 3 ? "sine" : "sawtooth";
      osc.frequency.value = f;
      osc.detune.value = (i - 1) * 4;

      const g = ctx.createGain();
      g.gain.value = gains[i] * 0.25;

      // slow amplitude shimmer
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.04 + i * 0.017;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = gains[i] * 0.12;
      lfo.connect(lfoGain).connect(g.gain);

      osc.connect(g).connect(lp);
      osc.start();
      lfo.start();
      droneNodes.push(osc, lfo);
    });

    // distant wind via filtered noise
    const noise = ctx.createBufferSource();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.5;
    noise.buffer = buf; noise.loop = true;
    const nf = ctx.createBiquadFilter();
    nf.type = "bandpass"; nf.frequency.value = 240; nf.Q.value = 0.5;
    const ng = ctx.createGain(); ng.gain.value = 0.05;
    noise.connect(nf).connect(ng).connect(droneGain);
    noise.start();
    droneNodes.push(noise);

    // fade in
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 2.5);
  }

  function stopDrone() {
    if (!ctx || !droneOn) return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.0, ctx.currentTime + 1.2);
    setTimeout(() => {
      droneNodes.forEach(n => { try { n.stop(); } catch (e) {} });
      droneNodes = [];
      droneOn = false;
    }, 1300);
  }

  // Short paper/parchment rustle for page turns — noise burst shaped by envelope.
  function pageRustle() {
    ensure();
    if (ctx.state === "suspended") ctx.resume();
    const dur = 0.5;
    const noise = ctx.createBufferSource();
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      const t = i / d.length;
      d[i] = (Math.random() * 2 - 1) * (1 - t) * (0.5 + 0.5 * Math.random());
    }
    noise.buffer = buf;

    const bp = ctx.createBiquadFilter();
    bp.type = "highpass"; bp.frequency.value = 1800;
    const bp2 = ctx.createBiquadFilter();
    bp2.type = "bandpass"; bp2.frequency.value = 3200; bp2.Q.value = 0.8;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 0.04);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

    // route rustle independent of drone mute so it's always audible once enabled
    noise.connect(bp).connect(bp2).connect(g).connect(ctx.destination);
    noise.start();
    noise.stop(ctx.currentTime + dur);
  }

  // soft low thud for cover open / close
  function thud() {
    ensure();
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    osc.type = "sine"; osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.3);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(g).connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.45);
  }

  return {
    toggleDrone() {
      if (droneOn) { stopDrone(); return false; }
      startDrone(); return true;
    },
    get enabled() { return droneOn; },
    pageRustle,
    thud,
    // rustle/thud should only play when sound is enabled
    sfx(name) { if (!droneOn) return; if (name === "rustle") pageRustle(); else if (name === "thud") thud(); }
  };
})();
