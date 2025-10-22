/**
 * 玩家战机类
 * 处理玩家的移动、射击、生命值等，支持多种战机类型
 */

class Player {
    constructor(x, y, shipType = 'STANDARD') {
        this.shipType = shipType;
        this.loadShipConfig(shipType);

        this.x = x;
        this.y = y;
        this.alive = true;

        // 射击
        this.lastFireTime = 0;

        // Buff状态
        this.shields = false;
        this.shieldEndTime = 0;
        this.powerUp = false;
        this.powerUpEndTime = 0;
        this.powerUpMultiplier = 1;

        // 等级和经验
        this.level = 1;
        this.exp = 0;
        this.expToNextLevel = GameConfig.UPGRADE.EXP_PER_LEVEL;
    }

    /**
     * 加载战机配置
     */
    loadShipConfig(shipType) {
        const config = GameConfig.SHIP_TYPES[shipType] || GameConfig.SHIP_TYPES.STANDARD;

        this.width = config.WIDTH;
        this.height = config.HEIGHT;
        this.speed = config.SPEED;
        this.maxHealth = config.MAX_HEALTH;
        this.health = this.maxHealth;
        this.fireRate = config.FIRE_RATE;
        this.damage = GameConfig.PLAYER.BASE_DAMAGE * config.DAMAGE_MULTIPLIER;
        this.bulletType = config.BULLET_TYPE;
        this.colorPrimary = config.COLOR_PRIMARY;
        this.colorSecondary = config.COLOR_SECONDARY;
        this.shipName = config.NAME;
        this.shipDesc = config.DESC;
    }

    /**
     * 切换战机类型
     */
    changeShipType(shipType) {
        const oldHealth = this.health;
        const oldMaxHealth = this.maxHealth;
        const healthPercent = oldHealth / oldMaxHealth;

        this.shipType = shipType;
        this.loadShipConfig(shipType);

        // 保持生命值百分比
        this.health = Math.floor(this.maxHealth * healthPercent);
    }

    /**
     * 重置玩家状态
     */
    reset(shipType) {
        if (shipType) {
            this.shipType = shipType;
            this.loadShipConfig(shipType);
        }

        this.x = GameConfig.PLAYER.START_X;
        this.y = GameConfig.PLAYER.START_Y;
        this.health = this.maxHealth;
        this.alive = true;
        this.shields = false;
        this.powerUp = false;
        this.level = 1;
        this.exp = 0;
        this.expToNextLevel = GameConfig.UPGRADE.EXP_PER_LEVEL;
    }

    /**
     * 移动相关方法
     */
    moveLeft() {
        this.x = Math.max(this.width / 2, this.x - this.speed);
    }

    moveRight() {
        this.x = Math.min(GameConfig.CANVAS_WIDTH - this.width / 2, this.x + this.speed);
    }

    moveUp() {
        this.y = Math.max(this.height / 2, this.y - this.speed);
    }

    moveDown() {
        this.y = Math.min(GameConfig.CANVAS_HEIGHT - this.height / 2, this.y + this.speed);
    }

    /**
     * 移动到目标位置(鼠标/触摸控制)
     */
    moveTowards(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 5) { // 避免抖动
            const moveDistance = Math.min(this.speed, distance);
            this.x += (dx / distance) * moveDistance;
            this.y += (dy / distance) * moveDistance;

            // 保持在边界内
            this.x = Math.max(this.width / 2, Math.min(GameConfig.CANVAS_WIDTH - this.width / 2, this.x));
            this.y = Math.max(this.height / 2, Math.min(GameConfig.CANVAS_HEIGHT - this.height / 2, this.y));
        }
    }

    /**
     * 射击（根据战机类型和子弹类型）
     */
    shoot() {
        const currentTime = Date.now();
        if (currentTime - this.lastFireTime >= this.fireRate) {
            this.lastFireTime = currentTime;

            // 计算伤害(考虑power up)
            const bulletDamage = this.damage * this.powerUpMultiplier;

            // 根据子弹类型返回不同的子弹
            return this.createBullets(bulletDamage);
        }
        return null;
    }

    /**
     * 创建子弹（根据子弹类型）
     */
    createBullets(damage) {
        const bullets = [];
        const bulletConfig = GameConfig.BULLET_TYPES[this.bulletType];

        switch (this.bulletType) {
            case 'SPREAD':
                // 散弹 - 发射多个子弹
                const count = bulletConfig.SPREAD_COUNT;
                const angle = bulletConfig.SPREAD_ANGLE;
                const angleStep = angle / (count - 1);
                const baseAngle = -Math.PI / 2; // 向上

                for (let i = 0; i < count; i++) {
                    const bulletAngle = baseAngle - angle / 2 + angleStep * i;
                    const speed = bulletConfig.SPEED;
                    const vx = Math.cos(bulletAngle) * speed;
                    const vy = Math.sin(bulletAngle) * speed;

                    bullets.push(new Bullet(
                        this.x,
                        this.y - this.height / 2,
                        vx,
                        vy,
                        damage,
                        'player',
                        this.bulletType
                    ));
                }
                break;

            case 'LASER':
                // 激光 - 单发高速
                bullets.push(new Bullet(
                    this.x,
                    this.y - this.height / 2,
                    0,
                    -bulletConfig.SPEED,
                    damage,
                    'player',
                    this.bulletType
                ));
                break;

            case 'MISSILE':
                // 导弹 - 追踪导弹
                bullets.push(new Bullet(
                    this.x,
                    this.y - this.height / 2,
                    0,
                    -bulletConfig.SPEED,
                    damage,
                    'player',
                    this.bulletType
                ));
                break;

            case 'PLASMA':
                // 等离子炮 - 慢速穿透
                bullets.push(new Bullet(
                    this.x,
                    this.y - this.height / 2,
                    0,
                    -bulletConfig.SPEED,
                    damage,
                    'player',
                    this.bulletType
                ));
                break;

            default:
                // 普通子弹
                bullets.push(new Bullet(
                    this.x,
                    this.y - this.height / 2,
                    0,
                    -GameConfig.BULLET.SPEED,
                    damage,
                    'player',
                    'NORMAL'
                ));
        }

        return bullets.length > 0 ? bullets : null;
    }

    /**
     * 受到伤害
     */
    takeDamage(damage) {
        if (this.shields) {
            console.log('护盾抵挡了攻击！');
            return;
        }

        this.health -= damage;
        if (this.health <= 0) {
            this.health = 0;
            this.alive = false;
            console.log('玩家被击毁！');
        }
    }

    /**
     * 治疗
     */
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        console.log(`恢复生命值: ${amount}`);
    }

    /**
     * 激活护盾
     */
    activateShield(duration) {
        this.shields = true;
        this.shieldEndTime = Date.now() + duration;
        console.log(`护盾激活: ${duration / 1000}秒`);
    }

    /**
     * 激活火力强化
     */
    activatePowerUp(duration, multiplier) {
        this.powerUp = true;
        this.powerUpEndTime = Date.now() + duration;
        this.powerUpMultiplier = multiplier;
        console.log(`火力强化激活: ${multiplier}倍伤害, ${duration / 1000}秒`);
    }

    /**
     * 增加经验值
     */
    addExp(amount) {
        this.exp += amount;
        if (this.exp >= this.expToNextLevel && this.level < GameConfig.UPGRADE.MAX_LEVEL) {
            this.levelUp();
        }
    }

    /**
     * 升级
     */
    levelUp() {
        this.level++;
        this.exp -= this.expToNextLevel;
        this.expToNextLevel = Math.floor(this.expToNextLevel * GameConfig.UPGRADE.LEVEL_MULTIPLIER);

        // 提升属性
        this.damage += GameConfig.UPGRADE.STATS_INCREASE.DAMAGE;
        this.maxHealth += GameConfig.UPGRADE.STATS_INCREASE.HEALTH;
        this.health = this.maxHealth; // 升级时恢复满血
        this.fireRate = Math.max(50, this.fireRate + GameConfig.UPGRADE.STATS_INCREASE.FIRE_RATE);

        console.log(`升级到 Lv.${this.level}! 伤害: ${this.damage}, 生命: ${this.maxHealth}`);
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
     * 更新
     */
    update(deltaTime) {
        const currentTime = Date.now();

        // 检查buff时间
        if (this.shields && currentTime > this.shieldEndTime) {
            this.shields = false;
            console.log('护盾消失');
        }

        if (this.powerUp && currentTime > this.powerUpEndTime) {
            this.powerUp = false;
            this.powerUpMultiplier = 1;
            console.log('火力强化消失');
        }
    }

    /**
     * 渲染
     */
    render(ctx, particleSystem) {
        if (!this.alive) return;

        // 根据战机类型使用不同的颜色
        const primaryColor = this.colorPrimary || '#00aaff';
        const secondaryColor = this.colorSecondary || '#0066cc';

        // 绘制引擎尾焰粒子效果
        if (Math.random() > 0.3) {
            if (particleSystem) {
                particleSystem.createEngineTrail(this.x - 8, this.y + this.height / 2 + 10, '#ff6600');
                particleSystem.createEngineTrail(this.x + 8, this.y + this.height / 2 + 10, '#ff6600');
            }
        }

        // 绘制护盾效果（加强版）
        if (this.shields) {
            const time = Date.now() / 1000;

            // 多层护盾
            for (let i = 0; i < 3; i++) {
                ctx.strokeStyle = `rgba(0, 255, 255, ${0.3 - i * 0.1})`;
                ctx.lineWidth = 3 - i;
                ctx.beginPath();
                ctx.arc(
                    this.x,
                    this.y,
                    this.width / 2 + 10 + i * 5 + Math.sin(time * 3 + i) * 3,
                    0,
                    Math.PI * 2
                );
                ctx.stroke();
            }
        }

        // 绘制战机主体（渐变色）
        const gradient = ctx.createLinearGradient(
            this.x,
            this.y - this.height / 2,
            this.x,
            this.y + this.height / 2
        );

        if (this.powerUp) {
            gradient.addColorStop(0, '#ff00ff');
            gradient.addColorStop(0.5, '#ff66ff');
            gradient.addColorStop(1, '#cc00cc');
        } else {
            gradient.addColorStop(0, primaryColor);
            gradient.addColorStop(0.5, this.adjustBrightness(primaryColor, 0.8));
            gradient.addColorStop(1, secondaryColor);
        }

        ctx.fillStyle = gradient;

        // 战机主体 - 更复杂的形状
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.height / 2);
        ctx.lineTo(this.x - this.width / 3, this.y - this.height / 4);
        ctx.lineTo(this.x - this.width / 2, this.y + this.height / 4);
        ctx.lineTo(this.x - this.width / 4, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width / 4, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height / 4);
        ctx.lineTo(this.x + this.width / 3, this.y - this.height / 4);
        ctx.closePath();
        ctx.fill();

        // 绘制机翼
        ctx.fillStyle = secondaryColor;
        ctx.beginPath();
        ctx.moveTo(this.x - this.width / 2, this.y);
        ctx.lineTo(this.x - this.width / 2 - 10, this.y + 15);
        ctx.lineTo(this.x - this.width / 4, this.y + 10);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width / 2 + 10, this.y + 15);
        ctx.lineTo(this.x + this.width / 4, this.y + 10);
        ctx.closePath();
        ctx.fill();

        // 绘制驾驶舱
        const cockpitGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 10);
        cockpitGradient.addColorStop(0, '#ffffff');
        cockpitGradient.addColorStop(0.5, '#00ffff');
        cockpitGradient.addColorStop(1, primaryColor);

        ctx.fillStyle = cockpitGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fill();

        // 驾驶舱边框
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 绘制引擎光效
        const engineGradient = ctx.createLinearGradient(
            this.x,
            this.y + this.height / 2,
            this.x,
            this.y + this.height / 2 + 15
        );
        engineGradient.addColorStop(0, 'rgba(255, 150, 0, 0.8)');
        engineGradient.addColorStop(1, 'rgba(255, 50, 0, 0)');

        ctx.fillStyle = engineGradient;
        ctx.fillRect(this.x - 10, this.y + this.height / 2, 7, 15);
        ctx.fillRect(this.x + 3, this.y + this.height / 2, 7, 15);

        // 绘制生命条
        this.renderHealthBar(ctx);
    }

    /**
     * 调整颜色亮度
     */
    adjustBrightness(color, factor) {
        // 简单的颜色调整
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

    /**
     * 渲染生命条
     */
    renderHealthBar(ctx) {
        const barWidth = this.width;
        const barHeight = 5;
        const barX = this.x - barWidth / 2;
        const barY = this.y - this.height / 2 - 15;

        // 背景
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // 生命值
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.3 ? '#00ff00' : '#ff0000';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

        // 边框
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Player;
}
