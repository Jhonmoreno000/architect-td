// ============================================
// CODEX - Software Architecture, DevOps & Threat Encyclopedia
// ============================================

const CODEX_DATA = {
  towers: [
    {
      id: 'loadbalancer',
      title: 'Load Balancer (Balanceador de Carga)',
      concept: 'Distribución de Carga & Anycast Routing',
      desc: 'Distribuye las peticiones entrantes entre múltiples instancias de backend para evitar la saturación de un único nodo. Implementa algoritmos como Round Robin, Least Connections y Weighted Distribution.',
      realWorldExample: 'NGINX, HAProxy, AWS ALB, F5 BIG-IP.',
      tip: 'Colócalo cerca de las puertas de entrada para ralentizar enjambres y dar tiempo a tus torres de daño concentrado.'
    },
    {
      id: 'circuitbreaker',
      title: 'Circuit Breaker (Disyuntor de Resiliencia)',
      concept: 'Aislamiento de Fallos & Prevención de Caídas en Cascada',
      desc: 'Monitorea la tasa de fallos en llamadas remotas. Si un servicio se degrada, el circuito "se abre" instantáneamente para devolver una respuesta alternativa (Fallback) en vez de bloquear hilos y memoria.',
      realWorldExample: 'Netflix Hystrix, Resilience4j, Istio Circuit Breaking.',
      tip: 'Esencial contra ataques de alta intensidad (POST y Jefes); su descarga de alto voltaje aturde a los objetivos.'
    },
    {
      id: 'apigateway',
      title: 'API Gateway (Puerta de Enlace API)',
      concept: 'Enrutamiento L7, Rate Limiting & Auth Validation',
      desc: 'Punto único de entrada para todas las aplicaciones cliente. Centraliza autenticación JWT/OAuth, limitación de tasa (Token Bucket), transformación de protocolos (REST a gRPC) y métricas.',
      realWorldExample: 'Kong Gateway, Apache APISIX, AWS API Gateway, Traefik.',
      tip: 'Posee una cadencia de disparo muy rápida y daño crítico contra peticiones complejas (POST y WebSockets).'
    },
    {
      id: 'cache',
      title: 'In-Memory Cache (Caché en Memoria)',
      concept: 'Almacenamiento Temporal de Ultra-Baja Latencia',
      desc: 'Mantiene en memoria RAM las respuestas a consultas frecuentes para evitar sobrecargar los discos de bases de datos. Utiliza políticas de expiración (TTL) y desalojo (LRU / LFU).',
      realWorldExample: 'Redis, Memcached, DragonflyDB.',
      tip: 'Genera un aura pasiva que frena a todos los paquetes alrededor de su perímetro.'
    },
    {
      id: 'waf',
      title: 'Web Application Firewall (WAF)',
      concept: 'Inspección Profunda de Paquetes L7 (OWASP Top 10)',
      desc: 'Analiza el payload HTTP en busca de patrones maliciosos como Cross-Site Scripting (XSS), Inyecciones SQL, falsificación de peticiones y escaneos de vulnerabilidades.',
      realWorldExample: 'Cloudflare WAF, AWS WAF, ModSecurity, Imperva.',
      tip: 'Su haz láser sostenido derrite escudos criptográficos y destruye amenazas SQLi rápidamente.'
    },
    {
      id: 'messagequeue',
      title: 'Message Queue & Event Streaming (Kafka)',
      concept: 'Desacoplamiento Asíncrono & Buffer de Alta Capacidad',
      desc: 'Almacena eventos y mensajes en un registro ordenado y particionado. Permite que los sistemas productores y consumidores operen a velocidades diferentes sin bloquearse mutuamente.',
      realWorldExample: 'Apache Kafka, RabbitMQ, AWS SQS, Apache Pulsar.',
      tip: 'Dispara proyectiles pesados de área que causan explosiones masivas contra grupos de paquetes.'
    },
    {
      id: 'cdn',
      title: 'Edge CDN Node (Red de Distribución de Contenido)',
      concept: 'Computación en el Borde & Caching Geodistribuido',
      desc: 'Despliega servidores proxy en cientos de puntos de presencia (PoP) alrededor del mundo para servir contenido desde la ubicación más cercana al usuario final.',
      realWorldExample: 'Cloudflare Edge Workers, Fastly, Akamai, AWS CloudFront.',
      tip: 'Alcance francotirador supremo. Ideal para eliminar amenazas críticas antes de que penetren tu perímetro.'
    },
    {
      id: 'database',
      title: 'Database Shard (Particionamiento Horizontal)',
      concept: 'Escalabilidad Horizontal de Datos & Replicación',
      desc: 'Divide grandes conjuntos de datos en fragmentos autónomos (shards) distribuidos en diferentes nodos físicos con replicación primario-secundario.',
      realWorldExample: 'PostgreSQL Citus, MongoDB Sharding, CockroachDB, Spanner.',
      tip: 'Genera presupuesto financiero continuo cada 5 segundos y emite pulsos sísmicos que aturden el suelo.'
    },
    {
      id: 'servicemesh',
      title: 'Service Mesh Envoy (Malla de Servicios)',
      concept: 'Cifrado mTLS, Sidecar Proxies & Observabilidad Zero-Trust',
      desc: 'Gestiona la comunicación Este-Oeste entre microservicios inyectando un proxy sidecar que cifra el tráfico con mTLS, recolecta métricas y aplica políticas de autorización.',
      realWorldExample: 'Istio, Linkerd, Envoy Proxy, Consul Connect.',
      tip: 'Potencia el daño (+25%) y la velocidad de todas las torres aliadas dentro de su radio de cobertura.'
    },
    {
      id: 'honeypot',
      title: 'Honeypot Decoy (Servidor Señuelo)',
      concept: 'Ciberseguridad Ofensiva & Trampas de Detección',
      desc: 'Un sistema trampa configurado deliberadamente para parecer vulnerable, atrayendo a atacantes y botnets para recolectar inteligencia y desviar el ataque del núcleo real.',
      realWorldExample: 'Cowrie SSH Honeypot, Dionaea, OpenCanary.',
      tip: 'Colócalo en una esquina para desviar a las hordas del Core. Al ser destruido causa una detonación EMP masiva.'
    }
  ],
  threats: [
    {
      name: 'GET Request Dart',
      danger: 'Baja',
      desc: 'Petición HTTP estándar de lectura. Aunque individualmente débil, en grandes volúmenes puede agotar descriptores de archivo.'
    },
    {
      name: 'POST Payload Heavy',
      danger: 'Media',
      desc: 'Petición con cuerpo pesado de datos (JSON/XML). Consume más memoria y tiempo de procesamiento en el servidor.'
    },
    {
      name: 'WebSocket Stream Fast',
      danger: 'Media-Alta',
      desc: 'Conexión bidireccional continua y de alta velocidad. Penetra rápidamente las defensas si no es interceptada.'
    },
    {
      name: 'Botnet Crawler Swarm',
      danger: 'Media',
      desc: 'Enjambre coordinado de dispositivos zombi infectados que atacan en masa para saturar los puertos de enlace.'
    },
    {
      name: 'SQL Injection Corrupted',
      danger: 'Alta (Peligro)',
      desc: 'Intento malicioso de alterar consultas de base de datos. Al ser destruido se fragmenta en sub-consultas anidadas.'
    },
    {
      name: 'Zero-Day Stealth Exploit',
      danger: 'Muy Alta',
      desc: 'Vulnerabilidad desconocida no parchada. Su código optimizado lo hace inmune a ralentizaciones.'
    },
    {
      name: 'Ransomware Crypter',
      danger: 'Extrema',
      desc: 'Amenaza criptográfica que proyecta un escudo de cifrado sobre todos los paquetes aliados circundantes.'
    },
    {
      name: 'Titan DDoS SYN Flood (Jefe)',
      danger: 'Jefe Nivel 5',
      desc: 'Invasión masiva que agota la pila TCP/IP. Invoca enjambres continuos de paquetes de saturación.'
    },
    {
      name: 'Memory Leak Colossus (Jefe)',
      danger: 'Jefe Nivel 10',
      desc: 'Fuga progresiva de memoria heap. Se autorregenera continuamente si no recibe fuego concentrado.'
    },
    {
      name: 'Botnet Overlord C2 (Jefe)',
      danger: 'Jefe Nivel 15',
      desc: 'Centro de comando global de botnets. Inmune a stuns y acelera la velocidad de todo el enjambre invasor.'
    },
    {
      name: 'Rootkit Apex (Jefe Final)',
      danger: 'Jefe Nivel 20 / Final',
      desc: 'Acceso a nivel de kernel (Ring 0). Blindaje cuántico supremo y velocidad extrema.'
    }
  ]
};
