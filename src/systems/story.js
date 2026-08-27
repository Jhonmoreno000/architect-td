// ============================================
// SYSTEMS - Story Campaign Controller & Interactive Mission Dispatcher
// ============================================

const StorySystem = {
  activeChapter: null,
  isStoryMode: false,
  selectedDecisionIdx: null,

  init() {},

  startCampaignChapter(chapterId) {
    const chapter = STORY_CHAPTERS.find(c => c.id === chapterId);
    if (!chapter) return;

    this.activeChapter = chapter;
    this.isStoryMode = true;
    this.selectedDecisionIdx = null;

    GameState.selectedLevelId = chapter.levelId;

    EventHandlers.hideScreen('intro-screen');
    EventHandlers.hideScreen('level-select-screen');
    EventHandlers.hideScreen('game-container');
    EventHandlers.hideScreen('gameover-screen');
    EventHandlers.hideScreen('victory-screen');

    this.showBriefingModal(chapter);
  },

  showBriefingModal(chapter) {
    const modal = document.getElementById('story-modal');
    if (!modal) return;

    const chapterNumEl = document.getElementById('story-chapter-num');
    if (chapterNumEl) chapterNumEl.textContent = chapter.chapterNumber;

    const titleEl = document.getElementById('story-title');
    if (titleEl) titleEl.textContent = chapter.title;

    const speakerNameEl = document.getElementById('story-speaker-name');
    if (speakerNameEl) speakerNameEl.textContent = chapter.speaker.name;

    const speakerRoleEl = document.getElementById('story-speaker-role');
    if (speakerRoleEl) speakerRoleEl.textContent = chapter.speaker.role;

    const speakerTagEl = document.getElementById('story-speaker-tag');
    if (speakerTagEl) speakerTagEl.textContent = `// ${chapter.speaker.tag}`;

    const briefingEl = document.getElementById('story-briefing-text');
    if (briefingEl) briefingEl.innerHTML = chapter.briefing.trim().replace(/\n\s+/g, '<br><br>');

    // Avatar initials badge with border
    const avatarBadge = document.getElementById('story-speaker-avatar');
    if (avatarBadge) {
      avatarBadge.style.borderColor = chapter.speaker.avatarColor;
      avatarBadge.style.color = chapter.speaker.avatarColor;
      avatarBadge.style.backgroundColor = `${chapter.speaker.avatarColor}20`;
      const initials = chapter.speaker.name.split(' ').map(n => n[0]).join('').substring(0, 2);
      avatarBadge.textContent = initials;
    }

    // Render strategic decision options
    const decisionContainer = document.getElementById('story-decision-options');
    const decisionPrompt = document.getElementById('story-decision-prompt');
    if (decisionContainer && decisionPrompt) {
      decisionPrompt.textContent = chapter.decision.prompt;
      decisionContainer.innerHTML = chapter.decision.options.map((opt, idx) => `
        <button class="w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${this.selectedDecisionIdx === idx ? 'border-green-400 bg-green-950/40 shadow-md scale-[1.01]' : 'border-white/10 bg-black/50 hover:border-cyan-500/40 hover:bg-[#0c1424]'}" data-idx="${idx}">
          <div class="text-sm font-bold text-white font-heading mb-1 flex items-center gap-2">
            <span class="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs font-bold ${this.selectedDecisionIdx === idx ? 'text-green-400 bg-green-500/20' : 'text-slate-400'}">${idx + 1}</span>
            <span>${opt.text}</span>
          </div>
          <div class="text-xs text-slate-300 pl-7 leading-relaxed">${opt.effectDesc}</div>
        </button>
      `).join('');

      decisionContainer.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          this.selectedDecisionIdx = parseInt(btn.dataset.idx);
          AudioSystem.play('click');
          this.showBriefingModal(chapter);
        });
      });
    }

    const launchBtn = document.getElementById('btn-story-launch');
    if (launchBtn) {
      launchBtn.disabled = this.selectedDecisionIdx === null;
      launchBtn.className = `w-full py-4 px-8 rounded-xl font-bold uppercase tracking-widest text-sm transition-all font-heading flex items-center justify-center gap-2 ${this.selectedDecisionIdx !== null ? 'bg-green-600 hover:bg-green-500 text-black shadow-lg hover:scale-[1.01] cursor-pointer' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`;
    }

    EventHandlers.showScreen('story-modal', 'flex');
  },

  confirmDecisionAndStart() {
    if (this.selectedDecisionIdx === null || !this.activeChapter) return;

    EventHandlers.hideScreen('story-modal');
    EventHandlers.hideScreen('intro-screen');
    EventHandlers.hideScreen('level-select-screen');
    EventHandlers.showScreen('game-container', 'flex');

    GameState.init();

    // Apply chosen strategic perk
    const chosenOption = this.activeChapter.decision.options[this.selectedDecisionIdx];
    if (chosenOption && typeof chosenOption.apply === 'function') {
      chosenOption.apply(GameState);
      if (GameState.engine) {
        GameState.engine.addFloatingText(GameState.engine.core.x, GameState.engine.core.y - 60, 'ESTRATEGIA APLICADA!', '#00ff41', 14, true);
        GameState.engine.addRingShockwave(GameState.engine.core.x, GameState.engine.core.y, '#00ff41', 60);
      }
    }
    GameState.updateUI();
  }
};
