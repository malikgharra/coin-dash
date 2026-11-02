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
// Paper sketch theme. Set below the tuning so colour changes merge cleanly with gameplay changes.
Object.assign(window.COIN_DASH.colors, {
  background: 0xf6efdf, player: 0x1f5f5b, coin: 0xd09a1e, drone: 0xa8402f,
  grid: 0x6d9bd1, gridAlpha: 0.35, outline: 0x2b2622, panel: 0xfffaee, hud: '#2b2622'
});
