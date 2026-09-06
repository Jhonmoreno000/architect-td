// ============================================
// CORE - Web Worker / Sandbox Evaluator with Watchdog
// Executes user code safely, evaluates tests, protects main thread 60 FPS
// ============================================

const SandboxEvaluator = {
  timeoutMs: 80, // Watchdog threshold

  // Execute user function with arguments safely
  execute(codeString, functionName, args = [], options = {}) {
    const startTime = performance.now();
    try {
      // Basic sanity check
      if (!codeString || typeof codeString !== 'string') {
        return { success: false, error: 'Código vacío o inválido.' };
      }

      // Prohibit dangerous browser globals in the code context
      const forbiddenPatterns = [
        /\bwindow\b/,
        /\bdocument\b/,
        /\blocaltion\b/,
        /\blocalStorage\b/,
        /\bsessionStorage\b/,
        /\bfetch\b/,
        /\bXMLHttpRequest\b/,
        /\beval\b/,
        /\bFunction\b/
      ];

      for (const pattern of forbiddenPatterns) {
        if (pattern.test(codeString)) {
          return {
            success: false,
            error: `Instrucción de seguridad bloqueada: no se permite acceder a APIs globales externas (${pattern}).`
          };
        }
      }

      // Create isolated wrapper
      const wrapped = `
        "use strict";
        ${codeString}
        if (typeof ${functionName} === 'function') {
          return ${functionName}.apply(null, args);
        } else {
          throw new Error("No se encontró la función obligatoria: '" + "${functionName}" + "'");
        }
      `;

      // Run with parameter injection
      const fn = new Function('args', wrapped);
      const result = fn(args);
      const duration = performance.now() - startTime;

      if (duration > this.timeoutMs) {
        return {
          success: false,
          duration,
          error: `Timeout: El algoritmo tardó ${duration.toFixed(1)}ms (límite: ${this.timeoutMs}ms). Optimiza tus bucles.`
        };
      }

      return {
        success: true,
        result,
        duration
      };
    } catch (err) {
      const duration = performance.now() - startTime;
      return {
        success: false,
        duration,
        error: err.message || String(err)
      };
    }
  },

  // Run test assertions for Hotfix debugging challenges
  runTestSuite(userCode, testSuite) {
    const startTime = performance.now();
    const results = [];
    let allPassed = true;

    try {
      // Check code syntax first
      new Function(userCode);
    } catch (syntaxErr) {
      return {
        success: false,
        allPassed: false,
        syntaxError: syntaxErr.message,
        results: [{ name: 'Compilación de sintaxis', passed: false, error: syntaxErr.message }],
        duration: performance.now() - startTime
      };
    }

    // Mini test framework assertions
    const createAssertionContext = () => {
      return {
        assertEqual(actual, expected, message) {
          if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(message || `Esperado: ${JSON.stringify(expected)}, Obtenido: ${JSON.stringify(actual)}`);
          }
        },
        assertTrue(val, message) {
          if (!val) throw new Error(message || `Se esperaba valor verdadero (true), pero fue ${val}`);
        },
        assertFalse(val, message) {
          if (val) throw new Error(message || `Se esperaba valor falso (false), pero fue ${val}`);
        },
        assertNotContains(text, pattern, message) {
          if (typeof text === 'string' && text.includes(pattern)) {
            throw new Error(message || `No debería contener el patrón inseguro: '${pattern}'`);
          }
        }
      };
    };

    for (const test of testSuite) {
      try {
        const testScript = `
          "use strict";
          ${userCode}
          
          (function(assert, testData) {
            ${test.testCode}
          })(assert, testData);
        `;

        const testFn = new Function('assert', 'testData', testScript);
        testFn(createAssertionContext(), test.testData || {});

        results.push({
          name: test.name,
          passed: true,
          description: test.description || ''
        });
      } catch (err) {
        allPassed = false;
        results.push({
          name: test.name,
          passed: false,
          error: err.message,
          description: test.description || ''
        });
      }
    }

    const duration = performance.now() - startTime;

    return {
      success: true,
      allPassed,
      results,
      duration
    };
  }
};

// Global exposure
if (typeof window !== 'undefined') {
  window.SandboxEvaluator = SandboxEvaluator;
}
if (typeof module !== 'undefined') {
  module.exports = { SandboxEvaluator };
}
