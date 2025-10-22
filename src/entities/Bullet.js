/**
 * 子弹类
 * 处理子弹的移动和渲染，支持多种子弹类型
 */

class Bullet {
    constructor(x, y, vx, vy, damage, owner, bulletType = 'NORMAL') {
        this.x = x;
        this.y = y;
        this.vx = vx; // 水平速度
        this.vy = vy; // 垂直速度
        this.damage = damage;
        this.owner = owner; // 'player' 或 'enemy'
        this.bulletType = bulletType;

        // 从配置获取子弹类型属性
        const config = owner === 'player' && GameConfig.BULLET_TYPES[bulletType]
            ? GameConfig.BULLET_TYPES[bulletType]
            : GameConfig.BULLET;

        this.width = config.WIDTH || GameConfig.BULLET.WIDTH;
        this.height = config.HEIGHT || GameConfig.BULLET.HEIGHT;
        this.alive = true;

        // 特殊属性
        this.pierce = config.PIERCE || false;
        this.pierceCount = config.PIERCE_COUNT || 0;
        this.pierceHits = 0;  // 已穿透次数

        this.homing = config.HOMING || false;
        this.homingStrength = config.HOMING_STRENGTH || 0;

        this.color = config.COLOR || '#00ffff';
        this.splashRadius = config.SPLASH_RADIUS || 0;

        // 导弹特效
        this.trailPositions = [];
        this.rotationAngle = 0;
    }

    /**
     * 更新位置
     */
    update(deltaTime, enemies) {
        // 追踪导弹逻辑
        if (this.homing && this.owner === 'player' && enemies && enemies.length > 0) {
            this.updateHoming(enemies);
        }

        this.x += this.vx;
        this.y += this.vy;

        // 更新旋转角度（导弹使用）
        if (this.homing) {
            this.rotationAngle = Math.atan2(this.vy, this.vx) + Math.PI / 2;

            // 记录轨迹位置
            this.trailPositions.push({x: this.x, y: this.y});
            if (this.trailPositions.length > 10) {
                this.trailPositions.shift();
            }
        }
    }

    /**
     * 追踪最近的敌人
     */
    updateHoming(enemies) {
        let closestEnemy = null;
        let minDistance = Infinity;

        // 找到最近的活着的敌人
        for (const enemy of enemies) {
            if (!enemy.alive) continue;

            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distanceSquared = dx * dx + dy * dy;

            if (distanceSquared < minDistance) {
                minDistance = distanceSquared;
                closestEnemy = enemy;
            }
        }

        // 如果找到目标，调整速度方向
        if (closestEnemy) {
            const dx = closestEnemy.x - this.x;
            const dy = closestEnemy.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
                // 计算目标方向
                const targetVx = (dx / distance) * Math.abs(this.vy);
                const targetVy = (dy / distance) * Math.abs(this.vy);

                // 平滑转向
                this.vx += (targetVx - this.vx) * this.homingStrength;
                this.vy += (targetVy - this.vy) * this.homingStrength;
            }
        }
    }

    /**
     * 检查是否超出屏幕
     */
    isOutOfBounds() {
        return (
            this.x < -10 ||
            this.x > GameConfig.CANVAS_WIDTH + 10 ||
            this.y < -10 ||
            this.y > GameConfig.CANVAS_HEIGHT + 10
        );
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
     * 标记为死亡（考虑穿透）
     */
    destroy() {
        if (this.pierce) {
            this.pierceHits++;
            if (this.pierceHits >= this.pierceCount) {
                this.alive = false;
            }
            // 穿透弹继续存在
        } else {
            this.alive = false;
        }
    }

    /**
     * 强制销毁
     */
    forceDestroy() {
        this.alive = false;
    }

    /**
     * 渲染
     */
    render(ctx, particleSystem) {
        if (!this.alive) return;

        if (this.owner === 'player') {
            this.renderPlayerBullet(ctx, particleSystem);
        } else {
            this.renderEnemyBullet(ctx, particleSystem);
        }
    }

    /**
     * 渲染玩家子弹（根据类型）
     */
    renderPlayerBullet(ctx, particleSystem) {
        switch (this.bulletType) {
            case 'LASER':
                this.renderLaser(ctx, particleSystem);
                break;
            case 'MISSILE':
                this.renderMissile(ctx, particleSystem);
                break;
            case 'SPREAD':
                this.renderSpread(ctx, particleSystem);
                break;
            case 'PLASMA':
                this.renderPlasma(ctx, particleSystem);
                break;
            default:
                this.renderNormal(ctx, particleSystem);
        }
    }

    /**
     * 渲染普通子弹
     */
    renderNormal(ctx, particleSystem) {
        // 拖尾效果
        if (particleSystem && Math.random() > 0.5) {
            particleSystem.createBulletTrail(this.x, this.y + this.height / 2, this.color, 'up');
        }

        // 创建渐变效果
        const gradient = ctx.createLinearGradient(
            this.x, this.y - this.height / 2,
            this.x, this.y + this.height / 2
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, this.adjustColor(this.color, 0.8));
        gradient.addColorStop(1, this.adjustColor(this.color, 0.3));

        ctx.fillStyle = gradient;

        // 绘制子弹主体
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.height / 2);
        ctx.lineTo(this.x - this.width / 2, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2);
        ctx.closePath();
        ctx.fill();

        // 绘制核心光点
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * 渲染激光
     */
    renderLaser(ctx, particleSystem) {
        if (particleSystem && Math.random() > 0.3) {
            particleSystem.createBulletTrail(this.x, this.y + this.height / 2, this.color, 'up');
        }

        // 激光核心
        const gradient = ctx.createLinearGradient(
            this.x - this.width / 2, this.y,
            this.x + this.width / 2, this.y
        );
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0)');
        gradient.addColorStop(0.5, 'rgba(255, 0, 0, 1)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);

        // 白色核心线
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x - 2, this.y - this.height / 2, 4, this.height);
    }

    /**
     * 渲染导弹
     */
    renderMissile(ctx, particleSystem) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotationAngle);

        // 绘制尾焰拖尾
        if (particleSystem && Math.random() > 0.5) {
            particleSystem.createEngineTrail(this.x, this.y + this.height / 2, '#ff6600');
        }

        // 绘制轨迹
        if (this.trailPositions.length > 1) {
            ctx.strokeStyle = 'rgba(255, 170, 0, 0.4)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.trailPositions[0].x - this.x, this.trailPositions[0].y - this.y);
            for (let i = 1; i < this.trailPositions.length; i++) {
                ctx.lineTo(this.trailPositions[i].x - this.x, this.trailPositions[i].y - this.y);
            }
            ctx.stroke();
        }

        // 导弹主体
        const gradient = ctx.createLinearGradient(0, -this.height / 2, 0, this.height / 2);
        gradient.addColorStop(0, '#ffaa00');
        gradient.addColorStop(0.6, '#ff6600');
        gradient.addColorStop(1, '#cc3300');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2);
        ctx.lineTo(-this.width / 2, this.height / 4);
        ctx.lineTo(0, this.height / 2);
        ctx.lineTo(this.width / 2, this.height / 4);
        ctx.closePath();
        ctx.fill();

        // 弹头
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, -this.height / 3, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * 渲染散弹
     */
    renderSpread(ctx, particleSystem) {
        if (particleSystem && Math.random() > 0.6) {
            particleSystem.createBulletTrail(this.x, this.y, this.color, 'up');
        }

        // 散弹为绿色小球
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.width);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, this.color);
        gradient.addColorStop(1, this.adjustColor(this.color, 0.3));

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * 渲染等离子炮
     */
    renderPlasma(ctx, particleSystem) {
        if (particleSystem && Math.random() > 0.4) {
            particleSystem.createBulletTrail(this.x, this.y, this.color, 'up');
        }

        // 外层光晕
        const outerGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.width);
        outerGradient.addColorStop(0, 'rgba(255, 0, 255, 1)');
        outerGradient.addColorStop(0.5, 'rgba(255, 0, 255, 0.6)');
        outerGradient.addColorStop(1, 'rgba(255, 0, 255, 0)');

        ctx.fillStyle = outerGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
        ctx.fill();

        // 核心能量球
        const coreGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.width / 2);
        coreGradient.addColorStop(0, '#ffffff');
        coreGradient.addColorStop(0.5, '#ff00ff');
        coreGradient.addColorStop(1, '#aa00ff');

        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * 渲染敌机子弹
     */
    renderEnemyBullet(ctx, particleSystem) {
        // 敌机子弹 - 黄色能量球with拖尾
        if (particleSystem && Math.random() > 0.5) {
            particleSystem.createBulletTrail(this.x, this.y - this.height / 2, '#ffaa00', 'down');
        }

        // 外层光晕
        const outerGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.width);
        outerGradient.addColorStop(0, 'rgba(255, 255, 0, 1)');
        outerGradient.addColorStop(0.5, 'rgba(255, 150, 0, 0.8)');
        outerGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

        ctx.fillStyle = outerGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
        ctx.fill();

        // 核心能量球
        const coreGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.width / 2);
        coreGradient.addColorStop(0, '#ffffff');
        coreGradient.addColorStop(0.5, '#ffff00');
        coreGradient.addColorStop(1, '#ffaa00');

        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * 调整颜色亮度
     */
    adjustColor(color, factor) {
        // 简单的颜色调整（添加透明度）
        if (color.startsWith('#')) {
            return color + Math.floor(255 * factor).toString(16).padStart(2, '0');
        }
        return color;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Bullet;
}
