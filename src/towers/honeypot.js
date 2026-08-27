// ============================================
// TOWERS - Honeypot Decoy (Magnetic Threat Diverter)
// ============================================

class HoneypotTower extends Tower {
  constructor(x, y) {
    super(x, y, TOWER_CONFIG.honeypot);
    this.maxHp = 220;
    this.hp = this.maxHp;
    this.pulseAngle = 0;
  }

  update(dt) {
    this.pulseAngle += dt * 0.05;

    // Attract nearby enemies magnetically towards Honeypot decoy
    if (GameState.engine) {
      const cx = this.x + this.size / 2;
      const cy = this.y + this.size / 2;

      for (const e of GameState.engine.enemies) {
        if (e.alive && !e.isBoss && this.distTo(e) <= this.range) {
          // Attract towards Honeypot
          const edx = cx - e.x;
          const edy = cy - e.y;
          const edist = Math.hypot(edx, edy);

          if (edist > 10) {
            e.targetPos = { x: cx, y: cy };
          } else {
            // Threat reached Honeypot: damages the Honeypot and takes return damage
            this.hp -= 8 * (dt / 30);
            e.takeDamage(12 * (dt / 30));

            if (this.hp <= 0) {
              this.detonate();
              break;
            }
          }
        }
      }
    }
  }

  detonate() {
    AudioSystem.play('explosion');
    if (GameState.engine) {
      const cx = this.x + this.size / 2;
      const cy = this.y + this.size / 2;

      GameState.engine.triggerScreenShake(10);
      GameState.engine.addRingShockwave(cx, cy, '#14b8a6', this.range);
      GameState.engine.addFloatingText(cx, cy - 15, '💣 HONEYPOT EMP DETONADO!', '#14b8a6', 13, true);

      CombatSystem.applyAreaDamage(cx, cy, this.range, this.damage, '#14b8a6');

      // Free grid cell and remove
      GameState.engine.grid[this.gridY][this.gridX] = 0;
      const idx = GameState.engine.towers.indexOf(this);
      if (idx !== -1) GameState.engine.towers.splice(idx, 1);

      if (GameState.selectedPlacedTower === this) {
        GameState.selectPlacedTower(null);
      }
    }
  }

  _drawTurret(ctx) {
    const r = this.size / 2 - 6;
    const pulse = Math.sin(this.pulseAngle * 3) * 0.3 + 0.7;

    // Glowing decoy beacon
    ctx.save();
    ctx.strokeStyle = '#14b8a6';
    ctx.lineWidth = 2;
    ctx.fillStyle = `rgba(20, 184, 166, ${0.4 * pulse})`;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Small rotating radar antennas
    ctx.strokeStyle = '#14b8a6';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      const a = this.pulseAngle * 2 + (Math.PI * 2 / 3) * i;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      ctx.stroke();
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('HP', 0, 0);
    ctx.restore();
  }
}
