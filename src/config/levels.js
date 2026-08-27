// ============================================
// CONFIG - Open Perimeter Topologies with Level-Specific Mechanics
// ============================================

const LEVEL_CONFIGS = [
  {
    id: 1,
    name: 'El Data Center Central (Perímetro 360°)',
    subtitle: 'Infraestructura On-Premise & Perímetro Abierto',
    description: 'Ataques llegando desde todas las direcciones de la red pública. Construye anillos de defensa concéntricos alrededor del Core.',
    difficultyRating: 'Baja',
    theme: 'monolith',
    bgColor: '#040814',
    accentColor: '#00ff41',
    startMoney: 280,
    maxWaves: 15,
    core: { gx: 13, gy: 8 },
    mechanicTitle: 'DEFENSA EN CAPAS (DMZ)',
    mechanicDesc: 'Construye un perímetro exterior de WAF/Load Balancers y un núcleo interior de Gateways y BD.',
    subNodes: []
  },
  {
    id: 2,
    name: 'Malla Activa-Activa (Data-Sync Link)',
    subtitle: 'Cluster de Alta Disponibilidad con Replicación',
    description: 'Dos núcleos de servidores sincronizados. Un haz láser de datos une ambos núcleos desintegrando a los enemigos que intenten cruzarlo.',
    difficultyRating: 'Media',
    theme: 'microservices',
    bgColor: '#06061a',
    accentColor: '#8be9fd',
    startMoney: 340,
    maxWaves: 20,
    core: { gx: 13, gy: 8 },
    hasSyncLink: true,
    mechanicTitle: 'ENLACE LÁSER DE SINCRONIZACIÓN',
    mechanicDesc: 'Un rayo de replicación de datos activo entre los cuadrantes destruye enemigos que lo cruzan.',
    auxCores: [
      { gx: 7, gy: 8, label: 'NODE_ALPHA' },
      { gx: 19, gy: 8, label: 'NODE_BETA' }
    ],
    subNodes: []
  },
  {
    id: 3,
    name: 'Cloud Edge (Nodos Satélite PoP)',
    subtitle: 'Arquitectura Distribuida con Nodos de Borde',
    description: '4 Nodos PoP perimetrales protegen el origen. Cada nodo PoP que mantengas con vida genera +$25 de ingresos extra por oleada.',
    difficultyRating: 'Alta',
    theme: 'cloud_edge',
    bgColor: '#050a1c',
    accentColor: '#bd93f9',
    startMoney: 380,
    maxWaves: 20,
    core: { gx: 13, gy: 8 },
    mechanicTitle: 'ECONOMÍA DE BORDE (EDGE PoPs)',
    mechanicDesc: 'Defiende los 4 nodos satélite para maximizar tus ingresos de presupuesto en cada oleada.',
    subNodes: [
      { gx: 6, gy: 4, label: 'POP_US_EAST', hp: 120 },
      { gx: 20, gy: 4, label: 'POP_EU_WEST', hp: 120 },
      { gx: 6, gy: 12, label: 'POP_AP_SOUTH', hp: 120 },
      { gx: 20, gy: 12, label: 'POP_SA_EAST', hp: 120 }
    ]
  },
  {
    id: 4,
    name: 'Clúster de Kubernetes & Chaos Pods',
    subtitle: 'Orquestación de Contenedores Distribuidos',
    description: 'Enjambres masivos en pinza. Los pods auxiliares emiten pulsos que potencian la velocidad de disparo de todos los pods adyacentes.',
    difficultyRating: 'Experto',
    theme: 'kubernetes',
    bgColor: '#061018',
    accentColor: '#50fa7b',
    startMoney: 420,
    maxWaves: 25,
    core: { gx: 13, gy: 8 },
    mechanicTitle: 'POD SERVICE MESH BOOST',
    mechanicDesc: 'Los pods del clúster aceleran un 30% a todas las torres colocadas en sus cuadrantes.',
    subNodes: [
      { gx: 13, gy: 3, label: 'INGRESS_NGINX', hp: 150 },
      { gx: 13, gy: 13, label: 'DATABASE_POD', hp: 150 }
    ]
  },
  {
    id: 5,
    name: 'Fortaleza Cuántica Zero-Trust',
    subtitle: 'Sistema Crítico Financiero y Bancario Global',
    description: 'Ataques de estado coordinados. Se abren brechas cuánticas aleatorias dentro del perímetro que debes contener inmediatamente.',
    difficultyRating: 'Pesadilla',
    theme: 'quantum',
    bgColor: '#140516',
    accentColor: '#ff79c6',
    startMoney: 480,
    maxWaves: 25,
    core: { gx: 13, gy: 8 },
    hasQuantumPortals: true,
    mechanicTitle: 'BRECHAS CUÁNTICAS DE DÍA CERO',
    mechanicDesc: 'Portales de distorsión infiltran enemigos en el interior del perímetro. Mantén reservas de WAF y EMP.',
    subNodes: []
  }
];

const DIFFICULTY_SETTINGS = {
  dev: {
    id: 'dev',
    name: 'Dev (Fácil)',
    desc: 'Tráfico 20% más lento, +35% presupuesto inicial y +5 vidas de Core.',
    moneyMultiplier: 1.35,
    enemyHpMultiplier: 0.75,
    enemySpeedMultiplier: 0.8,
    coreHpBonus: 5,
    scoreMultiplier: 0.8
  },
  staging: {
    id: 'staging',
    name: 'Staging (Normal)',
    desc: 'Balance estándar de arquitectura, oleadas e incidentes.',
    moneyMultiplier: 1.0,
    enemyHpMultiplier: 1.0,
    enemySpeedMultiplier: 1.0,
    coreHpBonus: 0,
    scoreMultiplier: 1.0
  },
  production: {
    id: 'production',
    name: 'Production (Difícil)',
    desc: 'Enjambres rápidos y agresivos, presupuesto ajustado y bonus de puntuación x1.5.',
    moneyMultiplier: 0.85,
    enemyHpMultiplier: 1.25,
    enemySpeedMultiplier: 1.15,
    coreHpBonus: -5,
    scoreMultiplier: 1.5
  },
  chaos: {
    id: 'chaos',
    name: 'Chaos Eng. (Infinito)',
    desc: 'Oleadas interminables estilo horda con mutadores caóticos aleatorios y jefes recurrentes.',
    moneyMultiplier: 1.0,
    enemyHpMultiplier: 1.35,
    enemySpeedMultiplier: 1.2,
    coreHpBonus: 0,
    scoreMultiplier: 2.0,
    isEndless: true
  }
};
