/* global Phaser, COIN_DASH */
// Best score: saved in localStorage, mirrored in memory so the game still works when storage is blocked.
const BEST_KEY = 'coinDash.best';
let sessionBest = 0;
function loadBest() {
  try {
    const stored = Number(localStorage.getItem(BEST_KEY)); // missing -> 0, non-numeric -> NaN
    if (Number.isFinite(stored)) sessionBest = Math.max(sessionBest, Math.floor(stored));
  } catch { /* storage blocked: keep the in-memory best */ }
  return sessionBest;
}
function saveBest(score) {
  sessionBest = score;
  try { localStorage.setItem(BEST_KEY, String(score)); } catch { /* storage blocked */ }
}

class CoinDash extends Phaser.Scene {
  constructor() { super('CoinDash'); }

  create() {
    const c = COIN_DASH;
    // The registry outlives scene.restart(), so the chosen preset survives R.
    this.difficulty = this.registry.get('difficulty') || c.defaultDifficulty;
    const preset = c.difficulties[this.difficulty];
    this.score = 0;
    this.best = loadBest();
    this.finished = false;
    this.paused = false;
    this.deadline = this.time.now + c.roundSeconds * 1000;
    this.physics.world.setBounds(0, 44, c.width, c.height - 44);
    this.add.grid(c.width / 2, c.height / 2, c.width, c.height, 40, 40,
      c.colors.background, 1, 0x24334b, 0.45);
    this.hud = this.add.text(18, 12, '', { font: '18px monospace', color: '#ffffff' });
    this.player = this.add.rectangle(c.width / 2, c.height / 2, 24, 24, c.colors.player);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.coin = this.add.circle(100, 100, 9, c.colors.coin);
    this.physics.add.existing(this.coin);
    this.coin.body.setCircle(9);
    this.placeCoin();
    this.drones = this.physics.add.group();
    // Original 270 px spacing, squeezed to fit 90..width-90 when there are more drones.
    // The row sits at y = 100, 150 px above the player's centre start.
    const gap = Math.min(270, (c.width - 180) / Math.max(1, preset.droneCount - 1));
    for (let i = 0; i < preset.droneCount; i++) {
      const drone = this.add.rectangle(90 + i * gap, 100, 26, 26, c.colors.drone);
      this.drones.add(drone);
      drone.body.setCollideWorldBounds(true).setBounce(1, 1);
      const angle = (35 + i * 105) * Math.PI / 180;
      drone.body.setVelocity(Math.cos(angle) * preset.droneSpeed, Math.sin(angle) * preset.droneSpeed);
    }
    this.physics.add.overlap(this.player, this.coin, () => {
      if (this.finished) return;
      this.score++;
      this.placeCoin();
    });
    this.physics.add.overlap(this.player, this.drones, () => this.finish('A drone caught you!'));
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,R');
    this.input.keyboard.on('keydown-R', () => this.scene.restart());
    ['easy', 'normal', 'hard'].forEach((name, i) => this.input.keyboard.on(
      `keydown-${['ONE', 'TWO', 'THREE'][i]}`, () => { this.registry.set('difficulty', name); this.scene.restart(); }));
    this.input.keyboard.on('keydown-P', () => this.togglePause());
    this.input.keyboard.on('keydown-ESC', () => this.togglePause());
    this.pauseOverlay = this.add.container(0, 0, [
      this.add.rectangle(c.width / 2, c.height / 2, c.width, c.height, 0x0a1120, 0.5),
      this.add.rectangle(c.width / 2, c.height / 2, 520, 90, 0x0a1120, 0.95),
      this.add.text(c.width / 2, c.height / 2, 'Paused — press P to resume',
        { font: '28px monospace', color: '#ffffff' }).setOrigin(0.5)
    ]).setVisible(false);
  }

  togglePause() {
    if (this.finished) return;
    this.paused = !this.paused;
    if (this.paused) {
      this.pausedAt = this.time.now;
      this.player.body.setVelocity(0, 0);
      this.physics.pause();
    } else {
      // Freeze the round timer: push the deadline back by however long we were paused.
      this.deadline += this.time.now - this.pausedAt;
      this.physics.resume();
    }
    this.pauseOverlay.setVisible(this.paused);
  }

  placeCoin() {
    const c = COIN_DASH;
    // Avoid spawning the next coin directly underneath the player.
    let x, y;
    do {
      x = Phaser.Math.Between(25, c.width - 25);
      y = Phaser.Math.Between(70, c.height - 25);
    } while (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < 60);
    this.coin.setPosition(x, y);
    this.coin.body.reset(x, y);
  }

  update() {
    if (this.finished || this.paused) return;
    const dx = Number(this.cursors.right.isDown || this.keys.D.isDown)
      - Number(this.cursors.left.isDown || this.keys.A.isDown);
    const dy = Number(this.cursors.down.isDown || this.keys.S.isDown)
      - Number(this.cursors.up.isDown || this.keys.W.isDown);
    const direction = new Phaser.Math.Vector2(dx, dy).normalize().scale(COIN_DASH.playerSpeed);
    this.player.body.setVelocity(direction.x, direction.y);
    this.drawHud();
    if (this.secondsLeft() === 0) this.finish('Time is up!');
  }

  secondsLeft() { return Math.max(0, Math.ceil((this.deadline - this.time.now) / 1000)); }

  drawHud() {
    const label = COIN_DASH.difficulties[this.difficulty].label;
    this.hud.setText(`Coins: ${this.score}   Best: ${this.best}   ${label.padEnd(13)}Time: ${this.secondsLeft()}s`);
  }

  finish(reason) {
    if (this.finished) return;
    this.finished = true;
    this.physics.pause();
    const newBest = this.score > this.best;
    if (newBest) { this.best = this.score; saveBest(this.best); }
    this.drawHud();
    const c = COIN_DASH;
    this.add.rectangle(c.width / 2, c.height / 2, 460, 190, 0x0a1120, 0.95);
    this.add.text(c.width / 2, c.height / 2,
      `${reason}\n${this.score} coins collected\n${newBest ? 'New best!' : `Best: ${this.best}`}\nPress R to try again`,
      { font: '24px monospace', color: '#ffffff', align: 'center', lineSpacing: 12 }
    ).setOrigin(0.5);
  }
}
window.coinDashGame = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: COIN_DASH.width,
  height: COIN_DASH.height,
  backgroundColor: COIN_DASH.colors.background,
  physics: { default: 'arcade', arcade: { debug: false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_HORIZONTALLY },
  scene: CoinDash
});
