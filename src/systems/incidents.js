// ============================================
// SYSTEMS - Incident Controller & Educational RCA Quiz Engine
// ============================================

const IncidentSystem = {
  currentIncident: null,
  answeredIncidents: new Set(),

  triggerRandomIncident() {
    const available = INCIDENT_QUIZZES.filter(q => !this.answeredIncidents.has(q.id));
    if (available.length === 0) {
      this.answeredIncidents.clear(); // Recycle
    }
    const quiz = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : INCIDENT_QUIZZES[0];
    this.showIncidentModal(quiz);
  },

  showIncidentModal(quiz) {
    this.currentIncident = quiz;
    this.answeredIncidents.add(quiz.id);

    AudioSystem.play('boss_alert');

    const modal = document.getElementById('incident-modal');
    if (!modal) return;

    modal.classList.remove('hidden');
    modal.style.display = 'flex';

    document.getElementById('incident-title').textContent = quiz.title;
    document.getElementById('incident-scenario').textContent = quiz.scenario;
    document.getElementById('incident-question').textContent = quiz.question;

    const optionsContainer = document.getElementById('incident-options');
    optionsContainer.innerHTML = '';

    quiz.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'w-full p-3 text-left rounded-xl border border-white/10 bg-[#080d18] hover:border-cyan-500/50 hover:bg-[#0e1626] transition-all text-xs text-slate-200 font-sans leading-relaxed';
      btn.textContent = opt.text;

      btn.addEventListener('click', () => {
        this.handleAnswer(opt, quiz);
      });

      optionsContainer.appendChild(btn);
    });

    const resultBox = document.getElementById('incident-result');
    if (resultBox) resultBox.classList.add('hidden');
  },

  handleAnswer(selectedOption, quiz) {
    const resultBox = document.getElementById('incident-result');
    const optionsContainer = document.getElementById('incident-options');
    optionsContainer.innerHTML = ''; // Hide buttons

    resultBox.classList.remove('hidden');

    if (selectedOption.correct) {
      AudioSystem.play('wave');
      resultBox.className = 'p-4 rounded-xl border border-green-500/40 bg-green-950/30 text-green-300 space-y-2';
      resultBox.innerHTML = `
        <div class="text-sm font-bold font-heading flex items-center gap-2 text-green-400">
          <span>✓ INCIDENTE MITIGADO CON ÉXITO</span>
          <span class="text-yellow-400 font-code font-bold">+$$${quiz.reward.money}</span>
        </div>
        <p class="text-xs text-slate-200 leading-relaxed">${selectedOption.feedback}</p>
        <div class="text-[11px] text-cyan-400 font-code font-bold">Recompensa: ${quiz.reward.buff}</div>
        <button id="btn-continue-incident" class="w-full mt-2 py-2 px-4 rounded-lg bg-green-600 hover:bg-green-500 text-black font-bold uppercase text-xs transition-all font-heading">
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
        <div class="text-[11px] text-slate-400">Lección aprendida: Revisa las guías de ingeniería en el Códice.</div>
        <button id="btn-continue-incident" class="w-full mt-2 py-2 px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold uppercase text-xs transition-all font-heading">
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
