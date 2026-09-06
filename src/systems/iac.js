// ============================================
// SYSTEMS - Live Infrastructure as Code (IaC) Generator
// Generates real docker-compose.yml, Kubernetes manifests & Terraform from placed towers
// ============================================

const IaCGenerator = {
  // Inspect placed towers and build inventory
  getInventory() {
    const counts = {};
    if (GameState.engine && GameState.engine.towers) {
      GameState.engine.towers.forEach(t => {
        counts[t.type] = (counts[t.type] || 0) + 1;
      });
    }
    return counts;
  },

  // Generate real Docker Compose file
  generateDockerCompose() {
    const inv = this.getInventory();
    const hasLB = inv.loadbalancer > 0;
    const hasCache = inv.cache > 0;
    const hasKafka = inv.messagequeue > 0;
    const hasDB = inv.database > 0;
    const hasGateway = inv.apigateway > 0;
    const hasWAF = inv.waf > 0;
    const hasMesh = inv.servicemesh > 0;

    let yaml = `# ===============================================\n`;
    yaml += `# Architect TD - Generated Infrastructure Stack\n`;
    yaml += `# Generated from cluster: ${GameState.currentLevel ? GameState.currentLevel.name : 'Data Center Central'}\n`;
    yaml += `# Active Servers: ${Object.values(inv).reduce((a, b) => a + b, 0)} modules\n`;
    yaml += `# ===============================================\n\n`;
    yaml += `version: '3.8'\n\n`;
    yaml += `services:\n`;

    if (hasGateway || hasLB) {
      yaml += `  ingress-gateway:\n`;
      yaml += `    image: nginx:alpine\n`;
      yaml += `    container_name: arch_ingress_proxy\n`;
      yaml += `    ports:\n`;
      yaml += `      - "80:80"\n`;
      yaml += `      - "443:443"\n`;
      yaml += `    restart: always\n`;
      yaml += `    volumes:\n`;
      yaml += `      - ./nginx/conf.d:/etc/nginx/conf.d:ro\n`;
      yaml += `    depends_on:\n`;
      if (hasLB) yaml += `      - load-balancer\n`;
      if (hasCache) yaml += `      - redis-cache\n`;
      yaml += `    networks:\n`;
      yaml += `      - arch-network\n\n`;
    }

    if (hasLB) {
      yaml += `  load-balancer:\n`;
      yaml += `    image: haproxy:alpine\n`;
      yaml += `    container_name: arch_load_balancer\n`;
      yaml += `    restart: unless-stopped\n`;
      yaml += `    environment:\n`;
      yaml += `      - BALANCE_ALGORITHM=roundrobin\n`;
      yaml += `      - MAX_CONNECTIONS=10000\n`;
      yaml += `    networks:\n`;
      yaml += `      - arch-network\n\n`;
    }

    if (hasWAF) {
      yaml += `  waf-firewall:\n`;
      yaml += `    image: owasp/modsecurity-crs:apache\n`;
      yaml += `    container_name: arch_waf_inspector\n`;
      yaml += `    environment:\n`;
      yaml += `      - PARANOIA=2\n`;
      yaml += `      - BLOCKING_PARANOIA=2\n`;
      yaml += `    networks:\n`;
      yaml += `      - arch-network\n\n`;
    }

    if (hasCache) {
      yaml += `  redis-cache:\n`;
      yaml += `    image: redis:7-alpine\n`;
      yaml += `    container_name: arch_redis_cache\n`;
      yaml += `    command: ["redis-server", "--maxmemory", "512mb", "--maxmemory-policy", "allkeys-lru"]\n`;
      yaml += `    ports:\n`;
      yaml += `      - "6379:6379"\n`;
      yaml += `    networks:\n`;
      yaml += `      - arch-network\n\n`;
    }

    if (hasKafka) {
      yaml += `  zookeeper:\n`;
      yaml += `    image: confluentinc/cp-zookeeper:7.5.0\n`;
      yaml += `    environment:\n`;
      yaml += `      ZOOKEEPER_CLIENT_PORT: 2181\n`;
      yaml += `      ZOOKEEPER_TICK_TIME: 2000\n`;
      yaml += `    networks:\n`;
      yaml += `      - arch-network\n\n`;
      yaml += `  kafka-broker:\n`;
      yaml += `    image: confluentinc/cp-kafka:7.5.0\n`;
      yaml += `    container_name: arch_kafka_queue\n`;
      yaml += `    depends_on:\n`;
      yaml += `      - zookeeper\n`;
      yaml += `    ports:\n`;
      yaml += `      - "9092:9092"\n`;
      yaml += `    environment:\n`;
      yaml += `      KAFKA_BROKER_ID: 1\n`;
      yaml += `      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181\n`;
      yaml += `      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1\n`;
      yaml += `    networks:\n`;
      yaml += `      - arch-network\n\n`;
    }

    if (hasDB) {
      yaml += `  primary-db-shard:\n`;
      yaml += `    image: postgres:16-alpine\n`;
      yaml += `    container_name: arch_postgres_shard\n`;
      yaml += `    environment:\n`;
      yaml += `      POSTGRES_DB: architect_production\n`;
      yaml += `      POSTGRES_USER: devops_admin\n`;
      yaml += `      POSTGRES_PASSWORD: ${"${DB_SECRET_PASSWORD:-SecureP@ssw0rd!}"}\n`;
      yaml += `    volumes:\n`;
      yaml += `      - arch_db_data:/var/lib/postgresql/data\n`;
      yaml += `    networks:\n`;
      yaml += `      - arch-network\n\n`;
    }

    if (hasMesh) {
      yaml += `  service-mesh-envoy:\n`;
      yaml += `    image: envoyproxy/envoy:v1.28.0\n`;
      yaml += `    container_name: arch_envoy_sidecar\n`;
      yaml += `    command: ["-c", "/etc/envoy/envoy.yaml"]\n`;
      yaml += `    networks:\n`;
      yaml += `      - arch-network\n\n`;
    }

    // Default microservice core
    yaml += `  app-core-service:\n`;
    yaml += `    image: node:20-alpine\n`;
    yaml += `    container_name: arch_app_core\n`;
    yaml += `    environment:\n`;
    yaml += `      NODE_ENV: production\n`;
    yaml += `      PORT: 3000\n`;
    yaml += `    networks:\n`;
    yaml += `      - arch-network\n\n`;

    yaml += `networks:\n`;
    yaml += `  arch-network:\n`;
    yaml += `    driver: bridge\n`;

    if (hasDB) {
      yaml += `\nvolumes:\n`;
      yaml += `  arch_db_data:\n`;
    }

    return yaml;
  },

  // Generate Kubernetes Manifest
  generateKubernetes() {
    const inv = this.getInventory();
    return `# ===============================================
# Architect TD - Kubernetes Production Cluster Manifests
# ===============================================
apiVersion: apps/v1
kind: Deployment
metadata:
  name: architect-core-deployment
  labels:
    app: architect-core
spec:
  replicas: ${inv.loadbalancer ? 3 * inv.loadbalancer : 2}
  selector:
    matchLabels:
      app: architect-core
  template:
    metadata:
      labels:
        app: architect-core
    spec:
      containers:
      - name: core-api
        image: architect-core:latest
        resources:
          limits:
            cpu: "500m"
            memory: "512Mi"
          requests:
            cpu: "250m"
            memory: "256Mi"
        ports:
        - containerPort: 3000
        livenessProbe:
          httpGet:
            path: /healthz
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: architect-service
spec:
  type: LoadBalancer
  selector:
    app: architect-core
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: architect-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: architect-core-deployment
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 75
`;
  }
};

// Global exposure
if (typeof window !== 'undefined') {
  window.IaCGenerator = IaCGenerator;
}
if (typeof module !== 'undefined') {
  module.exports = { IaCGenerator };
}
