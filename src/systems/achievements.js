// ============================================
// SYSTEMS - Achievement / Badge System (Clean Vector Graphics)
// ============================================

/**
 * AchievementSystem - Sistema de logros desbloqueables sin emojis.
 */
const AchievementSystem = {
  unlocked: new Set(),
  notificationQueue: [],
  currentNotification: null,
  notificationTimer: 0,

  definitions: {
    first_blood: {
      id: 'first_blood',
      title: 'Primera Mitigación',
      desc: 'Elimina tu primera amenaza cibernética',
      tag: 'SEC_01',
      color: '#00ff41'
    },
    wave_5: {
      id: 'wave_5',
      title: 'Incidente Contenido',
      desc: 'Sobrevive 5 oleadas de tráfico masivo',
      tag: 'UPTIME_5',
      color: '#38bdf8'
    },
    wave_10: {
      id: 'wave_10',
      title: 'Defensor Veterano',
      desc: 'Sobrevive 10 oleadas perimetrales',
      tag: 'UPTIME_10',
      color: '#a855f7'
    },
    wave_15: {
      id: 'wave_15',
      title: 'Arquitecto de Resiliencia',
      desc: 'Sobrevive 15 oleadas consecutivas',
      tag: 'UPTIME_15',
      color: '#f97316'
    },
    boss_slain: {
      id: 'boss_slain',
      title: 'Incidente Crítico Resuelto',
      desc: 'Neutraliza a tu primer jefe de amenaza',
      tag: 'BOSS_KILL',
      color: '#ff3366'
    },
    combo_10: {
      id: 'combo_10',
      title: 'Reacción en Cadena',
      desc: 'Alcanza un combo x10 de mitigación',
      tag: 'COMBO_10',
      color: '#ffeb3b'
    },
    combo_25: {
      id: 'combo_25',
      title: 'Purga Volumétrica',
      desc: 'Alcanza un combo x25 sostenido',
      tag: 'COMBO_25',
      color: '#ff6600'
    },
    money_1000: {
      id: 'money_1000',
      title: 'Superávit Financiero',
      desc: 'Acumula $1000 de presupuesto en la nube',
      tag: 'BUDGET_1K',
      color: '#eab308'
    },
    kill_100: {
      id: 'kill_100',
      title: 'Purga de Paquetes (100)',
      desc: 'Elimina 100 amenazas totales',
      tag: 'KILL_100',
      color: '#10b981'
    },
    kill_500: {
      id: 'kill_500',
      title: 'Limpieza de Red Masiva (500)',
      desc: 'Elimina 500 amenazas totales',
      tag: 'KILL_500',
      color: '#ef4444'
    },
    perfect_wave: {
      id: 'perfect_wave',
      title: 'Zero Downtime',
      desc: 'Completa una oleada sin perder vidas del Core',
      tag: 'PERFECT',
      color: '#00f0ff'
    },
    tier3_tower: {
      id: 'tier3_tower',
      title: 'Infraestructura Enterprise',
      desc: 'Mejora cualquier servidor a Tier 3 máximo',
      tag: 'TIER_3',
      color: '#ec4899'
    },
    all_towers: {
      id: 'all_towers',
      title: 'Full Stack Architect',
      desc: 'Construye al menos un servidor de cada uno de los 10 tipos',
      tag: 'FULL_STACK',
      color: '#6366f1'
    },
    incident_master: {
      id: 'incident_master',
      title: 'Root Cause Master',
      desc: 'Resuelve un cuestionario de incidente SRE correctamente',
      tag: 'RCA_PRO',
      color: '#14b8a6'
    },
    synergy_active: {
      id: 'synergy_active',
      title: 'Malla Interconectada',
      desc: 'Activa una sinergia de red entre servidores',
      tag: 'SYNERGY',
      color: '#ffeb3b'
    },
    repair_master: {
      id: 'repair_master',
      title: 'SRE On-Call',
      desc: 'Repara un servidor en caliente bajo fuego hostil',
      tag: 'REPAIR',
      color: '#38bdf8'
    },
    focus_target: {
      id: 'focus_target',
      title: 'Target Lock Táctico',
      desc: 'Usa el foco manual (Clic Derecho) para concentrar el fuego',
      tag: 'TARGET_LOCK',
      color: '#ff0055'
    },
    apex_slayer: {
      id: 'apex_slayer',
      title: 'Leyenda del Sistema',
      desc: 'Destruye al Jefe Supremo Zero-Day Rootkit Apex',
      tag: 'APEX_SLAIN',
      color: '#ff79c6'
    }
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
  },

  unlock(id) {
    if (this.unlocked.has(id)) return;
    const def = this.definitions[id];
    if (!def) return;

    this.unlocked.add(id);
    this.notificationQueue.push(def);

    if (typeof GameState !== 'undefined') {
      GameState.score += 150;
      if (GameState.updateUI) GameState.updateUI();
    }

    if (typeof AudioSystem !== 'undefined') {
      AudioSystem.play('upgrade');
    }

    const countEl = document.getElementById('achievement-count');
    if (countEl) {
      countEl.textContent = `${this.getCount()}/${this.getTotal()}`;
    }
  },

  check(id) {
    this.unlock(id);
  },

  update(dt) {
    if (this.currentNotification) {
      this.notificationTimer -= dt;
      if (this.notificationTimer <= 0) {
        this.currentNotification = null;
        this.hideNotification();
      }
    } else if (this.notificationQueue.length > 0) {
      this.currentNotification = this.notificationQueue.shift();
      this.notificationTimer = 180; // 3 seconds
      this.showNotification(this.currentNotification);
    }
  },

  showNotification(achievement) {
    let el = document.getElementById('achievement-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'achievement-toast';
      el.className = 'fixed top-16 right-6 z-50 transition-all duration-300 transform translate-y-0 opacity-100';
      document.body.appendChild(el);
    }

    el.innerHTML = `
      <div class="flex items-center gap-3 p-4 bg-[#080d18] border border-green-500/40 rounded-2xl shadow-[0_0_30px_rgba(0,255,65,0.2)] backdrop-blur max-w-sm">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border" style="background:${achievement.color}25;color:${achievement.color};border-color:${achievement.color}">
          ${achievement.tag.substring(0, 4)}
        </div>
        <div>
          <div class="text-[10px] text-green-400 font-bold uppercase tracking-widest font-heading">// LOGRO DESBLOQUEADO</div>
          <div class="text-sm font-bold text-white font-heading">${achievement.title}</div>
          <div class="text-xs text-slate-300 leading-tight">${achievement.desc}</div>
        </div>
      </div>
    `;
    el.style.display = 'block';
    el.style.opacity = '1';
  },

  hideNotification() {
    const el = document.getElementById('achievement-toast');
    if (el) {
      el.style.opacity = '0';
      setTimeout(() => { el.style.display = 'none'; }, 300);
    }
  },

  showAchievementsModal() {
    const modal = document.getElementById('achievements-modal');
    if (!modal) return;

    const list = document.getElementById('achievements-list');
    if (list) {
      list.innerHTML = Object.values(this.definitions).map(a => {
        const isUnlocked = this.unlocked.has(a.id);
        return `
          <div class="p-4 rounded-xl border transition-all ${isUnlocked ? 'border-green-500/40 bg-green-950/20' : 'border-white/10 bg-black/40 opacity-50'} flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border" style="background:${isUnlocked ? a.color + '25' : '#ffffff10'};color:${isUnlocked ? a.color : '#94a3b8'};border-color:${isUnlocked ? a.color : '#ffffff20'}">
              ${a.tag.substring(0, 4)}
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <span class="text-sm font-bold text-white font-heading">${a.title}</span>
                <span class="text-[10px] font-code font-bold px-2 py-0.5 rounded ${isUnlocked ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-slate-500'}">
                  ${isUnlocked ? '✓ DESBLOQUEADO' : 'BLOQUEADO'}
                </span>
              </div>
              <div class="text-xs text-slate-300 mt-0.5">${a.desc}</div>
            </div>
          </div>
        `;
      }).join('');
    }

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  },

  closeAchievementsModal() {
    const modal = document.getElementById('achievements-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  },

  render(ctx, w, h) {
    // Optional canvas overlay for achievements
  }
};
