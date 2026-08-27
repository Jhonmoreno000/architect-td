// ============================================
// CONFIG - 7-Chapter Interactive Story Campaign & Architectural Decisions
// ============================================

const STORY_CHAPTERS = [
  {
    id: 1,
    levelId: 1,
    chapterNumber: 'CAPÍTULO I',
    title: 'El Lanzamiento del Monolito (Black Friday)',
    speaker: {
      name: 'Elena Vance',
      role: 'VP de Infraestructura & Cloud',
      avatarColor: '#00ff41',
      tag: 'STAFF_SRE'
    },
    briefing: `
      "Bienvenido a bordo, Ingeniero Principal. Hoy es el día más crítico del año: el despliegue global de ventas en el Data Center Central.
      
      Los sensores de tráfico indican que millones de peticiones entrantes inundarán nuestros servidores desde la red pública en 360 grados. Si el Core central se satura, perderemos la disponibilidad del servicio.
      
      Despliega Load Balancers para dispersar la carga y nodos de In-Memory Cache para mitigar la saturación de base de datos."
    `,
    decision: {
      prompt: 'DECISIÓN ESTRATÉGICA DEL ARQUITECTO:',
      options: [
        {
          text: 'Estrategia Agresiva: Solicitar presupuesto de emergencia en la nube',
          effectDesc: 'Inicias con +$120 de presupuesto adicional para desplegar más servidores.',
          apply: (state) => { state.money += 120; }
        },
        {
          text: 'Estrategia de Resiliencia: Reforzar el ancho de banda del Core',
          effectDesc: 'El Core gana +5 vidas de disponibilidad (Uptime).',
          apply: (state) => { state.lives += 5; state.maxLives += 5; }
        }
      ]
    }
  },
  {
    id: 2,
    levelId: 2,
    chapterNumber: 'CAPÍTULO II',
    title: 'Falla en Cascada & La Malla Activa-Activa',
    speaker: {
      name: 'Alex Chen',
      role: 'Incident Commander & SRE Lead',
      avatarColor: '#8be9fd',
      tag: 'INCIDENT_LEAD'
    },
    briefing: `
      "¡Alerta Roja de PagerDuty! Un servicio aguas abajo ha comenzado a fallar y los reintentos automáticos están provocando un efecto avalancha (Cascading Failure).
      
      Hemos activado una topología Activa-Activa entre dos centros de datos (Alpha y Beta). Un rayo láser de sincronización une ambos nodos.
      
      Necesitamos que coloques Circuit Breakers inmediatamente para aislar los fallos y uses API Gateways con rate limiting estricto."
    `,
    decision: {
      prompt: 'DECISIÓN ESTRATÉGICA DEL ARQUITECTO:',
      options: [
        {
          text: 'Sobrecargar el Enlace Láser de Sincronización',
          effectDesc: 'El haz de datos entre los nodos inflige +50% de daño a amenazas que lo crucen.',
          apply: (state) => { state.laserBoost = 1.5; }
        },
        {
          text: 'Desplegar Circuit Breakers de Alta Prioridad',
          effectDesc: 'Los Circuit Breakers cuestan $40 menos durante esta misión.',
          apply: (state) => { if (TOWER_CONFIG.circuitbreaker) TOWER_CONFIG.circuitbreaker.cost = Math.max(100, TOWER_CONFIG.circuitbreaker.cost - 40); }
        }
      ]
    }
  },
  {
    id: 3,
    levelId: 3,
    chapterNumber: 'CAPÍTULO III',
    title: 'Guerra Cibernética L7 & La Red Edge',
    speaker: {
      name: 'Marcus Vance',
      role: 'Chief Information Security Officer (CISO)',
      avatarColor: '#bd93f9',
      tag: 'CYBER_SEC'
    },
    briefing: `
      "Estamos bajo un ataque volumétrico coordinado. Una botnet C2 global está disparando inyecciones SQL masivas y saturación L7 contra nuestras APIs.
      
      Hemos desplegado 4 Nodos Satélite PoP en el borde de la red (Cloud Edge). Cada PoP activo absorbe tráfico malicioso y genera presupuesto continuo.
      
      Coloca Web Application Firewalls (WAF) y Edge CDNs para desintegrar las consultas SQL corruptas antes de que lleguen al almacenamiento."
    `,
    decision: {
      prompt: 'DECISIÓN ESTRATÉGICA DEL ARQUITECTO:',
      options: [
        {
          text: 'Activar Políticas WAF de Inspección Profunda (DPI)',
          effectDesc: 'Todos los WAF ganan +25% de alcance y velocidad de desintegración.',
          apply: (state) => { state.wafDpiBoost = true; }
        },
        {
          text: 'Subsidio de Infraestructura en Nodos PoP',
          effectDesc: 'Inicias con +$150 de presupuesto para blindar los 4 puntos de presencia.',
          apply: (state) => { state.money += 150; }
        }
      ]
    }
  },
  {
    id: 4,
    levelId: 4,
    chapterNumber: 'CAPÍTULO IV',
    title: 'Infiltración Zero-Trust & Kubernetes Pods',
    speaker: {
      name: 'Dra. Samantha Ortiz',
      role: 'Arquitecta de Criptografía & Zero-Trust',
      avatarColor: '#50fa7b',
      tag: 'ZERO_TRUST'
    },
    briefing: `
      "Credenciales privilegiadas han sido filtradas. Malware tipo Ransomware ha ingresado por la VPN corporativa y está encriptando servidores internos.
      
      En esta arquitectura de Kubernetes, no confiamos en ninguna conexión interna. Debemos aplicar Service Mesh (Envoy) con cifrado mutuo mTLS en cada pod.
      
      Coloca servidores trampa Honeypot para engañar al ransomware y desviar sus ataques lejos del núcleo mientras los Service Mesh potencian tu defensa."
    `,
    decision: {
      prompt: 'DECISIÓN ESTRATÉGICA DEL ARQUITECTO:',
      options: [
        {
          text: 'Aislar Microservicios con Malla mTLS Estricta',
          effectDesc: 'El aura de Service Mesh aumenta el daño de aliados en un +40% (en vez de +25%).',
          apply: (state) => { state.meshAuraMultiplier = 1.6; }
        },
        {
          text: 'Cebo Honeypot con Sobrecarga EMP',
          effectDesc: 'Los Honeypots tienen +35% de vida y radio de atracción magnética.',
          apply: (state) => { state.honeypotBoost = true; }
        }
      ]
    }
  },
  {
    id: 5,
    levelId: 1,
    chapterNumber: 'CAPÍTULO V',
    title: 'Man-In-The-Middle & Envenenamiento de Cadena',
    speaker: {
      name: 'Viktor Kross',
      role: 'Líder de Red Team & Threat Intelligence',
      avatarColor: '#f1fa8c',
      tag: 'RED_TEAM'
    },
    briefing: `
      "¡Reporte urgente de inteligencia! Ciberdelincuentes han comprometido repositorios upstream e inyectado troyanos Supply Chain Poisoning y atacantes MitM.
      
      Estos atacantes emiten campos de interferencia que ralentizan la cadencia de disparo de nuestras defensas y derraman lodo corrosivo.
      
      Necesitamos desplegar Message Queues (Kafka) y Shards de Base de Datos para asegurar la persistencia y absorción asíncrona de eventos."
    `,
    decision: {
      prompt: 'DECISIÓN ESTRATÉGICA DEL ARQUITECTO:',
      options: [
        {
          text: 'Particionamiento Masivo de Message Queues',
          effectDesc: 'Los Message Queues ganan +40% de radio de detonación y cadencia.',
          apply: (state) => { state.mqBoost = true; }
        },
        {
          text: 'Aislamiento de Seguridad Sandbox',
          effectDesc: 'Tus servidores son inmunes a los campos de interferencia MitM.',
          apply: (state) => { state.mitmImmunity = true; }
        }
      ]
    }
  },
  {
    id: 6,
    levelId: 2,
    chapterNumber: 'CAPÍTULO VI',
    title: 'Vulnerabilidad Spectre & Crisis de Memoria',
    speaker: {
      name: 'Dra. Aris Thorne',
      role: 'Especialista en Computación Cuántica & Hardware',
      avatarColor: '#ff5555',
      tag: 'HARDWARE_SEC'
    },
    briefing: `
      "La amenaza ha escalado a nivel de silicio. Exploits de canal lateral Spectre y gusanos polimórficos están eludiendo el aislamiento de memoria del kernel.
      
      Los atacantes Spectre pueden teletransportarse instantáneamente esquivando tus disparos, mientras que los gusanos polimórficos se autorregeneran.
      
      Utiliza el Foco Manual de Ataque (Clic Derecho) y la habilidad de reinicio forzado kill -9 para pulverizar los exploits en tránsito."
    `,
    decision: {
      prompt: 'DECISIÓN ESTRATÉGICA DEL ARQUITECTO:',
      options: [
        {
          text: 'Refrigeración Criogénica de Servidores',
          effectDesc: 'Las habilidades DevOps (Q, W, E) tienen un 35% menos de tiempo de recarga.',
          apply: (state) => { state.abilityCooldownMultiplier = 0.65; }
        },
        {
          text: 'Fondo de Liquidez para Overclock',
          effectDesc: 'Inicias con +$180 de presupuesto para blindar el centro de datos.',
          apply: (state) => { state.money += 180; }
        }
      ]
    }
  },
  {
    id: 7,
    levelId: 5,
    chapterNumber: 'CAPÍTULO VII',
    title: 'Rootkit Apex: Protocolo Fin del Mundo',
    speaker: {
      name: 'Comando Central de Operaciones',
      role: 'Directorio Ejecutivo & Defensa Cibernética Global',
      avatarColor: '#ff79c6',
      tag: 'COMMAND_APEX'
    },
    briefing: `
      "Esta es la batalla definitiva por la supervivencia de la infraestructura digital del planeta.
      
      Un actor de estado ha desplegado el exploit Zero-Day definitivo: 'Rootkit Apex'. Se están abriendo brechas cuánticas en el núcleo y el jefe cuenta con un rayo orbital destructor.
      
      Utiliza todo tu arsenal: Foco de Ataque Manual con Clic Derecho, Habilidades DevOps coordinadas y reparaciones en caliente constantes. ¡Salva la red global!"
    `,
    decision: {
      prompt: 'DECISIÓN ESTRATÉGICA DEL ARQUITECTO:',
      options: [
        {
          text: 'Protocolo de Emergencia: Sobrecarga Total de Clúster',
          effectDesc: 'Todas las torres ganan +20% de daño base y las habilidades recargan 30% más rápido.',
          apply: (state) => { state.globalDamageMultiplier = 1.2; state.abilityCooldownMultiplier = 0.7; }
        },
        {
          text: 'Fondo Supremo de Infraestructura',
          effectDesc: 'Inicias con +$250 de presupuesto para blindar el perímetro interior.',
          apply: (state) => { state.money += 250; }
        }
      ]
    }
  }
];
