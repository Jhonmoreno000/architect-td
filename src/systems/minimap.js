// ============================================
// SYSTEMS - Tactical Widescreen Radar with Cyberpunk CRT Effects & Telemetry
// ============================================

/**
 * MinimapSystem - Mini-mapa táctico widescreen con efectos de barrido CRT, telemetría y alarmas perimetrales.
 */
const MinimapSystem = {
  width: 256,
  height: 158,
  canvas: null,
  ctx: null,
  sweepAngle: 0,

  init() {
    const container = document.getElementById('minimap-container');
    if (!container) return;

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.className = 'w-full h-auto block rounded-2xl shadow-inner';
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

    // Deep Dark CRT Background
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, this.width, this.height);

    // Grid Mesh
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    const coreX = engine.core.x * scaleX;
    const coreY = engine.core.y * scaleY;

    // Sector Classification & Nearest Threat
    let nearestDist = 9999;
    let nearestEnemy = null;
    let sectorCounts = { NW: 0, NE: 0, SW: 0, SE: 0 };

    for (let i = 0; i < engine.enemies.length; i++) {
      const enemy = engine.enemies[i];
      if (!enemy.alive) continue;

      if (enemy.x < engine.canvas.width / 2 && enemy.y < engine.canvas.height / 2) sectorCounts.NW++;
      else if (enemy.x >= engine.canvas.width / 2 && enemy.y < engine.canvas.height / 2) sectorCounts.NE++;
      else if (enemy.x < engine.canvas.width / 2 && enemy.y >= engine.canvas.height / 2) sectorCounts.SW++;
      else sectorCounts.SE++;

      const dist = Math.hypot(enemy.x - engine.core.x, enemy.y - engine.core.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestEnemy = { x: enemy.x * scaleX, y: enemy.y * scaleY, realDist: dist };
      }
    }

    const isPerimeterBreached = nearestEnemy && nearestEnemy.realDist < 180;

    // Perimeter Alarm Strobe
    if (isPerimeterBreached) {
      const alarmStrobe = Math.sin(time * 8) * 0.18 + 0.18;
      ctx.fillStyle = `rgba(255, 0, 85, ${alarmStrobe})`;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    // Concentric Sonar Rings
    ctx.strokeStyle = isPerimeterBreached ? 'rgba(255, 0, 85, 0.25)' : 'rgba(0, 240, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let r = 20; r < this.width; r += 30) {
      ctx.beginPath();
      ctx.arc(coreX, coreY, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Radar Sweep Beam & Phosphor Trail
    this.sweepAngle = (time * 2.2) % (Math.PI * 2);
    ctx.save();
    const sweepGrad = ctx.createRadialGradient(coreX, coreY, 5, coreX, coreY, this.width * 0.7);
    sweepGrad.addColorStop(0, isPerimeterBreached ? 'rgba(255, 0, 85, 0.35)' : 'rgba(0, 255, 65, 0.35)');
    sweepGrad.addColorStop(1, 'rgba(0, 255, 65, 0)');
    ctx.fillStyle = sweepGrad;
    ctx.beginPath();
    ctx.moveTo(coreX, coreY);
    ctx.arc(coreX, coreY, this.width * 0.75, this.sweepAngle - 0.5, this.sweepAngle);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Auxiliary Cores and Sub-Nodes
    for (const node of engine.subNodes) {
      if (!node.alive) continue;
      ctx.fillStyle = '#8be9fd';
      ctx.beginPath();
      ctx.arc(node.x * scaleX, node.y * scaleY, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const aux of engine.auxCores) {
      ctx.fillStyle = '#8be9fd';
      ctx.beginPath();
      ctx.arc(aux.x * scaleX, aux.y * scaleY, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Placed Towers
    for (const tower of engine.towers) {
      const tx = (tower.x + tower.size / 2) * scaleX;
      const ty = (tower.y + tower.size / 2) * scaleY;
      ctx.fillStyle = tower.isCrashed ? '#ef4444' : tower.color;
      ctx.globalAlpha = tower.isCrashed ? 0.35 : 0.85;
      ctx.fillRect(tx - 2, ty - 2, 4.5, 4.5);
      ctx.globalAlpha = 1;
    }

    // Core Blip with Dynamic Heartbeat
    const corePulse = Math.sin(time * 4) * 0.35 + 0.65;
    ctx.save();
    ctx.shadowBlur = 10 * corePulse;
    ctx.shadowColor = isPerimeterBreached ? '#ff0055' : '#00ff41';
    ctx.fillStyle = isPerimeterBreached ? '#ff0055' : '#00ff41';
    ctx.beginPath();
    ctx.arc(coreX, coreY, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Enemies Blips
    for (const enemy of engine.enemies) {
      if (!enemy.alive) continue;
      const ex = enemy.x * scaleX;
      const ey = enemy.y * scaleY;

      ctx.fillStyle = enemy.color;
      ctx.globalAlpha = enemy.isCloaked ? 0.25 : 0.95;

      if (enemy.isBoss) {
        ctx.shadowBlur = 8;
        ctx.shadowColor = enemy.color;
        ctx.beginPath();
        ctx.arc(ex, ey, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.beginPath();
        ctx.arc(ex, ey, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Threat Vector Laser to Closest Target
    if (nearestEnemy && engine.enemies.length > 0) {
      ctx.save();
      ctx.strokeStyle = isPerimeterBreached ? 'rgba(255, 0, 85, 0.85)' : 'rgba(0, 240, 255, 0.6)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(coreX, coreY);
      ctx.lineTo(nearestEnemy.x, nearestEnemy.y);
      ctx.stroke();
      ctx.restore();
    }

    // Target Lock Reticle
    if (engine.focusTarget) {
      const fx = engine.focusTarget.x * scaleX;
      const fy = engine.focusTarget.y * scaleY;
      const lockPulse = Math.sin(time * 6) * 2 + 7;
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(fx, fy, lockPulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(fx - 10, fy); ctx.lineTo(fx + 10, fy);
      ctx.moveTo(fx, fy - 10); ctx.lineTo(fx, fy + 10);
      ctx.stroke();
    }

    // Frame Border
    ctx.strokeStyle = isPerimeterBreached ? 'rgba(255, 0, 85, 0.6)' : 'rgba(0, 255, 65, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0.5, 0.5, this.width - 1, this.height - 1);

    // Live Telemetry Bar at Bottom
    ctx.fillStyle = 'rgba(4, 8, 16, 0.92)';
    ctx.fillRect(1, this.height - 20, this.width - 2, 19);

    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#00ff41';
    ctx.fillText(`THREATS: ${engine.enemies.length}`, 8, this.height - 7);

    const proxText = nearestEnemy ? `PROX: ${Math.round(nearestEnemy.realDist)}px` : 'SECTOR CLEAR';
    const proxColor = nearestEnemy && nearestEnemy.realDist < 180 ? '#ff0055' : nearestEnemy && nearestEnemy.realDist < 320 ? '#eab308' : '#00f0ff';
    ctx.fillStyle = proxColor;
    ctx.textAlign = 'right';
    ctx.fillText(proxText, this.width - 8, this.height - 7);
  }
};
