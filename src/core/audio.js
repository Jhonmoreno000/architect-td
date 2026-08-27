// ============================================
// CORE - WebAudio Procedural Audio & Music Synthesizer
// ============================================

const AudioSystem = {
  ctx: null,
  musicMuted: false,
  sfxMuted: false,
  musicPlaying: false,
  musicTimer: null,
  musicStep: 0,

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  play(type) {
    if (this.sfxMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      switch (type) {
        case 'shoot': this._shoot(); break;
        case 'shoot_heavy': this._shootHeavy(); break;
        case 'laser': this._laser(); break;
        case 'laser_tick': this._laserTick(); break;
        case 'sniper': this._sniper(); break;
        case 'hit': this._hit(); break;
        case 'build': this._build(); break;
        case 'coin': this._coin(); break;
        case 'zap': this._zap(); break;
        case 'explosion': this._explosion(); break;
        case 'error': this._error(); break;
        case 'wave': this._wave(); break;
        case 'boss_alert': this._bossAlert(); break;
        case 'ability': this._ability(); break;
        case 'gameover': this._gameover(); break;
        case 'click': this._click(); break;
      }
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  },

  _click() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.03);
  },

  _shoot() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.setValueAtTime(900, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(250, this.ctx.currentTime + 0.07);
    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.07);
  },

  _shootHeavy() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  },

  _sniper() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.setValueAtTime(1600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  },

  _laser() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(800, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  },

  _laserTick() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.setValueAtTime(320 + Math.random() * 80, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  },

  _hit() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.035, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  },

  _zap() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.setValueAtTime(200, this.ctx.currentTime + 0.04);
    osc.frequency.setValueAtTime(800, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  },

  _coin() {
    const notes = [987.77, 1318.51];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.06);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.06 + 0.1);
      osc.start(this.ctx.currentTime + i * 0.06);
      osc.stop(this.ctx.currentTime + i * 0.06 + 0.1);
    });
  },

  _explosion() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  },

  _build() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.04);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.04 + 0.15);
      osc.start(this.ctx.currentTime + i * 0.04);
      osc.stop(this.ctx.currentTime + i * 0.04 + 0.15);
    });
  },

  _error() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(90, this.ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.18);
  },

  _bossAlert() {
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.frequency.setValueAtTime(440, this.ctx.currentTime + i * 0.2);
      osc.frequency.linearRampToValueAtTime(880, this.ctx.currentTime + i * 0.2 + 0.12);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.2 + 0.18);
      osc.start(this.ctx.currentTime + i * 0.2);
      osc.stop(this.ctx.currentTime + i * 0.2 + 0.18);
    }
  },

  _ability() {
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.05);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.05 + 0.2);
      osc.start(this.ctx.currentTime + i * 0.05);
      osc.stop(this.ctx.currentTime + i * 0.05 + 0.2);
    });
  },

  _wave() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.08);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.08 + 0.15);
      osc.start(this.ctx.currentTime + i * 0.08);
      osc.stop(this.ctx.currentTime + i * 0.08 + 0.15);
    });
  },

  _gameover() {
    const notes = [440, 370, 311, 240, 180];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.2);
      gain.gain.setValueAtTime(0.07, this.ctx.currentTime + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.2 + 0.35);
      osc.start(this.ctx.currentTime + i * 0.2);
      osc.stop(this.ctx.currentTime + i * 0.2 + 0.35);
    });
  },

  // Ambient Lo-Fi Procedural Cyber Synth Background Track
  toggleMusic() {
    this.musicMuted = !this.musicMuted;
    if (this.musicMuted) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return !this.musicMuted;
  },

  startMusic() {
    if (this.musicPlaying || this.musicMuted) return;
    this.init();
    if (!this.ctx) return;
    this.musicPlaying = true;
    this.musicStep = 0;

    const scale = [130.81, 146.83, 164.81, 196.00, 220.00, 261.63]; // C minor pentatonic bass
    const padChord = [261.63, 311.13, 392.00, 466.16]; // Cm7 ambient chord

    const loop = () => {
      if (!this.musicPlaying) return;
      try {
        const t = this.ctx.currentTime;
        // Bass arp note
        const note = scale[this.musicStep % scale.length];
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note, t);
        gain.gain.setValueAtTime(0.02, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.28);

        // Soft pad every 8 steps
        if (this.musicStep % 8 === 0) {
          padChord.forEach(pFreq => {
            const pOsc = this.ctx.createOscillator();
            const pGain = this.ctx.createGain();
            pOsc.type = 'sine';
            pOsc.frequency.setValueAtTime(pFreq, t);
            pGain.gain.setValueAtTime(0.008, t);
            pGain.gain.linearRampToValueAtTime(0.012, t + 0.6);
            pGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
            pOsc.connect(pGain);
            pGain.connect(this.ctx.destination);
            pOsc.start(t);
            pOsc.stop(t + 1.8);
          });
        }

        this.musicStep++;
        this.musicTimer = setTimeout(loop, 300);
      } catch (e) {}
    };

    loop();
  },

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }
};
