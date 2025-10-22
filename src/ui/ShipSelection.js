/**
 * 战机选择界面
 * 允许玩家在游戏开始前选择战机类型
 */

class ShipSelection {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;

        // 选择状态
        this.selectedShipType = 'STANDARD'; // 默认选择标准型
        this.hoveredShipType = null;

        // 战机列表（按顺序排列）
        this.shipTypes = ['STANDARD', 'ASSAULT', 'TANK', 'INTERCEPTOR', 'HUNTER'];

        // 布局配置
        this.cardWidth = 85;
        this.cardHeight = 140;
        this.cardSpacing = 10;
        this.startX = (GameConfig.CANVAS_WIDTH - (this.cardWidth * 5 + this.cardSpacing * 4)) / 2;
        this.startY = 200;

        // 按钮
        this.confirmButton = {
            x: GameConfig.CANVAS_WIDTH / 2 - 80,
            y: 550,
            width: 160,
            height: 50,
            text: '确认选择'
        };

        // 动画
        this.animationTime = 0;

        // 触摸调试
        this.lastTouchPoint = null; // 用于可视化显示触摸点
        this.touchDebugTime = 0;

        // 绑定事件
        this.setupEvents();
    }

    /**
     * 设置事件监听
     */
    setupEvents() {
        // 获取坐标的辅助函数（考虑canvas缩放）
        const getCoordinates = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            let clientX, clientY;

            if (e.touches && e.touches.length > 0) {
                // 触摸事件
                clientX = e.touches[0].clientX - rect.left;
                clientY = e.touches[0].clientY - rect.top;
            } else {
                // 鼠标事件
                clientX = e.clientX - rect.left;
                clientY = e.clientY - rect.top;
            }

            // 转换坐标：从CSS显示坐标转换到canvas内部坐标
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;

            const x = clientX * scaleX;
            const y = clientY * scaleY;

            return { x, y };
        };

        // 处理点击/触摸的核心逻辑
        const handleInteraction = (x, y) => {
            console.log(`handleInteraction 被调用: (${Math.round(x)}, ${Math.round(y)})`);

            // 检查战机卡片点击
            this.shipTypes.forEach((type, index) => {
                const cardX = this.startX + index * (this.cardWidth + this.cardSpacing);
                const cardY = this.startY;

                if (x >= cardX && x <= cardX + this.cardWidth &&
                    y >= cardY && y <= cardY + this.cardHeight) {
                    this.selectedShipType = type;
                    console.log(`选择了战机: ${type}`);
                }
            });

            // 检查确认按钮点击
            if (x >= this.confirmButton.x && x <= this.confirmButton.x + this.confirmButton.width &&
                y >= this.confirmButton.y && y <= this.confirmButton.y + this.confirmButton.height) {
                console.log('确认按钮被点击!');
                this.onConfirm();
            }
        };

        // 处理悬停/触摸移动的核心逻辑
        const handleHover = (x, y) => {
            // 检查鼠标/触摸悬停
            this.hoveredShipType = null;
            this.shipTypes.forEach((type, index) => {
                const cardX = this.startX + index * (this.cardWidth + this.cardSpacing);
                const cardY = this.startY;

                if (x >= cardX && x <= cardX + this.cardWidth &&
                    y >= cardY && y <= cardY + this.cardHeight) {
                    this.hoveredShipType = type;
                }
            });

            // 检查按钮悬停
            this.isHoveringButton = (
                x >= this.confirmButton.x && x <= this.confirmButton.x + this.confirmButton.width &&
                y >= this.confirmButton.y && y <= this.confirmButton.y + this.confirmButton.height
            );
        };

        // 鼠标点击事件
        this.handleClick = (e) => {
            const { x, y } = getCoordinates(e);
            handleInteraction(x, y);
        };

        // 鼠标移动事件
        this.handleMouseMove = (e) => {
            const { x, y } = getCoordinates(e);
            handleHover(x, y);
        };

        // 触摸开始事件（用于触摸交互）
        this.handleTouchStart = (e) => {
            e.preventDefault(); // 防止触发鼠标事件
            const { x, y } = getCoordinates(e);
            handleHover(x, y);
        };

        // 触摸结束事件（用于确认选择）
        this.handleTouchEnd = (e) => {
            e.preventDefault(); // 防止触发鼠标事件
            // 使用changedTouches获取刚结束的触摸点
            if (e.changedTouches && e.changedTouches.length > 0) {
                const rect = this.canvas.getBoundingClientRect();
                const clientX = e.changedTouches[0].clientX - rect.left;
                const clientY = e.changedTouches[0].clientY - rect.top;

                // 转换坐标：从CSS显示坐标转换到canvas内部坐标
                const scaleX = this.canvas.width / rect.width;
                const scaleY = this.canvas.height / rect.height;
                const x = clientX * scaleX;
                const y = clientY * scaleY;

                // 记录触摸点用于可视化
                this.lastTouchPoint = { x, y };
                this.touchDebugTime = 2000; // 显示2秒

                console.log(`触摸坐标 - CSS: (${Math.round(clientX)}, ${Math.round(clientY)}), 内部: (${Math.round(x)}, ${Math.round(y)}), 缩放: ${scaleX.toFixed(2)}x${scaleY.toFixed(2)}`);
                console.log(`Canvas尺寸 - 内部: ${this.canvas.width}x${this.canvas.height}, 显示: ${Math.round(rect.width)}x${Math.round(rect.height)}`);
                console.log(`确认按钮区域: x=${this.confirmButton.x}-${this.confirmButton.x + this.confirmButton.width}, y=${this.confirmButton.y}-${this.confirmButton.y + this.confirmButton.height}`);

                handleInteraction(x, y);
            }
        };

        // 触摸移动事件
        this.handleTouchMove = (e) => {
            e.preventDefault(); // 防止页面滚动
            const { x, y } = getCoordinates(e);
            handleHover(x, y);
        };

        // 添加所有事件监听器
        this.canvas.addEventListener('click', this.handleClick);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false });
        this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    }

    /**
     * 移除事件监听
     */
    removeEvents() {
        this.canvas.removeEventListener('click', this.handleClick);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('touchstart', this.handleTouchStart);
        this.canvas.removeEventListener('touchend', this.handleTouchEnd);
        this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    }

    /**
     * 确认选择
     */
    onConfirm() {
        // 这个方法会被GameScene覆盖
        console.log('选择战机:', this.selectedShipType);
    }

    /**
     * 更新动画
     */
    update(deltaTime) {
        this.animationTime += deltaTime / 1000;

        // 更新触摸调试显示时间
        if (this.touchDebugTime > 0) {
            this.touchDebugTime -= deltaTime;
            if (this.touchDebugTime <= 0) {
                this.lastTouchPoint = null;
            }
        }
    }

    /**
     * 渲染选择界面
     */
    render() {
        const ctx = this.ctx;

        // 渐变背景
        const bgGradient = ctx.createLinearGradient(0, 0, 0, GameConfig.CANVAS_HEIGHT);
        bgGradient.addColorStop(0, '#001133');
        bgGradient.addColorStop(0.5, '#001a4d');
        bgGradient.addColorStop(1, '#002266');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT);

        // 标题
        this.renderTitle();

        // 战机卡片
        this.renderShipCards();

        // 详细信息面板
        this.renderDetailPanel();

        // 确认按钮
        this.renderConfirmButton();

        // 提示文字
        this.renderHints();

        // 触摸点可视化（用于调试）
        if (this.lastTouchPoint) {
            this.renderTouchDebug();
        }
    }

    /**
     * 渲染标题
     */
    renderTitle() {
        const ctx = this.ctx;

        // 主标题
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 发光效果
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00ffff';
        ctx.fillText('选择你的战机', GameConfig.CANVAS_WIDTH / 2, 80);
        ctx.shadowBlur = 0;

        // 副标题
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '16px Arial';
        ctx.fillText('每种战机都有独特的属性和武器', GameConfig.CANVAS_WIDTH / 2, 120);
    }

    /**
     * 渲染战机卡片
     */
    renderShipCards() {
        const ctx = this.ctx;

        this.shipTypes.forEach((type, index) => {
            const config = GameConfig.SHIP_TYPES[type];
            const x = this.startX + index * (this.cardWidth + this.cardSpacing);
            const y = this.startY;

            const isSelected = (type === this.selectedShipType);
            const isHovered = (type === this.hoveredShipType);

            // 卡片偏移（选中和悬停效果）
            let offsetY = 0;
            if (isSelected) {
                offsetY = -10 + Math.sin(this.animationTime * 3) * 3;
            } else if (isHovered) {
                offsetY = -5;
            }

            // 卡片背景
            ctx.save();
            ctx.translate(x, y + offsetY);

            // 背景渐变
            const cardGradient = ctx.createLinearGradient(0, 0, 0, this.cardHeight);
            if (isSelected) {
                cardGradient.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
                cardGradient.addColorStop(1, 'rgba(0, 100, 150, 0.5)');
            } else {
                cardGradient.addColorStop(0, 'rgba(100, 100, 100, 0.3)');
                cardGradient.addColorStop(1, 'rgba(50, 50, 50, 0.5)');
            }

            ctx.fillStyle = cardGradient;
            this.roundRect(ctx, 0, 0, this.cardWidth, this.cardHeight, 8);
            ctx.fill();

            // 边框
            ctx.strokeStyle = isSelected ? '#00ffff' : (isHovered ? '#ffffff' : '#666666');
            ctx.lineWidth = isSelected ? 3 : 2;
            this.roundRect(ctx, 0, 0, this.cardWidth, this.cardHeight, 8);
            ctx.stroke();

            // 战机预览（简化图标）
            this.renderShipIcon(ctx, config, this.cardWidth / 2, 35);

            // 战机名称
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(config.NAME, this.cardWidth / 2, 75);

            // 属性条
            this.renderStatBars(ctx, config, 5, 85);

            // 选中标记
            if (isSelected) {
                ctx.fillStyle = '#00ffff';
                ctx.font = 'bold 14px Arial';
                ctx.fillText('✓', this.cardWidth / 2, this.cardHeight - 10);
            }

            ctx.restore();
        });
    }

    /**
     * 渲染战机图标
     */
    renderShipIcon(ctx, config, x, y) {
        const size = 25;

        // 战机主体（简化三角形）
        const gradient = ctx.createLinearGradient(x, y - size, x, y + size);
        gradient.addColorStop(0, config.COLOR_PRIMARY);
        gradient.addColorStop(1, config.COLOR_SECONDARY);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x - size * 0.6, y + size);
        ctx.lineTo(x + size * 0.6, y + size);
        ctx.closePath();
        ctx.fill();

        // 驾驶舱
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * 渲染属性条
     */
    renderStatBars(ctx, config, x, y) {
        const barWidth = this.cardWidth - 10;
        const barHeight = 3;
        const spacing = 10;

        // 计算属性值（归一化到0-1）
        const stats = [
            { name: '火力', value: config.DAMAGE_MULTIPLIER, color: '#ff4444' },
            { name: '血量', value: config.MAX_HEALTH / 200, color: '#44ff44' },
            { name: '速度', value: config.SPEED / 8, color: '#ffaa00' },
            { name: '射速', value: 1 - (config.FIRE_RATE / 400), color: '#00aaff' }
        ];

        ctx.font = '8px Arial';
        ctx.textAlign = 'left';

        stats.forEach((stat, index) => {
            const barY = y + index * spacing;

            // 背景
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(x, barY, barWidth, barHeight);

            // 数值条
            ctx.fillStyle = stat.color;
            ctx.fillRect(x, barY, barWidth * Math.min(stat.value, 1), barHeight);
        });
    }

    /**
     * 渲染详细信息面板
     */
    renderDetailPanel() {
        const ctx = this.ctx;
        const config = GameConfig.SHIP_TYPES[this.selectedShipType];
        const bulletConfig = GameConfig.BULLET_TYPES[config.BULLET_TYPE];

        const panelX = 40;
        const panelY = 380;
        const panelWidth = GameConfig.CANVAS_WIDTH - 80;
        const panelHeight = 140;

        // 面板背景
        ctx.fillStyle = 'rgba(0, 50, 100, 0.7)';
        this.roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 10);
        ctx.fill();

        ctx.strokeStyle = '#00aaff';
        ctx.lineWidth = 2;
        this.roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 10);
        ctx.stroke();

        // 战机名称
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(config.NAME, panelX + 15, panelY + 25);

        // 描述
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.fillText(config.DESC, panelX + 15, panelY + 50);

        // 详细属性
        ctx.font = '12px Arial';
        const stats = [
            `生命值: ${config.MAX_HEALTH}`,
            `速度: ${config.SPEED}`,
            `射速: ${config.FIRE_RATE}ms`,
            `伤害倍率: ${config.DAMAGE_MULTIPLIER}x`
        ];

        ctx.fillStyle = '#aaaaaa';
        stats.forEach((stat, index) => {
            const col = index % 2;
            const row = Math.floor(index / 2);
            ctx.fillText(stat, panelX + 15 + col * 200, panelY + 75 + row * 20);
        });

        // 武器类型
        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`武器: ${bulletConfig.NAME}`, panelX + 15, panelY + 120);
    }

    /**
     * 渲染确认按钮
     */
    renderConfirmButton() {
        const ctx = this.ctx;
        const btn = this.confirmButton;

        // 按钮背景
        const gradient = ctx.createLinearGradient(btn.x, btn.y, btn.x, btn.y + btn.height);
        if (this.isHoveringButton) {
            gradient.addColorStop(0, '#00dd00');
            gradient.addColorStop(1, '#008800');
        } else {
            gradient.addColorStop(0, '#00aa00');
            gradient.addColorStop(1, '#006600');
        }

        ctx.fillStyle = gradient;
        this.roundRect(ctx, btn.x, btn.y, btn.width, btn.height, 10);
        ctx.fill();

        // 按钮边框
        ctx.strokeStyle = this.isHoveringButton ? '#00ff00' : '#00cc00';
        ctx.lineWidth = 3;
        this.roundRect(ctx, btn.x, btn.y, btn.width, btn.height, 10);
        ctx.stroke();

        // 发光效果
        if (this.isHoveringButton) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00ff00';
        }

        // 按钮文字
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(btn.text, btn.x + btn.width / 2, btn.y + btn.height / 2);

        ctx.shadowBlur = 0;
    }

    /**
     * 渲染提示文字
     */
    renderHints() {
        const ctx = this.ctx;

        ctx.fillStyle = '#888888';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('点击战机卡片查看详情，点击确认按钮开始游戏', GameConfig.CANVAS_WIDTH / 2, 630);
    }

    /**
     * 绘制圆角矩形
     */
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    /**
     * 渲染触摸调试信息
     */
    renderTouchDebug() {
        const ctx = this.ctx;
        const point = this.lastTouchPoint;

        // 绘制触摸点
        ctx.save();

        // 绘制十字准星
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;

        // 水平线
        ctx.beginPath();
        ctx.moveTo(point.x - 20, point.y);
        ctx.lineTo(point.x + 20, point.y);
        ctx.stroke();

        // 垂直线
        ctx.beginPath();
        ctx.moveTo(point.x, point.y - 20);
        ctx.lineTo(point.x, point.y + 20);
        ctx.stroke();

        // 圆圈
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 15, 0, Math.PI * 2);
        ctx.stroke();

        // 显示坐标
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`(${Math.round(point.x)}, ${Math.round(point.y)})`, point.x + 25, point.y - 10);

        ctx.restore();
    }

    /**
     * 获取选择的战机类型
     */
    getSelectedShip() {
        return this.selectedShipType;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShipSelection;
}
