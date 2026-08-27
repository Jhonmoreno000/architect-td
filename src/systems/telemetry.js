// ============================================
// SYSTEMS - Live Architecture Telemetry & Observability Engine
// ============================================

const TelemetrySystem = {
  rps: 0,
  p99Latency: 12, // ms
  slaUptime: 99.99,
  sampleTimer: 0,
  requestsHandledInSample: 0,

  update(dt) {
    this.sampleTimer += dt;

    if (this.sampleTimer >= 60) { // Every 1 second
      this.sampleTimer = 0;

      // RPS based on active threat count
      const threatCount = (GameState.engine && GameState.engine.enemies) ? GameState.engine.enemies.length : 0;
      this.rps = Math.max(0, threatCount * 14 + Math.floor(Math.random() * 8));

      // Latency calculation: If enemies are close to Core, latency spikes!
      let closestDist = 999;
      if (GameState.engine && GameState.engine.enemies) {
        for (const e of GameState.engine.enemies) {
          if (e.alive) {
            const d = e.distTo(GameState.engine.core);
            if (d < closestDist) closestDist = d;
          }
        }
      }

      if (closestDist < 120) {
        this.p99Latency = Math.min(480, Math.round(180 + (120 - closestDist) * 3));
      } else if (closestDist < 250) {
        this.p99Latency = Math.min(180, Math.round(45 + (250 - closestDist) * 0.8));
      } else {
        this.p99Latency = Math.max(8, Math.round(12 + Math.random() * 6));
      }

      // SLA %
      const lossRatio = Math.max(0, (GameState.maxLives - GameState.lives) / (GameState.maxLives || 1));
      this.slaUptime = Math.max(90.0, 99.999 - lossRatio * 8.5);

      this.renderTelemetryHUD();
    }
  },

  renderTelemetryHUD() {
    const rpsEl = document.getElementById('telemetry-rps');
    const latencyEl = document.getElementById('telemetry-latency');
    const slaEl = document.getElementById('telemetry-sla');

    if (rpsEl) rpsEl.textContent = `${this.rps} RPS`;
    if (latencyEl) {
      latencyEl.textContent = `${this.p99Latency}ms`;
      latencyEl.className = 'font-code font-bold ' + (this.p99Latency < 60 ? 'text-green-400' : this.p99Latency < 150 ? 'text-yellow-400' : 'text-red-400');
    }
    if (slaEl) {
      slaEl.textContent = `${this.slaUptime.toFixed(2)}%`;
      slaEl.className = 'font-code font-bold ' + (this.slaUptime >= 99.0 ? 'text-cyan-400' : this.slaUptime >= 95.0 ? 'text-yellow-400' : 'text-red-400');
    }
  }
};
