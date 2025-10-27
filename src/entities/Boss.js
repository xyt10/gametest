/**
 * Boss类
 * 强大的Boss敌人,具有复杂的攻击模式
 */

class Boss {
    constructor(x, y, modifiers = {}) {
        this.x = x;
        this.y = y;

        // 从配置获取属性
        const config = GameConfig.BOSS;
        const healthMultiplier = modifiers.healthMultiplier || 1;
        const damageMultiplier = modifiers.damageMultiplier || 1;
        const scoreMultiplier = modifiers.scoreMultiplier || 1;

        this.maxHealth = Math.round(config.HEALTH * healthMultiplier);
        this.health = this.maxHealth;
        this.speed = config.SPEED;
        this.scoreValue = Math.round(config.SCORE * scoreMultiplier);
        this.width = config.WIDTH;
        this.height = config.HEIGHT;
        this.fireRate = config.FIRE_RATE;
        this.damage = config.DAMAGE * damageMultiplier;

        this.alive = true;
        this.lastFireTime = 0;

        // Boss状态
        this.phase = 1; // Boss阶段(1-3)
        this.phaseTime = 0;
        this.attackPattern = 'circle'; // 攻击模式
        this.patternTime = 0;

        // 移动
        this.targetX = x;
        this.moveDirection = 1;

        // 进入动画
        this.isEntering = true;
        this.enterY = 100; // 目标Y位置
    }

    /**
     * 更新
     */
    update(deltaTime, player, currentTime) {
        this.phaseTime += deltaTime;
        this.patternTime += deltaTime / 1000;

        // 进入动画
        if (this.isEntering) {
            this.y += this.speed;
            if (this.y >= this.enterY) {
                this.y = this.enterY;
                this.isEntering = false;
                console.log('Boss进入战场！');
            }
            return [];
        }

        // 根据生命值切换阶段
        const healthPercent = this.health / this.maxHealth;
        if (healthPercent < 0.3 && this.phase < 3) {
            this.phase = 3;
            this.changeAttackPattern();
        } else if (healthPercent < 0.6 && this.phase < 2) {
            this.phase = 2;
            this.changeAttackPattern();
        }

        // 移动逻辑
        this.updateMovement();

        // 射击逻辑
        return this.shoot(player, currentTime);
    }

    /**
     * 更新移动
     */
    updateMovement() {
        // 水平移动
        if (Math.abs(this.x - this.targetX) < 5) {
            // 选择新的目标位置
            this.targetX = 100 + Math.random() * (GameConfig.CANVAS_WIDTH - 200);
        }

        const dx = this.targetX - this.x;
        this.x += Math.sign(dx) * Math.min(this.speed, Math.abs(dx));

        // 轻微的垂直摆动
        this.y = this.enterY + Math.sin(this.patternTime * 2) * 20;
    }

    /**
     * 切换攻击模式
     */
    changeAttackPattern() {
        const patterns = ['circle', 'spray', 'aimed', 'spiral'];
        this.attackPattern = patterns[Math.floor(Math.random() * patterns.length)];
        this.patternTime = 0;
        console.log(`Boss切换到阶段${this.phase}, 攻击模式: ${this.attackPattern}`);
    }

    /**
     * 射击
     */
    shoot(player, currentTime) {
        if (currentTime - this.lastFireTime < this.fireRate) {
            return [];
        }

        this.lastFireTime = currentTime;
        const bullets = [];

        switch (this.attackPattern) {
            case 'circle':
                // 环形弹幕
                const bulletCount = 8 + this.phase * 4;
                const angleStep = (Math.PI * 2) / bulletCount;
                for (let i = 0; i < bulletCount; i++) {
                    const angle = angleStep * i + this.patternTime;
                    const vx = Math.cos(angle) * 4;
                    const vy = Math.sin(angle) * 4;
                    bullets.push(new Bullet(this.x, this.y, vx, vy, this.damage, 'enemy'));
                }
                break;

            case 'spray':
                // 扇形射击
                const spreadCount = 5 + this.phase * 2;
                const spreadAngle = Math.PI / 3;
                const spreadStep = spreadAngle / (spreadCount - 1);
                const baseAngle = Math.PI / 2 - spreadAngle / 2;
                for (let i = 0; i < spreadCount; i++) {
                    const angle = baseAngle + spreadStep * i;
                    const vx = Math.cos(angle) * 5;
                    const vy = Math.sin(angle) * 5;
                    bullets.push(new Bullet(this.x, this.y, vx, vy, this.damage, 'enemy'));
                }
                break;

            case 'aimed':
                // 追踪射击 - 优化距离计算
                const aimCount = 3 + this.phase;
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const vx = (dx / distance) * 5;
                const vy = (dy / distance) * 5;

                const spacing = 20;
                const offset = (aimCount - 1) * spacing / 2;
                for (let i = 0; i < aimCount; i++) {
                    bullets.push(new Bullet(
                        this.x + i * spacing - offset,
                        this.y,
                        vx,
                        vy,
                        this.damage,
                        'enemy'
                    ));
                }
                break;

            case 'spiral':
                // 螺旋弹幕
                const spiralAngle = this.patternTime * 2;
                const spiralStep = (Math.PI * 2) / 3;
                for (let i = 0; i < 3; i++) {
                    const angle = spiralAngle + spiralStep * i;
                    const vx = Math.cos(angle) * 4;
                    const vy = Math.sin(angle) * 4;
                    bullets.push(new Bullet(this.x, this.y, vx, vy, this.damage, 'enemy'));
                }
                break;
        }

        return bullets;
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
     * 渲染
     */
    render(ctx) {
        if (!this.alive) return;

        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;

        // 绘制Boss主体 - Boss外形(六边形)
        ctx.fillStyle = GameConfig.COLORS.BOSS;
        ctx.beginPath();
        const angleStep = Math.PI / 3; // (Math.PI * 2) / 6 = PI/3
        for (let i = 0; i < 6; i++) {
            const angle = angleStep * i;
            const x = this.x + Math.cos(angle) * halfWidth;
            const y = this.y + Math.sin(angle) * halfHeight;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();

        // Boss核心
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 20, 0, Math.PI * 2);
        ctx.fill();

        // 发光效果 (移除expensive shadow blur, 使用stroke代替)
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = angleStep * i;
            const x = this.x + Math.cos(angle) * halfWidth;
            const y = this.y + Math.sin(angle) * halfHeight;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();

        // 旋转装饰
        const rotationAngle = this.patternTime;
        const decorStep = (Math.PI * 2) / 3;
        ctx.fillStyle = '#ff6600';
        for (let i = 0; i < 3; i++) {
            const angle = rotationAngle + decorStep * i;
            const x = this.x + Math.cos(angle) * 40;
            const y = this.y + Math.sin(angle) * 40;

            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fill();
        }

        // 绘制生命条
        this.renderHealthBar(ctx);

        // 绘制阶段指示
        this.renderPhaseIndicator(ctx);
    }

    /**
     * 渲染生命条
     */
    renderHealthBar(ctx) {
        const barWidth = 200;
        const barHeight = 10;
        const barX = GameConfig.CANVAS_WIDTH / 2 - barWidth / 2;
        const barY = 30;

        // 标题
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('BOSS', GameConfig.CANVAS_WIDTH / 2, barY - 5);

        // 背景
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // 生命值
        const healthPercent = this.health / this.maxHealth;
        let color;
        if (healthPercent > 0.6) {
            color = '#ff0000';
        } else if (healthPercent > 0.3) {
            color = '#ff8800';
        } else {
            color = '#ffff00';
        }

        ctx.fillStyle = color;
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

        // 边框
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // 生命值数字
        ctx.font = '12px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText(`${Math.ceil(this.health)} / ${this.maxHealth}`, GameConfig.CANVAS_WIDTH / 2, barY + barHeight + 15);
    }

    /**
     * 渲染阶段指示
     */
    renderPhaseIndicator(ctx) {
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`PHASE ${this.phase}`, GameConfig.CANVAS_WIDTH / 2, 70);
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Boss;
}
