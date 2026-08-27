// ============================================
// ENTITIES - Optimized Particle System
// ============================================

/**
 * Particle - Sistema de partículas para efectos visuales.
 *
 * Tipos de partículas:
 * - 'spark': Chispas de explosiones/hits (se desvanece con tamaño reducido)
 * - 'ring': Anillo de onda expansiva (crece con opacidad reducida)
 * - 'gravity': Partícula con gravedad (cae con el tiempo)
 * - 'friction': Partícula con fricción (frena progresivamente)
 *
 * @class Particle
 * @extends Entity
 */
class Particle extends Entity {
  constructor(x, y, color, vx, vy, life = 30, type = 'spark', size = 3) {
    super(x, y);
    this.color = color;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.type = type;
    this.radius = size;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (this.type === 'ring') {
      this.radius += 1.8 * dt;
    } else if (this.type === 'gravity') {
      this.vy += 0.08 * dt;
    } else if (this.type === 'friction') {
      this.vx *= 0.95;
      this.vy *= 0.95;
    }

    this.life -= dt;
    if (this.life <= 0) this.alive = false;
  }

  draw(ctx) {
    if (!this.alive) return;
    const progress = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.globalAlpha = progress;

    if (this.type === 'ring') {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = Math.max(1, 3 * progress);
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(0.5, this.radius * progress), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
