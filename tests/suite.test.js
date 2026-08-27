// ============================================
// AUTOMATED TEST SUITE - Architect Tower Defense
// ============================================

const fs = require('fs');
const path = require('path');
const vm = require('vm');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    testsPassed++;
  } else {
    console.error(`  ✕ FAIL: ${testName}`);
    testsFailed++;
  }
}

console.log('==================================================');
console.log('  RUNNING ARCHITECT TOWER DEFENSE TEST SUITE');
console.log('==================================================\n');

// 1. Syntax Validation of All Core Files
console.log('TEST GROUP 1: JavaScript Module Syntax Verification');
const files = [
  'src/config/levels.js',
  'src/config/story.js',
  'src/config/incidents.js',
  'src/config/guide.js',
  'src/config/codex.js',
  'src/config/towers.js',
  'src/entities/base.js',
  'src/entities/particle.js',
  'src/entities/loot-drop.js',
  'src/entities/floating-text.js',
  'src/entities/projectile.js',
  'src/entities/enemy-projectile.js',
  'src/entities/request.js',
  'src/towers/base.js',
  'src/towers/loadbalancer.js',
  'src/towers/circuitbreaker.js',
  'src/towers/apigateway.js',
  'src/towers/cache.js',
  'src/towers/waf.js',
  'src/towers/messagequeue.js',
  'src/towers/cdn.js',
  'src/towers/database.js',
  'src/towers/servicemesh.js',
  'src/towers/honeypot.js',
  'src/towers/factory.js',
  'src/core/audio.js',
  'src/core/engine.js',
  'src/systems/telemetry.js',
  'src/systems/minimap.js',
  'src/systems/achievements.js',
  'src/systems/story.js',
  'src/systems/incidents.js',
  'src/systems/combat.js',
  'src/systems/grid.js',
  'src/systems/wave.js',
  'src/ui/shop.js',
  'src/ui/hud.js',
  'src/ui/events.js',
  'src/main.js'
];

let allModulesOk = true;
for (const f of files) {
  try {
    const code = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
    new Function(code);
  } catch (err) {
    allModulesOk = false;
    console.error(`Syntax error in ${f}:`, err.message);
  }
}
assert(allModulesOk, 'All 39 frontend and system scripts compile without syntax errors');

// 2. Mock browser environment to evaluate configs in global scope
global.window = global;
global.document = {
  getElementById: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {}
};
global.localStorage = {
  getItem: () => null,
  setItem: () => {}
};

// Evaluate configs in this context
vm.runInThisContext(fs.readFileSync(path.join(__dirname, '../src/config/towers.js'), 'utf8'));
vm.runInThisContext(fs.readFileSync(path.join(__dirname, '../src/config/levels.js'), 'utf8'));
vm.runInThisContext(fs.readFileSync(path.join(__dirname, '../src/config/story.js'), 'utf8'));
vm.runInThisContext(fs.readFileSync(path.join(__dirname, '../src/config/incidents.js'), 'utf8'));
vm.runInThisContext(fs.readFileSync(path.join(__dirname, '../src/config/codex.js'), 'utf8'));

console.log('\nTEST GROUP 2: Tower Catalog & Balance Verification');
const towerKeys = Object.keys(TOWER_CONFIG);
assert(towerKeys.length === 10, 'All 10 architecture tower patterns are defined');
towerKeys.forEach(k => {
  const t = TOWER_CONFIG[k];
  assert(t.cost > 0 && t.maxHp > 0 && t.range > 0, `Tower [${k}] has valid cost ($${t.cost}), hp (${t.maxHp}), and range (${t.range}px)`);
  assert(Array.isArray(t.upgrades) && t.upgrades.length === 2, `Tower [${k}] has 2 upgrade tiers`);
});

console.log('\nTEST GROUP 3: Cyber Threat Archetype Verification');
const enemyKeys = Object.keys(ENEMY_CONFIG);
assert(enemyKeys.length >= 12, `At least 12 cyber threat archetypes configured (Found: ${enemyKeys.length})`);
['mitm', 'worm', 'supply_chain', 'spectre', 'prompt_injection', 'boss_apex'].forEach(e => {
  assert(ENEMY_CONFIG[e] !== undefined, `New threat [${e}] is properly registered in ENEMY_CONFIG`);
});

console.log('\nTEST GROUP 4: Story Campaign Configuration Verification');
assert(Array.isArray(STORY_CHAPTERS) && STORY_CHAPTERS.length === 7, `Story campaign contains exactly 7 narrative chapters (Found: ${STORY_CHAPTERS.length})`);
STORY_CHAPTERS.forEach(ch => {
  assert(ch.speaker && ch.speaker.name && ch.speaker.role, `Chapter ${ch.id} has speaker: ${ch.speaker?.name}`);
  assert(ch.decision && ch.decision.options && ch.decision.options.length === 2, `Chapter ${ch.id} has 2 strategic architectural options`);
});

console.log('\nTEST GROUP 5: Incident Response RCA Quizzes');
assert(INCIDENT_QUIZZES.length >= 6, `Incident quiz engine has at least 6 RCA scenarios (Found: ${INCIDENT_QUIZZES.length})`);
INCIDENT_QUIZZES.forEach(q => {
  const hasCorrect = q.options.some(o => o.correct === true);
  assert(hasCorrect, `Quiz [${q.id}] has a validated correct answer`);
});

console.log('\n==================================================');
console.log(`  TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
console.log('==================================================');

if (testsFailed > 0) {
  process.exit(1);
}
