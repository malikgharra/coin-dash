// Scoring sounds synthesized with the Web Audio API, so there are no audio files.
// Every call is a silent no-op when audio is unavailable, blocked or muted.
window.CoinDashSounds = (() => {
  let AudioCtx = window.AudioContext || window.webkitAudioContext;
  let ctx = null;
  const sounds = { muted: false };

  // Browsers block audio until a user gesture, so create or resume the context on one.
  function unlock() {
    if (!ctx && AudioCtx) {
      try { ctx = new AudioCtx(); } catch (e) { AudioCtx = null; }
    }
    if (ctx && ctx.state === 'suspended') {
      try { ctx.resume().catch(() => {}); } catch (e) { /* stay silent */ }
    }
  }
  ['keydown', 'pointerdown', 'touchstart'].forEach(type => window.addEventListener(type, unlock, true));

  // One note: starts `at` seconds from now, glides from f0 to f1 Hz, quick attack then decay.
  function note([type, f0, f1, at, dur, gain]) {
    const t = ctx.currentTime + at, osc = ctx.createOscillator(), amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, t);
    osc.frequency.exponentialRampToValueAtTime(f1, t + dur);
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(gain, t + 0.01);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }
  function play(...notes) {
    if (sounds.muted || !ctx || (ctx.state && ctx.state !== 'running')) return;
    try { notes.forEach(note); } catch (e) { /* sound is optional */ }
  }

  // Bright two-step blip; rises a semitone every two coins, up to a fifth.
  sounds.coin = (score = 0) => {
    const k = Math.pow(2, Math.min(score, 14) / 24);
    play(['square', 988 * k, 988 * k, 0, 0.06, 0.1], ['square', 1319 * k, 1319 * k, 0.06, 0.16, 0.1]);
  };
  // Low falling buzz with a thud underneath.
  sounds.crash = () => play(['sawtooth', 150, 40, 0, 0.35, 0.12], ['sine', 110, 35, 0, 0.25, 0.18]);
  // Rising three-note chime (C5, E5, G5).
  sounds.timeUp = () => play(['triangle', 523, 523, 0, 0.2, 0.15], ['triangle', 659, 659, 0.12, 0.2, 0.15],
    ['triangle', 784, 784, 0.24, 0.22, 0.15]);
  sounds.toggleMute = () => (sounds.muted = !sounds.muted);
  return sounds;
})();
