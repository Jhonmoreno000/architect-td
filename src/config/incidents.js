// ============================================
// CONFIG - DevOps Incidents, RCA Quizzes & Architecture Lore (No Emojis)
// ============================================

const INCIDENT_QUIZZES = [
  {
    id: 'cache_stampede',
    title: '[PAGERDUTY] Incidente de Caída por Thundering Herd',
    scenario: 'Tu base de datos relacional colapsó porque expiró la caché de la página principal en el Black Friday y 100,000 usuarios consultaron la base de datos a la vez (Cache Stampede).',
    question: '¿Qué patrón de arquitectura previene este problema en producción?',
    options: [
      { text: 'A) Implementar Mutex Lock en Caché (Probabilistic Early Expiration / Lock-Free) y precalentar Redis.', correct: true, feedback: '¡Excelente! Evita que todas las peticiones lleguen a la BD simultáneamente usando bloqueos o regeneración anticipada.' },
      { text: 'B) Aumentar la CPU del servidor de base de datos a 128 núcleos sin modificar el código.', correct: false, feedback: 'Incorrecto: El escalado vertical solo retrasa el colapso y aumenta exponencialmente la factura en la nube.' },
      { text: 'C) Eliminar la caché por completo para servir datos 100% frescos directamente de disco.', correct: false, feedback: 'Incorrecto: Saturaría la base de datos instantáneamente.' }
    ],
    reward: { money: 160, buff: 'Caché +25% rango y +$160 presupuesto', type: 'cache' }
  },
  {
    id: 'circuit_breaker_cascade',
    title: '[PAGERDUTY] Falla en Cascada de Microservicios',
    scenario: 'El microservicio de Pagos está respondiendo con 15 segundos de latencia. Los servicios de Carrito y Checkout están acumulando hilos y quedándose sin memoria.',
    question: '¿Cómo evitas que la lentitud de un servicio secundario tumbe todo el ecosistema?',
    options: [
      { text: 'A) Aplicar el patrón Circuit Breaker con Fallback y Timeouts estrictos.', correct: true, feedback: '¡Correcto! Corta la conexión inmediatamente y devuelve una respuesta de contingencia (Fallback) sin bloquear recursos.' },
      { text: 'B) Incrementar el timeout de las peticiones HTTP a 120 segundos.', correct: false, feedback: 'Incorrecto: Esto agotaría los pools de conexiones mucho más rápido.' },
      { text: 'C) Reintentar la misma petición inmediatamente en un bucle infinito.', correct: false, feedback: 'Incorrecto: Provocaría un ataque de denegación de servicio interno involuntario.' }
    ],
    reward: { money: 180, buff: 'Circuit Breakers +30% daño y +$180 presupuesto', type: 'circuitbreaker' }
  },
  {
    id: 'ddos_syn_flood',
    title: '[ALERTA SOC] Ataque Masivo de Denegación de Servicio (SYN Flood)',
    scenario: 'Los firewalls perimetrales reportan 50 millones de paquetes SYN por segundo falsificando IPs de origen para agotar la tabla de conexiones TCP.',
    question: '¿Qué mecanismo en capas de red (L4/L7) neutraliza este ataque?',
    options: [
      { text: 'A) Activar SYN Cookies en el Kernel, mitigación BGP Anycast y WAF L7 en el Edge.', correct: true, feedback: '¡Perfecto! Las SYN Cookies permiten verificar clientes sin reservar memoria previa para conexiones falsas.' },
      { text: 'B) Desconectar el cable de red del Data Center.', correct: false, feedback: 'Incorrecto: Provoca 100% de downtime en el negocio.' },
      { text: 'C) Responder con un error HTTP 500 a cada paquete SYN.', correct: false, feedback: 'Incorrecto: La capa HTTP (L7) ni siquiera ha establecido el handshake TCP (L4).' }
    ],
    reward: { money: 200, buff: 'Escudo DDoS recargado +$200 presupuesto', type: 'shield' }
  },
  {
    id: 'sql_injection_breach',
    title: '[AUDITORÍA SEC] Inyección SQL detectada en el Ingress',
    scenario: 'Un atacante está enviando `1 OR 1=1; DROP TABLE users;` a través de los parámetros del formulario de búsqueda.',
    question: '¿Cuál es la práctica estándar de ingeniería para erradicar SQLi?',
    options: [
      { text: 'A) Utilizar Consultas Preparadas (Prepared Statements / ORM) y validación en WAF.', correct: true, feedback: '¡Correcto! Las consultas parametrizadas tratan las entradas del usuario puramente como datos, no como código ejecutable.' },
      { text: 'B) Reemplazar manualmente las comillas simples por espacios con regex casero.', correct: false, feedback: 'Incorrecto: Los atacantes pueden evadir regex usando codificación Hex, Unicode o SQL comments.' },
      { text: 'C) Ocultar el nombre de las tablas en la base de datos.', correct: false, feedback: 'Incorrecto: Seguridad por oscuridad no previene la extracción masiva de datos.' }
    ],
    reward: { money: 175, buff: 'WAFs +35% velocidad de haz y +$175 presupuesto', type: 'waf' }
  },
  {
    id: 'zero_trust_mtls',
    title: '[INFORME DE SEGURIDAD] Infiltración de Red Interna',
    scenario: 'Un atacante logró entrar a la red interna (VPC) tras vulnerar una VPN corporativa.',
    question: 'Bajo el paradigma Zero-Trust, ¿cómo evitas el movimiento lateral del intruso?',
    options: [
      { text: 'A) Autenticación mutua con mTLS, Service Mesh y políticas estrictas de menor privilegio (Least Privilege).', correct: true, feedback: '¡Exacto! En Zero-Trust "nunca confíes, siempre verifica", incluso dentro de la red privada.' },
      { text: 'B) Confiar en todo el tráfico una vez dentro de la red local (LAN).', correct: false, feedback: 'Incorrecto: Permitiría al atacante leer y vulnerar cualquier base de datos interna sin barreras.' },
      { text: 'C) Instalar un antivirus en el servidor de base de datos.', correct: false, feedback: 'Incorrecto: No protege las comunicaciones entre servicios ni previene el robo de credenciales.' }
    ],
    reward: { money: 190, buff: 'Envoy Proxies +40% buff de aura y +$190 presupuesto', type: 'servicemesh' }
  },
  {
    id: 'event_driven_kafka',
    title: '[ARQUITECTURA] Desacoplamiento de Picos de Facturación',
    scenario: 'Durante el Cyber Monday, el servicio de notificaciones por email bloquea el checkout de compras porque SMTP es muy lento.',
    question: '¿Qué patrón de mensajería desacopla la compra inmediata del envío de correos?',
    options: [
      { text: 'A) Arquitectura Asíncrona Orientada a Eventos con Colas Kafka / RabbitMQ.', correct: true, feedback: '¡Excelente! La compra se confirma en milisegundos y el evento se procesa en segundo plano a su propio ritmo.' },
      { text: 'B) Hacer que el cliente espere 30 segundos en la pantalla hasta que el correo llegue.', correct: false, feedback: 'Incorrecto: Destruye la experiencia de usuario y satura los servidores web.' },
      { text: 'C) Guardar los correos en un archivo de texto en el escritorio del servidor.', correct: false, feedback: 'Incorrecto: No ofrece tolerancia a fallos ni concurrencia.' }
    ],
    reward: { money: 180, buff: 'Kafka Queues +35% radio de explosión y +$180 presupuesto', type: 'messagequeue' }
  }
];
