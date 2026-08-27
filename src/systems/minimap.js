// ============================================
// SYSTEMS - Tactical Widescreen Radar with Real-Time Telemetry
// ============================================

/**
 * MinimapSystem - Mini-mapa táctico widescreen con telemetría perimetral real.
 */
const MinimapSystem = {
  width: 256,
  height: 158,
  canvas: null,
  ctx: null,

  init() {
    const container = document.getElementById('minimap-container');
    if (!container) return;

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.className = 'w-full h-auto block rounded-xl';
    this.canvas.style.cursor = 'crosshair';

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

  render(engine) {
    if (!this.ctx || !engine) return;
    const ctx = this.ctx;
    const scaleX = this.width / engine.canvas.width;
    const scaleY = this.height / engine.canvas.height;
    const time = performance.now() / 1000;

    ctx.clearRect(0, 0, this.width, this.height);

    // Background Grid
    ctx.fillStyle = '#040810';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.strokeStyle = 'rgba(0, 255, 65, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    const coreX = engine.core.x * scaleX;
    const coreY = engine.core.y * scaleY;

    // Concentric Radar Rings
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
    ctx.lineWidth = 1;
    for (let r = 25; r < this.width; r += 35) {
      ctx.beginPath();
      ctx.arc(coreX, coreY, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Active Radar Sweep
    const radarSweep = (time * 2.0) % (Math.PI * 2);
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#00ff41';
    ctx.beginPath();
    ctx.moveTo(coreX, coreY);
    ctx.arc(coreX, coreY, this.width * 0.75, radarSweep - 0.45, radarSweep);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Sub-Nodes and Auxiliary Cores
    for (const node of engine.subNodes) {
      if (!node.alive) continue;
      ctx.fillStyle = '#8be9fd';
      ctx.beginPath();
      ctx.arc(node.x * scaleX, node.y * scaleY, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const aux of engine.auxCores) {
      ctx.fillStyle = '#8be9fd';
      ctx.beginPath();
      ctx.arc(aux.x * scaleX, aux.y * scaleY, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Placed Defense Towers
    for (const tower of engine.towers) {
      const tx = (tower.x + tower.size / 2) * scaleX;
      const ty = (tower.y + tower.size / 2) * scaleY;
      ctx.fillStyle = tower.isCrashed ? '#ef4444' : tower.color;
      ctx.globalAlpha = tower.isCrashed ? 0.4 : 0.85;
      ctx.fillRect(tx - 2, ty - 2, 4, 4);
      ctx.globalAlpha = 1;
    }

    // Core Blip
    const pulse = Math.sin(time * 3) * 0.3 + 0.7;
    ctx.save();
    ctx.shadowBlur = 8 * pulse;
    ctx.shadowColor = '#00ff41';
    ctx.fillStyle = '#00ff41';
    ctx.beginPath();
    ctx.arc(coreX, coreY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Enemies & Threat Distance Vector
    let nearestDist = 9999;
    let nearestEnemy = null;
    let northCount = 0, southCount = 0, eastCount = 0, westCount = 0;

    for (const enemy of engine.enemies) {
      if (!enemy.alive) continue;
      const ex = enemy.x * scaleX;
      const ey = enemy.y * scaleY;

      // Sector classification
      if (enemy.y < engine.canvas.height * 0.35) northCount++;
      else if (enemy.y > engine.canvas.height * 0.65) southCount++;
      if (enemy.x > engine.canvas.width * 0.65) eastCount++;
      else if (enemy.x < engine.canvas.width * 0.35) westCount++;

      const dist = Math.hypot(enemy.x - engine.core.x, enemy.y - engine.core.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestEnemy = { x: ex, y: ey, realDist: dist };
      }

      ctx.fillStyle = enemy.color;
      ctx.globalAlpha = enemy.isCloaked ? 0.25 : 0.95;

      if (enemy.isBoss) {
        ctx.shadowBlur = 6;
        ctx.shadowColor = enemy.color;
        ctx.beginPath();
        ctx.arc(ex, ey, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.beginPath();
        ctx.arc(ex, ey, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Draw Vector Line to Closest Threat
    if (nearestEnemy && engine.enemies.length > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 0, 85, 0.6)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(coreX, coreY);
      ctx.lineTo(nearestEnemy.x, nearestEnemy.y);
      ctx.stroke();
      ctx.restore();
    }

    // Manual Focus Target Reticle
    if (engine.focusTarget) {
      const fx = engine.focusTarget.x * scaleX;
      const fy = engine.focusTarget.y * scaleY;
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(fx, fy, 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(fx - 9, fy); ctx.lineTo(fx + 9, fy);
      ctx.moveTo(fx, fy - 9); ctx.lineTo(fx, fy + 9);
      ctx.stroke();
    }

    // Border Frame
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, this.width - 1, this.height - 1);

    // Live Real-Time Telemetry Bar at bottom of Radar
    ctx.fillStyle = 'rgba(4, 8, 16, 0.88)';
    ctx.fillRect(1, this.height - 18, this.width - 2, 17);

    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#00ff41';
    ctx.fillText(`TOTAL: ${engine.enemies.length}`, 6, this.height - 6);

    const proxText = nearestEnemy ? `PROX: ${Math.round(nearestEnemy.realDist)}px` : 'SECTOR CLEAR';
    const proxColor = nearestEnemy && nearestEnemy.realDist < 180 ? '#ff0055' : nearestEnemy && nearestEnemy.realDist < 320 ? '#eab308' : '#00f0ff';
    ctx.fillStyle = proxColor;
    ctx.textAlign = 'right';
    ctx.fillText(proxText, this.width - 6, this.height - 6);
  }
};
