// ============================================
// ENTITIES - Optimized Projectile System
// ============================================

/**
 * Projectile - Sistema de proyectiles optimizado.
 *
 * Soporta múltiples tipos: bullet, sniper, heavy_packet, bomb, beam.
 * Cada tipo tiene propiedades visuales y de daño diferentes.
 *
 * Optimizaciones:
 * - Trail almacenado como array plano [x1,y1, x2,y2, ...] en vez de objetos
 * - Hit detection usa distancia² (evita Math.sqrt)
 * - No crea objetos {x,y} por frame — usa lastTargetX/Y directamente
 *
 * @class Projectile
 * @extends Entity
 */
class Projectile extends Entity {
  /**
   * Crea un proyectil con sus propiedades de movimiento y daño.
   * @param {number} x - Posición X inicial
   * @param {number} y - Posición Y inicial
   * @param {Entity} target - Objetivo que sigue el proyectil
   * @param {number} damage - Daño base del proyectil
   * @param {string} color - Color hexadecimal del proyectil
   * @param {number} [speed=6] - Velocidad de movimiento
   * @param {string} [type='bullet'] - Tipo: 'bullet', 'sniper', 'heavy_packet', 'bomb', 'beam'
   * @param {number} [splashRadius=0] - Radio de daño en área (0 = sin splash)
   * @param {Object} [sourceTower=null] - Torre que disparó (para tracking de kills/damage)
   */
  constructor(x, y, target, damage, color, speed = 6, type = 'bullet', splashRadius = 0, sourceTower = null) {
    super(x, y);
    this.target = target;
    this.damage = damage;
    this.color = color;
    this.speed = speed;
    this.type = type;
    this.splashRadius = splashRadius;
    this.sourceTower = sourceTower;
    this.radius = type === 'sniper' ? 4 : type === 'heavy_packet' ? 5 : 3;
    this.trail = [];
    this.lastTargetX = target ? target.x : x;
    this.lastTargetY = target ? target.y : y;
  }

  /** Actualiza posición del proyectil y verifica colisión. */
  update(dt) {
    if (!this.alive) return;

    if (this.target && this.target.alive) {
      this.lastTargetX = this.target.x;
      this.lastTargetY = this.target.y;
    }

    const dx = this.lastTargetX - this.x;
    const dy = this.lastTargetY - this.y;
    const distSq = dx * dx + dy * dy;

    const hitThreshold = this.speed * dt + (this.target ? this.target.radius : 5);
    if (distSq < hitThreshold * hitThreshold || distSq < 36) {
      this.onHit();
      this.alive = false;
      return;
    }

    if (this.trail.length > (this.type === 'sniper' ? 12 : 6)) {
      this.trail.shift();
    }
    this.trail.push(this.x, this.y);

    const dist = Math.sqrt(distSq);
    this.x += (dx / dist) * this.speed * dt;
    this.y += (dy / dist) * this.speed * dt;
  }

  onHit() {
    if (this.splashRadius > 0 && GameState.engine) {
      CombatSystem.applyAreaDamage(this.x, this.y, this.splashRadius, this.damage, this.color);
      GameState.engine.addRingShockwave(this.x, this.y, this.color, this.splashRadius);
      GameState.engine.addParticles(this.x, this.y, this.color, 14, 'spark', 4);
    } else if (this.target && this.target.alive) {
      CombatSystem.dealDamage(this.target, this.damage, this.color, this.sourceTower);
      GameState.engine.addParticles(this.x, this.y, this.color, 6, 'spark', 2.5);
    }
  }

  draw(ctx) {
    if (!this.alive) return;
    ctx.save();

    const trailLen = this.trail.length;
    if (trailLen > 0) {
      const color = this.color;
      const r = this.radius;
      const maxStep = this.type === 'sniper' ? 12 : 6;
      const count = trailLen / 2;

      for (let i = 0; i < count; i++) {
        const t = i / count;
        ctx.globalAlpha = t * 0.42;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.trail[i * 2], this.trail[i * 2 + 1], Math.max(1, r * t), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 0.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}
