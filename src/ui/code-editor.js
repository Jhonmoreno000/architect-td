// ============================================
// UI - Embedded Code Editor (Cyberpunk Retro IDE)
// Lightweight, zero-dependency, real-time syntax highlighter & code input
// ============================================

class EmbeddedCodeEditor {
  constructor(options = {}) {
    this.container = typeof options.container === 'string' 
      ? document.getElementById(options.container) 
      : options.container;
    this.initialCode = options.initialCode || '';
    this.language = options.language || 'javascript';
    this.readOnly = options.readOnly || false;
    this.onChange = options.onChange || null;

    this.textarea = null;
    this.highlightLayer = null;
    this.lineNumbers = null;

    this.init();
  }

  init() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="code-editor-root font-code text-xs bg-[#050912] border border-cyan-500/30 rounded-xl overflow-hidden flex flex-col shadow-inner select-text">
        <div class="code-editor-toolbar bg-[#091020] border-b border-white/10 px-3 py-1.5 flex items-center justify-between text-[11px] text-slate-400">
          <div class="flex items-center gap-2">
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-red-500/70"></span>
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-yellow-500/70"></span>
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-green-500/70"></span>
            <span class="ml-2 font-bold text-cyan-400 uppercase tracking-wider">// TERMINAL IDE</span>
            <span class="text-slate-500 font-mono">(${this.language})</span>
          </div>
          <div class="flex items-center gap-3">
            <span id="editor-char-count" class="text-[10px] text-slate-500 font-mono">0 chars</span>
            <button type="button" class="btn-copy-code text-slate-400 hover:text-white px-2 py-0.5 rounded border border-white/10 hover:bg-white/5 transition-all text-[10px] font-heading cursor-pointer">COPIAR</button>
          </div>
        </div>
        <div class="code-editor-body relative flex flex-1 min-h-[220px] max-h-[360px] overflow-auto bg-[#03060c]">
          <div class="code-editor-lines py-3 px-2.5 bg-[#060a14] border-r border-white/10 text-slate-600 font-mono text-right select-none text-[11px] min-w-[34px] leading-relaxed">
            1
          </div>
          <div class="code-editor-stage relative flex-1 min-w-0">
            <pre class="code-editor-highlight m-0 p-3 font-mono text-[11px] leading-relaxed pointer-events-none whitespace-pre-wrap break-words text-slate-300 absolute inset-0 overflow-hidden font-code"></pre>
            <textarea spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" class="code-editor-textarea m-0 p-3 font-mono text-[11px] leading-relaxed text-transparent caret-green-400 bg-transparent resize-none border-0 outline-none w-full h-full min-h-[220px] whitespace-pre-wrap break-words absolute inset-0 font-code"></textarea>
          </div>
        </div>
      </div>
    `;

    this.textarea = this.container.querySelector('.code-editor-textarea');
    this.highlightLayer = this.container.querySelector('.code-editor-highlight');
    this.lineNumbers = this.container.querySelector('.code-editor-lines');
    this.charCount = this.container.querySelector('#editor-char-count');

    if (this.readOnly) {
      this.textarea.setAttribute('readonly', 'true');
    }

    // Event listeners
    this.textarea.addEventListener('input', () => this.handleInput());
    this.textarea.addEventListener('scroll', () => this.syncScroll());
    this.textarea.addEventListener('keydown', (e) => this.handleKeyDown(e));

    const copyBtn = this.container.querySelector('.btn-copy-code');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(this.getValue()).then(() => {
          copyBtn.textContent = '¡COPIADO!';
          setTimeout(() => { copyBtn.textContent = 'COPIAR'; }, 1500);
        });
      });
    }

    this.setValue(this.initialCode);
  }

  handleKeyDown(e) {
    // Support Tab for 2 spaces indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = this.textarea.selectionStart;
      const end = this.textarea.selectionEnd;
      const value = this.textarea.value;

      this.textarea.value = value.substring(0, start) + '  ' + value.substring(end);
      this.textarea.selectionStart = this.textarea.selectionEnd = start + 2;
      this.handleInput();
      return;
    }

    // Auto-close brackets and quotes
    const pairs = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`' };
    if (pairs[e.key]) {
      const start = this.textarea.selectionStart;
      const end = this.textarea.selectionEnd;
      if (start === end) {
        e.preventDefault();
        const close = pairs[e.key];
        const val = this.textarea.value;
        this.textarea.value = val.substring(0, start) + e.key + close + val.substring(end);
        this.textarea.selectionStart = this.textarea.selectionEnd = start + 1;
        this.handleInput();
        return;
      }
    }
  }

  handleInput() {
    const code = this.textarea.value;
    this.renderHighlight(code);
    this.updateLineNumbers(code);
    if (this.charCount) {
      this.charCount.textContent = `${code.length} chars`;
    }
    if (typeof this.onChange === 'function') {
      this.onChange(code);
    }
  }

  syncScroll() {
    if (this.highlightLayer && this.textarea) {
      this.highlightLayer.scrollTop = this.textarea.scrollTop;
      this.highlightLayer.scrollLeft = this.textarea.scrollLeft;
    }
  }

  updateLineNumbers(code) {
    if (!this.lineNumbers) return;
    const lines = code.split('\n').length;
    let nums = '';
    for (let i = 1; i <= lines; i++) {
      nums += i + '\n';
    }
    this.lineNumbers.textContent = nums.trimEnd();
  }

  renderHighlight(code) {
    if (!this.highlightLayer) return;
    this.highlightLayer.innerHTML = this.highlightSyntax(code);
  }

  highlightSyntax(code) {
    // Escape HTML first
    let escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Tokenizer regexes
    const comments = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g;
    const strings = /('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)/g;
    const keywords = /\b(const|let|var|function|return|if|else|for|while|switch|case|break|continue|new|class|this|import|export|from|try|catch|finally|throw|async|await|typeof|instanceof|yield)\b/g;
    const booleans = /\b(true|false|null|undefined|NaN)\b/g;
    const numbers = /\b(0x[0-9a-fA-F]+|\d+(?:\.\d+)?)\b/g;
    const builtins = /\b(Math|Array|Object|String|Number|Boolean|Map|Set|JSON|Promise|RegExp|Date|console)\b/g;
    const methods = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/g;

    // Tokens map to preserve matched literals
    const tokens = [];
    const saveToken = (cls, content) => {
      const id = `___TOKEN_${tokens.length}___`;
      tokens.push(`<span class="${cls}">${content}</span>`);
      return id;
    };

    // 1. Comments
    escaped = escaped.replace(comments, (m) => saveToken('text-slate-500 italic', m));
    // 2. Strings
    escaped = escaped.replace(strings, (m) => saveToken('text-amber-300', m));
    // 3. Keywords
    escaped = escaped.replace(keywords, (m) => saveToken('text-purple-400 font-bold', m));
    // 4. Builtins
    escaped = escaped.replace(builtins, (m) => saveToken('text-cyan-300 font-bold', m));
    // 5. Booleans/Null
    escaped = escaped.replace(booleans, (m) => saveToken('text-orange-400 font-bold', m));
    // 6. Numbers
    escaped = escaped.replace(numbers, (m) => saveToken('text-emerald-400 font-bold', m));
    // 7. Function Calls
    escaped = escaped.replace(methods, (m) => saveToken('text-blue-400 font-medium', m));

    // Restore tokens
    tokens.forEach((span, i) => {
      escaped = escaped.replace(new RegExp(`___TOKEN_${i}___`, 'g'), span);
    });

    return escaped + '\n '; // extra newline to keep scroll heights aligned
  }

  setValue(code) {
    if (!this.textarea) return;
    this.textarea.value = code || '';
    this.handleInput();
  }

  getValue() {
    return this.textarea ? this.textarea.value : '';
  }

  focus() {
    if (this.textarea) this.textarea.focus();
  }
}

// Global exposure
if (typeof window !== 'undefined') {
  window.EmbeddedCodeEditor = EmbeddedCodeEditor;
}
if (typeof module !== 'undefined') {
  module.exports = { EmbeddedCodeEditor };
}
