// ============================================
// TOWERS - Instantiation Factory
// ============================================

const TowerFactory = {
  create(type, x, y) {
    switch (type) {
      case 'loadbalancer':
        return new LoadBalancerTower(x, y);
      case 'circuitbreaker':
        return new CircuitBreakerTower(x, y);
      case 'apigateway':
        return new ApiGatewayTower(x, y);
      case 'cache':
        return new CacheTower(x, y);
      case 'waf':
        return new WafTower(x, y);
      case 'messagequeue':
        return new MessageQueueTower(x, y);
      case 'cdn':
        return new CdnTower(x, y);
      case 'database':
        return new DatabaseTower(x, y);
      case 'servicemesh':
        return new ServiceMeshTower(x, y);
      case 'honeypot':
        return new HoneypotTower(x, y);
      default:
        return new Tower(x, y, TOWER_CONFIG[type] || TOWER_CONFIG.loadbalancer);
    }
  }
};
