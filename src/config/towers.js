// ============================================
// CONFIG - 10 Architecture Modules, Strict Economy & Balanced Enemy Stats
// ============================================

const TOWER_CONFIG = {
  loadbalancer: {
    type: 'loadbalancer',
    name: 'Load Balancer',
    cost: 140,
    range: 150,
    fireRate: 75,
    damage: 9,
    maxHp: 140,
    color: '#00f0ff',
    icon: 'LB',
    category: 'Control / Slow',
    description: 'Ralentiza en cono y dispersa paquetes. Control de masa.',
    shape: 'hexagon',
    synergiesWith: ['messagequeue', 'cache'],
    synergyDesc: 'Alimentación acelerada de colas Kafka y duplicación de ralentización.',
    upgrades: [
      { level: 2, cost: 120, damageBonus: 7, rangeBonus: 25, fireRateMult: 0.85, desc: 'Algoritmo Least-Connections (+Rango, +Ralentización 55%)' },
      { level: 3, cost: 210, damageBonus: 14, rangeBonus: 35, fireRateMult: 0.75, desc: 'Anycast DNS Global (Pulso masivo que frena 70% del tráfico)' }
    ]
  },
  circuitbreaker: {
    type: 'circuitbreaker',
    name: 'Circuit Breaker',
    cost: 200,
    range: 130,
    fireRate: 95,
    damage: 36,
    maxHp: 180,
    color: '#ff3366',
    icon: 'CB',
    category: 'Stun / Burst',
    description: 'Descargas eléctricas de alto voltaje con stun. Se sobrecalienta.',
    shape: 'lightning',
    synergiesWith: ['waf', 'apigateway'],
    synergyDesc: 'Enemigos aturdidos reciben +50% de daño láser adicional.',
    upgrades: [
      { level: 2, cost: 160, damageBonus: 26, rangeBonus: 20, fireRateMult: 0.85, desc: 'Disipador Térmico Mejorado (-Tiempo sobrecalentado, +Stun)' },
      { level: 3, cost: 280, damageBonus: 55, rangeBonus: 25, fireRateMult: 0.75, desc: 'Resilience Mesh (El stun salta a 2 objetivos adicionales)' }
    ]
  },
  apigateway: {
    type: 'apigateway',
    name: 'API Gateway',
    cost: 170,
    range: 160,
    fireRate: 35,
    damage: 18,
    maxHp: 150,
    color: '#a855f7',
    icon: 'AG',
    category: 'Rapid / Direct',
    description: 'Cadencia rápida. Daño crítico aumentado a POST y WS.',
    shape: 'diamond',
    synergiesWith: ['cache', 'circuitbreaker', 'servicemesh'],
    synergyDesc: 'Pulsos de caché activan disparos críticos automáticos.',
    upgrades: [
      { level: 2, cost: 140, damageBonus: 12, rangeBonus: 25, fireRateMult: 0.8, desc: 'Token Bucket Rate Limiter (+Velocidad de ráfagas, +Daño)' },
      { level: 3, cost: 240, damageBonus: 26, rangeBonus: 30, fireRateMult: 0.7, desc: 'GraphQL Schema Optimizer (Dispara a 2 objetivos en simultáneo)' }
    ]
  },
  cache: {
    type: 'cache',
    name: 'In-Memory Cache',
    cost: 120,
    range: 120,
    fireRate: 40,
    damage: 12,
    maxHp: 120,
    color: '#eab308',
    icon: 'CA',
    category: 'Aura / Support',
    description: 'Aura pasiva de congelamiento Redis + pulsos instantáneos de respuesta.',
    shape: 'square',
    synergiesWith: ['apigateway', 'loadbalancer'],
    synergyDesc: 'Aumenta el radio de ralentización de balanceadores adyacentes.',
    upgrades: [
      { level: 2, cost: 100, damageBonus: 9, rangeBonus: 25, fireRateMult: 0.8, desc: 'LRU Eviction Index (+Radio de aura, +Ralentización pasiva)' },
      { level: 3, cost: 190, damageBonus: 18, rangeBonus: 30, fireRateMult: 0.7, desc: 'Distributed Memory Grid (Explosión fría que congela por 2s)' }
    ]
  },
  waf: {
    type: 'waf',
    name: 'App Firewall (WAF)',
    cost: 240,
    range: 150,
    fireRate: 12,
    damage: 8,
    maxHp: 200,
    color: '#f97316',
    icon: 'WAF',
    category: 'Laser / Anti-Malware',
    description: 'Haz láser sostenido L7. Destruye escudos y derrite ataques SQLi y Botnets.',
    shape: 'shield',
    synergiesWith: ['circuitbreaker', 'cdn'],
    synergyDesc: 'El láser gana +40% de alcance cuando está cerca de un nodo CDN.',
    upgrades: [
      { level: 2, cost: 180, damageBonus: 6, rangeBonus: 20, fireRateMult: 0.85, desc: 'Deep Packet Inspection (Derrite escudos 2x más rápido)' },
      { level: 3, cost: 310, damageBonus: 12, rangeBonus: 30, fireRateMult: 0.75, desc: 'AI Threat Heuristics (El haz inflige daño en cadena y desintegra)' }
    ]
  },
  messagequeue: {
    type: 'messagequeue',
    name: 'Kafka Queue (MQ)',
    cost: 220,
    range: 145,
    fireRate: 110,
    damage: 65,
    maxHp: 160,
    color: '#10b981',
    icon: 'MQ',
    category: 'AOE / Heavy',
    description: 'Acumula eventos en buffer y descarga una detonación masiva en área.',
    shape: 'hexagon_cluster',
    synergiesWith: ['loadbalancer', 'database'],
    synergyDesc: 'Aumenta el radio de explosión en un 35%.',
    upgrades: [
      { level: 2, cost: 170, damageBonus: 45, rangeBonus: 20, fireRateMult: 0.85, desc: 'Particionamiento Paralelo (+Radio de explosión, +Daño en área)' },
      { level: 3, cost: 290, damageBonus: 85, rangeBonus: 25, fireRateMult: 0.75, desc: 'Zero-Copy Consumer (Doble detonación y fragmentación)' }
    ]
  },
  cdn: {
    type: 'cdn',
    name: 'Edge CDN Node',
    cost: 290,
    range: 260,
    fireRate: 75,
    damage: 60,
    maxHp: 130,
    color: '#38bdf8',
    icon: 'CDN',
    category: 'Sniper / Global',
    description: 'Francotirador de larguísimo alcance. Pulso de ultra-baja latencia.',
    shape: 'triangle',
    synergiesWith: ['waf', 'apigateway'],
    synergyDesc: 'Disparos perforantes que dañan a enemigos en línea recta.',
    upgrades: [
      { level: 2, cost: 220, damageBonus: 50, rangeBonus: 45, fireRateMult: 0.85, desc: 'Anycast Routing Optimizer (+Rango extremo, +Perforación)' },
      { level: 3, cost: 360, damageBonus: 100, rangeBonus: 55, fireRateMult: 0.75, desc: 'Edge Compute Worker (Los disparos causan sobrecarga crítica)' }
    ]
  },
  database: {
    type: 'database',
    name: 'Database Shard',
    cost: 250,
    range: 125,
    fireRate: 130,
    damage: 42,
    maxHp: 220,
    color: '#ec4899',
    icon: 'DB',
    category: 'Economy / Seismic',
    description: 'Genera $20 cada 5 segundos y emite ondas sísmicas de base de datos.',
    shape: 'cylinder',
    synergiesWith: ['messagequeue', 'cache'],
    synergyDesc: 'Genera +$10 extra por cada ciclo de presupuesto.',
    upgrades: [
      { level: 2, cost: 190, damageBonus: 28, rangeBonus: 20, fireRateMult: 0.85, desc: 'Caché de Segundo Nivel (Genera $35 por ciclo, +Onda expansiva)' },
      { level: 3, cost: 320, damageBonus: 55, rangeBonus: 30, fireRateMult: 0.75, desc: 'Multi-Master Sharding (Genera $60 por ciclo y aturde)' }
    ]
  },
  servicemesh: {
    type: 'servicemesh',
    name: 'Service Mesh (Envoy)',
    cost: 190,
    range: 140,
    fireRate: 50,
    damage: 16,
    maxHp: 150,
    color: '#6366f1',
    icon: 'SM',
    category: 'Buffer / mTLS Mesh',
    description: 'Aura de cifrado mTLS que potencia (+25% daño, +15% cadencia) a torres aliadas.',
    shape: 'mesh_cube',
    synergiesWith: ['apigateway', 'waf', 'cache'],
    synergyDesc: 'Duplica el alcance de aura de soporte para toda la malla.',
    upgrades: [
      { level: 2, cost: 150, damageBonus: 12, rangeBonus: 25, fireRateMult: 0.85, desc: 'Sidecar Proxy Injection (El buff sube a +40% de daño a aliados)' },
      { level: 3, cost: 260, damageBonus: 25, rangeBonus: 35, fireRateMult: 0.75, desc: 'Zero-Trust Policy Engine (Dispara rayos mTLS que desintegran)' }
    ]
  },
  honeypot: {
    type: 'honeypot',
    name: 'Honeypot Decoy',
    cost: 130,
    range: 160,
    fireRate: 0,
    damage: 190,
    maxHp: 260,
    color: '#14b8a6',
    icon: 'HP',
    category: 'Decoy / Magnet',
    description: 'Servidor señuelo que atrae a los atacantes lejos del Core y detona al caer.',
    shape: 'decoy_trap',
    synergiesWith: ['circuitbreaker', 'messagequeue'],
    synergyDesc: 'Aumenta el radio de atracción magnética un 40%.',
    upgrades: [
      { level: 2, cost: 110, damageBonus: 110, rangeBonus: 30, fireRateMult: 1.0, desc: 'Credenciales Falsas de Alta Fidelidad (+Vida señuelo, +Atracción)' },
      { level: 3, cost: 210, damageBonus: 220, rangeBonus: 40, fireRateMult: 1.0, desc: 'Trampa Sandbox Explosiva (Detonación EMP masiva al morir)' }
    ]
  }
};

const ENEMY_CONFIG = {
  normal: {
    hp: 65,
    speed: 0.52,
    reward: 14,
    color: '#00ff41',
    label: 'GET',
    name: 'GET Request',
    radius: 9,
    attackRange: 80,
    attackPower: 6,
    attackCooldown: 60,
    description: 'Tráfico estándar con dardos de prueba L7'
  },
  heavy: {
    hp: 240,
    speed: 0.30,
    reward: 35,
    color: '#ff0055',
    label: 'POST',
    name: 'POST Payload',
    radius: 13,
    attackRange: 100,
    attackPower: 18,
    attackCooldown: 80,
    description: 'Lanza bombas pesadas de corrupción de datos'
  },
  fast: {
    hp: 45,
    speed: 0.88,
    reward: 20,
    color: '#00f0ff',
    label: 'WS',
    name: 'WebSocket Stream',
    radius: 8,
    attackRange: 75,
    attackPower: 5,
    attackCooldown: 25,
    description: 'Ráfagas continuas de alta frecuencia'
  },
  botnet: {
    hp: 95,
    speed: 0.58,
    reward: 18,
    color: '#a855f7',
    label: 'BOT',
    name: 'Botnet Crawler',
    radius: 9,
    attackRange: 70,
    attackPower: 8,
    attackCooldown: 50,
    stunsTowers: true,
    description: 'Inyecta troyanos que entorpecen la cadencia de torres'
  },
  malicious: {
    hp: 175,
    speed: 0.42,
    reward: 42,
    color: '#f97316',
    label: 'SQLi',
    name: 'SQL Injection',
    radius: 11,
    attackRange: 90,
    attackPower: 14,
    attackCooldown: 65,
    splitsOnDeath: true,
    description: 'Dispara consultas corruptas y se divide al morir'
  },
  zeroday: {
    hp: 240,
    speed: 0.62,
    reward: 52,
    color: '#ff0033',
    label: '0-DAY',
    name: 'Zero-Day Exploit',
    radius: 12,
    attackRange: 85,
    attackPower: 16,
    attackCooldown: 55,
    slowImmune: true,
    cloaks: true,
    description: 'Se camufla e invisibiliza periódicamente'
  },
  ransomware: {
    hp: 310,
    speed: 0.38,
    reward: 60,
    color: '#ec4899',
    label: 'CRYP',
    name: 'Ransomware Crypter',
    radius: 13,
    attackRange: 95,
    attackPower: 15,
    attackCooldown: 70,
    shieldNearby: true,
    locksTowers: true,
    description: 'Escuda aliados y bloquea servidores en jaulas criptográficas'
  },
  boss_syn: {
    hp: 2400,
    speed: 0.25,
    reward: 320,
    color: '#ff2a2a',
    label: 'BOSS',
    name: 'DDoS SYN Flood Titan',
    radius: 22,
    isBoss: true,
    bossTitle: 'INCIDENTE CRÍTICO: ATAQUE VOLUMÉTRICO DDoS',
    attackRange: 140,
    attackPower: 25,
    attackCooldown: 50,
    description: 'Jefe: Lanza ráfagas en abanico de paquetes destructivos'
  },
  boss_memory: {
    hp: 3800,
    speed: 0.22,
    reward: 500,
    color: '#bd93f9',
    label: 'BOSS',
    name: 'Memory Leak Colossus',
    radius: 24,
    isBoss: true,
    bossTitle: 'INCIDENTE CRÍTICO: FUGA DE MEMORIA MASIVA',
    regenerates: true,
    attackRange: 130,
    attackPower: 30,
    attackCooldown: 60,
    description: 'Jefe: Se autorregenera y arroja lodo de memoria'
  },
  boss_botnet: {
    hp: 5200,
    speed: 0.26,
    reward: 700,
    color: '#50fa7b',
    label: 'BOSS',
    name: 'Distributed Botnet Overlord',
    radius: 26,
    isBoss: true,
    bossTitle: 'INCIDENTE CRÍTICO: BOTNET C2 GLOBAL',
    stunImmune: true,
    attackRange: 150,
    attackPower: 35,
    attackCooldown: 45,
    description: 'Jefe: Invoca enjambres y emite pulsos de choque'
  },
  boss_apex: {
    hp: 8000,
    speed: 0.23,
    reward: 1200,
    color: '#ff79c6',
    label: 'BOSS',
    name: 'Zero-Day Rootkit Apex (Jefe Final)',
    radius: 28,
    isBoss: true,
    bossTitle: 'AMENAZA DE ESTADO: ROOTKIT APEX SUPREMO',
    slowImmune: true,
    isFinalBoss: true,
    attackRange: 180,
    attackPower: 45,
    attackCooldown: 40,
    description: 'Jefe Final: Rayo orbital destructor, clones de sombra y Kernel Panic EMP'
  }
};

const DEVOPS_ABILITIES = {
  autoscale: {
    id: 'autoscale',
    name: 'Auto-Scale HPA',
    cost: 0,
    cooldown: 35,
    duration: 6,
    icon: 'lightning',
    color: '#00f0ff',
    desc: 'Escalado Horizontal: Duplica la velocidad de disparo de todas las torres por 6s.',
    shortcut: 'Q'
  },
  shield: {
    id: 'shield',
    name: 'Cloudflare DDoS Shield',
    cost: 0,
    cooldown: 50,
    charges: 5,
    icon: 'shield',
    color: '#f97316',
    desc: 'WAF Perimetral: El Core absorbe las siguientes 5 amenazas sin perder vidas.',
    shortcut: 'W'
  },
  reboot: {
    id: 'reboot',
    name: 'Hard Reboot (kill -9)',
    cost: 0,
    cooldown: 60,
    icon: 'terminal',
    color: '#ff3366',
    desc: 'Reinicio Forzado: Pulso EMP que daña y aturde por 3.5s a todas las amenazas en pantalla.',
    shortcut: 'E'
  }
};

const GAME_CONFIG = {
  gridSize: 40,
  gridCols: 26,
  gridRows: 16,
  maxLives: 20,
  startMoney: 280, // Tighter strategic starting budget
  maxWaves: 20,
  prepTime: 12,
  sellRefundRate: 0.75,
  lootDropChance: 0.22,
  repairCostPerHp: 0.25
};
