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

        // 输入
        this.keys = {};
        this.mousePos = { x: 0, y: 0 };
        this.isMouseDown = false;

        // 时间
        this.lastTime = Date.now();
        this.deltaTime = 0;

        // 背景滚动
        this.bgOffset = 0;

        // 星空背景
        this.stars = [];
        this.initStars();

        // 性能监控
        this.performanceMonitor = null;

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
                brightness: Math.random()
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
        this.shipSelection.onConfirm = () => {
            this.selectedShipType = this.shipSelection.getSelectedShip();
            this.startGame();
        };

        // 绑定输入事件
        this.bindInputEvents();

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
        console.log('进入战机选择界面');
    }

    /**
     * 开始游戏
     */
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.stage = 1;
        this.stageTime = 0;

        // 重置玩家（使用选择的战机类型）
        const shipType = this.selectedShipType || 'STANDARD';
        this.player.reset(shipType);
        console.log(`游戏开始！使用战机: ${shipType}`);

        // 清空所有游戏对象
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.items = [];
        this.wingmen = [];  // 清空僚机
        this.boss = null;

        // 重置生成器
        this.enemySpawner.reset();

        console.log('游戏开始！');
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

        // 更新战机选择界面
        if (this.gameState === 'shipSelection') {
            this.shipSelection.update(this.deltaTime);
            return;
        }

        if (this.gameState !== 'playing') {
            return;
        }

        // 更新背景
        this.bgOffset += 1;
        if (this.bgOffset > GameConfig.CANVAS_HEIGHT) {
            this.bgOffset = 0;
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
            const bullet = wingman.update(this.deltaTime, this.enemies, currentTime);

            // 如果僚机射击，添加子弹
            if (bullet) {
                this.bullets.push(bullet);
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
            if (bullets) {
                // 处理子弹数组（散弹等）
                if (Array.isArray(bullets)) {
                    this.bullets.push(...bullets);
                } else {
                    this.bullets.push(bullets);
                }
                this.audioManager.play('playerShoot', 0.3);
            }
        }

        // 鼠标/触摸控制
        if (this.isMouseDown) {
            this.player.moveTowards(this.mousePos.x, this.mousePos.y);
            const bullets = this.player.shoot();
            if (bullets) {
                // 处理子弹数组（散弹等）
                if (Array.isArray(bullets)) {
                    this.bullets.push(...bullets);
                } else {
                    this.bullets.push(bullets);
                }
                this.audioManager.play('playerShoot', 0.3);
            }
        }
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
        const bgGradient = this.ctx.createLinearGradient(0, 0, 0, GameConfig.CANVAS_HEIGHT);
        bgGradient.addColorStop(0, '#000022');
        bgGradient.addColorStop(0.5, '#000033');
        bgGradient.addColorStop(1, '#000044');
        this.ctx.fillStyle = bgGradient;
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
        // 更新并绘制星星
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > GameConfig.CANVAS_HEIGHT) {
                star.y = 0;
                star.x = Math.random() * GameConfig.CANVAS_WIDTH;
            }

            const alpha = 0.3 + star.brightness * 0.7;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // 绘制网格线（更淡）
        this.ctx.strokeStyle = 'rgba(0, 50, 100, 0.3)';
        this.ctx.lineWidth = 1;

        // 绘制垂直线
        for (let x = 0; x < GameConfig.CANVAS_WIDTH; x += 60) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, GameConfig.CANVAS_HEIGHT);
            this.ctx.stroke();
        }

        // 绘制水平线(滚动效果)
        for (let y = -60 + (this.bgOffset % 60); y < GameConfig.CANVAS_HEIGHT; y += 60) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(GameConfig.CANVAS_WIDTH, y);
            this.ctx.stroke();
        }
    }

    /**
     * 渲染主菜单 - 优化版本
     */
    renderMenu() {
        const ctx = this.ctx;
        const centerX = GameConfig.CANVAS_WIDTH / 2;

        // 清空画布with渐变背景
        const bgGradient = ctx.createLinearGradient(0, 0, 0, GameConfig.CANVAS_HEIGHT);
        bgGradient.addColorStop(0, '#000022');
        bgGradient.addColorStop(0.5, '#000033');
        bgGradient.addColorStop(1, '#000044');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT);

        // 绘制背景网格和星空
        this.renderBackground();

        // 标题动画效果
        const time = Date.now() * 0.001;
        const titleScale = 1 + Math.sin(time * 2) * 0.05;
        const titleY = 200 + Math.sin(time) * 5;

        ctx.save();
        ctx.translate(centerX, titleY);
        ctx.scale(titleScale, titleScale);
        ctx.translate(-centerX, -titleY);

        // 主标题
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 150, 255, 0.8)';
        ctx.shadowBlur = 20;
        ctx.fillText('雷霆战机', centerX, 200);

        // 副标题
        ctx.font = '16px Arial';
        ctx.shadowBlur = 10;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText('Thunder Fighter', centerX, 220);

        ctx.restore();

        // 开始按钮
        const buttonY = 350;
        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonX = centerX - buttonWidth / 2;

        // 按钮动画
        const buttonHover = this.mousePos.x >= buttonX &&
                           this.mousePos.x <= buttonX + buttonWidth &&
                           this.mousePos.y >= buttonY &&
                           this.mousePos.y <= buttonY + buttonHeight;

        const buttonScale = buttonHover ? 1.1 : 1;
        const buttonAlpha = buttonHover ? 0.9 : 0.7;

        ctx.save();
        ctx.translate(centerX, buttonY + buttonHeight / 2);
        ctx.scale(buttonScale, buttonScale);
        ctx.translate(-centerX, -(buttonY + buttonHeight / 2));

        // 按钮背景
        ctx.fillStyle = `rgba(0, 150, 255, ${buttonAlpha})`;
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

        // 按钮边框
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

        // 按钮文字
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('点击开始', centerX, buttonY + 30);

        ctx.restore();

        // 控制说明
        ctx.font = '16px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.textAlign = 'center';

        const instructions = [
            '方向键/WASD/鼠标 - 移动战机',
            '空格/点击 - 射击',
            'ESC - 暂停'
        ];

        instructions.forEach((text, index) => {
            ctx.fillText(text, centerX, 500 + index * 30);
        });

        // 版本信息
        ctx.font = '12px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText('Pro Edition v2.0', centerX, GameConfig.CANVAS_HEIGHT - 20);
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

        // 如果帧时间过长，显示警告
        if (frameTime > 16) { // 16ms = 60fps
            console.warn(`帧时间过长: ${frameTime.toFixed(2)}ms`);
        }

        requestAnimationFrame(() => this.gameLoop());
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
