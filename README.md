# Architect Tower Defense 

> Tower Defense educativo sobre DevOps, patrones de arquitectura de software, resiliencia y ciberseguridad.

![HTML5 Canvas](https://img.shields.io/badge/HTML5-Canvas-orange) ![Vanilla JS](https://img.shields.io/badge/JavaScript-Vanilla-yellow) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8) ![Docker](https://img.shields.io/badge/Docker-Ready-blue) ![Tests](https://img.shields.io/badge/Tests-51%20Passing-brightgreen) ![License](https://img.shields.io/badge/License-MIT-green)

---

##  Tabla de Contenidos

- [Descripción](#-descripción)
- [Modos de Juego](#-modos-de-juego)
- [Sistema de Servidores (Torres)](#-sistema-de-servidores-torres)
- [Catálogo de Amenazas Cibernéticas](#-catálogo-de-amenazas-cibernéticas)
- [Radar Táctico & Telemetría en Tiempo Real](#-radar-táctico--telemetría-en-tiempo-real)
- [Sistemas Educativos & RCA Quizzes](#-sistemas-educativos--rca-quizzes)
- [Despliegue con Docker](#-despliegue-con-docker)
- [Pruebas Automatizadas](#-pruebas-automatizadas)
- [Controles del Juego](#-controles-del-juego)

---

##  Descripción

**Architect Tower Defense** es un juego de estrategia y simulación técnica en canvas 2D donde proteges el **Core central de infraestructura** contra oleadas invasoras de amenazas cibernéticas en 360 grados.

Cada servidor desplegable representa un patrón de arquitectura real (Load Balancer, Circuit Breaker, API Gateway, Redis Cache, WAF, Kafka Queue, Edge CDN, Database Sharding, Service Mesh Envoy, Honeypot), y cada atacante simula un vector de explotación real (SYN Flood, Memory Leak, Inyecciones SQL, Ataques Man-in-the-Middle, Gusanos Polimórficos, Exploits Spectre y Prompt Injections).

---

##  Modos de Juego

### 1.  Modo Campaña Historia (7 Capítulos Interactivos)
Una experiencia narrativa con toma de decisiones estratégicas que modifican tus recursos y ventajas en batalla:
- **Capítulo I:** *El Lanzamiento del Monolito (Black Friday)* — Elena Vance (VP Infraestructura).
- **Capítulo II:** *Falla en Cascada & La Malla Activa-Activa* — Alex Chen (Incident Commander).
- **Capítulo III:** *Guerra Cibernética L7 & La Red Edge* — Marcus Vance (CISO).
- **Capítulo IV:** *Infiltración Zero-Trust & Kubernetes* — Dra. Samantha Ortiz (Criptografía).
- **Capítulo V:** *Man-in-the-Middle & Supply Chain Threat* — Viktor Kross (Red Team Lead).
- **Capítulo VI:** *Vulnerabilidad Spectre & Crisis de Memoria* — Dra. Aris Thorne (Computación Cuántica).
- **Capítulo VII:** *Rootkit Apex: Protocolo Fin del Mundo* — Directorio Ejecutivo & Comando Global.

### 2.  Modo Libre / Sandbox de Topologías
Selecciona entre 5 topologías de red perimetral:
- **Data Center Central:** Perímetro concéntrico DMZ en 360°.
- **Malla Activa-Activa:** Dos centros de datos unidos por un haz láser de sincronización de datos.
- **Cloud Edge PoPs:** 4 nodos satélite perimetrales que generan presupuesto continuo.
- **Kubernetes Chaos Cluster:** Pods de orquestación con aceleración de disparo por cuadrante.
- **Fortaleza Cuántica Zero-Trust:** Brechas cuánticas aleatorias y portales de distorsión.

---

##  Sistema de Servidores (Torres)

| Módulo | Tipo | Costo | Rango | Rol de Arquitectura | Sinergias |
|---|---|---|---|---|---|
| **Load Balancer** | LB | $140 | 150px | Dispersión de carga 360° | API Gateway, Kafka |
| **Circuit Breaker** | CB | $200 | 130px | Descargas de alto voltaje y stuns | WAF, Load Balancer |
| **API Gateway** | AG | $170 | 160px | Rate Limiting y daño crítico L7 | Redis Cache, CDN |
| **Redis Cache** | CA | $120 | 120px | Aura criogénica de ralentización | Database, Gateway |
| **WAF Firewall** | WAF | $240 | 150px | Haz continuo que derrite escudos | Circuit Breaker, CDN |
| **Kafka Queue** | MQ | $220 | 145px | Artillería pesada con explosión en área | Database, Load Balancer |
| **Edge CDN Node** | CDN | $290 | 260px | Francotirador de largo alcance | WAF, API Gateway |
| **Database Shard** | DB | $250 | 125px | Generación de presupuesto ($20/5s) + Ondas | Kafka, Redis Cache |
| **Service Mesh Envoy** | SM | $190 | 140px | Aura mTLS (+25% daño a aliados) | Todas las torres |
| **Honeypot Decoy** | HP | $130 | 160px | Señuelo de alta vida + Detonación EMP | Service Mesh |

---

##  Catálogo de Amenazas Cibernéticas

1. **GET Request (`GET`):** Petición HTTP estándar de lectura.
2. **POST Payload (`POST`):** Tráfico pesado que lanza proyectiles de corrupción.
3. **WebSocket Stream (`WS`):** Ráfagas veloces de alta frecuencia.
4. **Botnet Crawler (`BOT`):** Enjambre coordinado que aturde la cadencia de torres.
5. **SQL Injection (`SQLi`):** Se fragmenta en sub-consultas al morir.
6. **Zero-Day Exploit (`0-DAY`):** Inmune a ralentizaciones y con camuflaje óptico.
7. **Ransomware Crypter (`CRYP`):** Proyecta escudos sobre aliados y encripta torres.
8. **Man-In-The-Middle (`MITM`):** Campo electromagnético que ralentiza el disparo de servidores.
9. **Polymorphic Worm (`WORM`):** Gusano autorregenerativo (+1.5% HP/s).
10. **Supply Chain Poisoning (`TRJN`):** Derrama charcos corrosivos que dañan servidores.
11. **Spectre CPU Exploit (`SPEC`):** Teletransportación cuántica instantánea hacia adelante.
12. **AI Prompt Injection (`LLM`):** Token neural que se divide en 3 sub-tokens de alucinación.
13. **Jefes Supremos:** Titan SYN Flood (W5), Memory Leak Colossus (W10), Botnet Overlord (W15), Rootkit Apex Supremo (W20).

---

##  Radar Táctico & Telemetría en Tiempo Real

- **Haz CRT de Fósforo:** Barrido continuo con persistencia de estela.
- **Alarma Estroboscópica:** Detección de peligro inminente cuando amenazas entran a menos de 180px del Core.
- **Target Lock Táctico:** Foco manual con clic derecho y trazado de vector láser.
- **Telemetría Grafana:** Indicador RPS, Latencia P99, SLA 99.99% y conteo de amenazas por sector.

---

##  Despliegue con Docker

### Con Docker Compose:
```bash
docker compose up --build -d
```
El juego estará disponible inmediatamente en `http://localhost:8080`.

### Con Dockerfile estándar:
```bash
# Construir imagen optimizada en multi-stage
docker build -t architect-td:latest .

# Ejecutar contenedor
docker run -d -p 8080:80 --name architect-td-game architect-td:latest
```

---

##  Pruebas Automatizadas

El proyecto incluye una suite de pruebas automatizadas que valida la sintaxis de los 39 módulos, la integridad de los 10 patrones de servidores, 16 tipos de enemigos, 7 capítulos de historia y cuestionarios RCA:

```bash
npm test
# O directamente con node:
node tests/suite.test.js
```

---

## Controles del Juego

- **Click Izquierdo:** Colocar servidor / Seleccionar servidor en campo / Recoger loot.
- **Click Derecho:** Target Focus (Foco manual de ataque concentrado).
- **R:** Reparar en caliente el servidor seleccionado.
- **Q / W / E:** Habilidades DevOps activas (Auto-Scale, DDoS Shield, kill -9 EMP).
- **Teclas 1 - 0:** Selección rápida de servidores de la tienda.
- **Enter:** Iniciar oleada anticipadamente durante la fase de preparación (+$ bonus).
- **Espacio:** Pausar / Reanudar el juego.
- **Esc:** Deseleccionar servidor o cerrar modales.

---

## 📄 Licencia

Distribuido bajo la Licencia MIT. Desarrollado con ❤️ para la comunidad de ingeniería de software, DevOps y ciberseguridad.
