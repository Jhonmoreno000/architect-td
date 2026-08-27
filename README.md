# Architect Tower Defense

> Tower Defense educativo sobre DevOps, arquitectura de software y ciberseguridad. Aprende patrones reales jugando.

![HTML5 Canvas](https://img.shields.io/badge/HTML5-Canvas-orange) ![Vanilla JS](https://img.shields.io/badge/JavaScript-Vanilla-yellow) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8) ![License](https://img.shields.io/badge/License-MIT-green)

---

## Tabla de Contenidos

- [Descripción](#descripcion)
- [Caracteristicas](#caracteristicas)
- [Arquitectura del Código](#arquitectura-del-codigo)
- [Sistema de Torre](#sistema-de-torres)
- [Sistema de Enemigos](#sistema-de-enemigos)
- [Sistemas Nuevos (v2)](#sistemas-nuevos-v2)
- [Optimizaciones de Rendimiento](#optimizaciones-de-rendimiento)
- [Instalación y Ejecución](#instalacion-y-ejecucion)
- [Estructura de Archivos](#estructura-de-archivos)
- [Controles](#controles)
- [Configuración](#configuracion)
- [Roadmap](#roadmap)

---

## Descripción

**Architect Tower Defense** es un juego de defensa de torres en canvas 2D donde el jugador protege un **core central de infraestructura** contra oleadas de amenazas cibernéticas que atacan desde los 4 bordes del mapa (360°).

Cada torre representa un patrón real de arquitectura de software (Load Balancer, Circuit Breaker, API Gateway, etc.) y cada enemigo representa un tipo de amenaza real (DDoS, SQL Injection, Zero-Day Exploit, Ransomware, etc.).

---

## Caracteristicas

### Gameplay
- **20 oleadas** con dificultad progresiva (+ modo Endless)
- **4 direcciones de ataque** (360°) — enemigos aparecen por todos los bordes
- **Sistema de combos** — kill streaks dan bonus de score progresivo (hasta 2.0x)
- **Loot drops interactivos** — Memory Dump ($50), Energy (CD -15s), Overclock (1.5x fire rate)
- **5 habilidades DevOps** — Autoscale, Shield, Reboot, Focus Target, Early Call
- **4 dificultades** — Staging, Production, Chaos Engineering, Zero Trust
- **Quiz de incidentes** cada 3 oleadas (educativo)
- **Save system** — Guarda progreso en localStorage

### Torre (10 tipos)
| Torre | Tipo | Costo | Patron de Arquitectura |
|-------|------|-------|------------------------|
| Load Balancer | Distribuidor | $150 | Distribuye daño entre enemigos cercanos |
| Circuit Breaker | Cascada | $180 | Frena enemigos (slow 60%) |
| API Gateway | Filtrador | $200 | +50% daño vs Heavy/Fast |
| Cache Redis | Soporte | $120 | Buffa torres cercanas (+30% damage) |
| CDN Edge | Sniper | $250 | Daño alto, rango largo, fire rate bajo |
| Auto-Scaler | Scaled Replicas | $300 | Dispara proyectiles múltiples |
| Load Shedder | Lanzador | $170 | Lanza enemigos hacia atrás |
| Microservice | AoE Chain | $220 | Daño en área con splash |
| Database Primary | Heavy | $280 | Daño masivo, splash grande |
| Kubernetes Pod | Drone | $260 | Sigue y daña enemigos cercanos |

### Enemigos (8 tipos)
| Enemigo | Tipo | Habilidad Especial |
|---------|------|-------------------|
| Normal Request | Basico | Ninguna |
| Fast Request | Rapido | Velocidad alta |
| Heavy Request | Tanque | Alta salud, ataca torres |
| Botnet Swarm | Grupo | Genera clones al morir |
| Malicious Payload | Daño | 3x dano al core |
| Zero-Day Exploit | Stealth | Se vuelve invisible temporalmente |
| Ransomware | Lock | Encripta torres (las desactiva) |
| Quantum Breach | Portal | Aparece en el mapa |

### Bosses (4)
- **Wave 5**: SYN Flood Generator
- **Wave 10**: Memory Leak Hydra
- **Wave 15**: Botnet Overlord
- **Wave 20**: Apex DDoS (Final Boss con clones)

---

## Arquitectura del Código

El juego sigue un patrón **ECS-like** (Entity-Component-System) vanilla:

```
┌─────────────────────────────────────────────────┐
│                  GameEngine                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  Towers  │  │ Enemies  │  │Projectiles│      │
│  └──────────┘  └──────────┘  └──────────┘      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │Particles │  │  Effects │  │  LootDrops│      │
│  └──────────┘  └──────────┘  └──────────┘      │
│                                                  │
│  update(dt) → render() ← requestAnimationFrame  │
└─────────────────────────────────────────────────┘
         ↓              ↓              ↓
    CombatSystem    WaveSystem    AchievementSystem
    MinimapSystem   TelemetrySystem
```

**Flujo del Game Loop:**
1. `requestAnimationFrame` llama a `loop()`
2. Calcula delta time normalizado (60fps base)
3. `update(dt)` → Actualiza torres, enemigos, proyectiles, partículas
4. `render()` → Dibuja todo en el canvas
5. `WaveSystem.update(dt)` → Maneja spawns de oleadas

---

## Sistemas Nuevos (v2)

### Minimap Tactico (`src/systems/minimap.js`)
- Vista global del campo de batalla en 160x160px
- Muestra: core, torres, enemigos, focus target
- **Radar sweep** animado cuando hay enemigos
- **Click interactivo**: Click en minimap activa Focus Target

### Sistema de Logros (`src/systems/achievements.js`)
- **18 logros** desbloqueables
- Notificaciones animadas con fade in/out
- +100 puntos de score por logro
- Ejemplos: First Blood, Chain Reaction (x10 combo), Full Stack Architect (todos los tipos de torre)

### Kill Tracking
- Cada torre trackea sus kills y daño total
- Tooltip de la tienda muestra stats en tiempo real
- Wave progress bar en el HUD

---

## Optimizaciones de Rendimiento

### Swap-and-Pop (O(1) elimination)
Todos los arrays de entidades (enemies, projectiles, particles, floatingTexts, lootDrops) usan **swap-and-pop** en vez de `Array.splice()`:

```javascript
// ANTES: O(n) por shift de elementos
array.splice(index, 1);

// DESPUES: O(1) - swap con último elemento y reducir length
array[index] = array[array.length - 1];
array.length--;
```

### Cached Background Gradient
El gradiente radial de fondo se crea una vez y se cachea:
```javascript
if (this._cachedBgKey !== bgKey) {
  // Solo recrea cuando cambia core position o canvas size
  this._cachedBgGradient = ctx.createRadialGradient(...);
}
```

### Squared Distance Comparisons
Hit detection y range checks usan distancia²:
```javascript
// ANTES: Math.sqrt en cada comparación
const dist = Math.sqrt(dx*dx + dy*dy);
if (dist < threshold) { ... }

// DESPUES: Compara dist² (evita sqrt)
const distSq = dx*dx + dy*dy;
if (distSq < threshold * threshold) { ... }
```

### Reduced Object Allocation
- Proyectiles: trail como array plano `[x1,y1, x2,y2]` en vez de objetos
- Enemigos: `lastTargetX/Y` directos en vez de `this.lastTargetPos = {x,y}`
- Core position cacheada en update loop

---

## Instalación y Ejecución

### Requisitos
- Node.js 14+ (para Tailwind CSS)
- Navegador moderno (Chrome, Firefox, Edge, Safari)

### Instalación
```bash
git clone https://github.com/Jhonmoreno000/architect-td.git
cd architect-td
npm install
```

### Desarrollo
```bash
npm run dev        # Watch mode - recompila CSS automáticamente
```
Abrir `index.html` en el navegador.

### Build Producción
```bash
npm run build      # CSS minificado
```

### Directo (sin build tools)
Simplemente abre `index.html` en tu navegador. El CSS pre-compilado ya está en `src/styles.css`.

---

## Estructura de Archivos

```
architect-td/
├── index.html                    # Punto de entrada HTML
├── package.json                  # Dependencias (tailwindcss)
├── src/
│   ├── input.css                 # Tailwind directives + estilos custom
│   ├── styles.css                # CSS compilado (generado)
│   ├── config.js                 # GAME_CONFIG, TOWER_CONFIG, ENEMY_CONFIG
│   ├── core/
│   │   ├── engine.js             # GameEngine - motor principal
│   │   ├── audio.js              # AudioSystem - efectos de sonido
│   │   ├── incidents.js          # IncidentSystem - quiz educativo
│   │   └── telemetry.js          # TelemetrySystem - métricas de gameplay
│   ├── entities/
│   │   ├── base.js               # Entity - clase base
│   │   ├── request.js            # Request - enemigos con IA
│   │   ├── projectile.js         # Projectile - proyectiles optimizados
│   │   ├── particle.js           # Particle - sistema de partículas
│   │   ├── floating-text.js      # FloatingText - texto flotante de daño
│   │   └── loot-drop.js          # LootDrop - drops coleccionables
│   ├── systems/
│   │   ├── combat.js             # CombatSystem - daño, combos, habilidades
│   │   ├── wave.js               # WaveSystem - orquestación de oleadas
│   │   ├── minimap.js            # MinimapSystem - radar táctico
│   │   └── achievements.js       # AchievementSystem - 18 logros
│   ├── towers/
│   │   ├── base.js               # TowerBase - clase base de torres
│   │   ├── factory.js            # TowerFactory - creación de torres
│   │   └── [10 tower types].js   # Implementaciones individuales
│   ├── grid/
│   │   ├── grid.js               # GridSystem - manejo de grid
│   │   └── levels.js             # Level definitions (4 niveles)
│   └── ui/
│       ├── shop.js               # Shop - tienda de torres con tooltips
│       ├── hud.js                # HUD - barra de vida, dinero, score
│       ├── menus.js              # Menús y pantallas
│       └── controls.js           # Controles del juego
```

---

## Controles

| Tecla/Accion | Funcion |
|--------------|---------|
| Click en tienda | Seleccionar torre para colocar |
| Click en grid | Colocar torre seleccionada |
| Click en torre | Seleccionar/inspeccionar torre |
| Click en minimap | Activar Focus Target |
| `Esc` | Deseleccionar torre |
| `1-0` | Seleccionar torre por teclado |
| Boton "Call Wave" | Llamada anticipada (+$$ bonus) |
| Boton "Collect" | Recolectar loot drops cercanos |
| Habilidad (1/2/3) | Autoscale / Shield / Reboot |

---

## Configuracion

### Velocidad del Juego
El `speedMultiplier` en `GameEngine` controla la velocidad:
```javascript
engine.speedMultiplier = 1;  // Normal
engine.speedMultiplier = 2;  // 2x rapido
```

### Dificultad
Definida en `config.js` → `DIFFICULTY_SETTINGS`:
- **Staging**: 1.0x HP, 1.0x velocidad
- **Production**: 1.5x HP, 1.2x velocidad
- **Chaos Engineering**: 2.0x HP, 1.4x velocidad
- **Zero Trust**: 2.8x HP, 1.6x velocidad

---

## Roadmap

### v1.0 (Actual)
- [x] 10 tipos de torre con upgrades
- [x] 8 tipos de enemigos + 4 bosses
- [x] 4 niveles con mecanicas unicas
- [x] Sistema de combate con combos
- [x] Quiz de incidentes educativo
- [x] Save/load system

### v2.0 (Desarrollo)
- [x] Minimap tactico interactivo
- [x] Sistema de 18 achievements
- [x] Kill tracking por torre
- [x] Wave progress bar
- [x] Tooltips de torres con stats
- [x] Optimizaciones de rendimiento (swap-and-pop, cached gradient, squared distance)
- [ ] Animaciones de entrada/salida de torres
- [ ] Efectos de particulas mejorados
- [ ] Sound design expandido
- [ ] Mobile touch controls

---

## Autores

- **Jhon Moreno** — Desarrollador original ([@Jhonmoreno000](https://github.com/Jhonmoreno000))
- **DAVIDVLEZ-DEVELOPER** — Contribuidor v2 ([@DAVIDVLEZ-DEVELOPER](https://github.com/DAVIDVLEZ-DEVELOPER))

---

## Licencia

MIT License - Ver `LICENSE` para detalles.
