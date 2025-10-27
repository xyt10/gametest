/**
 * 敌机生成器
 * 管理敌机的生成时机和类型
 */

class EnemySpawner {
    constructor(gameScene) {
        this.gameScene = gameScene;
        this.lastSpawnTime = 0;
        this.enemiesSpawned = 0;
        this.difficultyLevel = 1;
        this.levelConfig = null;

        this.enemyModifiers = {
            healthMultiplier: 1,
            speedMultiplier: 1,
            damageMultiplier: 1,
            scoreMultiplier: 1
        };

        this.bossModifiers = {
            healthMultiplier: 1,
            damageMultiplier: 1,
            scoreMultiplier: 1
        };

        this.minInterval = GameConfig.SPAWN.MIN_INTERVAL;
        this.difficultyStep = GameConfig.SPAWN.DIFFICULTY_INCREASE;
        this.spawnInterval = GameConfig.SPAWN.INITIAL_INTERVAL;

        this.applyLevelModifiers();
    }

    /**
     * 重置生成器
     */
    reset() {
        this.applyLevelModifiers();
        this.lastSpawnTime = 0;
        this.enemiesSpawned = 0;
        this.difficultyLevel = 1;
    }

    /**
     * 设置关卡配置
     */
    setLevelConfig(levelConfig) {
        this.levelConfig = levelConfig || null;
        this.applyLevelModifiers();
    }

    /**
     * 根据当前关卡应用修正
     */
    applyLevelModifiers() {
        const modifiers = this.levelConfig && this.levelConfig.MODIFIERS ? this.levelConfig.MODIFIERS : {};

        const spawnIntervalMultiplier = modifiers.SPAWN_INTERVAL_MULTIPLIER || 1;
        const spawnMinMultiplier = modifiers.SPAWN_MIN_INTERVAL_MULTIPLIER || 1;
        const spawnDifficultyMultiplier = modifiers.SPAWN_DIFFICULTY_MULTIPLIER || 1;

        this.spawnInterval = GameConfig.SPAWN.INITIAL_INTERVAL * spawnIntervalMultiplier;
        this.minInterval = GameConfig.SPAWN.MIN_INTERVAL * spawnMinMultiplier;
        this.difficultyStep = GameConfig.SPAWN.DIFFICULTY_INCREASE * spawnDifficultyMultiplier;

        this.enemyModifiers = {
            healthMultiplier: modifiers.ENEMY_HEALTH_MULTIPLIER || 1,
            speedMultiplier: modifiers.ENEMY_SPEED_MULTIPLIER || 1,
            damageMultiplier: modifiers.ENEMY_DAMAGE_MULTIPLIER || 1,
            scoreMultiplier: modifiers.SCORE_MULTIPLIER || 1
        };

        this.bossModifiers = {
            healthMultiplier: modifiers.BOSS_HEALTH_MULTIPLIER || modifiers.ENEMY_HEALTH_MULTIPLIER || 1,
            damageMultiplier: modifiers.BOSS_DAMAGE_MULTIPLIER || modifiers.ENEMY_DAMAGE_MULTIPLIER || 1,
            scoreMultiplier: modifiers.SCORE_MULTIPLIER || 1
        };
    }

    /**
     * 更新
     */
    update(deltaTime) {
        const currentTime = Date.now();

        // 检查是否应该生成敌机
        if (currentTime - this.lastSpawnTime >= this.spawnInterval) {
            this.spawnEnemy();
            this.lastSpawnTime = currentTime;

            // 逐渐增加难度
            this.enemiesSpawned++;
            if (this.enemiesSpawned % 10 === 0) {
                this.increaseDifficulty();
            }
        }
    }

    /**
     * 生成敌机
     */
    spawnEnemy() {
        // 随机位置
        const x = Math.random() * (GameConfig.CANVAS_WIDTH - 100) + 50;
        const y = -50;

        // 根据难度决定敌机类型
        const type = this.selectEnemyType();

        const enemy = new Enemy(x, y, type, this.enemyModifiers);
        this.gameScene.enemies.push(enemy);
    }

    /**
     * 选择敌机类型
     */
    selectEnemyType() {
        const roll = Math.random();

        // 根据难度等级调整概率
        if (this.difficultyLevel <= 2) {
            // 早期: 主要是小型敌机
            if (roll < 0.7) return 'SMALL';
            if (roll < 0.95) return 'MEDIUM';
            return 'LARGE';
        } else if (this.difficultyLevel <= 5) {
            // 中期: 混合
            if (roll < 0.4) return 'SMALL';
            if (roll < 0.8) return 'MEDIUM';
            return 'LARGE';
        } else {
            // 后期: 更多强力敌机
            if (roll < 0.2) return 'SMALL';
            if (roll < 0.6) return 'MEDIUM';
            return 'LARGE';
        }
    }

    /**
     * 增加难度
     */
    increaseDifficulty() {
        this.difficultyLevel++;

        // 缩短生成间隔
        this.spawnInterval = Math.max(
            this.minInterval,
            this.spawnInterval * this.difficultyStep
        );

        console.log(`难度提升! 等级: ${this.difficultyLevel}, 生成间隔: ${this.spawnInterval}ms`);
    }

    /**
     * 生成Boss
     */
    spawnBoss() {
        const x = GameConfig.CANVAS_WIDTH / 2;
        const y = -100;

        const boss = new Boss(x, y, this.bossModifiers);
        this.gameScene.boss = boss;

        console.log('Boss出现！');
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnemySpawner;
}
