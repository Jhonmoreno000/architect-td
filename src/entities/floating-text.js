// ============================================
// ENTITIES - Floating Combat Text
// ============================================

class FloatingText extends Entity {
  constructor(x, y, text, color = '#00ff41', size = 12, isCrit = false) {
    super(x, y);
    this.text = text;
    this.color = color;
    this.size = isCrit ? size * 1.3 : size;
    this.isCrit = isCrit;
    this.life = 45;
    this.maxLife = 45;
    this.vy = -(Math.random() * 0.8 + 0.8);
    this.vx = (Math.random() - 0.5) * 0.6;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    if (this.life <= 0) {
      this.alive = false;
    }
  }

  draw(ctx) {
    if (!this.alive) return;
    const progress = this.life / this.maxLife;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, progress * 1.5));
    ctx.shadowBlur = this.isCrit ? 12 : 6;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.font = `${this.isCrit ? 'bold ' : 'bold '}${Math.round(this.size)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}
