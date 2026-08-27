// ============================================
// ENTITIES - Base Entity Class
// ============================================

/**
 * Entity - Clase base para todas las entidades del juego.
 * Proporciona posición, estado alive, y método de distancia.
 *
 * @class Entity
 */
class Entity {
  /**
   * @param {number} x - Posición X
   * @param {number} y - Posición Y
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.alive = true;
  }

  /** @param {number} dt - Delta time */
  update(dt) {}
  /** @param {CanvasRenderingContext2D} ctx */
  draw(ctx) {}

  /**
   * Calcula la distancia euclidiana a otra entidad.
   * @param {Entity} other - Otra entidad
   * @returns {number} Distancia en píxeles
   */
  distTo(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
