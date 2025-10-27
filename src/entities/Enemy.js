/**
 * 敌机类
 * 处理敌机的移动、AI和射击
 */

class Enemy {
    constructor(x, y, type, modifiers = {}) {
        this.x = x;
        this.y = y;
        this.type = type || 'SMALL';

        // 从配置获取属性
        const config = GameConfig.ENEMY_TYPES[this.type];
        const healthMultiplier = modifiers.healthMultiplier || 1;
        const speedMultiplier = modifiers.speedMultiplier || 1;
        const damageMultiplier = modifiers.damageMultiplier || 1;
        const scoreMultiplier = modifiers.scoreMultiplier || 1;

        this.maxHealth = Math.round(config.HEALTH * healthMultiplier);
        this.health = this.maxHealth;
        this.speed = config.SPEED * speedMultiplier;
        this.scoreValue = Math.round(config.SCORE * scoreMultiplier);
        this.width = config.WIDTH;
        this.height = config.HEIGHT;
        this.fireRate = config.FIRE_RATE;
        this.damage = config.DAMAGE * damageMultiplier;

        this.alive = true;
        this.lastFireTime = 0;

        // AI行为模式
        this.movePattern = this.selectMovePattern();
        this.patternTime = 0;
        this.patternParam = Math.random() * Math.PI * 2; // 用于正弦波等运动
    }

    /**
     * 选择移动模式
     */
    selectMovePattern() {
        const patterns = ['straight', 'zigzag', 'sine'];
        return patterns[Math.floor(Math.random() * patterns.length)];
    }

    /**
     * 更新
     */
    update(deltaTime, player, currentTime) {
        this.patternTime += deltaTime / 1000;

        // 根据移动模式更新位置
        let xChanged = false;
        switch (this.movePattern) {
            case 'straight':
                this.y += this.speed;
                break;

            case 'zigzag':
                this.y += this.speed;
                this.x += Math.sin(this.patternTime * 3) * 2;
                xChanged = true;
                break;

            case 'sine':
                this.y += this.speed * 0.7;
                this.x += Math.cos(this.patternTime * 2 + this.patternParam) * 3;
                xChanged = true;
                break;
        }

        // 保持在屏幕内(横向) - 只在X位置改变时检查
        if (xChanged) {
            this.x = Math.max(this.width / 2, Math.min(GameConfig.CANVAS_WIDTH - this.width / 2, this.x));
        }

        // 射击AI
        if (this.canShoot(player, currentTime)) {
            return this.shoot(player);
        }

        return null;
    }

    /**
     * 判断是否可以射击
     */
    canShoot(player, currentTime) {
        if (currentTime - this.lastFireTime < this.fireRate) {
            return false;
        }

        // 只有当玩家在下方时才射击
        if (player.y > this.y + 50) {
            // 使用平方距离避免sqrt计算
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distanceSquared = dx * dx + dy * dy;

            // 在一定范围内才射击 (300^2 = 90000)
            if (distanceSquared < 90000) {
                this.lastFireTime = currentTime;
                // 缓存计算结果供shoot使用
                this._cachedDx = dx;
                this._cachedDy = dy;
                this._cachedDistance = Math.sqrt(distanceSquared);
                return true;
            }
        }

        return false;
    }

    /**
     * 射击
     */
    shoot(player) {
        // 使用缓存的距离计算结果
        const dx = this._cachedDx;
        const dy = this._cachedDy;
        const distance = this._cachedDistance;

        const vx = (dx / distance) * 3;
        const vy = (dy / distance) * 3;

        return new Bullet(
            this.x,
            this.y + this.height / 2,
            vx,
            vy,
            this.damage,
            'enemy'
        );
    }

    /**
     * 受到伤害
     */
    takeDamage(damage) {
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
     * 掉落道具(由外部调用)
     */
    shouldDropItem() {
        // 根据配置的掉落率决定是否掉落道具
        const roll = Math.random();
        let cumulativeRate = 0;

        for (const [type, config] of Object.entries(GameConfig.ITEM_TYPES)) {
            cumulativeRate += config.DROP_RATE;
            if (roll < cumulativeRate) {
                return type;
            }
        }

        return null;
    }

    /**
     * 渲染
     */
    render(ctx) {
        if (!this.alive) return;

        // 根据类型选择颜色
        let color;
        switch (this.type) {
            case 'SMALL':
                color = GameConfig.COLORS.ENEMY_SMALL;
                break;
            case 'MEDIUM':
                color = GameConfig.COLORS.ENEMY_MEDIUM;
                break;
            case 'LARGE':
                color = GameConfig.COLORS.ENEMY_LARGE;
                break;
            default:
                color = GameConfig.COLORS.ENEMY_SMALL;
        }

        // 缓存半宽高
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;

        // 绘制敌机主体(倒三角形)
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + halfHeight);
        ctx.lineTo(this.x - halfWidth, this.y - halfHeight);
        ctx.lineTo(this.x + halfWidth, this.y - halfHeight);
        ctx.closePath();
        ctx.fill();

        // 绘制敌机细节
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fill();

        // 绘制生命条
        this.renderHealthBar(ctx, halfWidth, halfHeight);
    }

    /**
     * 渲染生命条
     */
    renderHealthBar(ctx, halfWidth, halfHeight) {
        const barWidth = this.width;
        const barHeight = 4;
        const barX = this.x - halfWidth;
        const barY = this.y - halfHeight - 10;

        // 背景
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // 生命值
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Enemy;
}
