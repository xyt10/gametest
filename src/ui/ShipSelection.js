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

        // 僚机选择状态
        this.wingmanTypes = [...Object.keys(GameConfig.WINGMAN_TYPES), 'NONE'];
        this.selectedWingmanTypes = {
            LEFT: 'STANDARD',
            RIGHT: null,
        };
        this.activeWingmanSlot = 'LEFT';
        this.hoveredWingmanType = null;
        this.hoveredWingmanSlot = null;

        // 布局配置
        this.cardWidth = 85;
        this.cardHeight = 140;
        this.cardSpacing = 10;
        this.startX = (GameConfig.CANVAS_WIDTH - (this.cardWidth * 5 + this.cardSpacing * 4)) / 2;
        this.startY = 120;

        // 僚机卡片布局
        this.wingmanCardWidth = 70;
        this.wingmanCardHeight = 110;
        this.wingmanCardSpacing = 12;
        this.wingmanColumns = 4;
        this.slotButtonWidth = 120;
        this.slotButtonHeight = 32;
        this.slotButtonY = this.startY + this.cardHeight + 20;
        this.wingmanSlotButtons = [
            {
                slot: 'LEFT',
                label: '左僚机',
                x: GameConfig.CANVAS_WIDTH / 2 - this.slotButtonWidth - 10,
                y: this.slotButtonY,
                width: this.slotButtonWidth,
                height: this.slotButtonHeight,
            },
            {
                slot: 'RIGHT',
                label: '右僚机',
                x: GameConfig.CANVAS_WIDTH / 2 + 10,
                y: this.slotButtonY,
                width: this.slotButtonWidth,
                height: this.slotButtonHeight,
            }
        ];
        this.wingmanStartX = (GameConfig.CANVAS_WIDTH - (this.wingmanColumns * this.wingmanCardWidth + (this.wingmanColumns - 1) * this.wingmanCardSpacing)) / 2;
        this.wingmanStartY = this.slotButtonY + this.slotButtonHeight + 20;

        // 按钮
        this.confirmButton = {
            x: GameConfig.CANVAS_WIDTH / 2 - 80,
            y: 550,
            width: 160,
            height: 45,
            text: '确认选择'
        };

        // 提示位置
        this.hintY = 630;

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

            // 检查僚机槽位按钮
            this.wingmanSlotButtons.forEach((button) => {
                if (x >= button.x && x <= button.x + button.width &&
                    y >= button.y && y <= button.y + button.height) {
                    this.activeWingmanSlot = button.slot;
                    console.log(`激活僚机槽位: ${button.slot}`);
                }
            });

            // 检查僚机卡片
            this.wingmanTypes.forEach((type, index) => {
                const rect = this.getWingmanCardRect(index);
                if (x >= rect.x && x <= rect.x + rect.width &&
                    y >= rect.y && y <= rect.y + rect.height) {
                    const assignedType = type === 'NONE' ? null : type;
                    this.selectedWingmanTypes[this.activeWingmanSlot] = assignedType;
                    console.log(`为${this.activeWingmanSlot}槽位选择僚机: ${assignedType || '无僚机'}`);
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

            this.hoveredWingmanType = null;
            this.hoveredWingmanSlot = null;
            this.wingmanSlotButtons.forEach((button) => {
                if (x >= button.x && x <= button.x + button.width &&
                    y >= button.y && y <= button.y + button.height) {
                    this.hoveredWingmanSlot = button.slot;
                }
            });

            this.wingmanTypes.forEach((type, index) => {
                const rect = this.getWingmanCardRect(index);
                if (x >= rect.x && x <= rect.x + rect.width &&
                    y >= rect.y && y <= rect.y + rect.height) {
                    this.hoveredWingmanType = type;
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

        // 僚机槽位与卡片
        this.renderWingmanSlotButtons();
        this.renderWingmanCards();

        // 详细信息面板布局
        const panelMetrics = this.computeDetailPanelMetrics();

        // 更新确认按钮和提示位置
        this.confirmButton.y = panelMetrics.y + panelMetrics.height + 15;
        this.hintY = this.confirmButton.y + this.confirmButton.height + 15;

        // 详细信息面板
        this.renderDetailPanel(panelMetrics);

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
        ctx.fillText('选择你的战机与僚机', GameConfig.CANVAS_WIDTH / 2, 80);
        ctx.shadowBlur = 0;

        // 副标题
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '16px Arial';
        ctx.fillText('为战机与僚机搭配不同武器风格', GameConfig.CANVAS_WIDTH / 2, 120);
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
     * 获取僚机卡片行数
     */
    getWingmanRows() {
        return Math.ceil(this.wingmanTypes.length / this.wingmanColumns);
    }

    /**
     * 计算僚机卡片矩形区域
     */
    getWingmanCardRect(index) {
        const col = index % this.wingmanColumns;
        const row = Math.floor(index / this.wingmanColumns);
        const x = this.wingmanStartX + col * (this.wingmanCardWidth + this.wingmanCardSpacing);
        const y = this.wingmanStartY + row * (this.wingmanCardHeight + this.wingmanCardSpacing);

        return {
            x,
            y,
            width: this.wingmanCardWidth,
            height: this.wingmanCardHeight,
        };
    }

    /**
     * 计算详情面板布局
     */
    computeDetailPanelMetrics() {
        const rows = this.getWingmanRows();
        const panelX = 40;
        const panelWidth = GameConfig.CANVAS_WIDTH - 80;
        const panelHeight = 120;
        const gridHeight = rows * this.wingmanCardHeight + Math.max(0, (rows - 1) * this.wingmanCardSpacing);
        const panelY = this.wingmanStartY + gridHeight + 30;

        return { x: panelX, y: panelY, width: panelWidth, height: panelHeight };
    }

    /**
     * 渲染僚机槽位按钮
     */
    renderWingmanSlotButtons() {
        const ctx = this.ctx;

        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';

        this.wingmanSlotButtons.forEach((button) => {
            const isActive = this.activeWingmanSlot === button.slot;
            const isHovered = this.hoveredWingmanSlot === button.slot;

            const gradient = ctx.createLinearGradient(button.x, button.y, button.x, button.y + button.height);
            if (isActive) {
                gradient.addColorStop(0, 'rgba(0, 200, 255, 0.6)');
                gradient.addColorStop(1, 'rgba(0, 120, 200, 0.9)');
            } else if (isHovered) {
                gradient.addColorStop(0, 'rgba(120, 120, 120, 0.6)');
                gradient.addColorStop(1, 'rgba(60, 60, 60, 0.9)');
            } else {
                gradient.addColorStop(0, 'rgba(60, 60, 60, 0.6)');
                gradient.addColorStop(1, 'rgba(30, 30, 30, 0.9)');
            }

            ctx.fillStyle = gradient;
            this.roundRect(ctx, button.x, button.y, button.width, button.height, 10);
            ctx.fill();

            ctx.lineWidth = isActive ? 3 : 2;
            ctx.strokeStyle = isActive ? '#00ffff' : '#555555';
            this.roundRect(ctx, button.x, button.y, button.width, button.height, 10);
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.fillText(button.label, button.x + button.width / 2, button.y + button.height / 2 + 1);
        });
    }

    /**
     * 渲染僚机卡片
     */
    renderWingmanCards() {
        const ctx = this.ctx;

        this.wingmanTypes.forEach((type, index) => {
            const rect = this.getWingmanCardRect(index);
            const config = type === 'NONE' ? null : GameConfig.WINGMAN_TYPES[type];
            const assignedSlots = type === 'NONE'
                ? []
                : ['LEFT', 'RIGHT'].filter((slot) => {
                    const selected = this.selectedWingmanTypes[slot];
                    return selected === type;
                });
            const isActiveSelection = (this.selectedWingmanTypes[this.activeWingmanSlot] || 'NONE') === type;
            const isHovered = this.hoveredWingmanType === type;

            ctx.save();
            ctx.translate(rect.x, rect.y);

            const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
            if (config) {
                gradient.addColorStop(0, `${config.COLOR}55`);
                gradient.addColorStop(1, `${config.COLOR}aa`);
            } else {
                gradient.addColorStop(0, 'rgba(80, 80, 80, 0.4)');
                gradient.addColorStop(1, 'rgba(40, 40, 40, 0.7)');
            }
            ctx.fillStyle = gradient;
            this.roundRect(ctx, 0, 0, rect.width, rect.height, 8);
            ctx.fill();

            const borderColor = isActiveSelection
                ? '#00ffff'
                : (assignedSlots.length > 0 ? '#ffffff' : (isHovered ? '#bbbbbb' : '#555555'));
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = isActiveSelection ? 3 : 2;
            this.roundRect(ctx, 0, 0, rect.width, rect.height, 8);
            ctx.stroke();

            // 绘制僚机图标
            this.renderWingmanIcon(ctx, config, rect.width / 2, 32);

            // 名称
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(config ? config.NAME : '无僚机', rect.width / 2, 68);

            ctx.font = '10px Arial';
            ctx.fillStyle = '#cccccc';
            if (config) {
                ctx.fillText(`火力: ${config.DAMAGE}`, rect.width / 2, 85);
                ctx.fillText(`${config.FIRE_RATE}ms`, rect.width / 2, 100);
            } else {
                ctx.fillText('槽位将保持空置', rect.width / 2, 90);
            }

            // 已分配槽位标记
            this.renderWingmanBadges(ctx, assignedSlots, rect.width);

            ctx.restore();
        });
    }

    /**
     * 渲染僚机图标
     */
    renderWingmanIcon(ctx, config, x, y) {
        if (!config) {
            ctx.strokeStyle = '#888888';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, 18, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x - 12, y - 12);
            ctx.lineTo(x + 12, y + 12);
            ctx.stroke();
            return;
        }

        ctx.fillStyle = config.COLOR;
        ctx.beginPath();
        ctx.ellipse(x, y, 18, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#001122';
        ctx.beginPath();
        ctx.ellipse(x, y, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // 引擎光
        ctx.fillStyle = config.ENGINE_COLOR || '#00ffff';
        ctx.beginPath();
        ctx.arc(x, y + 10, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * 绘制僚机槽位徽章
     */
    renderWingmanBadges(ctx, slots, cardWidth) {
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';

        slots.forEach((slot, index) => {
            const badgeX = cardWidth - 18 - index * 22;
            const badgeY = 12;

            ctx.fillStyle = slot === 'LEFT' ? '#00ffff' : '#ff66ff';
            ctx.beginPath();
            ctx.arc(badgeX, badgeY, 10, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#001122';
            ctx.fillText(slot === 'LEFT' ? 'L' : 'R', badgeX, badgeY + 3);
        });
    }

    /**
     * 渲染详细信息面板
     */
    renderDetailPanel(panel) {
        const ctx = this.ctx;
        const shipConfig = GameConfig.SHIP_TYPES[this.selectedShipType];
        const shipBulletConfig = GameConfig.BULLET_TYPES[shipConfig.BULLET_TYPE];
        const activeSlot = this.activeWingmanSlot;
        const activeType = this.selectedWingmanTypes[activeSlot];
        const wingmanConfig = activeType ? GameConfig.WINGMAN_TYPES[activeType] : null;
        const wingmanBulletConfig = wingmanConfig && GameConfig.BULLET_TYPES[wingmanConfig.BULLET_TYPE];

        const panelX = panel.x;
        const panelY = panel.y;
        const panelWidth = panel.width;
        const panelHeight = panel.height;

        // 面板背景
        ctx.fillStyle = 'rgba(0, 50, 100, 0.7)';
        this.roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 10);
        ctx.fill();

        ctx.strokeStyle = '#00aaff';
        ctx.lineWidth = 2;
        this.roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 10);
        ctx.stroke();

        const innerPadding = 20;
        const columnWidth = (panelWidth - innerPadding * 3) / 2;
        const columnY = panelY + innerPadding;

        // 战机信息
        const shipX = panelX + innerPadding;
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(shipConfig.NAME, shipX, columnY + 10);

        ctx.fillStyle = '#ffffff';
        ctx.font = '13px Arial';
        ctx.fillText(shipConfig.DESC, shipX, columnY + 35);

        ctx.fillStyle = '#aaaaaa';
        ctx.font = '12px Arial';
        const shipStats = [
            `生命值: ${shipConfig.MAX_HEALTH}`,
            `速度: ${shipConfig.SPEED}`,
            `射速: ${shipConfig.FIRE_RATE}ms`,
            `伤害倍率: ${shipConfig.DAMAGE_MULTIPLIER}x`
        ];

        shipStats.forEach((stat, index) => {
            const row = Math.floor(index / 2);
            const col = index % 2;
            ctx.fillText(stat, shipX + col * (columnWidth / 2 + 20), columnY + 60 + row * 18);
        });

        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 13px Arial';
        ctx.fillText(`武器: ${shipBulletConfig.NAME}`, shipX, columnY + 110);

        // 僚机信息
        const wingmanX = panelX + innerPadding * 2 + columnWidth;
        const slotLabel = this.getWingmanSlotLabel(activeSlot);

        ctx.fillStyle = wingmanConfig ? '#ff66ff' : '#888888';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(`${slotLabel}`, wingmanX, columnY + 10);

        if (wingmanConfig) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Arial';
            ctx.fillText(wingmanConfig.NAME, wingmanX, columnY + 35);

            ctx.fillStyle = '#aaaaaa';
            ctx.font = '12px Arial';
            const wingmanStats = [
                `生命值: ${wingmanConfig.HEALTH}`,
                `火力: ${wingmanConfig.DAMAGE}`,
                `射速: ${wingmanConfig.FIRE_RATE}ms`,
                `模式: ${this.getFirePatternLabel(wingmanConfig.FIRE_PATTERN)}`
            ];

            wingmanStats.forEach((stat, index) => {
                ctx.fillText(stat, wingmanX, columnY + 60 + index * 18);
            });

            if (wingmanBulletConfig) {
                ctx.fillStyle = '#ffaa00';
                ctx.font = 'bold 13px Arial';
                ctx.fillText(`子弹: ${wingmanBulletConfig.NAME}`, wingmanX, columnY + 135);
            }
        } else {
            ctx.fillStyle = '#cccccc';
            ctx.font = '13px Arial';
            ctx.fillText('当前槽位未配置僚机', wingmanX, columnY + 35);
            ctx.font = '12px Arial';
            ctx.fillText('选择下方卡片以添加僚机', wingmanX, columnY + 60);
        }
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
        ctx.fillText('选择战机并为左右僚机配置阵容，点击确认按钮开始游戏', GameConfig.CANVAS_WIDTH / 2, this.hintY);
    }

    /**
     * 获取僚机槽位标签
     */
    getWingmanSlotLabel(slot) {
        return slot === 'LEFT' ? '左僚机' : '右僚机';
    }

    /**
     * 获取火力模式说明
     */
    getFirePatternLabel(pattern) {
        switch ((pattern || 'SINGLE').toUpperCase()) {
            case 'DUAL':
                return '双联射击';
            case 'SPREAD':
                return '散射齐发';
            default:
                return '单发射击';
        }
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

    /**
     * 设置默认的战机类型
     */
    setSelectedShip(type) {
        if (this.shipTypes.includes(type)) {
            this.selectedShipType = type;
        }
    }

    /**
     * 获取僚机配置
     */
    getSelectedWingmen() {
        return { ...this.selectedWingmanTypes };
    }

    /**
     * 设置默认的僚机配置
     */
    setSelectedWingmen(selection = {}) {
        const applySelection = (slot) => {
            const value = selection[slot];
            if (value === undefined) return;

            if (value && value !== 'NONE' && !GameConfig.WINGMAN_TYPES[value]) {
                return;
            }

            this.selectedWingmanTypes[slot] = value && value !== 'NONE' ? value : null;
        };

        applySelection('LEFT');
        applySelection('RIGHT');

        this.activeWingmanSlot = 'LEFT';
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShipSelection;
}
