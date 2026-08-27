// ============================================
// UI - Tower Shop & Architecture Catalog (High Readability & Tooltips)
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
      btn.className = 'tower-btn relative p-2.5 rounded-xl text-left transition-all flex flex-col justify-between group border border-white/10 bg-[#080d18] hover:border-cyan-500/40 hover:bg-[#0c1424] cursor-pointer';
      btn.dataset.type = key;

      const hotkey = idx === 9 ? '0' : `${idx + 1}`;

      btn.innerHTML = `
        <div class="flex items-center justify-between w-full mb-1.5">
          <div class="flex items-center gap-2 min-w-0">
            <span class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style="background:${def.color}25;color:${def.color};border:1.5px solid ${def.color}90">${def.icon}</span>
            <span class="text-xs font-bold text-white truncate font-heading tracking-wide">${def.name}</span>
          </div>
          <span class="text-[11px] px-1.5 py-0.5 rounded font-code bg-white/10 text-slate-300 font-bold shrink-0">[${hotkey}]</span>
        </div>
        <div class="text-[11px] text-slate-400 leading-tight mb-2 line-clamp-1">${def.category}</div>
        <div class="flex items-center justify-between mt-auto pt-1.5 border-t border-white/10 text-xs">
          <span class="text-yellow-400 font-bold font-code text-sm">$${def.cost}</span>
          <span class="text-xs text-cyan-400/90 font-code font-medium">${def.range}px</span>
        </div>
      `;

      const tooltip = document.createElement('div');
      tooltip.className = 'tower-tooltip hidden absolute z-50 p-3.5 rounded-2xl bg-[#080d1a] border border-cyan-500/30 text-xs shadow-2xl pointer-events-none backdrop-blur';
      tooltip.style.cssText = 'width: 250px; left: -260px; top: 0;';
      const dps = def.fireRate > 0 ? (def.damage / (def.fireRate / 60)).toFixed(1) : def.damage;
      const dmgPerShot = def.damage;
      const fireRateSec = def.fireRate > 0 ? (def.fireRate / 60).toFixed(2) + 's' : 'N/A';
      const existingKills = GameState.engine ? GameState.engine.towers.filter(t => t.type === key).reduce((sum, t) => sum + t.kills, 0) : 0;
      const totalDmg = GameState.engine ? GameState.engine.towers.filter(t => t.type === key).reduce((sum, t) => sum + t.damageDealt, 0) : 0;
      const towerCount = GameState.engine ? GameState.engine.towers.filter(t => t.type === key).length : 0;

      tooltip.innerHTML = `
        <div class="flex items-center gap-2.5 mb-2.5 pb-2 border-b border-white/10">
          <span class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style="background:${def.color}25;color:${def.color};border:1.5px solid ${def.color}90">${def.icon}</span>
          <div>
            <div class="font-bold text-white font-heading text-sm">${def.name}</div>
            <div class="text-xs text-cyan-400">${def.category}</div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-2.5 text-xs">
          <div><span class="text-slate-400 font-medium">Daño/Tiro:</span> <span class="font-bold text-white font-code">${dmgPerShot}</span></div>
          <div><span class="text-slate-400 font-medium">Cadencia:</span> <span class="font-bold text-white font-code">${fireRateSec}</span></div>
          <div><span class="text-slate-400 font-medium">DPS:</span> <span class="font-bold text-yellow-400 font-code">${dps}</span></div>
          <div><span class="text-slate-400 font-medium">Rango:</span> <span class="font-bold text-cyan-400 font-code">${def.range}px</span></div>
          <div class="col-span-2"><span class="text-slate-400 font-medium">Salud Máxima:</span> <span class="font-bold text-green-400 font-code">${def.maxHp} HP</span></div>
        </div>
        <div class="text-xs text-slate-300 leading-relaxed mb-2 bg-black/40 p-2 rounded-lg">${def.description}</div>
        ${towerCount > 0 ? `
          <div class="pt-2 border-t border-white/10 text-xs flex items-center justify-between text-slate-400">
            <span>En campo: <b class="text-white font-code">${towerCount}</b></span>
            <span>Kills: <b class="text-green-400 font-code">${existingKills}</b></span>
          </div>
        ` : ''}
        <div class="text-[11px] text-yellow-300/80 mt-1.5 font-heading">Sinergias: ${def.synergiesWith.join(', ') || 'Ninguna'}</div>
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
        b.classList.add('border-green-400', 'bg-green-950/40', 'shadow-[0_0_15px_rgba(0,255,65,0.25)]', 'scale-[1.02]');
      } else {
        b.classList.remove('border-green-400', 'bg-green-950/40', 'shadow-[0_0_15px_rgba(0,255,65,0.25)]', 'scale-[1.02]');
      }
    });

    AudioSystem.play('click');
  },

  deselectAll() {
    GameState.selectedTower = null;
    document.querySelectorAll('.tower-btn').forEach(b => {
      b.classList.remove('border-green-400', 'bg-green-950/40', 'shadow-[0_0_15px_rgba(0,255,65,0.25)]', 'scale-[1.02]');
    });
  }
};
