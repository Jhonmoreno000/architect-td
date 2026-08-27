// ============================================
// SYSTEMS - Combat, DevOps Abilities & Loot Drop Engine
// ============================================

const CombatSystem = {
  combo: 0,
  comboTimer: 0,

  dealDamage(enemy, amount, color = '#00ff41', sourceTower = null) {
    if (!enemy || !enemy.alive) return;

    let isCrit = Math.random() < 0.12;
    let finalDamage = isCrit ? Math.round(amount * 1.6) : amount;

    if (sourceTower && sourceTower.type === 'apigateway') {
      if (enemy.type === 'heavy' || enemy.type === 'fast') {
        finalDamage = Math.round(finalDamage * 1.5);
        isCrit = true;
      }
    }

    // Overclock 1.5x damage bonus
    if (sourceTower && sourceTower.overclockTimer > 0) {
      finalDamage = Math.round(finalDamage * 1.5);
    }

    enemy.takeDamage(finalDamage);

    if (sourceTower) {
      sourceTower.damageDealt += finalDamage;
    }

    // Floating damage numbers
    if (GameState.engine) {
      const text = isCrit ? `${Math.round(finalDamage)}!` : `${Math.round(finalDamage)}`;
      GameState.engine.addFloatingText(
        enemy.x + (Math.random() - 0.5) * 14,
        enemy.y - 8 + (Math.random() - 0.5) * 10,
        text,
        isCrit ? '#ffeb3b' : color,
        isCrit ? 13 : 9,
        isCrit
      );
    }
  },

  applyAreaDamage(x, y, radius, damage, color = '#10b981') {
    if (!GameState.engine) return;
    for (const e of GameState.engine.enemies) {
      if (!e.alive || e.reached) continue;
      const dx = e.x - x;
      const dy = e.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= radius) {
        const falloff = 1 - (dist / radius) * 0.5;
        this.dealDamage(e, Math.round(damage * falloff), color);
      }
    }
  },

  handleEnemyReached(enemy) {
    if (GameState.shieldCharges > 0) {
      GameState.shieldCharges--;
      AudioSystem.play('zap');
      if (GameState.engine) {
        GameState.engine.addFloatingText(GameState.engine.core.x, GameState.engine.core.y - 25, 'CLOUDFLARE ABSORBIÓ PAQUETE', '#00f0ff', 12, true);
        GameState.engine.addRingShockwave(GameState.engine.core.x, GameState.engine.core.y, '#00f0ff', 50);
      }
      GameState.updateUI();
      return;
    }

    const damage = enemy.isBoss ? 8 : enemy.type === 'malicious' || enemy.type === 'ransomware' ? 3 : 1;
    GameState.lives -= damage;
    AudioSystem.play('error');

    if (GameState.engine) {
      GameState.engine.triggerScreenShake(enemy.isBoss ? 15 : 6);
      GameState.engine.addFloatingText(GameState.engine.core.x, GameState.engine.core.y - 15, `-${damage} VIDAS!`, '#ff0055', 13, true);
    }

    GameState.updateUI();

    if (GameState.lives <= 0) {
      GameState.triggerGameOver();
    }
  },

  handleEnemyKilled(enemy) {
    this.combo++;
    this.comboTimer = 120;
    const comboBonus = Math.min(2.0, 1 + this.combo * 0.05);

    const reward = Math.round(enemy.reward * (GameState.difficultySettings ? GameState.difficultySettings.moneyMultiplier : 1.0));
    const scoreAdd = Math.round(enemy.reward * (GameState.difficultySettings ? GameState.difficultySettings.scoreMultiplier : 1.0) * comboBonus);

    GameState.money += reward;
    GameState.score += scoreAdd;
    GameState.statsKills = (GameState.statsKills || 0) + 1;

    // Check Loot Drop Chance (Memory Dump, Energy, Overclock)
    if (GameState.engine && Math.random() < GAME_CONFIG.lootDropChance) {
      const dropTypes = ['money', 'money', 'energy', 'overclock'];
      const pickedDrop = dropTypes[Math.floor(Math.random() * dropTypes.length)];
      GameState.engine.addLootDrop(enemy.x, enemy.y, pickedDrop);
    }

    // Split mechanic for SQL Injection
    if (enemy.splitsOnDeath && GameState.engine) {
      GameState.engine.addFloatingText(enemy.x, enemy.y - 15, 'SUB-QUERIES SPLIT!', '#f97316', 10, true);
      for (let s = 0; s < 2; s++) {
        const minion = new Request(enemy.x + (s === 0 ? -6 : 6), enemy.y, enemy.path, 'botnet', GameState.currentDifficulty, true);
        minion.pathIndex = Math.min(enemy.path.length - 1, enemy.pathIndex);
        GameState.engine.enemies.push(minion);
      }
    }

    if (enemy.isBoss) {
      AudioSystem.play('wave');
      if (GameState.engine) {
        GameState.engine.triggerScreenShake(14);
        GameState.engine.addFloatingText(enemy.x, enemy.y - 25, '🚨 INCIDENTE RESUELTO! +$$$', '#00ff41', 16, true);
        GameState.engine.addRingShockwave(enemy.x, enemy.y, '#00ff41', 80);
      }
    } else {
      AudioSystem.play('hit');
    }

    GameState.updateUI();
  },

  triggerAbility(abilityId) {
    if (!GameState.gameStarted || GameState.isGameOver || GameState.paused) return;

    if (abilityId === 'autoscale') {
      if (GameState.abilityCooldowns.autoscale > 0) return;
      GameState.abilityCooldowns.autoscale = DEVOPS_ABILITIES.autoscale.cooldown;
      GameState.activeAbilities.autoscale = DEVOPS_ABILITIES.autoscale.duration;
      AudioSystem.play('ability');
      if (GameState.engine) {
        GameState.engine.addFloatingText(GameState.engine.canvas.width / 2, 80, '⚡ CLUSTER AUTO-SCALED: 2X FIRE RATE', '#00f0ff', 14, true);
      }
    } else if (abilityId === 'shield') {
      if (GameState.abilityCooldowns.shield > 0) return;
      GameState.abilityCooldowns.shield = DEVOPS_ABILITIES.shield.cooldown;
      GameState.shieldCharges = DEVOPS_ABILITIES.shield.charges;
      AudioSystem.play('ability');
      if (GameState.engine) {
        GameState.engine.addFloatingText(GameState.engine.canvas.width / 2, 80, '🛡️ CLOUDFLARE SHIELD ACTIVE (5 CARGAS)', '#f97316', 14, true);
        GameState.engine.addRingShockwave(GameState.engine.core.x, GameState.engine.core.y, '#f97316', 60);
      }
    } else if (abilityId === 'reboot') {
      if (GameState.abilityCooldowns.reboot > 0) return;
      GameState.abilityCooldowns.reboot = DEVOPS_ABILITIES.reboot.cooldown;
      AudioSystem.play('explosion');
      if (GameState.engine) {
        GameState.engine.triggerScreenShake(18);
        GameState.engine.addFloatingText(GameState.engine.canvas.width / 2, 80, '💀 HARD REBOOT (KILL -9) EMP LANZADO!', '#ff3366', 15, true);

        GameState.engine.addRingShockwave(GameState.engine.canvas.width / 2, GameState.engine.canvas.height / 2, '#ff3366', 400);

        for (const e of GameState.engine.enemies) {
          if (e.alive && !e.reached) {
            e.stunTimer = 210;
            this.dealDamage(e, 240, '#ff3366');
            GameState.engine.addParticles(e.x, e.y, '#ff3366', 8, 'spark', 3);
          }
        }
      }
    }

    GameState.updateUI();
  }
};
