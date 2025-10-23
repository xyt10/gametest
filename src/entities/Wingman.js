/**
 * 僚机类
 * 跟随玩家的辅助战机，提供额外火力支援
 */

class Wingman {
    constructor(player, position = 'LEFT', wingmanType = 'STANDARD') {
        this.player = player;
        this.position = position; // 'LEFT' 或 'RIGHT'
        this.wingmanType = wingmanType;

        // 从配置加载属性
        this.loadConfig(wingmanType);

        // 位置（相对于玩家）
        this.x = player.x;
        this.y = player.y;
        this.targetX = player.x;
        this.targetY = player.y;

        // 偏移量（左右僚机的位置）
        this.offsetX = position === 'LEFT' ? -50 : 50;
        this.offsetY = -20;

        // 状态
        this.alive = true;
        this.lastFireTime = 0;

        // 动画
        this.animationTime = Math.random() * Math.PI * 2;
    }

    /**
     * 加载僚机配置
     */
    loadConfig(type) {
        const config = GameConfig.WINGMAN_TYPES[type] || GameConfig.WINGMAN_TYPES.STANDARD;

        this.width = config.WIDTH;
        this.height = config.HEIGHT;
        this.health = config.HEALTH;
        this.maxHealth = config.HEALTH;
        this.damage = config.DAMAGE;
        this.fireRate = config.FIRE_RATE;
        this.followSpeed = config.FOLLOW_SPEED;
        this.bulletType = config.BULLET_TYPE;
        this.color = config.COLOR;
        this.name = config.NAME;
        this.autoAim = config.AUTO_AIM !== false; // 默认自动瞄准
        this.invincible = config.INVINCIBLE === true;
        this.firePattern = (config.FIRE_PATTERN || 'SINGLE').toUpperCase();
        this.projectileCount = Math.max(1, config.PROJECTILES || 1);
        this.projectileSpacing = config.PROJECTILE_SPACING || 16;
        this.spreadAngle = config.SPREAD_ANGLE || Math.PI / 12;
        this.forwardOffset = config.PROJECTILE_FORWARD_OFFSET || 0;
        this.bulletSpeedOverride = config.BULLET_SPEED || null;
        this.engineColor = config.ENGINE_COLOR || this.color;
    }

    /**
     * 更新僚机位置和行为
     */
    update(deltaTime, enemies, currentTime) {
        if (!this.alive) return null;

        this.animationTime += deltaTime / 1000;

        // 计算目标位置（玩家周围）
        const floatOffset = Math.sin(this.animationTime * 2) * 3;
        this.targetX = this.player.x + this.offsetX;
        this.targetY = this.player.y + this.offsetY + floatOffset;

        // 平滑跟随玩家
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 1) {
            const moveDistance = Math.min(this.followSpeed, distance);
            this.x += (dx / distance) * moveDistance;
            this.y += (dy / distance) * moveDistance;
        }

        // 自动射击
        const bullets = this.autoShoot(enemies, currentTime);
        return bullets && bullets.length > 0 ? bullets : null;
    }

    /**
     * 自动射击逻辑
     */
    autoShoot(enemies, currentTime) {
        if (currentTime - this.lastFireTime < this.fireRate) {
            return null;
        }

        // 寻找最近的敌人
        let target = null;
        let minDistance = Infinity;
        const maxRange = 400; // 射击范围

        for (const enemy of enemies) {
            if (!enemy.alive) continue;

            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distanceSquared = dx * dx + dy * dy;

            // 只攻击前方的敌人
            if (dy < 0 && distanceSquared < maxRange * maxRange && distanceSquared < minDistance) {
                minDistance = distanceSquared;
                target = enemy;
            }
        }

        if (target) {
            this.lastFireTime = currentTime;
            const bullets = this.shoot(target);
            return bullets && bullets.length > 0 ? bullets : null;
        }

        return null;
    }

    /**
     * 射击
     */
    shoot(target) {
        const bullets = [];
        const speed = this.getBulletSpeed();

        let dirX = 0;
        let dirY = -1;

        if (this.autoAim && target) {
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
                dirX = dx / distance;
                dirY = dy / distance;
            }
        }

        const baseAngle = Math.atan2(dirY, dirX);

        switch (this.firePattern) {
            case 'DUAL': {
                const count = Math.max(2, this.projectileCount);
                const half = (count - 1) / 2;
                const spacing = this.projectileSpacing || 16;
                for (let i = 0; i < count; i++) {
                    const lateralOffset = (i - half) * spacing;
                    bullets.push(this.createBulletFromAngle(baseAngle, speed, lateralOffset, this.forwardOffset));
                }
                break;
            }
            case 'SPREAD': {
                const count = Math.max(2, this.projectileCount);
                const spread = this.spreadAngle || Math.PI / 8;
                const step = count > 1 ? spread / (count - 1) : 0;
                const startAngle = baseAngle - spread / 2;
                for (let i = 0; i < count; i++) {
                    const angle = startAngle + step * i;
                    bullets.push(this.createBulletFromAngle(angle, speed, 0, this.forwardOffset));
                }
                break;
            }
            default: {
                bullets.push(this.createBulletFromAngle(baseAngle, speed, 0, this.forwardOffset));
                break;
            }
        }

        return bullets;
    }

    /**
     * 计算当前子弹飞行速度
     */
    getBulletSpeed() {
        if (this.bulletSpeedOverride) {
            return this.bulletSpeedOverride;
        }

        const typeConfig = GameConfig.BULLET_TYPES[this.bulletType];
        if (typeConfig && typeConfig.SPEED) {
            return typeConfig.SPEED;
        }

        return GameConfig.BULLET.SPEED;
    }

    /**
     * 根据角度创建子弹
     */
    createBulletFromAngle(angle, speed, lateralOffset = 0, forwardOffset = 0) {
        const dirX = Math.cos(angle);
        const dirY = Math.sin(angle);
        const perpX = -dirY;
        const perpY = dirX;

        const spawnX = this.x + dirX * forwardOffset + perpX * lateralOffset;
        const spawnY = this.y - this.height / 2 + dirY * forwardOffset + perpY * lateralOffset;

        return new Bullet(
            spawnX,
            spawnY,
            dirX * speed,
            dirY * speed,
            this.damage,
            'player',
            this.bulletType
        );
    }

    /**
     * 受到伤害
     */
    takeDamage(damage) {
        if (this.invincible) {
            return;
        }

        this.health -= damage;
        if (this.health <= 0) {
            this.health = 0;
            this.alive = false;
        }
    }

    /**
     * 是否死亡
     */
    isDead() {
        return !this.alive;
    }

    /**
     * 获取碰撞边界
     */
    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }

    /**
     * 渲染僚机
     */
    render(ctx, particleSystem) {
        if (!this.alive) return;

        // 引擎尾焰
        if (Math.random() > 0.5 && particleSystem) {
            particleSystem.createEngineTrail(
                this.x,
                this.y + this.height / 2 + 5,
                this.engineColor
            );
        }

        // 连接线（表示僚机与主机的联系）
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(this.player.x, this.player.y);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // 僚机主体
        const gradient = ctx.createLinearGradient(
            this.x,
            this.y - this.height / 2,
            this.x,
            this.y + this.height / 2
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, this.adjustBrightness(this.color, 0.7));
        gradient.addColorStop(1, this.adjustBrightness(this.color, 0.4));

        ctx.fillStyle = gradient;

        // 绘制三角形战机
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.height / 2);
        ctx.lineTo(this.x - this.width / 2, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2);
        ctx.closePath();
        ctx.fill();

        // 驾驶舱
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fill();

        // 僚机标识（L或R）
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.position[0], this.x, this.y - this.height / 2 - 8);

        // 生命条（如果受伤）
        if (this.health < this.maxHealth) {
            this.renderHealthBar(ctx);
        }
    }

    /**
     * 渲染生命条
     */
    renderHealthBar(ctx) {
        const barWidth = this.width;
        const barHeight = 3;
        const barX = this.x - barWidth / 2;
        const barY = this.y - this.height / 2 - 15;

        // 背景
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // 生命值
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.3 ? '#00ff00' : '#ff0000';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    }

    /**
     * 调整颜色亮度
     */
    adjustBrightness(color, factor) {
        if (color.startsWith('#') && color.length === 7) {
            const r = parseInt(color.substr(1, 2), 16);
            const g = parseInt(color.substr(3, 2), 16);
            const b = parseInt(color.substr(5, 2), 16);

            const newR = Math.floor(r * factor);
            const newG = Math.floor(g * factor);
            const newB = Math.floor(b * factor);

            return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
        }
        return color;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Wingman;
}
