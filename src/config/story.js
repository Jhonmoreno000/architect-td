// ============================================
// CONFIG - Interactive Story Campaign & Narrative Missions
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
      "Bienvenido a bordo, Ingeniero Principal. Hoy es el día más crítico del año: el despliegue del nuevo monolito para el evento global de ventas.
      
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
    },
    successMessage: `
      "¡Excelente trabajo! El monolito resistió el pico de tráfico inicial. Pero nuestras sondas de telemetría detectan anomalías en los microservicios adyacentes..."
    `
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
      
      Hemos activado una topología Activa-Activa entre dos centros de datos. Un rayo de sincronización de datos une los dos nodos Alpha y Beta.
      
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
          apply: (state) => { if (TOWER_CONFIG.circuitbreaker) TOWER_CONFIG.circuitbreaker.cost -= 40; }
        }
      ]
    },
    successMessage: `
      "¡Cascada contenida con éxito! Los Circuit Breakers salvaron el clúster. Sin embargo, nuestros firewalls detectan tráfico botnet coordinado..."
    `
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
          effectDesc: 'Todos los WAF ganan +25% de alcance y derriten escudos más rápido.',
          apply: (state) => { state.wafDpiBoost = true; }
        },
        {
          text: 'Subsidio de Infraestructura en Nodos PoP',
          effectDesc: 'Recibes +$50 por cada nodo PoP que siga en pie al final de la oleada.',
          apply: (state) => { state.popSubsidy = true; }
        }
      ]
    },
    successMessage: `
      "¡Ataque L7 mitigado! El C-Level está impresionado. Pero las alertas del SIEM indican una infiltración interna en la VPN corporativa..."
    `
  },
  {
    id: 4,
    levelId: 4,
    chapterNumber: 'CAPÍTULO IV',
    title: 'Infiltración Zero-Trust & Pods de Kubernetes',
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
    },
    successMessage: `
      "¡Infiltración interna neutralizada! Pero la señal de ataque se ha concentrado en una firma desconocida... es el temido Rootkit Apex."
    `
  },
  {
    id: 5,
    levelId: 5,
    chapterNumber: 'CAPÍTULO V',
    title: 'Rootkit Apex: Protocolo Fin del Mundo',
    speaker: {
      name: 'Comando Central de Operaciones',
      role: 'Directorio Ejecutivo & Defensa Cibernética',
      avatarColor: '#ff79c6',
      tag: 'COMMAND_APEX'
    },
    briefing: `
      "Esta es la batalla definitiva por la supervivencia de la infraestructura digital global.
      
      Un actor de estado ha desplegado el exploit Zero-Day 'Rootkit Apex'. Se están abriendo brechas cuánticas en el interior de nuestra red perimetral y el jefe supremo cuenta con un rayo orbital destructor.
      
      Utiliza todo el arsenal arquitectónico aprendido: Foco de Ataque Manual con Clic Derecho, Habilidades DevOps (Auto-Scale, DDoS Shield, kill -9) y reparaciones en caliente constantes."
    `,
    decision: {
      prompt: 'DECISIÓN ESTRATÉGICA DEL ARQUITECTO:',
      options: [
        {
          text: 'Protocolo de Emergencia: Sobrecarga Total de Clúster',
          effectDesc: 'Las habilidades DevOps (Q, W, E) tienen un 30% menos de enfriamiento.',
          apply: (state) => { state.abilityCooldownMultiplier = 0.7; }
        },
        {
          text: 'Fondo de Estabilidad de Emergencia',
          effectDesc: 'Inicias con +$200 de presupuesto para blindar el perímetro interior.',
          apply: (state) => { state.money += 200; }
        }
      ]
    },
    successMessage: `
      "¡VICTORIA TOTAL! El Rootkit Apex ha sido erradicado y la infraestructura global está a salvo. Has demostrado ser un Arquitecto de Sistemas Legendario."
    `
  }
];
