/**
 * 粒子系统
 * 用于创建爆炸、拖尾等视觉效果
 */

/**
 * 单个粒子类
 */
class Particle {
    constructor(x, y, vx, vy, color, size, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.life = life;
        this.maxLife = life;
        this.alpha = 1;
        this.gravity = 0.1;
        this.friction = 0.98;
    }

    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= this.friction;
        this.vy *= this.friction;

        this.life -= deltaTime / 1000;
        this.alpha = this.life / this.maxLife;

        return this.life > 0;
    }

    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

/**
 * 粒子系统管理器
 */
class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    /**
     * 创建爆炸效果
     */
    createExplosion(x, y, color = '#ff6600', count = 20, size = 3) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
            const speed = 2 + Math.random() * 4;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const particleSize = size + Math.random() * size;
            const life = 0.5 + Math.random() * 0.5;

            this.particles.push(new Particle(x, y, vx, vy, color, particleSize, life));
        }
    }

    /**
     * 创建小型爆炸
     */
    createSmallExplosion(x, y, color = '#ffaa00') {
        this.createExplosion(x, y, color, 10, 2);
    }

    /**
     * 创建大型爆炸
     */
    createLargeExplosion(x, y, color = '#ff3300') {
        this.createExplosion(x, y, color, 40, 5);

        // 添加火花
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 5;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            this.particles.push(new Particle(x, y, vx, vy, '#ffff00', 2, 0.8));
        }
    }

    /**
     * 创建引擎尾焰
     */
    createEngineTrail(x, y, color = '#00aaff') {
        const vx = (Math.random() - 0.5) * 2;
        const vy = 2 + Math.random() * 2;
        const size = 2 + Math.random() * 2;
        const life = 0.3 + Math.random() * 0.2;

        this.particles.push(new Particle(x, y, vx, vy, color, size, life));
    }

    /**
     * 创建子弹拖尾
     */
    createBulletTrail(x, y, color = '#00ffff', direction = 'up') {
        const vx = (Math.random() - 0.5) * 0.5;
        const vy = direction === 'up' ? 1 : -1;
        const size = 1 + Math.random();
        const life = 0.2 + Math.random() * 0.1;

        this.particles.push(new Particle(x, y, vx, vy, color, size, life));
    }

    /**
     * 创建击中火花
     */
    createHitSparks(x, y, color = '#ffaa00') {
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            this.particles.push(new Particle(x, y, vx, vy, color, 2, 0.3));
        }
    }

    /**
     * 创建能量收集效果
     */
    createEnergyEffect(x, y, color = '#00ff00') {
        for (let i = 0; i < 15; i++) {
            const angle = (Math.PI * 2 / 15) * i;
            const speed = 2 + Math.random();
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            this.particles.push(new Particle(x, y, vx, vy, color, 2, 0.5));
        }
    }

    /**
     * 创建升级光环
     */
    createLevelUpEffect(x, y) {
        const colors = ['#ffff00', '#ff00ff', '#00ffff'];

        for (let ring = 0; ring < 3; ring++) {
            for (let i = 0; i < 20; i++) {
                const angle = (Math.PI * 2 / 20) * i;
                const speed = 3 + ring;
                const vx = Math.cos(angle) * speed;
                const vy = Math.sin(angle) * speed;
                const color = colors[ring % colors.length];

                this.particles.push(new Particle(x, y, vx, vy, color, 3, 0.6));
            }
        }
    }

    /**
     * 创建冲击波效果
     */
    createShockwave(x, y, color = '#ffff00') {
        for (let i = 0; i < 50; i++) {
            const angle = (Math.PI * 2 / 50) * i + Math.random() * 0.2;
            const speed = 5 + Math.random() * 3;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            this.particles.push(new Particle(x, y, vx, vy, color, 3, 0.4));
        }
    }

    /**
     * 创建护盾激活效果
     */
    createShieldEffect(x, y) {
        for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 / 30) * i;
            const speed = 3 + Math.random() * 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            this.particles.push(new Particle(x, y, vx, vy, '#00ffff', 2, 0.5));
        }
    }

    /**
     * 更新所有粒子
     */
    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const alive = this.particles[i].update(deltaTime);
            if (!alive) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * 渲染所有粒子
     */
    render(ctx) {
        this.particles.forEach(particle => particle.render(ctx));
    }

    /**
     * 清空所有粒子
     */
    clear() {
        this.particles = [];
    }

    /**
     * 获取粒子数量
     */
    getCount() {
        return this.particles.length;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ParticleSystem;
}
