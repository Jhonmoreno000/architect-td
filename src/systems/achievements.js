// ============================================
// SYSTEMS - Achievement / Badge System
// ============================================

/**
 * AchievementSystem - Sistema de logros desbloqueables con notificaciones.
 *
 * 18 logros definidos que cubren: kills, combos, oleadas, bosses, upgrades, y más.
 * Cada logro se desbloquea una sola vez y muestra una notificación animada.
 *
 * Flujo:
 * 1. Combate/oleada llama a AchievementSystem.check('id')
 * 2. Si no está desbloqueado, se agrega a la cola de notificaciones
 * 3. Se muestra una notificación de 3 segundos con fade in/out
 * 4. Se otorgan 100 puntos de score por logro desbloqueado
 *
 * @namespace AchievementSystem
 */
const AchievementSystem = {
  unlocked: new Set(),
  notificationQueue: [],
  currentNotification: null,
  notificationTimer: 0,

  definitions: {
    first_blood: {
      id: 'first_blood',
      title: 'First Blood',
      desc: 'Elimina tu primera amenaza',
      icon: '🎯',
      color: '#00ff41'
    },
    wave_5: {
      id: 'wave_5',
      title: 'Incidente Contenido',
      desc: 'Sobrevive 5 oleadas',
      icon: '🛡️',
      color: '#38bdf8'
    },
    wave_10: {
      id: 'wave_10',
      title: 'Defensor Veterano',
      desc: 'Sobrevive 10 oleadas',
      icon: '⚔️',
      color: '#a855f7'
    },
    wave_15: {
      id: 'wave_15',
      title: 'Arquitecto de Resiliencia',
      desc: 'Sobrevive 15 oleadas',
      icon: '🏰',
      color: '#f97316'
    },
    boss_slain: {
      id: 'boss_slain',
      title: 'Incidente Resuelto',
      desc: 'Elimina tu primer jefe',
      icon: '💀',
      color: '#ff3366'
    },
    combo_10: {
      id: 'combo_10',
      title: 'Chain Reaction',
      desc: 'Alcanza un combo x10',
      icon: '⚡',
      color: '#ffeb3b'
    },
    combo_25: {
      id: 'combo_25',
      title: 'Killing Spree',
      desc: 'Alcanza un combo x25',
      icon: '🔥',
      color: '#ff6600'
    },
    money_1000: {
      id: 'money_1000',
      title: 'Capital Surplus',
      desc: 'Acumula $1000 de presupuesto',
      icon: '💰',
      color: '#eab308'
    },
    kill_100: {
      id: 'kill_100',
      title: 'Century Kill',
      desc: 'Elimina 100 amenazas totales',
      icon: '🎯',
      color: '#10b981'
    },
    kill_500: {
      id: 'kill_500',
      title: 'Mass Purge',
      desc: 'Elimina 500 amenazas totales',
      icon: '☠️',
      color: '#ef4444'
    },
    perfect_wave: {
      id: 'perfect_wave',
      title: 'Zero Downtime',
      desc: 'Completa una oleada sin perder vidas',
      icon: '✨',
      color: '#00f0ff'
    },
    tower_upgrade: {
      id: 'tower_upgrade',
      title: 'Rolling Deployment',
      desc: 'Mejora una torre a Tier 2+',
      icon: '🔧',
      color: '#6366f1'
    },
    tower_max: {
      id: 'tower_max',
      title: 'Production Ready',
      desc: 'Lleva una torre a Tier 3 (MAX)',
      icon: '🏆',
      color: '#ffeb3b'
    },
    all_towers_placed: {
      id: 'all_towers_placed',
      title: 'Full Stack Architect',
      desc: 'Coloca al menos una torre de cada tipo',
      icon: '🏗️',
      color: '#14b8a6'
    },
    early_call: {
      id: 'early_call',
      title: 'Shift-Left Security',
      desc: 'Llama una oleada anticipada 5 veces',
      icon: '🚀',
      color: '#ec4899'
    },
    shield_save: {
      id: 'shield_save',
      title: 'DDoS Mitigation',
      desc: 'Bloquea 10 ataques con el escudo',
      icon: '🛡️',
      color: '#f97316'
    },
    victory: {
      id: 'victory',
      title: '99.999% Uptime',
      desc: 'Completa el juego en cualquier dificultad',
      icon: '👑',
      color: '#ffeb3b'
    },
    no_crash: {
      id: 'no_crash',
      title: 'Zero Incidents',
      desc: 'Gana sin que ningún servidor se caiga',
      icon: '💎',
      color: '#00f0ff'
    }
  },

  /**
   * Intenta desbloquear un logro por ID.
   * Si ya está desbloqueado, hace nothing. Si no, lo agrega a la cola.
   * @param {string} id - ID del logro (key de definitions)
   */
  check(id) {
    if (this.unlocked.has(id)) return;
    if (!this.definitions[id]) return;

    this.unlocked.add(id);
    const def = this.definitions[id];
    this.notificationQueue.push(def);

    GameState.score += 100;
    AudioSystem.play('ability');
  },

  update(dt) {
    if (this.currentNotification) {
      this.notificationTimer -= dt;
      if (this.notificationTimer <= 0) {
        this.currentNotification = null;
      }
    }

    if (!this.currentNotification && this.notificationQueue.length > 0) {
      this.currentNotification = this.notificationQueue.shift();
      this.notificationTimer = 180;
    }
  },

  /**
   * Renderiza la notificación actual con fade in/out.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} canvasW - Ancho del canvas principal
   * @param {number} canvasH - Alto del canvas principal
   */
  render(ctx, canvasW, canvasH) {
    if (!this.currentNotification) return;
    const n = this.currentNotification;
    const time = this.notificationTimer;
    const maxTime = 180;
    let alpha = 1;
    if (time > maxTime - 20) alpha = (maxTime - time) / 20;
    else if (time < 20) alpha = time / 20;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

    const boxW = 280;
    const boxH = 52;
    const boxX = (canvasW - boxW) / 2;
    const boxY = canvasH - 70;

    ctx.fillStyle = 'rgba(6, 12, 24, 0.95)';
    ctx.strokeStyle = n.color;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 16;
    ctx.shadowColor = n.color;

    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = n.color;
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('🏆 LOGRO DESBLOQUEADO', boxX + 12, boxY + 16);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(`${n.icon} ${n.title}`, boxX + 12, boxY + 34);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.fillText(n.desc, boxX + 12, boxY + 47);

    ctx.restore();
  },

  reset() {
    this.unlocked.clear();
    this.notificationQueue = [];
    this.currentNotification = null;
    this.notificationTimer = 0;
  },

  getCount() {
    return this.unlocked.size;
  },

  getTotal() {
    return Object.keys(this.definitions).length;
  }
};
