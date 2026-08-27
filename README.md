#  Architect Tower Defense (Architect TD)

> **Juego táctico de defensa perimetral 360° y simulador pedagógico de arquitectura de software, DevOps, resiliencia y ciberseguridad.**

![License](https://img.shields.io/badge/License-MIT-green.svg)
![HTML5](https://img.shields.io/badge/Engine-HTML5%20Canvas%202D-orange.svg)
![Tailwind](https://img.shields.io/badge/TailwindCSS-v3.4-cyan.svg)
![Docker](https://img.shields.io/badge/Docker-Multi--stage-blue.svg)
![Audio](https://img.shields.io/badge/Audio-Web%20Audio%20API-purple.svg)

---

##  Descripción General

**Architect Tower Defense** es un juego de estrategia y simulación en tiempo real donde asumes el rol de **Staff SRE / Principal Architect**. 

A diferencia de los tower defense tradicionales con caminos fijos unidimensionales, las amenazas cibernéticas (peticiones HTTP maliciosas, ataques DDoS, gusanos SQLi, ransomware y exploits Zero-Day) **invaden en 360 grados desde todos los puertos perimetrales de la red** (Internet Gateways, Darknets, Cloud Edges y VPNs comprometidas).

Tu misión es diseñar una arquitectura resistente en capas (**Defense-in-Depth**), gestionar presupuestos ajustados, reparar servidores bajo fuego en caliente y resolver incidentes reales de producción mediante análisis de causa raíz (**Root Cause Analysis**).

---

##  Inicio Rápido con Docker

El proyecto cuenta con una imagen multi-stage ultra ligera basada en `nginx:alpine` (menos de 25MB) lista para desplegarse en segundos.

### Usando Docker Compose (Recomendado)

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd architect-td

# 2. Levantar el contenedor en segundo plano
docker compose up -d

# 3. Abre en tu navegador
# http://localhost:8080
```

### Usando Docker CLI directamente

```bash
# Construir la imagen Docker
docker build -t architect-td:latest .

# Ejecutar el contenedor en el puerto 8080
docker run -d -p 8080:80 --name architect_td architect-td:latest
```

---

##  Desarrollo Local (Sin Docker)

```bash
# 1. Instalar dependencias
npm install

# 2. Compilar Tailwind CSS
npm run build

# 3. Servir localmente
python -m http.server 8080
# O con Node:
npx serve .
```

---

##  Mecánicas Principales de Juego

1. ** Invasión Perimetral 360°:** Los enemigos aparecen aleatoriamente en los bordes de la red pública y avanzan hacia el Core central con física de enjambre orgánico y evasión suave de obstáculos.
2. ** Durabilidad y Reparación de Servidores `[R]`:** Cada servidor tiene puntos de salud (HP). Si los atacantes lo bombardean hasta 0 HP, queda **OFFLINE (500 Error)** y deja de disparar hasta ser reparado o mejorado.
3. ** Foco de Ataque Manual (Target Lock - Clic Derecho):** Haz clic derecho en cualquier amenaza para concentrar el fuego de todas las torres cercanas durante 5 segundos.
4. ** Incidentes SRE / PagerDuty (RCA Quizzes):** Cada 3 oleadas se desata un incidente arquitectónico real (*Cache Stampede, Cascading Failures, SYN Floods, etc.*) con recompensas y buffs si eliges la solución técnica adecuada.
5. ** Dashboard de Observabilidad en Vivo:** Métricas en tiempo real de tráfico (RPS), latencia P99 (ms) y SLA Uptime (99.999%).
6. ** Microchips y Orbes Coleccionables:** Enemigos destruidos sueltan *Memory Dumps (+$50)*, *Celdas de Energía (-15s Cooldowns)* y *Turbos de Overclocking*.
7. ** Habilidades Activas de DevOps:**
   - **`[Q]` Auto-Scale HPA:** Duplica la velocidad de disparo de todos los servidores por 6s.
   - **`[W]` DDoS Shield:** El Core absorbe 5 pérdidas sin reducir vidas.
   - **`[E]` kill -9 EMP:** Pulso destructivo que aturde a todas las amenazas en pantalla.

---

##  Módulos de Arquitectura (Torres Defensivas)

| Módulo | Tipo | Icono | Rol / Patrón de Arquitectura | Herramientas Reales |
| :--- | :--- | :---: | :--- | :--- |
| **Load Balancer** | Control | `LB` | Ralentiza en cono y dispersa tráfico en múltiples rutas | Nginx, HAProxy, AWS ALB |
| **Circuit Breaker** | Burst | `CB` | Descargas de alto voltaje con aturdimiento (Stun) | Netflix Hystrix, Resilience4j |
| **API Gateway** | Rapid | `AG` | Cadencia rápida. Críticos aumentados contra POST y WS | Kong Gateway, Envoy, Apigee |
| **In-Memory Cache** | Aura | `CA` | Aura pasiva de congelamiento y respuesta ultrarrápida | Redis, Memcached, Hazelcast |
| **App Firewall (WAF)** | Laser | `WAF` | Haz sostenido L7. Destruye escudos y derrite SQLi | Cloudflare WAF, AWS WAF, ModSecurity |
| **Kafka Queue (MQ)** | AOE | `MQ` | Acumula eventos en búfer y detona daño masivo en área | Apache Kafka, RabbitMQ, AWS SQS |
| **Edge CDN Node** | Sniper | `CDN` | Francotirador de larguísimo alcance y ultra-baja latencia | Cloudflare, Fastly, CloudFront |
| **Database Shard** | Economy | `DB` | Genera $20 cada 5s y emite ondas sísmicas de datos | PostgreSQL Sharding, CockroachDB |
| **Service Mesh** | Buffer | `SM` | Aura mTLS que otorga +25% de daño a servidores aliados | Istio, Envoy Proxy, Linkerd |
| **Honeypot Decoy** | Magnet | `HP` | Servidor trampa que atrae magnéticamente al enjambre | Snort, Honeyd, Cowrie |

---

##  Tipos de Amenazas Cibernéticas & Jefes

- **GET Request (`GET`):** Tráfico estándar de prueba con dardos L7.
- **POST Payload (`POST`):** Carga pesada blindada que lanza bombas de corrupción en área.
- **WebSocket Stream (`WS`):** Flujo de alta velocidad con ráfagas continuas.
- **Botnet Crawler (`BOT`):** Inyecta troyanos que entorpecen la cadencia de tus torres.
- **SQL Injection (`SQLi`):** Dispara consultas corruptas; al morir se fragmenta en 2 sub-queries.
- **Zero-Day Exploit (`0-DAY`):** Se vuelve invisible y camuflado periódicamente.
- **Ransomware Crypter (`CRYP`):** Escuda aliados y bloquea servidores en jaulas criptográficas.
- **Jefes de Incidente:**
  - *DDoS SYN Flood Titan (Volumétrico)*
  - *Memory Leak Colossus (Regenerativo)*
  - *Distributed Botnet Overlord (Invocador C2)*
  - *Zero-Day Rootkit Apex (Jefe Final - Rayo Orbital y Clones de Sombra)*

---

##  Topologías y Mecánicas de Nivel

1. **Nivel 1: El Data Center Central (Perímetro 360°)** - Defensa en capas concéntrica DMZ.
2. **Nivel 2: Malla Activa-Activa** - Haz láser continuo de sincronización de datos entre nodos que desintegra amenazas.
3. **Nivel 3: Cloud Edge (Nodos Satélite PoP)** - 4 Nodos PoP que generan +$25 de presupuesto extra por oleada si sobreviven.
4. **Nivel 4: Clúster de Kubernetes** - Pods de orquestación que aceleran la velocidad de fuego de cuadrantes completos.
5. **Nivel 5: Fortaleza Cuántica Zero-Trust** - Portales cuánticos de distorsión que infiltran enemigos en el interior de tu red.

---

##  Atajos de Teclado y Controles

| Tecla | Acción |
| :---: | :--- |
| **1 - 9, 0** | Seleccionar módulos de la tienda (LB, CB, AG, CA, WAF, MQ, CDN, DB, SM, HP) |
| **Clic Izquierdo** | Colocar servidor en casilla libre / Seleccionar servidor colocado |
| **Clic Derecho** | Fijar **Target Focus (Foco de Ataque Manual)** en enemigo o área |
| **`[R]`** | **Reparar en caliente** el servidor dañado seleccionado |
| **`[Q]`** | Habilidad DevOps: **Auto-Scale HPA (2x Cadencia)** |
| **`[W]`** | Habilidad DevOps: **Cloudflare DDoS Shield (Escudo Core)** |
| **`[E]`** | Habilidad DevOps: **kill -9 EMP (Stun + Daño Global)** |
| **`[Enter]`** | **Llamar Oleada Anticipada** durante la preparación para ganar bonus (+$) |
| **`[Espacio]`** | Pausar / Reanudar partida |
| **`[Esc]`** | Cancelar selección de torre / Cerrar modales |

---

##  Estructura del Proyecto

```
architect-td/
├── Dockerfile                # Configuración de compilación multi-stage y Nginx
├── docker-compose.yml        # Orquestación de servicios en Docker
├── nginx.conf                # Servidor web Nginx con gzip y security headers
├── package.json              # Dependencias y scripts de construcción Tailwind
├── tailwind.config.js        # Configuración de diseño y colores cyber
├── index.html                # Entrypoint HTML5 con telemetría y modales
└── src/
    ├── config/
    │   ├── codex.js          # Enciclopedia técnica de patrones y amenazas
    │   ├── guide.js          # Manual interactivo de entrenamiento
    │   ├── incidents.js      # Base de conocimientos de incidentes RCA
    │   ├── levels.js         # Topologías de niveles y mecánicas de entorno
    │   └── towers.js         # Balance de estadísticas de torres y enemigos
    ├── core/
    │   ├── audio.js          # Sintetizador procedural con Web Audio API
    │   └── engine.js         # Motor gráfico 2D con protección anti-crash
    ├── entities/
    │   ├── base.js           # Entidad base posicional y colisiones
    │   ├── enemy-projectile.js # Proyectiles y ataques hostiles
    │   ├── floating-text.js  # Textos flotantes y números de daño crítico
    │   ├── loot-drop.js      # Orbes vectoriales de datos recolectables
    │   ├── particle.js       # Sistema de chispas, humo y ondas de choque
    │   ├── projectile.js     # Balas, láseres y misiles de servidores
    │   └── request.js        # IA de enemigos 360°, habilidades y jefes
    ├── systems/
    │   ├── combat.js         # Motor de daño, combos y mitigación
    │   ├── grid.js           # Sistema de colocación libre y selección
    │   ├── incidents.js      # Despachador de cuestionarios SRE
    │   ├── telemetry.js      # Métricas en vivo estilo Grafana (RPS, P99, SLA)
    │   └── wave.js           # Gestor de oleadas, temporizadores e hordas
    ├── towers/
    │   ├── apigateway.js     # API Gateway
    │   ├── base.js           # Clase base de torre con durabilidad y HP
    │   ├── cache.js          # In-Memory Cache (Redis)
    │   ├── cdn.js            # Edge CDN Node
    │   ├── circuitbreaker.js # Circuit Breaker
    │   ├── database.js       # Database Sharding
    │   ├── factory.js        # Fábrica de instanciación de torres
    │   ├── honeypot.js       # Honeypot Decoy
    │   ├── loadbalancer.js   # Load Balancer
    │   ├── messagequeue.js   # Kafka Message Queue
    │   ├── servicemesh.js    # Service Mesh Envoy
    │   └── waf.js            # Web Application Firewall
    └── ui/
        ├── events.js         # Controladores de eventos del mouse y teclado
        ├── hud.js            # HUD superior, telemetría e inspector de torre
        └── shop.js           # Tienda de 10 módulos con atajos
```

---

## 📄 Licencia

Distribuido bajo la Licencia MIT. Consulta `LICENSE` para más información.
