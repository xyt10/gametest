/**
 * 碰撞管理器
 * 处理所有游戏对象之间的碰撞检测
 */

class CollisionManager {
    constructor(gameScene) {
        this.gameScene = gameScene;
    }

    /**
     * 检查所有碰撞
     */
    checkCollisions() {
        // 玩家子弹 vs 敌机
        this.checkPlayerBulletsVsEnemies();

        // 玩家子弹 vs Boss
        if (this.gameScene.boss && !this.gameScene.boss.isDead()) {
            this.checkPlayerBulletsVsBoss();
        }

        // 敌机子弹 vs 玩家
        this.checkEnemyBulletsVsPlayer();

        // 敌机子弹 vs 僚机
        this.checkEnemyBulletsVsWingmen();

        // 敌机 vs 玩家(撞击)
        this.checkEnemiesVsPlayer();

        // 敌机 vs 僚机
        this.checkEnemiesVsWingmen();

        // Boss vs 玩家
        if (this.gameScene.boss && !this.gameScene.boss.isDead()) {
            this.checkBossVsPlayer();
        }

        // 道具 vs 玩家
        this.checkItemsVsPlayer();
    }

    /**
     * 玩家子弹 vs 敌机
     */
    checkPlayerBulletsVsEnemies() {
        const bullets = this.gameScene.bullets;
        const enemies = this.gameScene.enemies;

        // 早期退出优化
        if (bullets.length === 0 || enemies.length === 0) return;

        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            if (!bullet.alive) continue;

            // 获取一次子弹边界
            const bulletBounds = bullet.getBounds();

            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                if (!enemy.alive) continue;

                if (this.checkCollisionBounds(bulletBounds, enemy.getBounds())) {
                    // 造成伤害
                    enemy.takeDamage(bullet.damage);
                    bullet.destroy();

                    // 粒子效果和音效
                    this.gameScene.particleSystem.createHitSparks(bullet.x, bullet.y);
                    this.gameScene.audioManager.play('hit', 0.5);

                    // 敌机被击毁
                    if (enemy.isDead()) {
                        this.gameScene.score += enemy.scoreValue;
                        this.gameScene.player.addExp(enemy.scoreValue);

                        // 爆炸效果和音效
                        this.gameScene.particleSystem.createExplosion(enemy.x, enemy.y, '#ff6600', 20, 3);
                        this.gameScene.audioManager.play('explosion', 0.7);

                        // 可能掉落道具
                        const itemType = enemy.shouldDropItem();
                        if (itemType) {
                            this.spawnItem(enemy.x, enemy.y, itemType);
                        }

                        enemies.splice(j, 1);
                    }

                    bullets.splice(i, 1);
                    break;
                }
            }
        }
    }

    /**
     * 玩家子弹 vs Boss
     */
    checkPlayerBulletsVsBoss() {
        const bullets = this.gameScene.bullets;
        const boss = this.gameScene.boss;

        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            if (!bullet.alive) continue;

            if (this.checkCollision(bullet, boss)) {
                boss.takeDamage(bullet.damage);
                bullet.destroy();
                bullets.splice(i, 1);

                // Boss被击败
                if (boss.isDead()) {
                    this.gameScene.score += boss.scoreValue;
                    this.gameScene.player.addExp(boss.scoreValue);

                    // Boss必定掉落多个道具
                    this.spawnItem(boss.x - 40, boss.y, 'HEALTH');
                    this.spawnItem(boss.x + 40, boss.y, 'POWER_UP');
                    this.spawnItem(boss.x, boss.y + 40, 'SHIELD');
                }
            }
        }
    }

    /**
     * 敌机子弹 vs 玩家
     */
    checkEnemyBulletsVsPlayer() {
        const bullets = this.gameScene.enemyBullets;
        const player = this.gameScene.player;

        if (!player.alive) return;

        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            if (!bullet.alive) continue;

            if (this.checkCollision(bullet, player)) {
                player.takeDamage(bullet.damage);
                bullet.destroy();
                bullets.splice(i, 1);
            }
        }
    }

    /**
     * 敌机 vs 玩家(撞击)
     */
    checkEnemiesVsPlayer() {
        const enemies = this.gameScene.enemies;
        const player = this.gameScene.player;

        if (!player.alive) return;

        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            if (!enemy.alive) continue;

            if (this.checkCollision(enemy, player)) {
                // 双方都受伤
                player.takeDamage(enemy.damage);
                enemy.takeDamage(9999); // 撞击后敌机立即被摧毁

                if (enemy.isDead()) {
                    enemies.splice(i, 1);
                }
            }
        }
    }

    /**
     * Boss vs 玩家
     */
    checkBossVsPlayer() {
        const boss = this.gameScene.boss;
        const player = this.gameScene.player;

        if (!player.alive || !boss.alive) return;

        if (this.checkCollision(boss, player)) {
            player.takeDamage(boss.damage);
        }
    }

    /**
     * 敌机子弹 vs 僚机
     */
    checkEnemyBulletsVsWingmen() {
        const bullets = this.gameScene.enemyBullets;
        const wingmen = this.gameScene.wingmen;

        if (wingmen.length === 0) return;

        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            if (!bullet.alive) continue;

            for (let j = wingmen.length - 1; j >= 0; j--) {
                const wingman = wingmen[j];
                if (!wingman.alive) continue;

                if (this.checkCollision(bullet, wingman)) {
                    wingman.takeDamage(bullet.damage);
                    bullet.destroy();
                    bullets.splice(i, 1);

                    // 粒子效果
                    this.gameScene.particleSystem.createHitSparks(bullet.x, bullet.y);

                    // 僚机被击毁
                    if (wingman.isDead()) {
                        this.gameScene.particleSystem.createExplosion(wingman.x, wingman.y, wingman.color, 15, 2);
                        this.gameScene.audioManager.play('explosion', 0.5);
                        wingmen.splice(j, 1);
                        console.log('僚机被击毁！');
                    }

                    break;
                }
            }
        }
    }

    /**
     * 敌机 vs 僚机
     */
    checkEnemiesVsWingmen() {
        const enemies = this.gameScene.enemies;
        const wingmen = this.gameScene.wingmen;

        if (wingmen.length === 0) return;

        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            if (!enemy.alive) continue;

            for (let j = wingmen.length - 1; j >= 0; j--) {
                const wingman = wingmen[j];
                if (!wingman.alive) continue;

                if (this.checkCollision(enemy, wingman)) {
                    // 双方都受伤
                    wingman.takeDamage(enemy.damage);
                    enemy.takeDamage(9999); // 撞击后敌机立即被摧毁

                    if (enemy.isDead()) {
                        enemies.splice(i, 1);
                    }

                    if (wingman.isDead()) {
                        this.gameScene.particleSystem.createExplosion(wingman.x, wingman.y, wingman.color, 15, 2);
                        this.gameScene.audioManager.play('explosion', 0.5);
                        wingmen.splice(j, 1);
                        console.log('僚机被撞毁！');
                    }

                    break;
                }
            }
        }
    }

    /**
     * 道具 vs 玩家
     */
    checkItemsVsPlayer() {
        const items = this.gameScene.items;
        const player = this.gameScene.player;

        if (!player.alive) return;

        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];

            if (this.checkCollision(item, player)) {
                this.applyItemEffect(item, player);
                items.splice(i, 1);
            }
        }
    }

    /**
     * AABB碰撞检测 (使用已获取的边界)
     */
    checkCollisionBounds(bounds1, bounds2) {
        return (
            bounds1.x < bounds2.x + bounds2.width &&
            bounds1.x + bounds1.width > bounds2.x &&
            bounds1.y < bounds2.y + bounds2.height &&
            bounds1.y + bounds1.height > bounds2.y
        );
    }

    /**
     * AABB碰撞检测 (原方法保持兼容性)
     */
    checkCollision(obj1, obj2) {
        const bounds1 = obj1.getBounds();
        const bounds2 = obj2.getBounds();
        return this.checkCollisionBounds(bounds1, bounds2);
    }

    /**
     * 生成道具
     */
    spawnItem(x, y, type) {
        const item = new Item(x, y, type);
        this.gameScene.items.push(item);
    }

    /**
     * 应用道具效果
     */
    applyItemEffect(item, player) {
        const config = GameConfig.ITEM_TYPES[item.type];

        // 通用收集效果
        this.gameScene.particleSystem.createEnergyEffect(item.x, item.y, config.COLOR);
        this.gameScene.audioManager.play('itemCollect');

        switch (item.type) {
            case 'HEALTH':
                player.heal(config.VALUE);
                break;

            case 'POWER_UP':
                player.activatePowerUp(config.DURATION, config.MULTIPLIER);
                this.gameScene.audioManager.play('powerUp');
                break;

            case 'SHIELD':
                player.activateShield(config.DURATION);
                this.gameScene.particleSystem.createShieldEffect(player.x, player.y);
                this.gameScene.audioManager.play('shield');
                break;

            case 'BOMB':
                this.activateBomb(config);
                this.gameScene.audioManager.play('bomb');
                break;

            case 'WINGMAN':
                this.spawnWingman(config);
                this.gameScene.audioManager.play('powerUp');
                break;
        }
    }

    /**
     * 激活炸弹效果
     */
    activateBomb(config) {
        const player = this.gameScene.player;
        const radius = config.RADIUS;
        const damage = config.DAMAGE;
        const radiusSquared = radius * radius; // 使用平方距离避免sqrt

        // 对所有在范围内的敌机造成伤害
        const enemies = this.gameScene.enemies;
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            const dx = enemy.x - player.x;
            const dy = enemy.y - player.y;
            const distanceSquared = dx * dx + dy * dy;

            if (distanceSquared <= radiusSquared) {
                enemy.takeDamage(damage);
                if (enemy.isDead()) {
                    this.gameScene.score += enemy.scoreValue;
                    enemies.splice(i, 1);
                }
            }
        }

        // 清空所有敌机子弹
        this.gameScene.enemyBullets = [];

        console.log('炸弹爆炸！');
    }

    /**
     * 生成僚机
     */
    spawnWingman(config) {
        const player = this.gameScene.player;
        const wingmen = this.gameScene.wingmen;

        // 最多2个僚机（左右各一个）
        if (wingmen.length >= 2) {
            console.log('僚机数量已达上限！');
            return;
        }

        // 确定僚机位置（左或右）
        const hasLeft = wingmen.some(w => w.position === 'LEFT');
        const hasRight = wingmen.some(w => w.position === 'RIGHT');

        let position = 'LEFT';
        if (hasLeft && !hasRight) {
            position = 'RIGHT';
        } else if (!hasLeft) {
            position = 'LEFT';
        } else if (hasRight && !hasLeft) {
            position = 'LEFT';
        }

        let wingmanType = config.WINGMAN_TYPE;
        if (!wingmanType) {
            const preferences = this.gameScene.selectedWingmanTypes || {};
            if (!hasLeft && preferences.LEFT) {
                wingmanType = preferences.LEFT;
            } else if (!hasRight && preferences.RIGHT) {
                wingmanType = preferences.RIGHT;
            } else {
                wingmanType = this.gameScene.preferredWingmanType || 'STANDARD';
            }
        }

        if (!wingmanType) {
            wingmanType = 'STANDARD';
        }

        // 创建僚机
        const wingman = new Wingman(player, position, wingmanType);
        wingmen.push(wingman);

        console.log(`${position}侧僚机加入！类型: ${wingman.name}`);
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CollisionManager;
}
