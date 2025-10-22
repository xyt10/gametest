/**
 * 道具类
 * 处理各种增益道具
 */

class Item {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;

        this.width = 20;
        this.height = 20;
        this.speed = 2;

        // 获取颜色配置
        this.color = GameConfig.ITEM_TYPES[type].COLOR;

        // 动画
        this.animationTime = 0;
    }

    /**
     * 更新
     */
    update(deltaTime) {
        this.y += this.speed;
        this.animationTime += deltaTime / 1000;
    }

    /**
     * 是否超出屏幕
     */
    isOutOfBounds() {
        return this.y > GameConfig.CANVAS_HEIGHT + 50;
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
        // 旋转和脉冲效果
        const pulse = 1 + Math.sin(this.animationTime * 5) * 0.2;
        const size = this.width * pulse;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.animationTime * 2);

        // 外发光效果
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;

        // 绘制道具形状
        switch (this.type) {
            case 'HEALTH':
                // 十字(生命)
                ctx.fillStyle = this.color;
                ctx.fillRect(-size / 4, -size / 2, size / 2, size);
                ctx.fillRect(-size / 2, -size / 4, size, size / 2);
                break;

            case 'POWER_UP':
                // 星形(火力)
                ctx.fillStyle = this.color;
                this.drawStar(ctx, 0, 0, 5, size / 2, size / 4);
                break;

            case 'SHIELD':
                // 六边形(护盾)
                ctx.fillStyle = this.color;
                this.drawPolygon(ctx, 0, 0, size / 2, 6);
                break;

            case 'BOMB':
                // 菱形(炸弹)
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.moveTo(0, -size / 2);
                ctx.lineTo(size / 2, 0);
                ctx.lineTo(0, size / 2);
                ctx.lineTo(-size / 2, 0);
                ctx.closePath();
                ctx.fill();
                break;
        }

        ctx.shadowBlur = 0;
        ctx.restore();

        // 绘制类型文字
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        const label = this.getLabel();
        ctx.fillText(label, this.x, this.y + size / 2 + 15);
    }

    /**
     * 获取道具标签
     */
    getLabel() {
        switch (this.type) {
            case 'HEALTH':
                return 'HP';
            case 'POWER_UP':
                return 'PWR';
            case 'SHIELD':
                return 'SLD';
            case 'BOMB':
                return 'BOMB';
            default:
                return '';
        }
    }

    /**
     * 绘制星形
     */
    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);

        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }

        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * 绘制多边形
     */
    drawPolygon(ctx, cx, cy, radius, sides) {
        const angle = (Math.PI * 2) / sides;

        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const x = cx + radius * Math.cos(i * angle - Math.PI / 2);
            const y = cy + radius * Math.sin(i * angle - Math.PI / 2);

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Item;
}
