// ============================================
// UI - Tower Shop & Architecture Catalog (10 Modules) - Vertical Sidebar
// ============================================

const Shop = {
  container: null,

  init() {
    this.container = document.getElementById('tower-shop');
    this.build();
  },

  build() {
    if (!this.container) return;
    this.container.innerHTML = '';

    const entries = Object.entries(TOWER_CONFIG);
    entries.forEach(([key, def], idx) => {
      const btn = document.createElement('button');
      btn.className = 'tower-btn relative p-1.5 rounded-lg text-left transition-all flex flex-col items-center gap-0.5 group';
      btn.dataset.type = key;

      const hotkey = idx === 9 ? '0' : `${idx + 1}`;

      btn.innerHTML = `
        <div class="w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 border transition-all" style="background:${def.color}20;color:${def.color};border-color:${def.color}50">${def.icon}</div>
        <span class="text-[8px] text-slate-400 font-code font-bold leading-none">$${def.cost}</span>
        <span class="text-[7px] text-slate-500 font-code leading-none">${hotkey}</span>
      `;

      const tooltip = document.createElement('div');
      tooltip.className = 'tower-tooltip hidden fixed z-[100] p-3 rounded-xl bg-[#0c1424] border border-white/20 text-xs shadow-2xl pointer-events-none';
      tooltip.style.cssText = 'width: 230px;';

      const dps = def.fireRate > 0 ? (def.damage / (def.fireRate / 60)).toFixed(1) : def.damage;
      const fireRateSec = def.fireRate > 0 ? (def.fireRate / 60).toFixed(2) + 's' : 'N/A';
      const existingKills = GameState.engine ? GameState.engine.towers.filter(t => t.type === key).reduce((sum, t) => sum + t.kills, 0) : 0;
      const totalDmg = GameState.engine ? GameState.engine.towers.filter(t => t.type === key).reduce((sum, t) => sum + t.damageDealt, 0) : 0;
      const towerCount = GameState.engine ? GameState.engine.towers.filter(t => t.type === key).length : 0;

      tooltip.innerHTML = `
        <div class="flex items-center gap-2 mb-2 pb-1.5 border-b border-white/10">
          <span class="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold" style="background:${def.color}25;color:${def.color};border:1px solid ${def.color}80">${def.icon}</span>
          <div>
            <div class="font-bold text-white font-heading">${def.name}</div>
            <div class="text-[10px] text-slate-400">${def.category}</div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-x-3 gap-y-1 mb-2 text-[11px]">
          <div><span class="text-slate-500">Daño:</span> <span class="font-bold text-white font-code">${def.damage}</span></div>
          <div><span class="text-slate-500">Cadencia:</span> <span class="font-bold text-white font-code">${fireRateSec}</span></div>
          <div><span class="text-slate-500">DPS:</span> <span class="font-bold text-yellow-400 font-code">${dps}</span></div>
          <div><span class="text-slate-500">Rango:</span> <span class="font-bold text-cyan-400 font-code">${def.range}px</span></div>
          <div><span class="text-slate-500">Vida:</span> <span class="font-bold text-green-400 font-code">${def.maxHp} HP</span></div>
          <div><span class="text-slate-500">Costo:</span> <span class="font-bold text-yellow-400 font-code">$${def.cost}</span></div>
        </div>
        <div class="text-[10px] text-slate-300 leading-tight mb-1.5">${def.description}</div>
        ${towerCount > 0 ? `
          <div class="pt-1.5 border-t border-white/10 text-[10px]">
            <span class="text-slate-500">Colocadas:</span> <span class="font-bold text-white font-code">${towerCount}</span>
            <span class="text-slate-500 ml-2">Kills:</span> <span class="font-bold text-green-400 font-code">${existingKills}</span>
            <span class="text-slate-500 ml-2">Daño:</span> <span class="font-bold text-yellow-400 font-code">${Math.round(totalDmg)}</span>
          </div>
        ` : ''}
        <div class="text-[9px] text-cyan-400/60 mt-1 font-code">Sinergias: ${def.synergiesWith.join(', ') || 'Ninguna'}</div>
        <div class="text-[8px] text-green-400/50 mt-1 font-code">Click izq: Colocar | Shift+Click: Múltiple</div>
      `;

      btn.appendChild(tooltip);

      btn.addEventListener('mouseenter', (e) => {
        tooltip.classList.remove('hidden');
        const rect = btn.getBoundingClientRect();
        tooltip.style.left = (rect.right + 8) + 'px';
        tooltip.style.top = rect.top + 'px';
        if (rect.right + 240 > window.innerWidth) {
          tooltip.style.left = (rect.left - 240) + 'px';
        }
        if (rect.top + 300 > window.innerHeight) {
          tooltip.style.top = (window.innerHeight - 310) + 'px';
        }
      });
      btn.addEventListener('mouseleave', () => {
        tooltip.classList.add('hidden');
      });

      btn.addEventListener('click', () => this.selectTower(key));
      this.container.appendChild(btn);
    });
  },

  selectTower(type) {
    if (GameState.selectedTower === type) {
      this.deselectAll();
      return;
    }

    GameState.selectPlacedTower(null);
    GameState.selectedTower = type;

    document.querySelectorAll('.tower-btn').forEach(b => {
      if (b.dataset.type === type) {
        b.classList.add('selected');
      } else {
        b.classList.remove('selected');
      }
    });

    AudioSystem.play('click');
    GameState.updateUI();
  },

  deselectAll() {
    GameState.selectedTower = null;
    document.querySelectorAll('.tower-btn').forEach(b => b.classList.remove('selected'));
    GameState.updateUI();
  }
};
