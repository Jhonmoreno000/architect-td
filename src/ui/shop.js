// ============================================
// UI - Tower Shop & Architecture Catalog (10 Modules)
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
      btn.className = 'tower-btn relative p-2 rounded-lg text-left transition-all flex flex-col justify-between group';
      btn.dataset.type = key;

      const hotkey = idx === 9 ? '0' : `${idx + 1}`;

      btn.innerHTML = `
        <div class="flex items-center justify-between w-full mb-1">
          <div class="flex items-center gap-1.5 min-w-0">
            <span class="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0" style="background:${def.color}25;color:${def.color};border:1px solid ${def.color}80">${def.icon}</span>
            <span class="text-[11px] font-bold text-white truncate font-heading tracking-wide">${def.name}</span>
          </div>
          <span class="text-[9px] px-1 py-0.2 rounded font-code bg-white/10 text-gray-300 font-bold shrink-0">[${hotkey}]</span>
        </div>
        <div class="text-[10px] text-gray-400 leading-tight mb-1 line-clamp-1">${def.category}</div>
        <div class="flex items-center justify-between mt-auto pt-1 border-t border-white/10 text-[11px]">
          <span class="text-yellow-400 font-bold font-code">$${def.cost}</span>
          <span class="text-[9px] text-cyan-400/80 font-code">${def.range}px</span>
        </div>
      `;

      const tooltip = document.createElement('div');
      tooltip.className = 'tower-tooltip hidden absolute z-50 p-3 rounded-xl bg-[#0c1424] border border-white/20 text-xs shadow-xl pointer-events-none';
      tooltip.style.cssText = 'width: 220px; left: -225px; top: 0;';
      const dps = def.fireRate > 0 ? (def.damage / (def.fireRate / 60)).toFixed(1) : def.damage;
      const dmgPerShot = def.damage;
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
          <div><span class="text-slate-500">Daño/Disparo:</span> <span class="font-bold text-white font-code">${dmgPerShot}</span></div>
          <div><span class="text-slate-500">Cadencia:</span> <span class="font-bold text-white font-code">${fireRateSec}</span></div>
          <div><span class="text-slate-500">DPS:</span> <span class="font-bold text-yellow-400 font-code">${dps}</span></div>
          <div><span class="text-slate-500">Rango:</span> <span class="font-bold text-cyan-400 font-code">${def.range}px</span></div>
          <div><span class="text-slate-500">Vida:</span> <span class="font-bold text-green-400 font-code">${def.maxHp} HP</span></div>
        </div>
        <div class="text-[10px] text-slate-300 leading-tight mb-1.5">${def.description}</div>
        ${towerCount > 0 ? `
          <div class="pt-1.5 border-t border-white/10 text-[10px]">
            <span class="text-slate-500">Colocadas:</span> <span class="font-bold text-white font-code">${towerCount}</span>
            <span class="text-slate-500 ml-2">Kills:</span> <span class="font-bold text-green-400 font-code">${existingKills}</span>
            <span class="text-slate-500 ml-2">Daño Total:</span> <span class="font-bold text-yellow-400 font-code">${Math.round(totalDmg)}</span>
          </div>
        ` : ''}
        <div class="text-[9px] text-cyan-400/60 mt-1 font-code">Sinergias: ${def.synergiesWith.join(', ') || 'Ninguna'}</div>
      `;

      btn.style.position = 'relative';
      btn.appendChild(tooltip);

      btn.addEventListener('mouseenter', () => {
        tooltip.classList.remove('hidden');
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
