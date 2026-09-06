// ============================================
// SYSTEMS - Incident Controller & Educational Code Hotfix IDE
// Dual Mode: Interactive Code Challenge (Double Reward) & Conceptual RCA Quiz
// ============================================

const IncidentSystem = {
  currentIncident: null,
  currentMode: 'hotfix', // 'hotfix' or 'quiz'
  codeEditor: null,
  answeredIncidents: new Set(),

  triggerRandomIncident() {
    const available = INCIDENT_QUIZZES.filter(q => !this.answeredIncidents.has(q.id));
    if (available.length === 0) {
      this.answeredIncidents.clear();
    }
    const quiz = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : INCIDENT_QUIZZES[0];
    this.showIncidentModal(quiz);
  },

  showIncidentModal(quiz) {
    this.currentIncident = quiz;
    this.answeredIncidents.add(quiz.id);
    this.currentMode = quiz.codeChallenge ? 'hotfix' : 'quiz';

    AudioSystem.play('boss_alert');

    const modal = document.getElementById('incident-modal');
    if (!modal) return;

    modal.classList.remove('hidden');
    modal.style.display = 'flex';

    document.getElementById('incident-title').textContent = quiz.title;
    document.getElementById('incident-scenario').textContent = quiz.scenario;

    this.renderModeTabs(quiz);
    this.renderActiveView(quiz);

    const resultBox = document.getElementById('incident-result');
    if (resultBox) resultBox.classList.add('hidden');
  },

  renderModeTabs(quiz) {
    const tabContainer = document.getElementById('incident-tabs-container');
    if (!tabContainer) return;

    if (!quiz.codeChallenge) {
      tabContainer.innerHTML = '';
      return;
    }

    tabContainer.innerHTML = `
      <div class="flex items-center gap-2 border-b border-white/10 pb-2 mb-2">
        <button id="btn-tab-hotfix" class="py-1.5 px-3.5 rounded-lg text-xs font-heading font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${this.currentMode === 'hotfix' ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 'text-slate-400 hover:text-white'}">
          <svg class="w-3.5 h-3.5 stroke-current" fill="none" stroke-width="2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          <span>TERMINAL DE HOTFIX (2X RECOMPENSA)</span>
        </button>
        <button id="btn-tab-quiz" class="py-1.5 px-3.5 rounded-lg text-xs font-heading font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${this.currentMode === 'quiz' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-slate-400 hover:text-white'}">
          <svg class="w-3.5 h-3.5 stroke-current" fill="none" stroke-width="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          <span>PREGUNTA CONCEPTUAL (RCA)</span>
        </button>
      </div>
    `;

    document.getElementById('btn-tab-hotfix')?.addEventListener('click', () => {
      this.currentMode = 'hotfix';
      this.renderModeTabs(quiz);
      this.renderActiveView(quiz);
    });

    document.getElementById('btn-tab-quiz')?.addEventListener('click', () => {
      this.currentMode = 'quiz';
      this.renderModeTabs(quiz);
      this.renderActiveView(quiz);
    });
  },

  renderActiveView(quiz) {
    const hotfixView = document.getElementById('incident-hotfix-view');
    const quizView = document.getElementById('incident-quiz-view');

    if (this.currentMode === 'hotfix' && quiz.codeChallenge) {
      if (hotfixView) hotfixView.classList.remove('hidden');
      if (quizView) quizView.classList.add('hidden');

      document.getElementById('incident-challenge-title').textContent = quiz.codeChallenge.title;
      document.getElementById('incident-challenge-desc').textContent = quiz.codeChallenge.instructions;

      const editorMount = document.getElementById('incident-code-mount');
      editorMount.innerHTML = '';
      this.codeEditor = new EmbeddedCodeEditor({
        container: editorMount,
        initialCode: quiz.codeChallenge.initialCode,
        language: 'javascript'
      });

      const testsBox = document.getElementById('incident-test-status');
      if (testsBox) {
        testsBox.innerHTML = `
          <div class="text-[11px] text-slate-400 font-mono">
            Pruebas requeridas (${quiz.codeChallenge.tests.length}):
            <ul class="list-disc pl-4 mt-1 space-y-0.5 text-slate-500">
              ${quiz.codeChallenge.tests.map(t => `<li>${t.name}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      const runBtn = document.getElementById('btn-run-hotfix');
      if (runBtn) {
        runBtn.onclick = () => this.handleRunHotfix(quiz);
      }
    } else {
      if (hotfixView) hotfixView.classList.add('hidden');
      if (quizView) quizView.classList.remove('hidden');

      document.getElementById('incident-question').textContent = quiz.question;
      const optionsContainer = document.getElementById('incident-options');
      optionsContainer.innerHTML = '';

      quiz.options.forEach((opt) => {
        const btn = document.createElement('button');
        btn.className = 'w-full p-3.5 text-left rounded-xl border border-white/10 bg-[#080d18] hover:border-cyan-500/50 hover:bg-[#0e1626] transition-all text-xs text-slate-200 font-sans leading-relaxed cursor-pointer';
        btn.textContent = opt.text;
        btn.addEventListener('click', () => {
          this.handleAnswer(opt, quiz);
        });
        optionsContainer.appendChild(btn);
      });
    }
  },

  handleRunHotfix(quiz) {
    if (!this.codeEditor) return;
    const userCode = this.codeEditor.getValue();
    const testsBox = document.getElementById('incident-test-status');

    const evalResult = SandboxEvaluator.runTestSuite(userCode, quiz.codeChallenge.tests);

    if (evalResult.allPassed) {
      AudioSystem.play('wave');
      if (typeof AchievementSystem !== 'undefined') {
        AchievementSystem.check('incident_master');
      }

      const doubleMoney = quiz.reward.money * 2;
      GameState.money += doubleMoney;
      GameState.score += doubleMoney * 4;
      GameState.updateUI();

      if (testsBox) {
        testsBox.innerHTML = `
          <div class="p-3 rounded-xl bg-green-950/40 border border-green-500/40 text-green-300 text-xs font-mono space-y-2">
            <div class="font-bold flex items-center justify-between">
              <span>✓ ¡TODAS LAS PRUEBAS PASARON! (HOTFIX VALIDADO EN PRODUCCIÓN)</span>
              <span class="text-yellow-400 font-bold">+$${doubleMoney} (2X BONUS)</span>
            </div>
            <div class="text-[11px] text-slate-300">Has resuelto la vulnerabilidad mediante código de ingeniería real.</div>
            <button id="btn-close-hotfix-success" class="w-full mt-2 py-2 px-4 rounded-xl bg-green-600 hover:bg-green-500 text-black font-bold uppercase text-xs transition-all cursor-pointer font-heading">
              DESPLEGAR A PRODUCCIÓN & CONTINUAR ▶
            </button>
          </div>
        `;
        document.getElementById('btn-close-hotfix-success')?.addEventListener('click', () => {
          this.closeModal();
        });
      }
    } else {
      AudioSystem.play('error');
      if (testsBox) {
        testsBox.innerHTML = `
          <div class="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono space-y-2">
            <div class="font-bold">✕ FALLARON LAS PRUEBAS AUTOMATIZADAS:</div>
            <ul class="list-disc pl-4 space-y-1 text-[11px]">
              ${evalResult.results.map(r => `
                <li class="${r.passed ? 'text-green-400' : 'text-red-400'}">
                  ${r.passed ? '✓' : '✕'} ${r.name} ${r.error ? `➔ <span class="text-yellow-300">${r.error}</span>` : ''}
                </li>
              `).join('')}
            </ul>
          </div>
        `;
      }
    }
  },

  handleAnswer(selectedOption, quiz) {
    const resultBox = document.getElementById('incident-result');
    const optionsContainer = document.getElementById('incident-options');
    optionsContainer.innerHTML = '';

    resultBox.classList.remove('hidden');

    if (selectedOption.correct) {
      AudioSystem.play('wave');
      if (typeof AchievementSystem !== 'undefined') {
        AchievementSystem.check('incident_master');
      }

      resultBox.className = 'p-4 rounded-xl border border-green-500/40 bg-green-950/30 text-green-300 space-y-2';
      resultBox.innerHTML = `
        <div class="text-sm font-bold font-heading flex items-center gap-2 text-green-400">
          <span>✓ INCIDENTE MITIGADO CON ÉXITO</span>
          <span class="text-yellow-400 font-code font-bold">+$${quiz.reward.money}</span>
        </div>
        <p class="text-xs text-slate-200 leading-relaxed">${selectedOption.feedback}</p>
        <div class="text-xs text-cyan-400 font-code font-bold">Recompensa: ${quiz.reward.buff}</div>
        <button id="btn-continue-incident" class="w-full mt-2 py-2.5 px-4 rounded-xl bg-green-600 hover:bg-green-500 text-black font-bold uppercase text-xs transition-all font-heading cursor-pointer shadow-md">
          CONTINUAR AL DESPLIEGUE ▶
        </button>
      `;

      GameState.money += quiz.reward.money;
      GameState.score += quiz.reward.money * 3;
      GameState.updateUI();
    } else {
      AudioSystem.play('error');
      resultBox.className = 'p-4 rounded-xl border border-red-500/40 bg-red-950/30 text-red-300 space-y-2';
      resultBox.innerHTML = `
        <div class="text-sm font-bold font-heading flex items-center gap-2 text-red-400">
          <span>✕ DECISIÓN DE ARQUITECTURA DEFICIENTE</span>
        </div>
        <p class="text-xs text-slate-200 leading-relaxed">${selectedOption.feedback}</p>
        <div class="text-xs text-slate-400">Lección aprendida: Revisa las guías de ingeniería en el Códice.</div>
        <button id="btn-continue-incident" class="w-full mt-2 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold uppercase text-xs transition-all font-heading cursor-pointer shadow-md">
          CONTINUAR AL DESPLIEGUE ▶
        </button>
      `;
    }

    document.getElementById('btn-continue-incident')?.addEventListener('click', () => {
      this.closeModal();
    });
  },

  closeModal() {
    const modal = document.getElementById('incident-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  }
};

// Global exposure
if (typeof window !== 'undefined') {
  window.IncidentSystem = IncidentSystem;
}
if (typeof module !== 'undefined') {
  module.exports = { IncidentSystem };
}
