// ============================================
// SYSTEMS - Open Grid & Free-form Architecture Placement Engine
// ============================================

const GridSystem = {
  canPlace(gx, gy) {
    if (!GameState.engine) return false;
    return GameState.engine.canPlaceTower(gx, gy);
  },

  getTowerAt(gx, gy) {
    if (!GameState.engine) return null;
    return GameState.engine.towers.find(t => t.gridX === gx && t.gridY === gy);
  },

  placeTower(type, gx, gy) {
    if (!GameState.engine) return false;

    // Check if clicking existing tower for inspection
    const existing = this.getTowerAt(gx, gy);
    if (existing) {
      GameState.selectPlacedTower(existing);
      return true;
    }

    if (!type || !this.canPlace(gx, gy)) return false;

    const def = TOWER_CONFIG[type];
    if (!def || GameState.money < def.cost) {
      AudioSystem.play('error');
      if (GameState.engine) {
        GameState.engine.addFloatingText(gx * GameState.engine.gridSize + 20, gy * GameState.engine.gridSize, 'PRESUPUESTO INSUFICIENTE', '#ff0055', 9);
      }
      return false;
    }

    GameState.money -= def.cost;
    const tower = TowerFactory.create(type, 0, 0);
    GameState.engine.placeTower(tower, gx, gy);

    // Track tower types placed
    if (GameState.statsTowersPlaced) {
      GameState.statsTowersPlaced.add(type);
      if (GameState.statsTowersPlaced.size >= 10 && typeof AchievementSystem !== 'undefined') {
        AchievementSystem.check('all_towers_placed');
      }
    }

    AudioSystem.play('build');
    if (GameState.engine) {
      GameState.engine.addParticles(gx * 40 + 20, gy * 40 + 20, def.color, 14, 'spark', 3.5);
      GameState.engine.addFloatingText(gx * 40 + 20, gy * 40, `-$${def.cost}`, '#ffeb3b', 10);
    }

    GameState.selectPlacedTower(tower);
    GameState.updateUI();
    return true;
  },

  upgradeTower(tower) {
    if (!tower) return false;
    return tower.upgrade();
  },

  sellTower(tower) {
    if (!tower || !GameState.engine) return false;
    const refund = tower.getSellValue();
    GameState.money += refund;
    GameState.score += Math.round(refund * 0.5);

    // Free the grid cell
    GameState.engine.grid[tower.gridY][tower.gridX] = 0;

    // Remove from engine tower array
    const idx = GameState.engine.towers.indexOf(tower);
    if (idx !== -1) {
      GameState.engine.towers.splice(idx, 1);
    }

    AudioSystem.play('coin');
    GameState.engine.addFloatingText(tower.x + tower.size / 2, tower.y - 10, `+$${refund} VENDIDA`, '#ec4899', 11, true);
    GameState.engine.addParticles(tower.x + tower.size / 2, tower.y + tower.size / 2, '#ec4899', 10, 'spark', 2.5);

    GameState.selectPlacedTower(null);
    GameState.updateUI();
    return true;
  },

  getGridCoords(canvasX, canvasY) {
    if (!GameState.engine) return null;
    const gs = GameState.engine.gridSize;
    const gx = Math.floor(canvasX / gs);
    const gy = Math.floor(canvasY / gs);
    if (gx < 0 || gx >= GameState.engine.cols || gy < 0 || gy >= GameState.engine.rows) {
      return null;
    }
    return { gx, gy };
  },
};
