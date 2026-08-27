// ============================================
// ENTITIES - Base Entity Class
// ============================================

class Entity {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.alive = true;
  }

  update(dt) {}
  draw(ctx) {}

  distTo(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
