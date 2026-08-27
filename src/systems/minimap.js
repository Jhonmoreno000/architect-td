// ============================================
// SYSTEMS - Tactical Minimap with Real-Time Radar
// ============================================

/**
 * MinimapSystem - Mini-mapa táctico con vista global del campo de batalla.
 *
 * Renderiza una vista reducida del mapa mostrando:
 * - Core (verde pulsante)
 * - Sub-nodes y aux cores (cyan)
 * - Torres colocadas (colores de la torre)
 * - Enemigos (con indicador de boss más grande)
 * - Sweep radar animado cuando hay enemigos
 * - Focus target (crosshair rojo)
 * - Conteo de enemigos y bosses en la esquina
 *
 * Interactividad: Click en el minimap activa Focus Target en esa posición.
 *
 * @namespace MinimapSystem
 */
const MinimapSystem = {
  size: 160,
  padding: 10,
  canvas: null,
  ctx: null,

  /** Inicializa el canvas del minimap y el listener de clicks. */
  init() {
    const container = document.getElementById('minimap-container');
    if (!container) return;

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.size;
    this.canvas.height = this.size;
    this.canvas.style.borderRadius = '12px';
    this.canvas.style.border = '1px solid rgba(0,255,65,0.3)';
    this.canvas.style.boxShadow = '0 0 15px rgba(0,255,65,0.1)';
    this.canvas.style.cursor = 'pointer';

    container.innerHTML = '';
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    this.canvas.addEventListener('click', (e) => {
      if (!GameState.engine) return;
      const rect = this.canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      const engine = GameState.engine;
      const worldX = mx * engine.canvas.width;
      const worldY = my * engine.canvas.height;
      engine.setFocusTarget(worldX, worldY);
    });
  },

  /**
   * Renderiza el minimap completo cada frame.
   * @param {GameEngine} engine - Instancia del motor del juego
   */
  render(engine) {
    if (!this.ctx || !engine) return;
    const ctx = this.ctx;
    const scale = this.size / engine.canvas.width;

    ctx.clearRect(0, 0, this.size, this.size);

    ctx.fillStyle = '#040810';
    ctx.fillRect(0, 0, this.size, this.size);

    ctx.strokeStyle = 'rgba(0,255,65,0.08)';
    ctx.lineWidth = 0.5;
    const gridStep = engine.gridSize * scale;
    for (let x = 0; x < this.size; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.size);
      ctx.stroke();
    }
    for (let y = 0; y < this.size; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.size, y);
      ctx.stroke();
    }

    const coreX = engine.core.x * scale;
    const coreY = engine.core.y * scale;
    const time = performance.now() / 1000;
    const pulse = Math.sin(time * 3) * 0.3 + 0.7;

    ctx.save();
    ctx.shadowBlur = 6 * pulse;
    ctx.shadowColor = '#00ff41';
    ctx.fillStyle = '#00ff41';
    ctx.beginPath();
    ctx.arc(coreX, coreY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    for (const node of engine.subNodes) {
      if (!node.alive) continue;
      ctx.fillStyle = '#8be9fd';
      ctx.beginPath();
      ctx.arc(node.x * scale, node.y * scale, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const aux of engine.auxCores) {
      ctx.fillStyle = '#8be9fd';
      ctx.beginPath();
      ctx.arc(aux.x * scale, aux.y * scale, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const tower of engine.towers) {
      const tx = (tower.x + tower.size / 2) * scale;
      const ty = (tower.y + tower.size / 2) * scale;
      ctx.fillStyle = tower.isCrashed ? '#ef4444' : tower.color;
      ctx.globalAlpha = tower.isCrashed ? 0.5 : 0.8;
      ctx.fillRect(tx - 1.5, ty - 1.5, 3, 3);
      ctx.globalAlpha = 1;
    }

    const enemyCount = engine.enemies.length;
    if (enemyCount > 0) {
      const radarSweep = (time * 1.5) % (Math.PI * 2);
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = '#ff0040';
      ctx.beginPath();
      ctx.moveTo(coreX, coreY);
      ctx.arc(coreX, coreY, this.size * 0.8, radarSweep - 0.4, radarSweep);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    for (const enemy of engine.enemies) {
      if (!enemy.alive) continue;
      const ex = enemy.x * scale;
      const ey = enemy.y * scale;

      ctx.fillStyle = enemy.color;
      ctx.globalAlpha = enemy.isCloaked ? 0.3 : 0.9;

      if (enemy.isBoss) {
        ctx.shadowBlur = 4;
        ctx.shadowColor = enemy.color;
        ctx.beginPath();
        ctx.arc(ex, ey, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.beginPath();
        ctx.arc(ex, ey, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    if (engine.focusTarget) {
      const fx = engine.focusTarget.x * scale;
      const fy = engine.focusTarget.y * scale;
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(fx, fy, 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(fx - 6, fy);
      ctx.lineTo(fx + 6, fy);
      ctx.moveTo(fx, fy - 6);
      ctx.lineTo(fx, fy + 6);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(0,255,65,0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, this.size, this.size);

    const totalEnemies = engine.enemies.length;
    const bossCount = engine.enemies.filter(e => e.isBoss).length;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(2, this.size - 16, 70, 14);
    ctx.fillStyle = '#00ff41';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${totalEnemies} ENEM${totalEnemies !== 1 ? 'S' : ''}`, 5, this.size - 6);
    if (bossCount > 0) {
      ctx.fillStyle = '#ff0055';
      ctx.fillText(`BOSS:${bossCount}`, 42, this.size - 6);
    }
  }
};
