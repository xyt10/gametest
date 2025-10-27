/**
 * 游戏主场景
 * 管理游戏的主要逻辑和渲染
 */

class GameScene {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // 游戏状态
        this.gameState = 'menu'; // menu, shipSelection, playing, paused, gameover
        this.selectedShipType = null; // 保存选择的战机类型
        this.selectedWingmanTypes = { LEFT: 'STANDARD', RIGHT: null };
        this.preferredWingmanType = 'STANDARD';
        this.selectedLevelId = null; // 当前选择的关卡ID
        this.currentLevelConfig = null;
        this.score = 0;
        this.stage = 1;
        this.stageTime = 0;

        // 游戏对象
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.items = [];
        this.wingmen = [];  // 僚机数组
        this.boss = null;

        // 系统
        this.enemySpawner = null;
        this.collisionManager = null;
        this.upgradeSystem = null;
        this.gameHUD = null;
        this.audioManager = null;
        this.particleSystem = null;
        this.shipSelection = null; // 战机选择界面
        this.levelSelection = null; // 关卡选择界面

        // 输入
        this.keys = {};
        this.mousePos = { x: 0, y: 0 };
        this.isMouseDown = false;

        // 时间
        this.lastTime = Date.now();
        this.deltaTime = 0;

        // 背景滚动
        this.bgOffset = 0;

        // 预计算的背景资源与循环相关引用
        this.backgroundGradient = null;
        this.backgroundOverlay = null;
        this.backgroundGridPath = null;
        this.lastFrameWarningTime = 0;
        this.boundGameLoop = null;

        // 星空背景
        this.stars = [];
        this.initStars();

        // 视觉主题与特效
        this.sceneAnimationTime = 0;
        this.backgroundOrbs = [];
        this.techLines = [];
        this.visualThemeBase = null;
        this.currentVisualTheme = null;
        this.gridSpacing = 60;
        this.diagonalSpacing = 180;
        this.diagonalSpeed = 40;
        this.starColorComponents = [];

        // 性能监控
        this.performanceMonitor = null;

        // 默认关卡配置
        this.selectedLevelId = this.getDefaultLevelId();
        this.currentLevelConfig = this.getLevelConfig(this.selectedLevelId);

        // 背景音乐控制
        this.backgroundMusicStarted = false;

        // 预先应用视觉主题
        this.applyVisualTheme(this.currentLevelConfig, { permanent: true });

        // 初始化
        this.init();
    }

    /**
     * 初始化星空
     */
    initStars() {
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * GameConfig.CANVAS_WIDTH,
                y: Math.random() * GameConfig.CANVAS_HEIGHT,
                size: Math.random() * 2,
                speed: 0.5 + Math.random() * 1.5,
                brightness: Math.random(),
                colorIndex: Math.floor(Math.random() * 4)
            });
        }
    }

    /**
     * 初始化游戏 - 优化版本
     */
    init() {
        // 初始化玩家
        this.player = new Player(
            GameConfig.PLAYER.START_X,
            GameConfig.PLAYER.START_Y
        );

        // 初始化系统
        this.enemySpawner = new EnemySpawner(this);
        if (this.currentLevelConfig) {
            this.enemySpawner.setLevelConfig(this.currentLevelConfig);
        }
        this.collisionManager = new CollisionManager(this);
        this.upgradeSystem = new UpgradeSystem(this.player);
        this.gameHUD = new GameHUD(this);
        this.audioManager = new AudioManager();
        this.particleSystem = new ParticleSystem();

        // 初始化性能监控
        this.performanceMonitor = {
            fps: 0,
            frameCount: 0,
            lastTime: Date.now(),
            fpsArray: [],
            maxFpsHistory: 60,
            update: function() {
                this.frameCount++;
                const currentTime = Date.now();

                if (currentTime - this.lastTime >= 1000) {
                    this.fps = this.frameCount;
                    this.frameCount = 0;
                    this.lastTime = currentTime;
                    this.fpsArray.push(this.fps);
                    if (this.fpsArray.length > this.maxFpsHistory) {
                        this.fpsArray.shift();
                    }
                }
            }
        };

        // 初始化战机选择界面
        this.shipSelection = new ShipSelection(this.ctx, this.canvas);
        this.shipSelection.setSelectedShip(this.selectedShipType || 'STANDARD');
        this.shipSelection.setSelectedWingmen(this.selectedWingmanTypes);
        this.shipSelection.setActive(false);
        this.shipSelection.onConfirm = () => {
            this.selectedShipType = this.shipSelection.getSelectedShip();
            this.selectedWingmanTypes = this.shipSelection.getSelectedWingmen();
            this.preferredWingmanType = this.selectedWingmanTypes.LEFT || this.selectedWingmanTypes.RIGHT || 'STANDARD';
            this.showLevelSelection();
        };

        // 初始化关卡选择界面
        this.levelSelection = new LevelSelection(this.ctx, this.canvas);
        if (this.selectedLevelId) {
            this.levelSelection.setSelectedLevel(this.selectedLevelId);
        }
        this.levelSelection.setActive(false);
        this.levelSelection.onConfirm = (levelId) => {
            this.setLevel(levelId);
            this.startGame();
        };
        this.levelSelection.onBack = () => {
            this.showShipSelection();
        };
        this.levelSelection.onPreviewLevel = (levelId) => {
            if (!levelId) {
                this.applyVisualTheme(this.currentLevelConfig, { permanent: true });
                if (this.backgroundMusicStarted && this.audioManager) {
                    this.audioManager.setBackgroundMusicTheme(this.buildAudioTheme(this.currentLevelConfig));
                }
                return;
            }
            const previewConfig = this.getLevelConfig(levelId);
            if (previewConfig) {
                this.applyVisualTheme(previewConfig, { permanent: false });
                if (this.backgroundMusicStarted && this.audioManager) {
                    this.audioManager.setBackgroundMusicTheme(this.buildAudioTheme(previewConfig));
                }
            }
        };

        // 绑定输入事件
        this.bindInputEvents();

        // 预计算背景资源并绑定主循环，避免每帧重复创建
        this.precomputeBackgroundAssets();
        this.boundGameLoop = this.gameLoop.bind(this);

        console.log('游戏初始化完成');
    }

    /**
     * 绑定输入事件
     */
    bindInputEvents() {
        // 键盘事件
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === ' ') e.preventDefault(); // 防止空格键滚动页面
            if (e.key === 'Escape' && this.gameState === 'playing') {
                this.pause();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // 鼠标/触摸事件
        this.canvas.addEventListener('mousedown', (e) => {
            this.isMouseDown = true;
            this.updateMousePos(e);
            if (!this.backgroundMusicStarted) {
                this.ensureBackgroundMusic();
            }
            if (this.gameState === 'menu') {
                this.showShipSelection(); // 进入战机选择
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            this.updateMousePos(e);
        });

        // 触摸支持
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isMouseDown = true;
            const touch = e.touches[0];
            this.updateMousePos(touch);
            if (!this.backgroundMusicStarted) {
                this.ensureBackgroundMusic();
            }
            if (this.gameState === 'menu') {
                this.showShipSelection(); // 进入战机选择
            }
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.isMouseDown = false;
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.updateMousePos(touch);
        });
    }

    /**
     * 预计算背景渐变和网格路径以减少每帧开销
     */
    precomputeBackgroundAssets() {
        const theme = this.currentVisualTheme || this.buildVisualTheme(this.currentLevelConfig);
        const gradientColors = Array.isArray(theme.gradient) && theme.gradient.length > 0
            ? theme.gradient
            : ['#000022', '#000033', '#000044'];

        const gradient = this.ctx.createLinearGradient(0, 0, 0, GameConfig.CANVAS_HEIGHT);
        const stopCount = gradientColors.length;
        gradientColors.forEach((color, index) => {
            const stop = stopCount === 1 ? 1 : index / (stopCount - 1);
            gradient.addColorStop(stop, color);
        });
        this.backgroundGradient = gradient;

        const overlay = this.ctx.createLinearGradient(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT);
        overlay.addColorStop(0, ColorUtils.resolveColorWithAlpha(theme.accent || '#00d9ff', 0.08));
        overlay.addColorStop(0.5, 'rgba(255, 255, 255, 0.02)');
        overlay.addColorStop(1, ColorUtils.resolveColorWithAlpha(theme.accent || '#00d9ff', 0.1));
        this.backgroundOverlay = overlay;

        if (typeof Path2D !== 'undefined') {
            const verticalGridPath = new Path2D();
            this.gridSpacing = theme.gridSpacing || 60;
            for (let x = 0; x <= GameConfig.CANVAS_WIDTH; x += this.gridSpacing) {
                verticalGridPath.moveTo(x, 0);
                verticalGridPath.lineTo(x, GameConfig.CANVAS_HEIGHT);
            }

            this.backgroundGridPath = verticalGridPath;
        } else {
            this.backgroundGridPath = null;
        }

        this.diagonalSpacing = theme.diagonalSpacing || 180;
        this.diagonalSpeed = theme.diagonalSpeed || 40;
    }

    /**
     * 构建视觉主题配置
     */
    buildVisualTheme(levelConfig) {
        const defaults = {
            gradient: ['#000022', '#000033', '#000044'],
            gridColor: 'rgba(0, 150, 255, 0.25)',
            horizontalGridColor: 'rgba(0, 120, 255, 0.2)',
            diagonalColor: 'rgba(0, 200, 255, 0.2)',
            accent: '#00d9ff',
            cardGradient: ['rgba(0, 170, 255, 0.85)', 'rgba(0, 120, 255, 0.75)'],
            particleColors: ['rgba(0, 255, 255, 0.45)', 'rgba(0, 180, 255, 0.45)'],
            orbColor: '#00d8ff',
            gridSpacing: 60,
            diagonalSpacing: 180,
            diagonalSpeed: 40,
            gridScrollSpeed: 55,
            orbCount: 6,
            techLineCount: 6,
            starColors: ['#ffffff'],
            starSpeedMultiplier: 1
        };

        const visual = levelConfig && levelConfig.VISUAL ? levelConfig.VISUAL : {};

        return {
            gradient: visual.GRADIENT || visual.gradient || defaults.gradient,
            gridColor: visual.GRID_COLOR || visual.gridColor || defaults.gridColor,
            horizontalGridColor: visual.HORIZONTAL_GRID_COLOR || visual.horizontalGridColor || defaults.horizontalGridColor,
            diagonalColor: visual.DIAGONAL_COLOR || visual.diagonalColor || defaults.diagonalColor,
            accent: visual.ACCENT || visual.accent || defaults.accent,
            cardGradient: visual.CARD || visual.cardGradient || defaults.cardGradient,
            particleColors: visual.PARTICLE_COLORS || visual.particleColors || defaults.particleColors,
            orbColor: visual.ORB_COLOR || visual.orbColor || defaults.orbColor,
            gridSpacing: visual.GRID_SPACING || visual.gridSpacing || defaults.gridSpacing,
            diagonalSpacing: visual.DIAGONAL_SPACING || visual.diagonalSpacing || defaults.diagonalSpacing,
            diagonalSpeed: visual.DIAGONAL_SPEED || visual.diagonalSpeed || defaults.diagonalSpeed,
            gridScrollSpeed: visual.GRID_SCROLL_SPEED || visual.gridScrollSpeed || defaults.gridScrollSpeed,
            orbCount: visual.ORB_COUNT || visual.orbCount || defaults.orbCount,
            techLineCount: visual.TECH_LINE_COUNT || visual.techLineCount || defaults.techLineCount,
            starColors: visual.STAR_COLORS || visual.starColors || defaults.starColors,
            starSpeedMultiplier: visual.STAR_SPEED_MULTIPLIER || visual.starSpeedMultiplier || defaults.starSpeedMultiplier
        };
    }

    /**
     * 应用视觉主题
     */
    applyVisualTheme(levelConfig, { permanent = false } = {}) {
        const theme = this.buildVisualTheme(levelConfig);
        this.currentVisualTheme = theme;
        if (permanent) {
            this.visualThemeBase = theme;
        }
        this.precomputeBackgroundAssets();
        this.generateBackgroundEffects();
        const starColors = Array.isArray(theme.starColors) && theme.starColors.length > 0
            ? theme.starColors
            : ['#ffffff'];
        this.starColorComponents = starColors.map(color => ColorUtils.parseColor(color));
    }

    /**
     * 生成背景特效元素
     */
    generateBackgroundEffects() {
        const theme = this.currentVisualTheme || this.buildVisualTheme(this.currentLevelConfig);
        const orbCount = Math.max(0, Math.floor(theme.orbCount || 6));
        this.backgroundOrbs = [];
        for (let i = 0; i < orbCount; i++) {
            this.backgroundOrbs.push({
                x: Math.random() * GameConfig.CANVAS_WIDTH,
                y: Math.random() * GameConfig.CANVAS_HEIGHT,
                radius: 90 + Math.random() * 110,
                speed: 12 + Math.random() * 24,
                waveSpeed: 0.4 + Math.random() * 0.8,
                waveAmplitude: 20 + Math.random() * 35,
                phase: Math.random() * Math.PI * 2,
                pulseSpeed: 0.8 + Math.random() * 1.4
            });
        }

        const techLineCount = Math.max(0, Math.floor(theme.techLineCount || 6));
        this.techLines = [];
        for (let i = 0; i < techLineCount; i++) {
            this.techLines.push({
                x: Math.random() * GameConfig.CANVAS_WIDTH,
                offset: Math.random() * (GameConfig.CANVAS_HEIGHT + 200) - 200,
                length: 140 + Math.random() * 160,
                width: 1 + Math.random() * 1.6,
                speed: 60 + Math.random() * 70,
                angle: (Math.random() * 0.6) - 0.3
            });
        }
    }

    /**
     * 更新背景动画元素
     */
    updateBackgroundAnimation(deltaTime) {
        const theme = this.currentVisualTheme || this.buildVisualTheme(this.currentLevelConfig);
        const seconds = deltaTime / 1000;

        this.sceneAnimationTime += seconds;

        const scrollSpeed = theme.gridScrollSpeed || 55;
        this.bgOffset += scrollSpeed * seconds;
        const spacing = this.gridSpacing || theme.gridSpacing || 60;
        if (this.bgOffset > spacing) {
            this.bgOffset -= spacing;
        }

        const starSpeedMultiplier = theme.starSpeedMultiplier || 1;
        this.stars.forEach(star => {
            star.y += star.speed * seconds * 60 * starSpeedMultiplier;
            if (star.y > GameConfig.CANVAS_HEIGHT) {
                star.y = star.y - GameConfig.CANVAS_HEIGHT;
                star.x = Math.random() * GameConfig.CANVAS_WIDTH;
                star.colorIndex = Math.floor(Math.random() * 4);
            }
        });

        this.backgroundOrbs.forEach(orb => {
            orb.y += orb.speed * seconds;
            orb.x += Math.sin(this.sceneAnimationTime * orb.waveSpeed + orb.phase) * orb.waveAmplitude * seconds * 10;
            if (orb.y - orb.radius > GameConfig.CANVAS_HEIGHT) {
                orb.y = -orb.radius;
                orb.x = Math.random() * GameConfig.CANVAS_WIDTH;
            }
        });

        this.techLines.forEach(line => {
            line.offset += line.speed * seconds;
            if (line.offset - line.length > GameConfig.CANVAS_HEIGHT + 100) {
                line.offset = -200;
                line.x = Math.random() * GameConfig.CANVAS_WIDTH;
                line.length = 140 + Math.random() * 160;
                line.speed = 60 + Math.random() * 70;
            }
        });
    }

    /**
     * 构建背景音乐主题
     */
    buildAudioTheme(levelConfig) {
        const defaults = {
            baseFrequency: 180,
            padFrequency: 360,
            shimmerFrequency: 720,
            lfoFrequency: 0.08,
            lfoDepth: 24,
            masterGain: 0.32,
            baseGain: 0.45,
            padGain: 0.22,
            shimmerGain: 0.05,
            filterFrequency: 1400
        };

        const audio = levelConfig && levelConfig.AUDIO ? levelConfig.AUDIO : {};

        return {
            baseFrequency: audio.BASE_FREQUENCY ?? audio.baseFrequency ?? defaults.baseFrequency,
            padFrequency: audio.PAD_FREQUENCY ?? audio.padFrequency ?? defaults.padFrequency,
            shimmerFrequency: audio.SHIMMER_FREQUENCY ?? audio.shimmerFrequency ?? defaults.shimmerFrequency,
            lfoFrequency: audio.LFO_FREQUENCY ?? audio.lfoFrequency ?? defaults.lfoFrequency,
            lfoDepth: audio.LFO_DEPTH ?? audio.lfoDepth ?? defaults.lfoDepth,
            masterGain: audio.MASTER_GAIN ?? audio.masterGain ?? defaults.masterGain,
            baseGain: audio.BASE_GAIN ?? audio.baseGain ?? defaults.baseGain,
            padGain: audio.PAD_GAIN ?? audio.padGain ?? defaults.padGain,
            shimmerGain: audio.SHIMMER_GAIN ?? audio.shimmerGain ?? defaults.shimmerGain,
            filterFrequency: audio.FILTER_FREQUENCY ?? audio.filterFrequency ?? defaults.filterFrequency
        };
    }

    /**
     * 确保背景音乐已启动
     */
    ensureBackgroundMusic(themeOverride) {
        if (!this.audioManager) {
            return;
        }
        const theme = themeOverride || this.buildAudioTheme(this.currentLevelConfig);
        this.audioManager.startBackgroundMusic(theme);
        this.backgroundMusicStarted = true;
    }

    /**
     * 更新鼠标位置（考虑canvas缩放）
     */
    updateMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.clientX - rect.left;
        const clientY = e.clientY - rect.top;

        // 转换坐标：从CSS显示坐标转换到canvas内部坐标
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        this.mousePos.x = clientX * scaleX;
        this.mousePos.y = clientY * scaleY;
    }

    /**
     * 显示战机选择界面
     */
    showShipSelection() {
        this.gameState = 'shipSelection';
        if (this.shipSelection) {
            this.shipSelection.setSelectedShip(this.selectedShipType || 'STANDARD');
            this.shipSelection.setSelectedWingmen(this.selectedWingmanTypes);
            this.shipSelection.setActive(true);
        }
        if (this.levelSelection) {
            this.levelSelection.setActive(false);
        }
        console.log('进入战机选择界面');
    }

    /**
     * 显示关卡选择界面
     */
    showLevelSelection() {
        this.gameState = 'levelSelection';
        const fallbackLevelId = this.selectedLevelId || this.getDefaultLevelId();
        if (this.levelSelection) {
            this.levelSelection.setSelectedLevel(fallbackLevelId);
            this.levelSelection.setActive(true);
        }
        if (this.shipSelection) {
            this.shipSelection.setActive(false);
        }
        this.applyVisualTheme(this.currentLevelConfig, { permanent: true });
        if (this.backgroundMusicStarted && this.audioManager) {
            this.audioManager.setBackgroundMusicTheme(this.buildAudioTheme(this.currentLevelConfig));
        }
        console.log('进入关卡选择界面');
    }

    /**
     * 开始游戏
     */
    startGame() {
        this.setLevel(this.selectedLevelId || this.getDefaultLevelId());
        if (this.shipSelection) {
            this.shipSelection.setActive(false);
        }
        if (this.levelSelection) {
            this.levelSelection.setActive(false);
        }
        this.gameState = 'playing';
        this.score = 0;
        this.stage = 1;
        this.stageTime = 0;

        // 重置玩家（使用选择的战机类型）
        const shipType = this.selectedShipType || 'STANDARD';
        this.player.reset(shipType);
        console.log(`游戏开始！使用战机: ${shipType}`);
        if (this.currentLevelConfig) {
            console.log(`选择关卡: ${this.currentLevelConfig.NAME} (${this.currentLevelConfig.DIFFICULTY})`);
        }
        this.preferredWingmanType = this.selectedWingmanTypes.LEFT || this.selectedWingmanTypes.RIGHT || 'STANDARD';

        // 清空所有游戏对象
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.items = [];
        this.wingmen = [];  // 清空僚机
        this.boss = null;

        // 生成已选择的僚机
        this.spawnSelectedWingmen();

        // 重置生成器
        this.enemySpawner.reset();

        console.log('游戏开始！');
    }

    /**
     * 生成已选择的僚机
     */
    spawnSelectedWingmen() {
        const selections = this.selectedWingmanTypes || {};
        for (const slot of ['LEFT', 'RIGHT']) {
            const type = selections[slot];
            if (type) {
                this.wingmen.push(new Wingman(this.player, slot, type));
            }
        }
    }

    /**
     * 设置关卡并应用配置
     */
    setLevel(levelId) {
        const config = this.getLevelConfig(levelId);
        if (!config) {
            return;
        }

        this.selectedLevelId = config.ID;
        this.currentLevelConfig = config;

        this.applyVisualTheme(this.currentLevelConfig, { permanent: true });
        if (this.backgroundMusicStarted && this.audioManager) {
            this.audioManager.setBackgroundMusicTheme(this.buildAudioTheme(this.currentLevelConfig));
        }

        if (this.levelSelection) {
            this.levelSelection.setSelectedLevel(this.selectedLevelId);
        }

        if (this.enemySpawner) {
            this.enemySpawner.setLevelConfig(this.currentLevelConfig);
        }
    }

    /**
     * 获取关卡配置
     */
    getLevelConfig(levelId) {
        if (!GameConfig.LEVELS || GameConfig.LEVELS.length === 0) {
            return null;
        }

        const found = GameConfig.LEVELS.find(level => level.ID === levelId);
        return found || GameConfig.LEVELS[0];
    }

    /**
     * 获取默认关卡ID
     */
    getDefaultLevelId() {
        if (!GameConfig.LEVELS || GameConfig.LEVELS.length === 0) {
            return null;
        }

        const normalLevel = GameConfig.LEVELS.find(level => level.ID === 'NORMAL');
        return normalLevel ? normalLevel.ID : GameConfig.LEVELS[0].ID;
    }

    /**
     * 暂停游戏
     */
    pause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            console.log('游戏暂停');
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            console.log('游戏继续');
        }
    }

    /**
     * 游戏结束
     */
    gameOver() {
        this.gameState = 'gameover';
        console.log('游戏结束！得分:', this.score);
    }

    /**
     * 主更新循环
     */
    update() {
        const currentTime = Date.now();
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.updateBackgroundAnimation(this.deltaTime);

        // 更新战机选择界面
        if (this.gameState === 'shipSelection') {
            this.shipSelection.update(this.deltaTime);
            return;
        }

        if (this.gameState === 'levelSelection') {
            this.levelSelection.update(this.deltaTime);
            return;
        }

        if (this.gameState !== 'playing') {
            return;
        }

        // 更新关卡时间
        this.stageTime += this.deltaTime;

        // 更新玩家
        this.handlePlayerInput();
        this.player.update(this.deltaTime);

        // 更新敌机生成
        this.enemySpawner.update(this.deltaTime);

        // 更新敌机
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const bullet = enemy.update(this.deltaTime, this.player, currentTime);

            // 如果敌机射击,添加子弹
            if (bullet) {
                this.enemyBullets.push(bullet);
            }

            // 移除屏幕外的敌机
            if (enemy.y > GameConfig.CANVAS_HEIGHT + 50 || enemy.isDead()) {
                this.enemies.splice(i, 1);
            }
        }

        // 更新Boss
        if (this.boss) {
            const bossBullets = this.boss.update(this.deltaTime, this.player, currentTime);
            if (bossBullets && bossBullets.length > 0) {
                this.enemyBullets.push(...bossBullets);
            }

            if (this.boss.isDead()) {
                this.score += this.boss.scoreValue;
                this.boss = null;
                console.log('Boss已被击败！');
            }
        }

        // 更新僚机
        for (let i = this.wingmen.length - 1; i >= 0; i--) {
            const wingman = this.wingmen[i];
            const bulletsFromWingman = wingman.update(this.deltaTime, this.enemies, currentTime);

            // 如果僚机射击，添加子弹
            if (Array.isArray(bulletsFromWingman)) {
                if (bulletsFromWingman.length > 0) {
                    this.bullets.push(...bulletsFromWingman);
                }
            } else if (bulletsFromWingman) {
                this.bullets.push(bulletsFromWingman);
            }

            // 移除死亡的僚机
            if (wingman.isDead()) {
                this.wingmen.splice(i, 1);
            }
        }

        // 更新子弹
        this.updateBullets();

        // 更新道具
        this.updateItems();

        // 更新粒子系统
        this.particleSystem.update(this.deltaTime);

        // 碰撞检测
        this.collisionManager.checkCollisions();

        // 检查玩家死亡
        if (this.player.isDead()) {
            this.gameOver();
        }
    }

    /**
     * 处理玩家输入
     */
    handlePlayerInput() {
        // 键盘控制
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
            this.player.moveLeft();
        }
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
            this.player.moveRight();
        }
        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) {
            this.player.moveUp();
        }
        if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) {
            this.player.moveDown();
        }
        if (this.keys[' ']) {
            const bullets = this.player.shoot();
            this.spawnPlayerBullets(bullets);
        }

        // 鼠标/触摸控制
        if (this.isMouseDown) {
            this.player.moveTowards(this.mousePos.x, this.mousePos.y);
            const bullets = this.player.shoot();
            this.spawnPlayerBullets(bullets);
        }
    }

    /**
     * 统一处理玩家子弹生成逻辑
     */
    spawnPlayerBullets(bullets) {
        if (!bullets) {
            return;
        }

        if (Array.isArray(bullets)) {
            this.bullets.push(...bullets);
        } else {
            this.bullets.push(bullets);
        }

        this.audioManager.play('playerShoot', 0.3);
    }

    /**
     * 更新子弹
     */
    updateBullets() {
        // 玩家子弹（传递敌人列表供追踪导弹使用）
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update(this.deltaTime, this.enemies);
            if (this.bullets[i].isOutOfBounds()) {
                this.bullets.splice(i, 1);
            }
        }

        // 敌机子弹
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            this.enemyBullets[i].update(this.deltaTime);
            if (this.enemyBullets[i].isOutOfBounds()) {
                this.enemyBullets.splice(i, 1);
            }
        }
    }

    /**
     * 更新道具
     */
    updateItems() {
        for (let i = this.items.length - 1; i >= 0; i--) {
            this.items[i].update(this.deltaTime);
            if (this.items[i].isOutOfBounds()) {
                this.items.splice(i, 1);
            }
        }
    }

    /**
     * 渲染
     */
    render() {
        // 清空画布with渐变背景
        if (!this.backgroundGradient) {
            this.precomputeBackgroundAssets();
        }
        this.ctx.fillStyle = this.backgroundGradient;
        this.ctx.fillRect(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT);

        // 绘制背景网格和星空
        this.renderBackground();

        if (this.gameState === 'menu') {
            this.renderMenu();
            return;
        }

        if (this.gameState === 'shipSelection') {
            this.shipSelection.render();
            return;
        }

        if (this.gameState === 'levelSelection') {
            this.levelSelection.render();
            return;
        }

        if (this.gameState === 'gameover') {
            this.renderGameOver();
            return;
        }

        // 渲染粒子效果（底层）
        this.particleSystem.render(this.ctx);

        // 渲染游戏对象
        this.player.render(this.ctx, this.particleSystem);

        // 渲染僚机
        this.wingmen.forEach(wingman => wingman.render(this.ctx, this.particleSystem));

        this.enemies.forEach(enemy => enemy.render(this.ctx));

        if (this.boss) {
            this.boss.render(this.ctx);
        }

        this.bullets.forEach(bullet => bullet.render(this.ctx, this.particleSystem));
        this.enemyBullets.forEach(bullet => bullet.render(this.ctx, this.particleSystem));
        this.items.forEach(item => item.render(this.ctx));

        // 渲染HUD
        this.gameHUD.render(this.ctx);

        // 暂停提示
        if (this.gameState === 'paused') {
            this.renderPauseScreen();
        }
    }

    /**
     * 渲染背景
     */
    renderBackground() {
        const ctx = this.ctx;
        const theme = this.currentVisualTheme || this.visualThemeBase || this.buildVisualTheme(this.currentLevelConfig);
        const width = GameConfig.CANVAS_WIDTH;
        const height = GameConfig.CANVAS_HEIGHT;

        // 轻量渐变叠加，增加科技质感（缓存避免重复创建）
        if (!this.backgroundOverlay) {
            const overlay = this.ctx.createLinearGradient(0, 0, width, height);
            overlay.addColorStop(0, ColorUtils.resolveColorWithAlpha(theme.accent || '#00d9ff', 0.08));
            overlay.addColorStop(0.5, 'rgba(255, 255, 255, 0.02)');
            overlay.addColorStop(1, ColorUtils.resolveColorWithAlpha(theme.accent || '#00d9ff', 0.1));
            this.backgroundOverlay = overlay;
        }
        if (this.backgroundOverlay) {
            ctx.save();
            ctx.fillStyle = this.backgroundOverlay;
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
        }

        // 能量光球
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        this.backgroundOrbs.forEach(orb => {
            const pulse = 0.65 + Math.sin(this.sceneAnimationTime * orb.pulseSpeed + orb.phase) * 0.2;
            const radius = orb.radius * pulse;
            const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, radius);
            gradient.addColorStop(0, ColorUtils.resolveColorWithAlpha(theme.orbColor || theme.accent || '#00d8ff', 0.35));
            gradient.addColorStop(0.6, ColorUtils.resolveColorWithAlpha(theme.orbColor || theme.accent || '#00d8ff', 0.18));
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, radius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();

        // 高速扫描线
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = ColorUtils.resolveColorWithAlpha(theme.diagonalColor || theme.accent || '#00d9ff', 0.22);
        ctx.lineWidth = 1.2;
        const diagSpacing = this.diagonalSpacing || theme.diagonalSpacing || 180;
        const diagShift = (this.sceneAnimationTime * (this.diagonalSpeed || theme.diagonalSpeed || 40)) % diagSpacing;
        for (let i = -1; i < width / diagSpacing + 2; i++) {
            const x = i * diagSpacing + diagShift;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x - height * 0.6, height);
            ctx.stroke();
        }
        ctx.restore();

        // 科技线条
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        this.techLines.forEach(line => {
            const startX = line.x;
            const startY = line.offset;
            const endX = line.x + Math.cos(line.angle) * line.length;
            const endY = line.offset + Math.sin(line.angle) * line.length;
            ctx.strokeStyle = ColorUtils.resolveColorWithAlpha(theme.accent || '#00d9ff', 0.28);
            ctx.lineWidth = line.width;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            ctx.fillStyle = ColorUtils.resolveColorWithAlpha(theme.accent || '#00d9ff', 0.35);
            ctx.beginPath();
            ctx.arc(endX, endY, 2.5 + line.width, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();

        // 垂直网格线
        ctx.save();
        ctx.strokeStyle = theme.gridColor || 'rgba(0, 120, 255, 0.25)';
        ctx.lineWidth = 1;
        if (this.backgroundGridPath) {
            ctx.stroke(this.backgroundGridPath);
        }
        ctx.restore();

        // 水平扫描网格
        ctx.save();
        const spacing = this.gridSpacing || theme.gridSpacing || 60;
        const offset = (this.bgOffset % spacing);
        ctx.strokeStyle = theme.horizontalGridColor || theme.gridColor || 'rgba(0, 120, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.85;
        for (let y = -spacing + offset; y < height + spacing; y += spacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        ctx.restore();

        // 星空粒子
        ctx.save();
        const starColors = this.starColorComponents.length > 0
            ? this.starColorComponents
            : [ColorUtils.parseColor('#ffffff')];
        this.stars.forEach(star => {
            const components = starColors[star.colorIndex % starColors.length];
            const alpha = 0.25 + star.brightness * 0.6;
            ctx.fillStyle = ColorUtils.toRgbaString(components, alpha);
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size + alpha * 0.8, 0, Math.PI * 2);
            ctx.fill();

            const glowRadius = star.size * 3 + star.brightness * 4;
            const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowRadius);
            glow.addColorStop(0, ColorUtils.toRgbaString(components, alpha * 0.5));
            glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = glow;
            ctx.fillRect(star.x - glowRadius, star.y - glowRadius, glowRadius * 2, glowRadius * 2);
        });
        ctx.restore();
    }

    /**
     * 渲染主菜单 - 优化版本
     */
    renderMenu() {
        const ctx = this.ctx;
        const centerX = GameConfig.CANVAS_WIDTH / 2;
        const theme = this.currentVisualTheme || this.visualThemeBase || this.buildVisualTheme(this.currentLevelConfig);
        const accent = theme.accent || '#00f6ff';

        const time = Date.now() * 0.001;
        const titleScale = 1 + Math.sin(time * 2) * 0.05;
        const titleY = 200 + Math.sin(time) * 5;

        ctx.save();
        ctx.translate(centerX, titleY);
        ctx.scale(titleScale, titleScale);
        ctx.translate(-centerX, -titleY);

        const titleGradient = ctx.createLinearGradient(centerX - 140, titleY - 40, centerX + 140, titleY + 40);
        titleGradient.addColorStop(0, ColorUtils.resolveColorWithAlpha(accent, 0.95));
        titleGradient.addColorStop(0.5, '#ffffff');
        titleGradient.addColorStop(1, ColorUtils.resolveColorWithAlpha(accent, 0.95));
        ctx.fillStyle = titleGradient;
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = ColorUtils.resolveColorWithAlpha(accent, 0.85);
        ctx.shadowBlur = 24;
        ctx.fillText('雷霆战机', centerX, 200);

        ctx.font = '16px Arial';
        ctx.shadowBlur = 12;
        ctx.fillStyle = ColorUtils.resolveColorWithAlpha(accent, 0.65);
        ctx.fillText('Thunder Fighter', centerX, 224);

        ctx.restore();

        const buttonY = 360;
        const buttonWidth = 220;
        const buttonHeight = 56;
        const buttonX = centerX - buttonWidth / 2;
        const buttonHover = this.mousePos.x >= buttonX &&
                            this.mousePos.x <= buttonX + buttonWidth &&
                            this.mousePos.y >= buttonY &&
                            this.mousePos.y <= buttonY + buttonHeight;

        const buttonScale = buttonHover ? 1.08 : 1;
        const buttonAlpha = buttonHover ? 0.95 : 0.78;

        ctx.save();
        ctx.translate(centerX, buttonY + buttonHeight / 2);
        ctx.scale(buttonScale, buttonScale);
        ctx.translate(-centerX, -(buttonY + buttonHeight / 2));

        const radius = 12;
        ctx.beginPath();
        ctx.moveTo(buttonX + radius, buttonY);
        ctx.lineTo(buttonX + buttonWidth - radius, buttonY);
        ctx.quadraticCurveTo(buttonX + buttonWidth, buttonY, buttonX + buttonWidth, buttonY + radius);
        ctx.lineTo(buttonX + buttonWidth, buttonY + buttonHeight - radius);
        ctx.quadraticCurveTo(buttonX + buttonWidth, buttonY + buttonHeight, buttonX + buttonWidth - radius, buttonY + buttonHeight);
        ctx.lineTo(buttonX + radius, buttonY + buttonHeight);
        ctx.quadraticCurveTo(buttonX, buttonY + buttonHeight, buttonX, buttonY + buttonHeight - radius);
        ctx.lineTo(buttonX, buttonY + radius);
        ctx.quadraticCurveTo(buttonX, buttonY, buttonX + radius, buttonY);
        ctx.closePath();

        ctx.fillStyle = ColorUtils.resolveColorWithAlpha(accent, buttonAlpha);
        ctx.fill();

        ctx.strokeStyle = ColorUtils.resolveColorWithAlpha('#ffffff', 0.85);
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('开始游戏', centerX, buttonY + buttonHeight / 2 + 7);

        ctx.restore();

        ctx.font = '16px Arial';
        ctx.fillStyle = ColorUtils.resolveColorWithAlpha('#ffffff', 0.75);
        ctx.textAlign = 'center';
        ctx.fillText('点击屏幕或按任意键开始', centerX, buttonY + 90);
    }

    /**
     * 渲染游戏结束画面
     */
    renderGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT);

        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏结束', GameConfig.CANVAS_WIDTH / 2, 300);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = '32px Arial';
        this.ctx.fillText('得分: ' + this.score, GameConfig.CANVAS_WIDTH / 2, 400);

        this.ctx.font = '24px Arial';
        this.ctx.fillText('点击屏幕重新开始', GameConfig.CANVAS_WIDTH / 2, 500);
    }

    /**
     * 渲染暂停画面
     */
    renderPauseScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('暂停', GameConfig.CANVAS_WIDTH / 2, GameConfig.CANVAS_HEIGHT / 2);

        this.ctx.font = '24px Arial';
        this.ctx.fillText('按 ESC 继续', GameConfig.CANVAS_WIDTH / 2, GameConfig.CANVAS_HEIGHT / 2 + 50);
    }

    /**
     * 游戏主循环 - 优化版本
     */
    gameLoop() {
        const startTime = performance.now();

        this.update();
        this.render();

        const endTime = performance.now();
        const frameTime = endTime - startTime;

        // 性能监控
        if (this.performanceMonitor) {
            this.performanceMonitor.update();
        }

        // 如果帧时间过长，显示警告（限流避免刷屏）
        if (frameTime > 16 && endTime - this.lastFrameWarningTime > 500) { // 16ms = 60fps
            console.warn(`帧时间过长: ${frameTime.toFixed(2)}ms`);
            this.lastFrameWarningTime = endTime;
        }

        if (!this.boundGameLoop) {
            this.boundGameLoop = this.gameLoop.bind(this);
        }
        requestAnimationFrame(this.boundGameLoop);
    }

    /**
     * 启动游戏循环
     */
    start() {
        console.log('启动游戏循环');
        this.gameLoop();
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameScene;
}
