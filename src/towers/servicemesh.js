// ============================================
// TOWERS - Service Mesh (Envoy Proxy mTLS)
// ============================================

class ServiceMeshTower extends Tower {
  constructor(x, y) {
    super(x, y, TOWER_CONFIG.servicemesh);
    this.auraPulse = 0;
  }

  update(dt) {
    this.auraPulse += dt * 0.06;

    // Apply passive buff to all ally towers within range
    if (GameState.engine) {
      for (const t of GameState.engine.towers) {
        if (t !== this && this.distTo(t) <= this.range) {
          t.meshBuffTimer = 20; // Active mesh buff
        }
      }
    }
  }

  fire() {
    super.fire();
    if (!this.target) return;

    // Direct cryptographic beam against threats
    CombatSystem.dealDamage(this.target, this.damage, this.color, this);

    if (GameState.engine) {
      GameState.engine.addParticles(this.target.x, this.target.y, this.color, 4, 'spark', 2);
    }
  }

  _drawTurret(ctx) {
    const r = this.size / 2 - 6;
    const pulse = Math.sin(this.auraPulse * 3) * 0.25 + 0.75;

    // Pulsing mesh crypto cube
    ctx.save();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1.5;
    ctx.fillStyle = `rgba(99, 102, 241, ${0.3 * pulse})`;
    ctx.strokeRect(-r * 0.6, -r * 0.6, r * 1.2, r * 1.2);
    ctx.fillRect(-r * 0.6, -r * 0.6, r * 1.2, r * 1.2);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SM', 0, 0);
    ctx.restore();
  }
}
