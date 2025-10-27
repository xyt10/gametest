/**
 * 关卡选择界面
 * 允许玩家在开始游戏前选择不同的难度等级
 */

class LevelSelection {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.levels = Array.isArray(GameConfig.LEVELS) ? GameConfig.LEVELS : [];

        this.selectedLevelId = this.levels.length > 0 ? this.levels[0].ID : null;
        this.hoveredLevelId = null;
        this.isActive = false;

        this.cardWidth = 320;
        this.cardHeight = 110;
        this.cardSpacing = 25;
        this.startY = 220;

        this.confirmButton = {
            x: GameConfig.CANVAS_WIDTH / 2 + 20,
            y: 560,
            width: 150,
            height: 45,
            text: '确认开始'
        };

        this.backButton = {
            x: GameConfig.CANVAS_WIDTH / 2 - 170,
            y: 560,
            width: 150,
            height: 45,
            text: '返回配置'
        };

        this.animationTime = 0;
        this.isHoveringConfirm = false;
        this.isHoveringBack = false;

        this.defaultTheme = {
            gradient: ['#081427', '#102545', '#0d1c3b'],
            accent: '#00e0ff',
            cardGradient: ['rgba(0, 186, 255, 0.85)', 'rgba(0, 110, 255, 0.7)'],
            gridColor: 'rgba(0, 200, 255, 0.22)',
            diagonalColor: 'rgba(0, 255, 255, 0.18)',
            particleColors: ['rgba(0, 255, 255, 0.32)', 'rgba(0, 190, 255, 0.38)'],
            orbColor: '#00ffff'
        };

        this.backgroundParticles = [];
        this.orbiters = [];
        this.onPreviewLevel = null;
        this.lastPreviewLevelId = null;

        this.setupEvents();
        this.initializeBackgroundElements();
    }

    /**
     * 设置界面是否激活
     */
    setActive(isActive) {
        this.isActive = !!isActive;
        if (!this.isActive) {
            this.isHoveringConfirm = false;
            this.isHoveringBack = false;
            this.hoveredLevelId = null;
            this.lastPreviewLevelId = null;
            this.notifyPreviewChange(null);
        } else {
            this.triggerPreviewUpdate();
        }
    }

    /**
     * 设置当前选中的关卡
     */
    setSelectedLevel(levelId) {
        if (this.levels.some(level => level.ID === levelId)) {
            this.selectedLevelId = levelId;
            this.triggerPreviewUpdate();
        }
    }

    /**
     * 获取当前选中的关卡ID
     */
    getSelectedLevel() {
        return this.selectedLevelId;
    }

    /**
     * 根据索引获取关卡卡片的位置
     */
    getLevelCardRect(index) {
        const totalHeight = this.levels.length * this.cardHeight + (this.levels.length - 1) * this.cardSpacing;
        const startY = this.startY - totalHeight / 2;

        const x = (GameConfig.CANVAS_WIDTH - this.cardWidth) / 2;
        const y = startY + index * (this.cardHeight + this.cardSpacing);

        return { x, y, width: this.cardWidth, height: this.cardHeight };
    }

    /**
     * 绑定交互事件
     */
    setupEvents() {
        const getCoordinates = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            let clientX;
            let clientY;

            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX - rect.left;
                clientY = e.touches[0].clientY - rect.top;
            } else {
                clientX = e.clientX - rect.left;
                clientY = e.clientY - rect.top;
            }

            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;

            return {
                x: clientX * scaleX,
                y: clientY * scaleY
            };
        };

        const handleInteraction = (x, y) => {
            if (!this.isActive) {
                return;
            }

            let levelChanged = false;
            this.levels.forEach((level, index) => {
                const rect = this.getLevelCardRect(index);
                if (x >= rect.x && x <= rect.x + rect.width &&
                    y >= rect.y && y <= rect.y + rect.height) {
                    if (this.selectedLevelId !== level.ID) {
                        this.selectedLevelId = level.ID;
                        levelChanged = true;
                    }
                }
            });

            if (levelChanged) {
                this.triggerPreviewUpdate();
            }

            if (this.selectedLevelId) {
                const { x: confirmX, y: confirmY, width, height } = this.confirmButton;
                if (x >= confirmX && x <= confirmX + width &&
                    y >= confirmY && y <= confirmY + height) {
                    if (typeof this.onConfirm === 'function') {
                        this.onConfirm(this.selectedLevelId);
                    }
                }
            }

            const { x: backX, y: backY, width: backWidth, height: backHeight } = this.backButton;
            if (x >= backX && x <= backX + backWidth &&
                y >= backY && y <= backY + backHeight) {
                if (typeof this.onBack === 'function') {
                    this.onBack();
                }
            }
        };

        const handleHover = (x, y) => {
            if (!this.isActive) {
                return;
            }

            const previousHover = this.hoveredLevelId;
            this.hoveredLevelId = null;

            this.levels.forEach((level, index) => {
                const rect = this.getLevelCardRect(index);
                if (x >= rect.x && x <= rect.x + rect.width &&
                    y >= rect.y && y <= rect.y + rect.height) {
                    this.hoveredLevelId = level.ID;
                }
            });

            if (previousHover !== this.hoveredLevelId) {
                this.triggerPreviewUpdate();
            }

            const { x: confirmX, y: confirmY, width, height } = this.confirmButton;
            this.isHoveringConfirm = (
                x >= confirmX && x <= confirmX + width &&
                y >= confirmY && y <= confirmY + height
            );

            const { x: backX, y: backY, width: backWidth, height: backHeight } = this.backButton;
            this.isHoveringBack = (
                x >= backX && x <= backX + backWidth &&
                y >= backY && y <= backY + backHeight
            );
        };

        this.handleClick = (e) => {
            if (!this.isActive) {
                return;
            }
            const { x, y } = getCoordinates(e);
            handleInteraction(x, y);
        };

        this.handleMouseMove = (e) => {
            if (!this.isActive) {
                return;
            }
            const { x, y } = getCoordinates(e);
            handleHover(x, y);
        };

        this.handleTouchStart = (e) => {
            if (!this.isActive) {
                return;
            }
            e.preventDefault();
            const { x, y } = getCoordinates(e);
            handleInteraction(x, y);
        };

        this.handleTouchEnd = (e) => {
            if (!this.isActive) {
                return;
            }
            e.preventDefault();
        };

        this.handleTouchMove = (e) => {
            if (!this.isActive) {
                return;
            }
            e.preventDefault();
            const { x, y } = getCoordinates(e);
            handleHover(x, y);
        };

        this.canvas.addEventListener('click', this.handleClick);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false });
        this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    }

    /**
     * 初始化背景粒子和浮动元素
     */
    initializeBackgroundElements() {
        this.backgroundParticles = [];
        const particleColors = this.defaultTheme.particleColors || ['rgba(255,255,255,0.4)'];
        for (let i = 0; i < 70; i++) {
            this.backgroundParticles.push({
                x: Math.random() * GameConfig.CANVAS_WIDTH,
                y: Math.random() * GameConfig.CANVAS_HEIGHT,
                speed: 30 + Math.random() * 60,
                size: 1 + Math.random() * 2,
                alpha: 0.2 + Math.random() * 0.4,
                colorIndex: Math.floor(Math.random() * particleColors.length)
            });
        }

        this.orbiters = [];
        for (let i = 0; i < 6; i++) {
            this.orbiters.push({
                radius: 80 + Math.random() * 60,
                angle: Math.random() * Math.PI * 2,
                speed: 0.4 + Math.random() * 0.6,
                offsetY: 240 + Math.random() * 180
            });
        }
    }

    /**
     * 获取当前预览的主题
     */
    getActiveTheme() {
        const level = this.getActiveLevel();
        return this.getThemeForLevel(level);
    }

    /**
     * 获取当前预览的关卡
     */
    getActiveLevel() {
        if (this.hoveredLevelId) {
            return this.getLevelById(this.hoveredLevelId);
        }
        if (this.selectedLevelId) {
            return this.getLevelById(this.selectedLevelId);
        }
        return this.levels.length > 0 ? this.levels[0] : null;
    }

    /**
     * 根据ID获取关卡
     */
    getLevelById(levelId) {
        return this.levels.find(level => level.ID === levelId) || null;
    }

    /**
     * 生成指定关卡的主题
     */
    getThemeForLevel(level) {
        if (!level) {
            return { ...this.defaultTheme };
        }

        const visual = level.VISUAL || {};
        return {
            gradient: visual.GRADIENT || this.defaultTheme.gradient,
            accent: visual.ACCENT || this.defaultTheme.accent,
            cardGradient: visual.CARD || this.defaultTheme.cardGradient,
            gridColor: visual.GRID_COLOR || this.defaultTheme.gridColor,
            diagonalColor: visual.DIAGONAL_COLOR || this.defaultTheme.diagonalColor,
            particleColors: visual.PARTICLE_COLORS || this.defaultTheme.particleColors,
            orbColor: visual.ORB_COLOR || this.defaultTheme.orbColor,
            badge: visual.BADGE || level.DIFFICULTY || level.NAME
        };
    }

    /**
     * 更新动画
     */
    update(deltaTime) {
        const seconds = deltaTime / 1000;
        this.animationTime += seconds;

        const height = GameConfig.CANVAS_HEIGHT;
        this.backgroundParticles.forEach(particle => {
            particle.y += particle.speed * seconds;
            if (particle.y > height + 20) {
                particle.y = -20;
                particle.x = Math.random() * GameConfig.CANVAS_WIDTH;
            }
        });

        this.orbiters.forEach(orbiter => {
            orbiter.angle += orbiter.speed * seconds;
        });
    }

    /**
     * 渲染界面
     */
    render() {
        const theme = this.getActiveTheme();

        this.renderBackgroundLayer(theme);
        this.renderFloatingDecor(theme);
        this.renderTitle(theme);
        this.renderLevelCards(theme);
        this.renderButtons(theme);
        this.renderHint(theme);
    }

    /**
     * 渲染标题
     */
    renderTitle(theme) {
        const ctx = this.ctx;
        const centerX = GameConfig.CANVAS_WIDTH / 2;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = 'bold 42px Arial';
        ctx.shadowColor = ColorUtils.resolveColorWithAlpha(theme.accent, 0.8);
        ctx.shadowBlur = 18;
        ctx.fillStyle = ColorUtils.resolveColorWithAlpha('#ffffff', 0.95);
        ctx.fillText('选择关卡难度', centerX, 140);

        ctx.font = '18px Arial';
        ctx.shadowBlur = 0;
        ctx.fillStyle = ColorUtils.resolveColorWithAlpha('#ffffff', 0.75);
        ctx.fillText('不同难度将改变敌人强度、数量与奖励倍率', centerX, 178);
        ctx.restore();
    }

    /**
     * 渲染关卡卡片
     */
    renderLevelCards(theme) {
        const ctx = this.ctx;

        this.levels.forEach((level, index) => {
            const rect = this.getLevelCardRect(index);
            const isSelected = this.selectedLevelId === level.ID;
            const isHovered = this.hoveredLevelId === level.ID;
            const levelTheme = this.getThemeForLevel(level);

            ctx.save();
            ctx.translate(rect.x, rect.y);

            const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
            const cardColors = levelTheme.cardGradient || this.defaultTheme.cardGradient;
            const startColor = cardColors[0] || this.defaultTheme.cardGradient[0];
            const endColor = cardColors[1] || cardColors[0] || this.defaultTheme.cardGradient[1];
            const baseAlpha = isSelected ? 0.95 : 0.75;
            gradient.addColorStop(0, ColorUtils.resolveColorWithAlpha(startColor, baseAlpha));
            gradient.addColorStop(1, ColorUtils.resolveColorWithAlpha(endColor, baseAlpha - 0.1));
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, rect.width, rect.height);

            ctx.shadowColor = ColorUtils.resolveColorWithAlpha(levelTheme.accent || theme.accent, isHovered ? 0.9 : 0.6);
            ctx.shadowBlur = isSelected ? 24 : 12;
            ctx.strokeStyle = ColorUtils.resolveColorWithAlpha(levelTheme.accent || theme.accent, isSelected ? 1 : (isHovered ? 0.8 : 0.45));
            ctx.lineWidth = isSelected ? 3 : 2;
            ctx.strokeRect(0, 0, rect.width, rect.height);
            ctx.shadowBlur = 0;

            ctx.fillStyle = ColorUtils.resolveColorWithAlpha('#ffffff', 0.15);
            ctx.fillRect(0, 0, rect.width, 8);

            const pulse = 0.4 + Math.sin(this.animationTime * 3 + index) * 0.1;
            ctx.fillStyle = ColorUtils.resolveColorWithAlpha(levelTheme.accent || theme.accent, 0.18 + pulse * 0.25);
            ctx.fillRect(0, rect.height - 6, rect.width, 6);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`${level.NAME} (${level.DIFFICULTY})`, 24, 38);

            ctx.font = '16px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
            this.wrapText(ctx, level.DESCRIPTION, 24, 74, rect.width - 48, 20);

            const badge = levelTheme.badge || level.DIFFICULTY;
            if (badge) {
                ctx.font = 'bold 14px Arial';
                const badgeWidth = ctx.measureText(badge).width + 24;
                const badgeX = rect.width - badgeWidth - 20;
                const badgeY = 18;
                ctx.fillStyle = ColorUtils.resolveColorWithAlpha(levelTheme.accent || theme.accent, isSelected ? 0.55 : 0.35);
                ctx.fillRect(badgeX, badgeY, badgeWidth, 26);
                ctx.strokeStyle = ColorUtils.resolveColorWithAlpha(levelTheme.accent || theme.accent, isSelected ? 0.95 : 0.65);
                ctx.lineWidth = 1.5;
                ctx.strokeRect(badgeX, badgeY, badgeWidth, 26);
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.fillText(badge, badgeX + badgeWidth / 2, badgeY + 18);
            }

            ctx.restore();
        });
    }

    /**
     * 渲染按钮
     */
    renderButtons(theme) {
        this.renderButton(this.backButton, this.isHoveringBack, false, theme);
        this.renderButton(this.confirmButton, this.isHoveringConfirm && !!this.selectedLevelId, !this.selectedLevelId, theme);
    }

    /**
     * 渲染单个按钮
     */
    renderButton(button, isHovering, isDisabled = false, theme) {
        const ctx = this.ctx;
        const { x, y, width, height, text } = button;

        ctx.save();
        ctx.translate(x, y);

        const scale = isHovering && !isDisabled ? 1.05 : 1;
        ctx.translate(width / 2, height / 2);
        ctx.scale(scale, scale);
        ctx.translate(-width / 2, -height / 2);

        const accent = theme.accent || this.defaultTheme.accent;
        const alpha = isDisabled ? 0.3 : (isHovering ? 0.95 : 0.75);
        const radius = 10;
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(width - radius, 0);
        ctx.quadraticCurveTo(width, 0, width, radius);
        ctx.lineTo(width, height - radius);
        ctx.quadraticCurveTo(width, height, width - radius, height);
        ctx.lineTo(radius, height);
        ctx.quadraticCurveTo(0, height, 0, height - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();

        ctx.fillStyle = ColorUtils.resolveColorWithAlpha(accent, alpha);
        ctx.fill();

        ctx.strokeStyle = ColorUtils.resolveColorWithAlpha('#ffffff', isDisabled ? 0.3 : 0.85);
        ctx.lineWidth = 2;
        ctx.stroke();

        if (!isDisabled) {
            ctx.shadowColor = ColorUtils.resolveColorWithAlpha(accent, 0.5);
            ctx.shadowBlur = 12;
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, width / 2, height / 2 + 6);

        ctx.restore();
    }

    /**
     * 渲染提示文字
     */
    renderHint(theme) {
        const ctx = this.ctx;
        const centerX = GameConfig.CANVAS_WIDTH / 2;
        ctx.fillStyle = ColorUtils.resolveColorWithAlpha('#ffffff', 0.78);
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('提示: 高难度带来更高分数与稀有掉落。', centerX, 632);
        ctx.fillStyle = ColorUtils.resolveColorWithAlpha(theme.accent, 0.6);
        ctx.fillText('左右滑动或移动鼠标预览不同战区氛围', centerX, 656);
    }

    /**
     * 渲染背景层
     */
    renderBackgroundLayer(theme) {
        const ctx = this.ctx;
        const width = GameConfig.CANVAS_WIDTH;
        const height = GameConfig.CANVAS_HEIGHT;

        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        const colors = Array.isArray(theme.gradient) && theme.gradient.length > 0 ? theme.gradient : this.defaultTheme.gradient;
        const stopCount = colors.length;
        colors.forEach((color, index) => {
            const stop = stopCount === 1 ? 1 : index / (stopCount - 1);
            gradient.addColorStop(stop, color);
        });
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.strokeStyle = theme.gridColor || this.defaultTheme.gridColor;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = 1;
        for (let x = 0; x <= width; x += 60) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y <= height; y += 60) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = theme.diagonalColor || this.defaultTheme.diagonalColor;
        ctx.globalAlpha = 0.28;
        ctx.lineWidth = 1;
        const spacing = 160;
        const offset = (this.animationTime * 40) % spacing;
        for (let x = -height; x < width + spacing; x += spacing) {
            ctx.beginPath();
            ctx.moveTo(x + offset, 0);
            ctx.lineTo(x + offset + height, height);
            ctx.stroke();
        }
        ctx.restore();

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const particleColors = theme.particleColors || this.defaultTheme.particleColors;
        this.backgroundParticles.forEach(particle => {
            const color = particleColors[particle.colorIndex % particleColors.length] || particleColors[0];
            ctx.fillStyle = color;
            ctx.globalAlpha = particle.alpha;
            ctx.fillRect(particle.x, particle.y, particle.size, particle.size * 2);
        });
        ctx.restore();
    }

    /**
     * 渲染浮动装饰
     */
    renderFloatingDecor(theme) {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const accent = theme.accent || this.defaultTheme.accent;
        this.orbiters.forEach((orbiter, index) => {
            const radius = orbiter.radius + Math.sin(this.animationTime + index) * 6;
            const x = GameConfig.CANVAS_WIDTH / 2 + Math.cos(orbiter.angle) * radius;
            const y = orbiter.offsetY + Math.sin(orbiter.angle) * 18;
            const size = 3 + Math.sin(this.animationTime * 2 + index) * 2;
            const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 3.5);
            glow.addColorStop(0, ColorUtils.resolveColorWithAlpha(accent, 0.35));
            glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = glow;
            ctx.fillRect(x - size * 3.5, y - size * 3.5, size * 7, size * 7);

            ctx.fillStyle = ColorUtils.resolveColorWithAlpha('#ffffff', 0.85);
            ctx.beginPath();
            ctx.arc(x, y, Math.max(1.5, size), 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    /**
     * 触发预览更新
     */
    triggerPreviewUpdate() {
        const level = this.getActiveLevel();
        const levelId = level ? level.ID : null;
        if (this.lastPreviewLevelId === levelId) {
            return;
        }
        this.lastPreviewLevelId = levelId;
        this.notifyPreviewChange(levelId);
    }

    /**
     * 通知外部预览变化
     */
    notifyPreviewChange(levelId) {
        if (typeof this.onPreviewLevel === 'function') {
            this.onPreviewLevel(levelId);
        }
    }

    /**
     * 绘制自动换行文本
     */
    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split('');
        let line = '';

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i];
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && i > 0) {
                ctx.fillText(line, x, y);
                line = words[i];
                y += lineHeight;
            } else {
                line = testLine;
            }
        }

        ctx.fillText(line, x, y);
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LevelSelection;
}
