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
