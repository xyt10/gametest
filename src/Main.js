/**
 * 游戏主程序
 * 初始化和启动游戏 - 优化版本
 */

// 性能监控类
class PerformanceMonitor {
    constructor() {
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = Date.now();
        this.fpsArray = [];
        this.maxFpsHistory = 60;
    }

    update() {
        this.frameCount++;
        const currentTime = Date.now();

        if (currentTime - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;

            // 更新FPS显示
            const fpsElement = document.getElementById('fpsValue');
            if (fpsElement) {
                fpsElement.textContent = this.fps;
            }

            // 记录FPS历史用于分析
            this.fpsArray.push(this.fps);
            if (this.fpsArray.length > this.maxFpsHistory) {
                this.fpsArray.shift();
            }
        }
    }

    getAverageFPS() {
        return this.fpsArray.length > 0
            ? Math.round(this.fpsArray.reduce((a, b) => a + b, 0) / this.fpsArray.length)
            : 0;
    }
}

// 图像资源预加载管理器
class AssetPreloader {
    constructor() {
        this.loadPromises = [];
        this.loadedAssets = 0;
        this.totalAssets = 0;
    }

    async preloadImages(imageUrls) {
        this.totalAssets = imageUrls.length;

        for (const url of imageUrls) {
            const promise = new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    this.loadedAssets++;
                    resolve(img);
                };
                img.onerror = reject;
                img.src = url;
            });
            this.loadPromises.push(promise);
        }

        return Promise.all(this.loadPromises);
    }

    getProgress() {
        return this.totalAssets > 0 ? (this.loadedAssets / this.totalAssets) * 100 : 0;
    }
}

/**
 * 调整canvas大小以适应屏幕 - 优化版本
 */
function resizeCanvas(canvas) {
    const container = document.getElementById('gameContainer');
    if (!container) return;

    // 获取容器尺寸
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // 游戏的基准分辨率（内部逻辑分辨率）
    const baseWidth = 480;
    const baseHeight = 800;
    const baseRatio = baseWidth / baseHeight;

    // 计算适配比例
    const containerRatio = containerWidth / containerHeight;

    let displayWidth, displayHeight;

    if (containerRatio > baseRatio) {
        // 容器更宽，以高度为准
        displayHeight = containerHeight;
        displayWidth = displayHeight * baseRatio;
    } else {
        // 容器更高或比例相同，以宽度为准
        displayWidth = containerWidth;
        displayHeight = displayWidth / baseRatio;
    }

    // 设置canvas的CSS显示尺寸（缩放）
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';

    // 保持canvas的内部分辨率不变（480x800）
    // canvas.width 和 canvas.height 已经在HTML中设置，这里不改变

    // 调整FPS计数器位置
    const fpsCounter = document.querySelector('.fps-counter');
    if (fpsCounter) {
        fpsCounter.style.right = Math.max(10, (containerWidth - displayWidth) / 2 + 10) + 'px';
    }

    return { displayWidth, displayHeight, containerWidth, containerHeight };
}

// 检查设备方向和显示警告
function checkOrientation() {
    const warning = document.getElementById('orientationWarning');
    if (window.innerWidth < window.innerHeight) {
        // 竖屏
        warning.style.display = 'none';
    } else if (window.innerWidth < 768 && window.innerHeight < 768) {
        // 移动端横屏
        warning.style.display = 'block';
    } else {
        warning.style.display = 'none';
    }
}

// 性能优化的游戏初始化
function initializeGame() {
    console.log('雷霆战机 - Thunder Fighter Pro Edition');
    console.log('游戏加载中...');

    // 初始化性能监控
    const perfMonitor = new PerformanceMonitor();
    const assetPreloader = new AssetPreloader();

    // 获取canvas
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('无法找到游戏画布!');
        return;
    }

    // 初始调整canvas大小
    resizeCanvas(canvas);

    // 监听窗口大小变化
    window.addEventListener('resize', () => {
        resizeCanvas(canvas);
        checkOrientation();
    });

    // 监听屏幕方向变化（移动端）
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            resizeCanvas(canvas);
            checkOrientation();
        }, 100);
    });

    // 检查设备方向
    checkOrientation();

    // 性能监控集成
    let lastPerfUpdate = Date.now();
    setInterval(() => {
        perfMonitor.update();
        const currentAvgFPS = perfMonitor.getAverageFPS();

        // 如果FPS过低，显示警告
        if (currentAvgFPS < 30 && currentAvgFPS > 0) {
            console.warn(`性能警告: 当前平均FPS: ${currentAvgFPS}`);
        }
    }, 100);

    // 隐藏加载提示
    const loading = document.getElementById('loading');
    if (loading) {
        // 模拟加载时间
        setTimeout(() => {
            loading.style.display = 'none';
        }, 500);
    }

    // 创建游戏场景
    try {
        const gameScene = new GameScene(canvas);

        // 启动游戏循环
        gameScene.start();

        console.log('游戏启动成功!');
        console.log('控制说明:');
        console.log('- 方向键/WASD/鼠标 - 移动战机');
        console.log('- 空格键/鼠标点击 - 射击');
        console.log('- ESC键 - 暂停/继续');
        console.log('');
        console.log('游戏目标:');
        console.log('- 消灭所有敌机');
        console.log('- 收集道具增强实力');
        console.log('- 击败强大的Boss');
        console.log('- 尽可能获得高分!');
        console.log('');
        console.log('✨ 新特性:');
        console.log('- 实时FPS监控');
        console.log('- 优化的性能');
        console.log('- 响应式设计');
        console.log('- 改进的视觉效果');

    } catch (error) {
        console.error('游戏初始化失败:', error);
        loading.innerHTML = '游戏加载失败<br><small>请刷新页面重试</small>';
    }
}

// 确保DOM加载完成后初始化游戏
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}

// 添加错误处理
window.addEventListener('error', (event) => {
    console.error('游戏错误:', event.error);
});

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initializeGame, PerformanceMonitor, AssetPreloader };
}
