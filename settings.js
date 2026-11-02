// Keep tuning separate from game behaviour so features can be developed independently.
window.COIN_DASH = {
  width: 800,
  height: 500,
  roundSeconds: 45,
  playerSpeed: 240,
  // Keys 1 / 2 / 3 pick a preset; normal keeps the original drone tuning.
  defaultDifficulty: 'normal',
  difficulties: {
    easy: { label: 'Easy', droneCount: 2, droneSpeed: 80 },
    normal: { label: 'Normal', droneCount: 3, droneSpeed: 105 },
    hard: { label: 'Hard', droneCount: 5, droneSpeed: 150 }
  },
  colors: { background: 0x101c31, player: 0x71e8ce, coin: 0xffd166, drone: 0xff657a }
};
