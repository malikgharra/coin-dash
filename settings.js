// Keep tuning separate from game behaviour so features can be developed independently.
window.COIN_DASH = {
  width: 800,
  height: 500,
  roundSeconds: 45,
  playerSpeed: 240,
  droneSpeed: 105,
  droneCount: 3,
  colors: { background: 0x101c31, player: 0x71e8ce, coin: 0xffd166, drone: 0xff657a }
};
// Neon arcade theme. Set below the tuning so colour changes merge cleanly with gameplay changes.
Object.assign(window.COIN_DASH.colors, {
  background: 0x06050f, player: 0x00f0ff, coin: 0xffe94a, drone: 0xff2d8a,
  grid: 0x7a3cff, gridAlpha: 0.3, outline: 0xffffff, panel: 0x0b0820, hud: '#00f0ff'
});
