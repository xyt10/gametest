/**
 * 游戏HUD (Heads-Up Display)
 * 显示游戏中的UI信息
 */

class GameHUD {
    constructor(gameScene) {
        this.gameScene = gameScene;
    }

    /**
     * 渲染HUD
     */
    render(ctx) {
        this.renderTopBar(ctx);
        this.renderPlayerInfo(ctx);
        this.renderBuffIndicators(ctx);
    }

    /**
     * 渲染顶部信息栏 - 优化版本
     */
    renderTopBar(ctx) {
        const player = this.gameScene.player;

        // 半透明背景with渐变
        const gradient = ctx.createLinearGradient(0, 0, 0, 60);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, GameConfig.CANVAS_WIDTH, 60);

        // 分数
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.shadowColor = 'rgba(255, 255, 0, 0.8)';
        ctx.shadowBlur = 5;
        ctx.fillText('分数: ' + this.gameScene.score, 10, 25);

        // 关卡
        ctx.fillStyle = '#00ffff';
        ctx.fillText('关卡: ' + this.gameScene.stage, 10, 50);

        // 等级
        ctx.fillStyle = '#ff00ff';
        ctx.textAlign = 'right';
        ctx.shadowBlur = 0;

        // 等级背景
        const levelText = 'Lv.' + player.level;
        const levelMetrics = ctx.measureText(levelText);
        const levelX = GameConfig.CANVAS_WIDTH - 10 - levelMetrics.width - 10;

        ctx.fillStyle = 'rgba(255, 0, 255, 0.2)';
        ctx.fillRect(levelX, 10, levelMetrics.width + 10, 20);

        ctx.fillStyle = '#ff00ff';
        ctx.fillText(levelText, GameConfig.CANVAS_WIDTH - 10, 25);

        // 生命值
        this.renderHealthBar(ctx, GameConfig.CANVAS_WIDTH - 200, 30, 190, 20, player.health, player.maxHealth);
    }

    /**
     * 渲染生命值条 - 优化版本
     */
    renderHealthBar(ctx, x, y, width, height, current, max) {
        // 背景
        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        ctx.fillRect(x, y, width, height);

        // 边框
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);

        // 生命值条
        const healthPercent = current / max;
        const healthWidth = width * healthPercent;

        if (healthPercent > 0.6) {
            ctx.fillStyle = '#00ff00';
        } else if (healthPercent > 0.3) {
            ctx.fillStyle = '#ffff00';
        } else {
            ctx.fillStyle = '#ff0000';
        }

        ctx.fillRect(x, y, healthWidth, height);

        // 生命值文字
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.ceil(current)}/${max}`, x + width / 2, y + height / 2 + 4);
    }

    /**
     * 渲染经验值条 - 优化版本
     */
    renderPlayerInfo(ctx) {
        const player = this.gameScene.player;
        const x = 10;
        const y = 70;
        const expBarWidth = 200;
        const expBarHeight = 10;

        // 经验值条背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, expBarWidth, expBarHeight);

        // 经验值边框
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, expBarWidth, expBarHeight);

        // 经验值填充
        const expPercent = player.exp / player.expToNextLevel;
        const expGradient = ctx.createLinearGradient(x, y, x + expBarWidth * expPercent, y);
        expGradient.addColorStop(0, '#00ffff');
        expGradient.addColorStop(1, '#0099ff');

        ctx.fillStyle = expGradient;
        ctx.fillRect(x, y, expBarWidth * expPercent, expBarHeight);

        // 经验值文字
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`经验: ${player.exp}/${player.expToNextLevel}`, x, y + expBarHeight + 15);
    }

    /**
     * 渲染Buff指示器
     */
    renderBuffIndicators(ctx) {
        const player = this.gameScene.player;
        const x = GameConfig.CANVAS_WIDTH - 70;
        let y = 100;
        const iconSize = 40;
        const spacing = 50;

        // 护盾
        if (player.shields) {
            const timeLeft = (player.shieldEndTime - Date.now()) / 1000;
            this.renderBuffIcon(ctx, x, y, iconSize, '#00ffff', 'SLD', timeLeft);
            y += spacing;
        }

        // 火力强化
        if (player.powerUp) {
            const timeLeft = (player.powerUpEndTime - Date.now()) / 1000;
            this.renderBuffIcon(ctx, x, y, iconSize, '#ff0000', 'PWR', timeLeft);
            y += spacing;
        }
    }

    /**
     * 渲染单个Buff图标
     */
    renderBuffIcon(ctx, x, y, size, color, text, timeLeft) {
        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x, y, size, size);

        // 边框
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, size, size);

        // 文字
        ctx.fillStyle = color;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, x + size / 2, y + size / 2);

        // 剩余时间
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.fillText(timeLeft.toFixed(1) + 's', x + size / 2, y + size / 2 + 12);

        // 倒计时进度条
        const progressHeight = 3;
        const progress = timeLeft / (text === 'SLD' ? 8 : 5); // 假设最大时间
        ctx.fillStyle = color;
        ctx.fillRect(x, y + size - progressHeight, size * Math.min(1, progress), progressHeight);
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameHUD;
}
