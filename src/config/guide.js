// ============================================
// CONFIG - Architect's Training Manual & Interactive Guide (No Emojis)
// ============================================

const GUIDE_SECTIONS = [
  {
    id: 'objective',
    title: '1. Objetivo & Perímetro 360°',
    icon: 'target',
    content: `
      <h3 class="text-sm font-bold text-green-400 font-heading mb-2">Defiende el Núcleo (CORE) de la Infraestructura</h3>
      <p class="text-xs text-slate-300 leading-relaxed mb-3">
        En <b>Architect Tower Defense</b>, eres el Ingeniero Principal (Staff SRE) a cargo de la estabilidad de un sistema de producción crítico. Los ataques cibernéticos y peticiones maliciosas no siguen un camino predecible: <b>invaden en 360 grados desde todos los puertos de entrada</b> (Internet Gateway, Darknet, Cloud Edge y VPNs comprometidas).
      </p>
      <div class="p-3 bg-black/60 border border-green-500/20 rounded-xl space-y-1.5 text-xs text-slate-300">
        <div class="text-green-400 font-bold font-heading">Reglas Fundamentales:</div>
        <div>• Si una amenaza llega al Core central, el sistema pierde <b>Vidas (Uptime)</b>.</div>
        <div>• Si las vidas llegan a 0, ocurre un <b>503 System Crash</b> y se pierde la partida.</div>
        <div>• Puedes colocar servidores y defensas en <b>cualquier casilla libre del mapa</b> para construir anillos concéntricos y laberintos de seguridad (Defense-in-Depth).</div>
      </div>
    `
  },
  {
    id: 'economy',
    title: '2. Economía & Presupuesto Táctico',
    icon: 'coins',
    content: `
      <h3 class="text-sm font-bold text-yellow-400 font-heading mb-2">Gestión de Presupuesto en la Nube</h3>
      <p class="text-xs text-slate-300 leading-relaxed mb-3">
        El presupuesto de infraestructura es limitado. Cada servidor cuesta dinero de despliegue, por lo que cada decisión debe responder a las amenazas entrantes.
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
        <div class="p-3 bg-black/60 border border-yellow-500/20 rounded-xl space-y-1">
          <div class="text-yellow-400 font-bold font-heading mb-1">Fuentes de Ingresos:</div>
          <div>• <b>Destruir Amenazas:</b> Recompensas por petición neutralizada.</div>
          <div>• <b>Loot Drops [RAM/DISK]:</b> Recoge microchips caídos pasando el ratón (+$50).</div>
          <div>• <b>Database Sharding (DB):</b> Genera $20 de presupuesto pasivo cada 5s.</div>
          <div>• <b>Bonus por Oleada:</b> Finalizar oleadas otorga presupuesto extra.</div>
          <div>• <b>Llamada Anticipada:</b> Pulsa <span class="text-white font-code font-bold">[Enter]</span> en la preparación para ganar bonus.</div>
        </div>
        <div class="p-3 bg-black/60 border border-cyan-500/20 rounded-xl space-y-1">
          <div class="text-cyan-400 font-bold font-heading mb-1">Optimización de Costos:</div>
          <div>• No gastes todo tu dinero de golpe; mantén una reserva para <b>reparaciones de emergencia</b>.</div>
          <div>• Vender servidores devuelve el <b>75% de la inversión total</b>.</div>
        </div>
      </div>
    `
  },
  {
    id: 'durability',
    title: '3. Salud, Durabilidad & Reparaciones',
    icon: 'wrench',
    content: `
      <h3 class="text-sm font-bold text-cyan-400 font-heading mb-2">Mantenimiento de Servidores en Producción</h3>
      <p class="text-xs text-slate-300 leading-relaxed mb-3">
        Los servidores reciben fuego hostil de los atacantes y pueden ser dañados, infectados o deshabilitados.
      </p>
      <div class="p-3 bg-black/60 border border-cyan-500/20 rounded-xl space-y-2 text-xs text-slate-300">
        <div>• <b>Barra de Vida del Servidor:</b> Cada torre tiene puntos de durabilidad (HP). Si llega a 0 HP, queda <b>OFFLINE (Error 500)</b> y deja de disparar.</div>
        <div>• <b>Reparación en Caliente [R]:</b> Selecciona cualquier servidor dañado y presiona la tecla <span class="text-yellow-400 font-code font-bold">[R]</span> o haz clic en <i>"Reparar Servidor"</i> en el inspector para restaurarlo por poco dinero.</div>
        <div>• <b>Mejoras (Upgrades):</b> Subir un servidor a Tier 2 o Tier 3 <b>repara automáticamente el 100% de su salud</b> y aumenta su vida máxima.</div>
        <div>• <b>Ransomware [LOCK]:</b> Los crypters bloquean servidores en jaulas criptográficas. Repáralos o destrúyelo para liberarlos.</div>
      </div>
    `
  },
  {
    id: 'combat',
    title: '4. Foco Manual & Habilidades DevOps',
    icon: 'zap',
    content: `
      <h3 class="text-sm font-bold text-purple-400 font-heading mb-2">Comandos de Emergencia y Ataque Manual</h3>
      <div class="space-y-2 text-xs text-slate-300">
        <div class="p-3 bg-black/60 border border-purple-500/20 rounded-xl">
          <div class="text-purple-400 font-bold font-heading mb-1">[TARGET LOCK] Foco Manual de Ataque (Clic Derecho):</div>
          <div>Haz <b>Clic Derecho</b> en cualquier enemigo o sector del mapa para activar el <b>Target Focus</b>. Todas las torres en rango concentrarán su fuego inmediatamente en ese objetivo durante 5 segundos.</div>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <div class="p-2.5 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-center">
            <div class="text-cyan-400 font-bold font-code">[Q] Auto-Scale</div>
            <div class="text-xs text-slate-400 mt-1">Duplica la cadencia de tiro por 6s.</div>
          </div>
          <div class="p-2.5 bg-orange-950/40 border border-orange-500/30 rounded-xl text-center">
            <div class="text-orange-400 font-bold font-code">[W] DDoS Shield</div>
            <div class="text-xs text-slate-400 mt-1">El Core absorbe 5 pérdidas sin daño.</div>
          </div>
          <div class="p-2.5 bg-red-950/40 border border-red-500/30 rounded-xl text-center">
            <div class="text-red-400 font-bold font-code">[E] kill -9 EMP</div>
            <div class="text-xs text-slate-400 mt-1">Stun y daño masivo a toda la pantalla.</div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'synergies',
    title: '5. Sinergias & Arquitectura en Capas',
    icon: 'mesh',
    content: `
      <h3 class="text-sm font-bold text-indigo-400 font-heading mb-2">Diseño de Arquitectura Resiliente</h3>
      <p class="text-xs text-slate-300 leading-relaxed mb-3">
        Colocar patrones de arquitectura complementarios cerca genera <b>Sinergias de Red</b> conectadas por cables de bus de datos amarillos:
      </p>
      <div class="space-y-2 text-xs text-slate-300">
        <div class="p-2.5 bg-black/60 border border-white/10 rounded-xl flex items-center justify-between">
          <span class="text-yellow-400 font-bold">API Gateway + Redis Cache:</span>
          <span class="text-slate-300">Pulsos de caché activan disparos críticos automáticos en el Gateway.</span>
        </div>
        <div class="p-2.5 bg-black/60 border border-white/10 rounded-xl flex items-center justify-between">
          <span class="text-cyan-400 font-bold">Load Balancer + Kafka Queue:</span>
          <span class="text-slate-300">Alimentación acelerada que aumenta el radio de explosión en un 35%.</span>
        </div>
        <div class="p-2.5 bg-black/60 border border-white/10 rounded-xl flex items-center justify-between">
          <span class="text-orange-400 font-bold">WAF Firewall + Circuit Breaker:</span>
          <span class="text-slate-300">Enemigos aturdidos reciben +50% de daño láser adicional.</span>
        </div>
        <div class="p-2.5 bg-black/60 border border-white/10 rounded-xl flex items-center justify-between">
          <span class="text-indigo-400 font-bold">Service Mesh Envoy:</span>
          <span class="text-slate-300">Aura mTLS que otorga +25% de daño y +15% de velocidad a todas las torres cercanas.</span>
        </div>
      </div>
    `
  }
];
