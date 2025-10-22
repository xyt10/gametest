/**
 * 升级系统
 * 处理玩家的升级和属性强化
 */

class UpgradeSystem {
    constructor(player) {
        this.player = player;
    }

    /**
     * 检查并处理升级
     */
    checkLevelUp() {
        if (this.player.exp >= this.player.expToNextLevel) {
            this.player.levelUp();
            return true;
        }
        return false;
    }

    /**
     * 获取玩家当前属性
     */
    getPlayerStats() {
        return {
            level: this.player.level,
            health: this.player.health,
            maxHealth: this.player.maxHealth,
            damage: this.player.damage,
            fireRate: this.player.fireRate,
            exp: this.player.exp,
            expToNextLevel: this.player.expToNextLevel
        };
    }

    /**
     * 计算经验值百分比
     */
    getExpPercentage() {
        return (this.player.exp / this.player.expToNextLevel) * 100;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UpgradeSystem;
}
