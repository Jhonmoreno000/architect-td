// ============================================
// TOWERS - Database Read Replica / Shard (DB)
// ============================================

class DatabaseTower extends Tower {
  constructor(x, y) {
    super(x, y, TOWER_CONFIG.database);
    this.incomeTimer = 0;
    this.incomeInterval = 300;
  }

  updateCooldown(dt) {
    super.updateCooldown(dt);

    // Passive economy generation
    this.incomeTimer += dt;
    if (this.incomeTimer >= this.incomeInterval) {
      this.incomeTimer = 0;
      const genMoney = this.level === 3 ? 45 : this.level === 2 ? 25 : 15;
      GameState.money += genMoney;
      GameState.score += genMoney;
      if (GameState.engine) {
        GameState.engine.addFloatingText(this.x + this.size / 2, this.y - 12, `+$${genMoney}`, '#ec4899', 11, true);
        GameState.engine.addParticles(this.x + this.size / 2, this.y + this.size / 2, '#ec4899', 6, 'spark', 2.5);
      }
      AudioSystem.play('coin');
      GameState.updateUI();
    }
  }

  fire() {
    this.cooldown = this.fireRate;
    this.recoil = 3;
    const cx = this.x + this.size / 2;
    const cy = this.y + this.size / 2;

    if (GameState.engine) {
      CombatSystem.applyAreaDamage(cx, cy, this.range, this.damage, this.color);
      GameState.engine.addRingShockwave(cx, cy, this.color, this.range);

      if (this.level === 3) {
        for (const e of GameState.engine.enemies) {
          if (e.alive && !e.reached && this.distTo(e) <= this.range && !e.stunImmune) {
            e.stunTimer = 60;
          }
        }
      }

      AudioSystem.play('explosion');
    }

    return null;
  }

  _drawTurret(ctx) {
    const r = this.size / 2 - 4;
    // Database server disc stack
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Concentric data rings
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#060a12';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = this.color;
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DB', 0, 0);
  }
}
