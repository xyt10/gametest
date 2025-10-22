/**
 * 敌机生成器
 * 管理敌机的生成时机和类型
 */

class EnemySpawner {
    constructor(gameScene) {
        this.gameScene = gameScene;
        this.spawnInterval = GameConfig.SPAWN.INITIAL_INTERVAL;
        this.lastSpawnTime = 0;
        this.enemiesSpawned = 0;
        this.difficultyLevel = 1;
    }

    /**
     * 重置生成器
     */
    reset() {
        this.spawnInterval = GameConfig.SPAWN.INITIAL_INTERVAL;
        this.lastSpawnTime = 0;
        this.enemiesSpawned = 0;
        this.difficultyLevel = 1;
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

        const enemy = new Enemy(x, y, type);
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
            GameConfig.SPAWN.MIN_INTERVAL,
            this.spawnInterval * GameConfig.SPAWN.DIFFICULTY_INCREASE
        );

        console.log(`难度提升! 等级: ${this.difficultyLevel}, 生成间隔: ${this.spawnInterval}ms`);
    }

    /**
     * 生成Boss
     */
    spawnBoss() {
        const x = GameConfig.CANVAS_WIDTH / 2;
        const y = -100;

        const boss = new Boss(x, y);
        this.gameScene.boss = boss;

        console.log('Boss出现！');
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnemySpawner;
}
