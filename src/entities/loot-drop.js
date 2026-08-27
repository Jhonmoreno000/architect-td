// ============================================
// ENTITIES - Interactive Collectible Network Drops (Vector Graphics)
// ============================================

class LootDrop extends Entity {
  constructor(x, y, type = 'money') {
    super(x, y);
    this.type = type; // 'money', 'energy', 'overclock'
    this.alive = true;
    this.life = 480; // ~8s
    this.maxLife = 480;
    this.radius = 14;
    this.bounce = 0;
    this.bounceTimer = Math.random() * 10;

    switch (type) {
      case 'overclock':
        this.color = '#00f0ff';
        this.label = 'TURBO';
        break;
      case 'energy':
        this.color = '#bd93f9';
        this.label = 'COOLDOWN';
        break;
      case 'money':
      default:
        this.color = '#ffeb3b';
        this.label = '+$50';
        break;
    }
  }

  update(dt) {
    this.life -= dt;
    this.bounceTimer += dt * 0.1;
    this.bounce = Math.sin(this.bounceTimer * 2) * 3;

    if (this.life <= 0) {
      this.alive = false;
    }
  }

  collect() {
    if (!this.alive) return;
    this.alive = false;

    AudioSystem.play('coin');

    if (this.type === 'money') {
      GameState.money += 50;
      GameState.score += 100;
      if (GameState.engine) {
        GameState.engine.addFloatingText(this.x, this.y - 10, '+$50 DUMP RECOLECTADO!', '#ffeb3b', 12, true);
        GameState.engine.addRingShockwave(this.x, this.y, '#ffeb3b', 30);
      }
    } else if (this.type === 'energy') {
      if (GameState.abilityCooldowns) {
        for (const k of Object.keys(GameState.abilityCooldowns)) {
          GameState.abilityCooldowns[k] = Math.max(0, GameState.abilityCooldowns[k] - 15);
        }
      }
      if (GameState.engine) {
        GameState.engine.addFloatingText(this.x, this.y - 10, 'DEVOPS CD -15s!', '#bd93f9', 12, true);
        GameState.engine.addRingShockwave(this.x, this.y, '#bd93f9', 35);
      }
    } else if (this.type === 'overclock') {
      if (GameState.engine) {
        let count = 0;
        for (const t of GameState.engine.towers) {
          if (this.distTo(t) < 160) {
            t.overclockTimer = 480;
            count++;
          }
        }
        GameState.engine.addFloatingText(this.x, this.y - 10, `${count} TORRES SUPERCARGADAS!`, '#00f0ff', 12, true);
        GameState.engine.addRingShockwave(this.x, this.y, '#00f0ff', 40);
      }
    }

    GameState.updateUI();
  }

  draw(ctx) {
    if (!this.alive) return;
    const progress = this.life / this.maxLife;
    const drawY = this.y + this.bounce;

    ctx.save();
    ctx.globalAlpha = Math.min(1, progress * 3);

    // Glowing collectible pod
    ctx.shadowBlur = 14;
    ctx.shadowColor = this.color;
    ctx.fillStyle = 'rgba(6, 14, 28, 0.9)';
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(this.x, drawY, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Pure Canvas Vector Glyph
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;
    ctx.lineWidth = 1.5;

    if (this.type === 'money') {
      // Vector Data Chip
      ctx.strokeRect(this.x - 5, drawY - 5, 10, 10);
      ctx.fillRect(this.x - 2, drawY - 2, 4, 4);
    } else if (this.type === 'energy') {
      // Vector Battery / Capacitor Cell
      ctx.strokeRect(this.x - 4, drawY - 6, 8, 12);
      ctx.fillRect(this.x - 2, drawY - 8, 4, 2);
      ctx.fillRect(this.x - 2, drawY - 2, 4, 6);
    } else if (this.type === 'overclock') {
      // Vector Lightning Bolt
      ctx.beginPath();
      ctx.moveTo(this.x + 1, drawY - 7);
      ctx.lineTo(this.x - 4, drawY);
      ctx.lineTo(this.x, drawY);
      ctx.lineTo(this.x - 1, drawY + 7);
      ctx.lineTo(this.x + 4, drawY);
      ctx.lineTo(this.x, drawY);
      ctx.closePath();
      ctx.fill();
    }

    // Outer pulsing radar ring
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    ctx.arc(this.x, drawY, this.radius + 4 + Math.sin(this.bounceTimer * 3) * 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}
