// ============================================
// CONFIG - DevOps Incidents, RCA Quizzes & Code Challenges (No Emojis)
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
    reward: { money: 160, buff: 'Caché +25% rango y +$160 presupuesto', type: 'cache' },
    codeChallenge: {
      title: 'Hotfix de Rendimiento: Bloqueo de Mutex para Caché',
      instructions: 'Implementa getOrCompute() para que solo el primer hilo calcule el valor costoso si la clave no está en caché, evitando que 100,000 peticiones saturen la base de datos.',
      initialCode: `function getOrCompute(cache, key, computeFn) {\n  if (cache[key]) return cache[key];\n  // VULNERABLE: Sin verificación, múltiples peticiones concurrentes saturan la BD\n  const val = computeFn();\n  cache[key] = val;\n  return val;\n}`,
      tests: [
        {
          name: 'Retorna datos cacheados en O(1)',
          testCode: `
            const c = { 'user:1': 'cached_data' };
            let computed = false;
            const res = getOrCompute(c, 'user:1', () => { computed = true; return 'fresh'; });
            assert.assertEqual(res, 'cached_data');
            assert.assertFalse(computed, 'No debe llamar a computeFn si la clave existe');
          `
        },
        {
          name: 'Calcula y almacena si no existe en caché',
          testCode: `
            const c = {};
            const res = getOrCompute(c, 'news', () => 'breaking_news');
            assert.assertEqual(res, 'breaking_news');
            assert.assertEqual(c['news'], 'breaking_news');
          `
        }
      ]
    }
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
    reward: { money: 180, buff: 'Circuit Breakers +30% daño y +$180 presupuesto', type: 'circuitbreaker' },
    codeChallenge: {
      title: 'Hotfix de Resiliencia: Máquina de Estados de Circuit Breaker',
      instructions: 'Implementa la lógica en evaluateCircuit() para que abra el circuito ("OPEN") si la tasa de fallos consecutiva supera o iguala el umbral permitido (threshold). En caso contrario debe retornar "CLOSED".',
      initialCode: `function evaluateCircuit(consecutiveFailures, threshold) {\n  // TODO: Si consecutiveFailures >= threshold, debe retornar 'OPEN'\n  // En caso contrario, debe permanecer 'CLOSED'\n  return 'CLOSED';\n}`,
      tests: [
        {
          name: 'Mantiene CLOSED con fallos por debajo del umbral',
          testCode: `assert.assertEqual(evaluateCircuit(2, 5), 'CLOSED');`
        },
        {
          name: 'Abre el circuito (OPEN) al alcanzar o superar el umbral',
          testCode: `assert.assertEqual(evaluateCircuit(5, 5), 'OPEN');`
        },
        {
          name: 'Abre el circuito ante sobrecarga masiva',
          testCode: `assert.assertEqual(evaluateCircuit(12, 5), 'OPEN');`
        }
      ]
    }
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
    reward: { money: 200, buff: 'Escudo DDoS recargado +$200 presupuesto', type: 'shield' },
    codeChallenge: {
      title: 'Hotfix de Kernel: Validación de Paquetes SYN',
      instructions: 'Filtra peticiones en filterTraffic(): descarta paquetes retornando false si packet.ip está en blacklist o si packet.seq <= 0. Retorna true si es legítimo.',
      initialCode: `function filterTraffic(packet, blacklist) {\n  // TODO: Retorna false si packet.ip está en blacklist o si packet.seq <= 0.\n  // Retorna true si el paquete es legítimo.\n  return true;\n}`,
      tests: [
        {
          name: 'Bloquea IPs en la lista de bloqueo',
          testCode: `
            const blocked = filterTraffic({ ip: '198.51.100.1', seq: 100 }, ['198.51.100.1']);
            assert.assertFalse(blocked, 'Debe descartar IP bloqueada');
          `
        },
        {
          name: 'Descarta números de secuencia TCP inválidos',
          testCode: `
            const blocked = filterTraffic({ ip: '203.0.113.5', seq: -1 }, []);
            assert.assertFalse(blocked, 'Debe descartar seq <= 0');
          `
        },
        {
          name: 'Permite paquetes legítimos con handshake válido',
          testCode: `
            const allowed = filterTraffic({ ip: '10.0.0.1', seq: 4242 }, ['192.168.1.1']);
            assert.assertTrue(allowed, 'Debe aceptar paquete legítimo');
          `
        }
      ]
    }
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
    reward: { money: 175, buff: 'WAFs +35% velocidad de haz y +$175 presupuesto', type: 'waf' },
    codeChallenge: {
      title: 'Hotfix de Seguridad: Sanitización / Consulta Preparada',
      instructions: 'Corrige la función vulnerable buildUserQuery(userId): debe parametrizar o validar numéricamente el ID para que nunca concatene strings con OR 1=1 o DROP TABLE.',
      initialCode: `function buildUserQuery(userId) {\n  // VULNERABLE: Concatenación directa\n  return "SELECT * FROM users WHERE id = '" + userId + "' AND active = 1;";\n}`,
      tests: [
        {
          name: 'Neutraliza Inyección SQL clásica (OR 1=1)',
          testCode: `
            try {
              const res = buildUserQuery("1' OR '1'='1");
              if (typeof res === 'string') {
                assert.assertNotContains(res, "OR '1'='1", "La consulta SQL no debe concatenar literales no sanitizados.");
              } else {
                assert.assertTrue(res && res.params, "Debe retornar objeto parametrizado.");
              }
            } catch (e) {
              assert.assertTrue(true, "Excepción lanzada correctamente ante entrada maliciosa.");
            }
          `
        },
        {
          name: 'Procesa IDs legítimos correctamente',
          testCode: `
            const res = buildUserQuery("42");
            if (typeof res === 'string') {
              assert.assertTrue(res.includes("42"), "Debe consultar el ID solicitado.");
            } else {
              assert.assertEqual(res.params[0], 42, "Debe extraer el parámetro 42.");
            }
          `
        }
      ]
    }
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
    reward: { money: 190, buff: 'Envoy Proxies +40% buff de aura y +$190 presupuesto', type: 'servicemesh' },
    codeChallenge: {
      title: 'Hotfix Zero-Trust: Validación de Certificado mTLS',
      instructions: 'En verifyMtls(cert, expectedIssuer): verifica que cert exista, que cert.issuer === expectedIssuer y que cert.validUntil > Date.now(). Retorna true o false.',
      initialCode: `function verifyMtls(cert, expectedIssuer) {\n  // TODO: Retorna true solo si cert existe, su emisor coincide y no ha expirado\n  return false;\n}`,
      tests: [
        {
          name: 'Rechaza certificados expirados',
          testCode: `
            const valid = verifyMtls({ issuer: 'ClusterCA', validUntil: 1000 }, 'ClusterCA');
            assert.assertFalse(valid, 'Debe rechazar cert expirado');
          `
        },
        {
          name: 'Acepta certificados mTLS válidos emitidos por la CA de la malla',
          testCode: `
            const valid = verifyMtls({ issuer: 'ClusterCA', validUntil: Date.now() + 100000 }, 'ClusterCA');
            assert.assertTrue(valid, 'Debe validar mTLS correctamente');
          `
        }
      ]
    }
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
    reward: { money: 180, buff: 'Kafka Queues +35% radio de explosión y +$180 presupuesto', type: 'messagequeue' },
    codeChallenge: {
      title: 'Hotfix Asíncrono: Dead Letter Queue (DLQ) en Consumidor Kafka',
      instructions: 'En processEvent(event, maxRetries): si event.success === true retorna "ACK". Si event.attempts >= maxRetries retorna "DLQ". Si no, retorna "RETRY".',
      initialCode: `function processEvent(event, maxRetries) {\n  // TODO: Retornar 'ACK', 'DLQ' o 'RETRY'\n  return 'ACK';\n}`,
      tests: [
        {
          name: 'Confirma con ACK eventos exitosos',
          testCode: `assert.assertEqual(processEvent({ success: true, attempts: 1 }, 3), 'ACK');`
        },
        {
          name: 'Envía a DLQ si excede reintentos máximos',
          testCode: `assert.assertEqual(processEvent({ success: false, attempts: 3 }, 3), 'DLQ');`
        },
        {
          name: 'Reintenta eventos fallidos con intentos restantes',
          testCode: `assert.assertEqual(processEvent({ success: false, attempts: 1 }, 3), 'RETRY');`
        }
      ]
    }
  }
];

// Global exposure
if (typeof window !== 'undefined') {
  window.INCIDENT_QUIZZES = INCIDENT_QUIZZES;
}
if (typeof module !== 'undefined') {
  module.exports = { INCIDENT_QUIZZES };
}
