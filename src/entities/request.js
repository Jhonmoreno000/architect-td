// ============================================
// ENTITIES - Optimized Request (Enemy) with Reduced Allocations
// ============================================

class Request extends Entity {
  constructor(x, y, targetPos, type = 'normal', difficulty = 'staging', isMinion = false) {
    super(x, y);
    this.targetPosX = targetPos ? targetPos.x : 520;
    this.targetPosY = targetPos ? targetPos.y : 320;
    this.type = type;
    this.alive = true;
    this.reached = false;
    this.isMinion = isMinion;

    this.angle = Math.atan2(this.targetPosY - this.y, this.targetPosX - this.x);
    this.hitFlash = 0;
    this.animTimer = Math.random() * 100;
    this.driftFactor = (Math.random() - 0.5) * 0.8;

    this.slowTimer = 0;
    this.slowFactor = 1.0;
    this.stunTimer = 0;
    this.burnTimer = 0;
    this.burnDamage = 0;
    this.hasShield = false;
    this.shieldHp = 0;
    this.maxShieldHp = 0;

    this.attackCooldown = 0;
    this.cloakTimer = 0;
    this.isCloaked = false;
    this.hasCloned = false;
    this.lastHitTower = null;

    const diff = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS.staging;
    const stats = ENEMY_CONFIG[type] || ENEMY_CONFIG.normal;

    this.radius = stats.radius || 10;
    this.maxHp = Math.round(stats.hp * diff.enemyHpMultiplier * (isMinion ? 0.55 : 1.0));
    this.hp = this.maxHp;
    this.baseSpeed = stats.speed * diff.enemySpeedMultiplier * (0.9 + Math.random() * 0.2);
    this.speed = this.baseSpeed;
    this.reward = stats.reward || 10;
    this.color = stats.color || '#00ff41';
    this.label = stats.label || 'REQ';
    this.name = stats.name || 'Request';
    this.isBoss = !!stats.isBoss;
    this.bossTitle = stats.bossTitle || '';
    this.slowImmune = !!stats.slowImmune;
    this.stunImmune = !!stats.stunImmune;
    this.splitsOnDeath = !!stats.splitsOnDeath && !isMinion;
    this.regenerates = !!stats.regenerates;
    this.shieldNearby = !!stats.shieldNearby;
    this.locksTowers = !!stats.locksTowers;
    this.stunsTowers = !!stats.stunsTowers;
    this.cloaks = !!stats.cloaks;
    this.isFinalBoss = !!stats.isFinalBoss;

    this.attackRange = stats.attackRange || 85;
    this.attackPower = stats.attackPower || 8;
    this.maxAttackCooldown = stats.attackCooldown || 60;

    this.trail = [];
    this.trailTimer = 0;
  }

  update(dt) {
    if (!this.alive || this.reached) return;
    this.animTimer += dt * 0.08;

    if (this.hitFlash > 0) {
      this.hitFlash -= dt * 0.2;
      if (this.hitFlash < 0) this.hitFlash = 0;
    }

    if (this.cloaks) {
      this.cloakTimer += dt;
      this.isCloaked = (this.cloakTimer % 180) < 80;
    }

    if (this.isBoss && this.regenerates) {
      if (Math.random() < 0.035 && this.hp < this.maxHp) {
        const heal = Math.min(this.maxHp - this.hp, Math.round(this.maxHp * 0.012));
        this.hp += heal;
        if (GameState.engine && Math.random() < 0.25) {
          GameState.engine.addFloatingText(this.x, this.y - 18, `+${heal} REGEN`, '#bd93f9', 9);
        }
      }
    }

    if (this.shieldNearby && GameState.engine) {
      const enemies = GameState.engine.enemies;
      for (let i = 0, len = enemies.length; i < len; i++) {
        const other = enemies[i];
        if (other !== this && other.alive && !other.hasShield) {
          const dx = this.x - other.x;
          const dy = this.y - other.y;
          if (dx * dx + dy * dy < 9025) {
            other.applyShield(Math.round(other.maxHp * 0.35));
          }
        }
      }
    }

    if (this.isFinalBoss && !this.hasCloned && this.hp <= this.maxHp * 0.5 && GameState.engine) {
      this.hasCloned = true;
      AudioSystem.play('boss_alert');
      GameState.engine.triggerScreenShake(14);
      GameState.engine.addFloatingText(this.x, this.y - 25, 'ROOTKIT SHADOW CLONES!', '#ff79c6', 13, true);

      for (let c = -1; c <= 1; c += 2) {
        const clone = new Request(this.x + c * 35, this.y + c * 25, { x: this.targetPosX, y: this.targetPosY }, 'zeroday', GameState.currentDifficulty, true);
        clone.maxHp = Math.round(this.maxHp * 0.25);
        clone.hp = clone.maxHp;
        GameState.engine.enemies.push(clone);
      }
    }

    if (this.burnTimer > 0) {
      this.burnTimer -= dt;
      this.hp -= this.burnDamage * (dt / 30);
      if (Math.random() < 0.15 && GameState.engine) {
        GameState.engine.addParticles(this.x, this.y, '#f97316', 2, 'spark', 1.5);
      }
      if (this.hp <= 0) {
        this.alive = false;
        return;
      }
    }

    if (this.stunTimer > 0) {
      if (!this.stunImmune) {
        this.stunTimer -= dt;
        return;
      } else {
        this.stunTimer = 0;
      }
    }

    if (this.slowTimer > 0 && !this.slowImmune) {
      this.slowTimer -= dt;
      this.speed = this.baseSpeed * (1 - this.slowFactor);
    } else {
      this.speed = this.baseSpeed;
    }

    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
    } else if (GameState.engine) {
      this._performHostileAttack();
    }

    let targetX = this.targetPosX;
    let targetY = this.targetPosY;
    if (GameState.engine && GameState.engine.core) {
      targetX = GameState.engine.core.x;
      targetY = GameState.engine.core.y;
    }

    const dirX = targetX - this.x;
    const dirY = targetY - this.y;
    const distSq = dirX * dirX + dirY * dirY;

    if (distSq < (this.radius + 20) * (this.radius + 20)) {
      this.reached = true;
      return;
    }

    const dist = Math.sqrt(distSq);
    let vx = (dirX / dist) * this.speed * dt;
    let vy = (dirY / dist) * this.speed * dt;

    const driftAngle = Math.sin(this.animTimer + this.driftFactor * 10) * 0.35;
    const cosD = Math.cos(driftAngle);
    const sinD = Math.sin(driftAngle);
    const tvx = vx * cosD - vy * sinD;
    const tvy = vx * sinD + vy * cosD;
    vx = tvx;
    vy = tvy;

    if (GameState.engine) {
      const myX = this.x;
      const myY = this.y;
      const myR = this.radius;

      const towers = GameState.engine.towers;
      for (let i = 0, len = towers.length; i < len; i++) {
        const t = towers[i];
        const tcx = t.x + t.size * 0.5;
        const tcy = t.y + t.size * 0.5;
        const tdx = myX - tcx;
        const tdy = myY - tcy;
        const tdistSq = tdx * tdx + tdy * tdy;
        const avoidDist = myR + t.size * 0.5 + 6;
        const avoidDistSq = avoidDist * avoidDist;

        if (tdistSq < avoidDistSq && tdistSq > 0.01) {
          const tdist = Math.sqrt(tdistSq);
          const pushForce = (avoidDist - tdist) * 0.15;
          vx += (tdx / tdist) * pushForce * dt;
          vy += (tdy / tdist) * pushForce * dt;
        }
      }

      const enemies = GameState.engine.enemies;
      for (let i = 0, len = enemies.length; i < len; i++) {
        const other = enemies[i];
        if (other !== this && other.alive) {
          const odx = myX - other.x;
          const ody = myY - other.y;
          const odistSq = odx * odx + ody * ody;
          const sepDist = myR + other.radius + 4;
          const sepDistSq = sepDist * sepDist;

          if (odistSq < sepDistSq && odistSq > 0.01) {
            const odist = Math.sqrt(odistSq);
            const push = (sepDist - odist) * 0.08;
            vx += (odx / odist) * push * dt;
            vy += (ody / odist) * push * dt;
          }
        }
      }
    }

    this.x += vx;
    this.y += vy;
    this.angle = Math.atan2(vy, vx);

    this.trailTimer += dt;
    if (this.trailTimer > 5) {
      this.trail.push(this.x, this.y, 0.5);
      this.trailTimer = 0;
    }
    if (this.trail.length > 60) {
      this.trail.splice(0, 3);
    }
    for (let i = this.trail.length - 3; i >= 0; i -= 3) {
      this.trail[i + 2] -= 0.03 * dt;
      if (this.trail[i + 2] <= 0) {
        this.trail.splice(i, 3);
      }
    }
  }

  _performHostileAttack() {
    let target = null;
    let closestDist = this.attackRange;

    const towers = GameState.engine.towers;
    for (let i = 0, len = towers.length; i < len; i++) {
      const t = towers[i];
      if (!t.isCrashed) {
        const dx = this.x - (t.x + t.size * 0.5);
        const dy = this.y - (t.y + t.size * 0.5);
        const dSq = dx * dx + dy * dy;
        if (dSq <= closestDist * closestDist) {
          closestDist = Math.sqrt(dSq);
          target = t;
        }
      }
    }

    const coreDistSq = (this.x - GameState.engine.core.x) ** 2 + (this.y - GameState.engine.core.y) ** 2;
    if (!target && coreDistSq <= (this.attackRange + 30) * (this.attackRange + 30)) {
      target = { x: GameState.engine.core.x, y: GameState.engine.core.y, isCore: true };
    }

    if (target) {
      this.attackCooldown = this.maxAttackCooldown;

      if (this.locksTowers && !target.isCore) {
        target.isRansomed = true;
        target.ransomedTimer = 180;
        GameState.engine.addFloatingText(target.x + 18, target.y - 12, '[LOCK] SERVIDOR ENCRIPTADO', '#ec4899', 10, true);
      }

      if (this.stunsTowers && !target.isCore) {
        target.cooldown = 120;
        GameState.engine.addFloatingText(target.x + 18, target.y - 12, '[VIRUS] TROYANO INYECTADO', '#a855f7', 10);
      }

      const projType = this.type === 'heavy' ? 'bomb' : this.type === 'fast' ? 'beam' : 'bullet';
      GameState.engine.addEnemyProjectile(this.x, this.y, target, this.attackPower, this.color, projType);
    }
  }

  applyShield(amount) {
    this.hasShield = true;
    this.shieldHp = amount;
    this.maxShieldHp = amount;
    if (GameState.engine) {
      GameState.engine.addFloatingText(this.x, this.y - 12, 'ESCUDADO', '#ec4899', 9);
      GameState.engine.addRingShockwave(this.x, this.y, '#ec4899', 20);
    }
  }

  takeDamage(amount) {
    this.hitFlash = 1.0;

    if (this.hasShield && this.shieldHp > 0) {
      if (amount <= this.shieldHp) {
        this.shieldHp -= amount;
        return;
      } else {
        amount -= this.shieldHp;
        this.hasShield = false;
        this.shieldHp = 0;
        if (GameState.engine) {
          GameState.engine.addFloatingText(this.x, this.y - 12, 'ESCUDO ROTO', '#ff0055', 9);
        }
      }
    }

    this.hp -= amount;
    if (this.hp <= 0) {
      this.alive = false;
    }
  }

  draw(ctx) {
    if (!this.alive) return;
    ctx.save();

    if (this.isCloaked) {
      ctx.globalAlpha = 0.25;
    }

    const trailLen = this.trail.length / 3;
    if (trailLen > 0) {
      const color = this.color;
      const r = this.radius;
      for (let i = 0; i < trailLen; i++) {
        ctx.globalAlpha = Math.max(0, this.trail[i * 3 + 2] * 0.35);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.trail[i * 3], this.trail[i * 3 + 1], r * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = this.isCloaked ? 0.35 : 1;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    ctx.shadowBlur = this.isBoss ? 20 : 10;
    ctx.shadowColor = this.hitFlash > 0 ? '#ffffff' : this.color;

    this._drawTypeGraphics(ctx);

    ctx.shadowBlur = 0;
    ctx.restore();

    this._drawOverlays(ctx);
  }

  _drawTypeGraphics(ctx) {
    const r = this.radius;
    const bodyColor = this.hitFlash > 0 ? '#ffffff' : (this.stunTimer > 0 ? '#ffffff' : this.color);

    if (this.isBoss) {
      const spin = this.animTimer * 2;
      ctx.fillStyle = '#060d17';
      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      for (let i = 0; i < 4; i++) {
        const a = spin + (Math.PI / 2) * i;
        ctx.beginPath();
        ctx.arc(0, 0, r + 4, a, a + 0.8);
        ctx.stroke();
      }

      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    ctx.fillStyle = bodyColor;

    switch (this.type) {
      case 'fast':
        ctx.beginPath();
        ctx.moveTo(r * 1.3, 0);
        ctx.lineTo(-r, -r * 0.65);
        ctx.lineTo(-r * 0.3, 0);
        ctx.lineTo(-r, r * 0.65);
        ctx.closePath();
        ctx.fill();
        break;

      case 'heavy':
        ctx.fillStyle = '#120716';
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = bodyColor;
        ctx.fillRect(-r * 0.4, -r * 0.4, r * 0.8, r * 0.8);
        break;

      case 'botnet':
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-r, -r); ctx.lineTo(r, r);
        ctx.moveTo(-r, r); ctx.lineTo(r, -r);
        ctx.stroke();
        break;

      case 'malicious':
        ctx.fillStyle = '#ff6b35';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(r * 1.1, 0);
        ctx.lineTo(0, -r * 0.9);
        ctx.lineTo(-r * 1.1, 0);
        ctx.lineTo(0, r * 0.9);
        ctx.closePath();
        ctx.fill();
        break;

      case 'zeroday':
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(r * 1.2, 0);
        ctx.lineTo(-r * 0.8, -r);
        ctx.lineTo(-r * 0.3, 0);
        ctx.lineTo(-r * 0.8, r);
        ctx.closePath();
        ctx.fill();
        break;

      case 'ransomware':
        ctx.fillRect(-r * 0.8, -r * 0.8, r * 1.6, r * 1.6);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-r * 0.8, -r * 0.8, r * 1.6, r * 1.6);
        break;

      case 'normal':
      default:
        ctx.beginPath();
        ctx.moveTo(r * 1.1, 0);
        ctx.lineTo(-r * 0.8, -r * 0.7);
        ctx.lineTo(-r * 0.8, r * 0.7);
        ctx.closePath();
        ctx.fill();
        break;
    }
  }

  _drawOverlays(ctx) {
    ctx.save();

    if (this.hasShield && this.shieldHp > 0) {
      const pct = this.shieldHp / this.maxShieldHp;
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ec4899';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2 * pct);
      ctx.stroke();
    }

    const badgeY = this.y - this.radius - 12;
    if (this.stunTimer > 0) {
      ctx.fillStyle = '#ffeb3b';
      ctx.beginPath();
      ctx.moveTo(this.x + 1, badgeY - 5);
      ctx.lineTo(this.x - 3, badgeY);
      ctx.lineTo(this.x, badgeY);
      ctx.lineTo(this.x - 1, badgeY + 5);
      ctx.lineTo(this.x + 3, badgeY);
      ctx.lineTo(this.x, badgeY);
      ctx.closePath();
      ctx.fill();
    } else if (this.burnTimer > 0) {
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(this.x, badgeY, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.slowTimer > 0) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(this.x - 4, badgeY); ctx.lineTo(this.x + 4, badgeY);
      ctx.moveTo(this.x, badgeY - 4); ctx.lineTo(this.x, badgeY + 4);
      ctx.stroke();
    }

    if (!this.isBoss) {
      const barW = Math.max(22, this.radius * 2.2);
      const barH = 3.5;
      const barX = this.x - barW / 2;
      const barY = this.y - this.radius - 6;
      const hpPct = Math.max(0, Math.min(1, this.hp / this.maxHp));

      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

      ctx.fillStyle = hpPct > 0.5 ? '#00ff41' : hpPct > 0.25 ? '#ffcc00' : '#ff0040';
      ctx.fillRect(barX, barY, barW * hpPct, barH);
    }

    ctx.restore();
  }
}
