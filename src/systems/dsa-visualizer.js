// ============================================
// SYSTEMS - Interactive Data Structures & Algorithms (DSA) Visualizer
// Demonstrates Queues (Kafka), Hash Maps & LRU (Redis), and Balancing Algorithms (Load Balancer)
// ============================================

const DSAVisualizer = {
  currentTab: 'queue',
  queueData: ['PAYLOAD_1', 'PAYLOAD_2', 'PAYLOAD_3'],
  queueMax: 6,
  cacheData: [
    { key: 'user:101', val: '{"name":"Elena"}', hits: 14 },
    { key: 'session:auth', val: '{"token":"jwt"}', hits: 32 },
    { key: 'cart:902', val: '{"items":2}', hits: 5 }
  ],
  cacheMax: 4,
  lbNodes: [
    { id: 'app-node-1', load: 3, max: 10 },
    { id: 'app-node-2', load: 6, max: 10 },
    { id: 'app-node-3', load: 1, max: 10 }
  ],
  lbPointer: 0,

  showModal(initialTab = 'queue') {
    this.currentTab = initialTab;
    const modal = document.getElementById('dsa-modal');
    if (!modal) return;

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    this.render();
  },

  closeModal() {
    const modal = document.getElementById('dsa-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  },

  setTab(tab) {
    this.currentTab = tab;
    this.render();
  },

  render() {
    const container = document.getElementById('dsa-visualizer-content');
    if (!container) return;

    if (this.currentTab === 'queue') {
      this.renderQueue(container);
    } else if (this.currentTab === 'cache') {
      this.renderCache(container);
    } else if (this.currentTab === 'lb') {
      this.renderLB(container);
    }
  },

  // 1. Queue (FIFO / Buffer)
  renderQueue(container) {
    const isFull = this.queueData.length >= this.queueMax;
    container.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-emerald-400 font-heading">// COLA FIFO (FIRST-IN, FIRST-OUT) - PATRÓN KAFKA</h3>
            <p class="text-xs text-slate-400">Los eventos se encolan al final (Tail) y se consumen desde el frente (Head) preservando el orden.</p>
          </div>
          <div class="text-xs font-code font-bold ${isFull ? 'text-red-400' : 'text-emerald-400'}">
            Buffer: ${this.queueData.length} / ${this.queueMax}
          </div>
        </div>

        <!-- Buffer Array View -->
        <div class="bg-black/70 p-4 rounded-xl border border-white/10">
          <div class="text-[11px] text-slate-500 mb-2 font-mono flex items-center justify-between">
            <span>[HEAD / CONSUMIDOR] ◄</span>
            <span>◄ [TAIL / PRODUCTOR]</span>
          </div>
          <div class="grid grid-cols-6 gap-2 min-h-[70px] items-center">
            ${Array.from({ length: this.queueMax }).map((_, i) => {
              const item = this.queueData[i];
              if (item) {
                return `
                  <div class="h-14 rounded-lg bg-emerald-950/70 border border-emerald-500/50 flex flex-col items-center justify-center p-1 text-center animate-pulse">
                    <span class="text-[10px] text-emerald-400 font-mono font-bold">${item}</span>
                    <span class="text-[9px] text-slate-500 font-mono">idx: ${i}</span>
                  </div>
                `;
              } else {
                return `
                  <div class="h-14 rounded-lg bg-white/5 border border-dashed border-white/15 flex flex-col items-center justify-center p-1 text-center">
                    <span class="text-[9px] text-slate-600 font-mono">SLOT VACÍO</span>
                    <span class="text-[9px] text-slate-600 font-mono">idx: ${i}</span>
                  </div>
                `;
              }
            }).join('')}
          </div>
        </div>

        <!-- Action Controls -->
        <div class="flex items-center gap-3">
          <button id="btn-enqueue" class="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs uppercase transition-all cursor-pointer font-heading ${isFull ? 'opacity-50 cursor-not-allowed' : ''}">
            + ENQUEUE (PRODUCIR EVENTO)
          </button>
          <button id="btn-dequeue" class="flex-1 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs uppercase transition-all cursor-pointer font-heading ${this.queueData.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}">
            - DEQUEUE (CONSUMIR EVENTO)
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-enqueue')?.addEventListener('click', () => {
      if (this.queueData.length < this.queueMax) {
        this.queueData.push(`MSG_${Math.floor(Math.random() * 900 + 100)}`);
        this.render();
      }
    });

    document.getElementById('btn-dequeue')?.addEventListener('click', () => {
      if (this.queueData.length > 0) {
        this.queueData.shift();
        this.render();
      }
    });
  },

  // 2. Cache LRU & Hash Map
  renderCache(container) {
    container.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-yellow-400 font-heading">// CACHÉ EN MEMORIA & DESALOJO LRU - PATRÓN REDIS</h3>
            <p class="text-xs text-slate-400">Acceso en tiempo O(1) con Hash Map y desalojo de los elementos menos recientemente usados (Least Recently Used).</p>
          </div>
          <div class="text-xs font-code text-yellow-400 font-bold">
            Capacidad: ${this.cacheData.length} / ${this.cacheMax}
          </div>
        </div>

        <!-- Cache Slots -->
        <div class="bg-black/70 p-4 rounded-xl border border-white/10 space-y-2">
          <div class="text-[11px] text-slate-500 font-mono flex items-center justify-between">
            <span>[MÁS RECIENTE / MRU]</span>
            <span>[MÁS ANTIGUO / CANDIDATO A DESALOJO / LRU]</span>
          </div>
          <div class="space-y-2">
            ${this.cacheData.map((entry, idx) => `
              <div class="p-2.5 rounded-lg bg-yellow-950/30 border border-yellow-500/30 flex items-center justify-between text-xs">
                <div class="flex items-center gap-2">
                  <span class="w-5 h-5 rounded bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-mono text-[10px] font-bold">#${idx + 1}</span>
                  <span class="font-code font-bold text-white">${entry.key}</span>
                  <span class="font-mono text-slate-400 text-[11px]">➔ ${entry.val}</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-emerald-400 font-code font-bold text-[11px]">${entry.hits} hits</span>
                  <button class="btn-touch-cache text-[10px] bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/40 px-2 py-1 rounded cursor-pointer" data-key="${entry.key}">ACCEDER (GET)</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <button id="btn-cache-insert" class="w-full py-2.5 px-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs uppercase transition-all cursor-pointer font-heading">
          + INSERTAR NUEVA CLAVE (PROVOCAR DESALOJO SI ESTÁ LLENA)
        </button>
      </div>
    `;

    container.querySelectorAll('.btn-touch-cache').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const key = e.target.getAttribute('data-key');
        const idx = this.cacheData.findIndex(item => item.key === key);
        if (idx !== -1) {
          const item = this.cacheData.splice(idx, 1)[0];
          item.hits++;
          this.cacheData.unshift(item); // move to front (MRU)
          this.render();
        }
      });
    });

    document.getElementById('btn-cache-insert')?.addEventListener('click', () => {
      const newKey = `data:${Math.floor(Math.random() * 900 + 100)}`;
      if (this.cacheData.length >= this.cacheMax) {
        this.cacheData.pop(); // Evict LRU tail
      }
      this.cacheData.unshift({ key: newKey, val: '{"status":"ok"}', hits: 1 });
      this.render();
    });
  },

  // 3. Load Balancer Distribution
  renderLB(container) {
    container.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-cyan-400 font-heading">// BALANCEADOR DE CARGA - ROUND ROBIN & LEAST CONN</h3>
            <p class="text-xs text-slate-400">Distribuye el tráfico para prevenir fallos por saturación y maximizar el Throughput.</p>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          ${this.lbNodes.map((node, i) => `
            <div class="p-3.5 rounded-xl bg-black/60 border ${this.lbPointer === i ? 'border-cyan-400 bg-cyan-950/20' : 'border-white/10'} space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="font-heading font-bold ${this.lbPointer === i ? 'text-cyan-400' : 'text-white'}">${node.id}</span>
                ${this.lbPointer === i ? '<span class="text-[10px] text-cyan-400 font-mono font-bold">◄ ACTIVO</span>' : ''}
              </div>
              <div class="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div class="h-full bg-cyan-500" style="width: ${(node.load / node.max) * 100}%"></div>
              </div>
              <div class="text-[11px] font-mono text-slate-400 text-right">${node.load} / ${node.max} reqs</div>
            </div>
          `).join('')}
        </div>

        <div class="flex items-center gap-3">
          <button id="btn-lb-roundrobin" class="flex-1 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs uppercase transition-all cursor-pointer font-heading">
            SIMULAR PETICIÓN ROUND ROBIN
          </button>
          <button id="btn-lb-leastconn" class="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase transition-all cursor-pointer font-heading">
            SIMULAR LEAST CONNECTIONS
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-lb-roundrobin')?.addEventListener('click', () => {
      this.lbNodes[this.lbPointer].load = Math.min(this.lbNodes[this.lbPointer].max, this.lbNodes[this.lbPointer].load + 1);
      this.lbPointer = (this.lbPointer + 1) % this.lbNodes.length;
      this.render();
    });

    document.getElementById('btn-lb-leastconn')?.addEventListener('click', () => {
      let minIdx = 0;
      let minLoad = this.lbNodes[0].load;
      for (let i = 1; i < this.lbNodes.length; i++) {
        if (this.lbNodes[i].load < minLoad) {
          minLoad = this.lbNodes[i].load;
          minIdx = i;
        }
      }
      this.lbNodes[minIdx].load = Math.min(this.lbNodes[minIdx].max, this.lbNodes[minIdx].load + 1);
      this.lbPointer = minIdx;
      this.render();
    });
  }
};

// Global exposure
if (typeof window !== 'undefined') {
  window.DSAVisualizer = DSAVisualizer;
}
if (typeof module !== 'undefined') {
  module.exports = { DSAVisualizer };
}
