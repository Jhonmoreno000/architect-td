// ============================================
// SYSTEMS - Tower Code System & Programmable Tower IDE
// Manages the Code Editor modal for customizing tower algorithms in real-time
// ============================================

const TowerCodeSystem = {
  currentTower: null,
  editor: null,

  defaultTemplates: {
    loadbalancer: [
      {
        name: 'Round Robin (Equitativo)',
        desc: 'Distribuye el fuego secuencialmente entre todos los enemigos en rango.',
        code: `function selectTarget(enemies, tower) {
  // Round Robin cíclico
  if (!enemies || enemies.length === 0) return null;
  tower._rr = ((tower._rr || 0) + 1) % enemies.length;
  return enemies[tower._rr];
}`
      },
      {
        name: 'Closest to Core (Protección Crítica)',
        desc: 'Prioriza al enemigo más cercano al Núcleo de datos.',
        code: `function selectTarget(enemies, tower) {
  // Ordena por distancia al núcleo (distToCore ascendente)
  if (!enemies || enemies.length === 0) return null;
  return enemies.slice().sort((a, b) => a.distToCore - b.distToCore)[0];
}`
      },
      {
        name: 'Highest Threat / Boss First (Anti-Tanques)',
        desc: 'Concentra el ataque en enemigos con mayor vida (HP).',
        code: `function selectTarget(enemies, tower) {
  // Ordena por vida descendente
  if (!enemies || enemies.length === 0) return null;
  return enemies.slice().sort((a, b) => b.hp - a.hp)[0];
}`
      }
    ],
    default: [
      {
        name: 'Target Prioritario Estándar',
        desc: 'Enfoca objetivos según el modo seleccionado.',
        code: `function selectTarget(enemies, tower) {
  if (!enemies || enemies.length === 0) return null;
  return enemies[0];
}`
      },
      {
        name: 'Weakest First (Optimizador de Kills)',
        desc: 'Elimina rápidamente a enemigos casi muertos para reducir RPS.',
        code: `function selectTarget(enemies, tower) {
  if (!enemies || enemies.length === 0) return null;
  return enemies.slice().sort((a, b) => a.hp - b.hp)[0];
}`
      }
    ]
  },

  openEditor(tower) {
    this.currentTower = tower;
    const modal = document.getElementById('tower-code-modal');
    if (!modal) return;

    modal.classList.remove('hidden');
    modal.style.display = 'flex';

    // Populate tower info
    document.getElementById('tower-code-name').textContent = `${tower.name} [TIER ${tower.level}]`;
    document.getElementById('tower-code-icon').textContent = tower.icon;
    document.getElementById('tower-code-icon').style.color = tower.color;
    document.getElementById('tower-code-icon').style.backgroundColor = `${tower.color}25`;
    document.getElementById('tower-code-icon').style.borderColor = tower.color;

    // Load templates
    const templates = this.defaultTemplates[tower.type] || this.defaultTemplates.default;
    const templateSelect = document.getElementById('tower-code-templates');
    templateSelect.innerHTML = '';
    templates.forEach((tpl, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `${tpl.name} - ${tpl.desc}`;
      templateSelect.appendChild(opt);
    });

    const initialCode = tower.customScript || templates[0].code;

    // Initialize or update editor
    const container = document.getElementById('tower-code-editor-mount');
    container.innerHTML = '';
    this.editor = new EmbeddedCodeEditor({
      container: container,
      initialCode: initialCode,
      language: 'javascript'
    });

    templateSelect.onchange = (e) => {
      const selected = templates[e.target.value];
      if (selected && this.editor) {
        this.editor.setValue(selected.code);
      }
    };

    const statusBox = document.getElementById('tower-code-status');
    if (statusBox) statusBox.classList.add('hidden');
  },

  closeModal() {
    const modal = document.getElementById('tower-code-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  },

  compileAndApply() {
    if (!this.currentTower || !this.editor) return;
    const code = this.editor.getValue();
    const statusBox = document.getElementById('tower-code-status');

    // Test with simulated enemies
    const fakeEnemies = [
      { id: 'E1', name: 'GET Request', hp: 50, maxHp: 50, distToCore: 120, speed: 1.2, alive: true },
      { id: 'E2', name: 'POST Heavy', hp: 200, maxHp: 200, distToCore: 240, speed: 0.8, alive: true },
      { id: 'E3', name: 'SQL Injection', hp: 110, maxHp: 110, distToCore: 180, speed: 1.0, alive: true }
    ];

    const evalResult = SandboxEvaluator.execute(code, 'selectTarget', [fakeEnemies, this.currentTower]);

    if (!evalResult.success) {
      AudioSystem.play('error');
      if (statusBox) {
        statusBox.classList.remove('hidden');
        statusBox.className = 'p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono';
        statusBox.innerHTML = `✕ ERROR DE COMPILACIÓN: ${evalResult.error}`;
      }
      return;
    }

    // Success! Apply script
    this.currentTower.customScript = code;
    this.currentTower.isScriptActive = true;
    this.currentTower.scriptMultiplier = 1.3;
    this.currentTower.scriptLastError = null;

    AudioSystem.play('wave');
    if (typeof AchievementSystem !== 'undefined') {
      AchievementSystem.check('first_script');
    }

    if (statusBox) {
      statusBox.classList.remove('hidden');
      statusBox.className = 'p-3 rounded-xl bg-green-950/40 border border-green-500/40 text-green-300 text-xs font-mono';
      statusBox.innerHTML = `✓ ALGORITMO COMPILADO CON ÉXITO! (+30% DPS ALGORÍTMICO). Objetivo seleccionado en simulación: ${evalResult.result ? evalResult.result.name : 'Ninguno'}`;
    }

    if (GameState.engine) {
      GameState.engine.addFloatingText(
        this.currentTower.x + this.currentTower.size / 2,
        this.currentTower.y - 14,
        'λ ALGORITMO COMPILADO! +30% DPS',
        '#00ff41',
        11,
        true
      );
    }

    GameState.updateUI();
  },

  resetDefault() {
    if (!this.currentTower) return;
    this.currentTower.customScript = null;
    this.currentTower.isScriptActive = false;
    this.currentTower.scriptMultiplier = 1.0;
    this.currentTower.scriptLastError = null;

    const templates = this.defaultTemplates[this.currentTower.type] || this.defaultTemplates.default;
    if (this.editor) {
      this.editor.setValue(templates[0].code);
    }

    const statusBox = document.getElementById('tower-code-status');
    if (statusBox) {
      statusBox.classList.remove('hidden');
      statusBox.className = 'p-3 rounded-xl bg-yellow-950/40 border border-yellow-500/40 text-yellow-300 text-xs font-mono';
      statusBox.innerHTML = '⟲ Algoritmo restablecido al comportamiento de fábrica.';
    }

    GameState.updateUI();
  }
};

// Global exposure
if (typeof window !== 'undefined') {
  window.TowerCodeSystem = TowerCodeSystem;
}
if (typeof module !== 'undefined') {
  module.exports = { TowerCodeSystem };
}
