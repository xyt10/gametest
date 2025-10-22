/**
 * 音效管理器
 * 使用Web Audio API生成程序化音效
 */

class AudioManager {
    constructor() {
        // 创建音频上下文
        this.audioContext = null;
        this.masterVolume = 0.3; // 主音量
        this.enabled = true;

        // 音效缓存
        this.sounds = {};

        this.init();
    }

    /**
     * 初始化音频系统
     */
    init() {
        try {
            // 创建音频上下文
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            console.log('音效系统初始化成功');
        } catch (e) {
            console.warn('音频系统不可用:', e);
            this.enabled = false;
        }
    }

    /**
     * 恢复音频上下文（某些浏览器需要用户交互）
     */
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    /**
     * 播放音效
     */
    play(soundType, volume = 1.0) {
        if (!this.enabled || !this.audioContext) return;

        this.resume();

        switch (soundType) {
            case 'playerShoot':
                this.playPlayerShoot(volume);
                break;
            case 'enemyShoot':
                this.playEnemyShoot(volume);
                break;
            case 'explosion':
                this.playExplosion(volume);
                break;
            case 'hit':
                this.playHit(volume);
                break;
            case 'powerUp':
                this.playPowerUp(volume);
                break;
            case 'levelUp':
                this.playLevelUp(volume);
                break;
            case 'bossAppear':
                this.playBossAppear(volume);
                break;
            case 'itemCollect':
                this.playItemCollect(volume);
                break;
            case 'shield':
                this.playShield(volume);
                break;
            case 'bomb':
                this.playBomb(volume);
                break;
            default:
                console.warn('未知音效类型:', soundType);
        }
    }

    /**
     * 玩家射击音效
     */
    playPlayerShoot(volume = 1.0) {
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // 创建振荡器（激光音效）
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        // 设置频率（从高到低）
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);

        // 音量包络
        gainNode.gain.setValueAtTime(this.masterVolume * volume * 0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.type = 'square';
        osc.start(now);
        osc.stop(now + 0.1);
    }

    /**
     * 敌机射击音效
     */
    playEnemyShoot(volume = 1.0) {
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);

        gainNode.gain.setValueAtTime(this.masterVolume * volume * 0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.type = 'sawtooth';
        osc.start(now);
        osc.stop(now + 0.15);
    }

    /**
     * 爆炸音效
     */
    playExplosion(volume = 1.0) {
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // 使用白噪声
        const bufferSize = ctx.sampleRate * 0.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(50, now + 0.5);

        gainNode.gain.setValueAtTime(this.masterVolume * volume * 0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        noise.start(now);
        noise.stop(now + 0.5);
    }

    /**
     * 击中音效
     */
    playHit(volume = 1.0) {
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.08);

        gainNode.gain.setValueAtTime(this.masterVolume * volume * 0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        osc.type = 'sawtooth';
        osc.start(now);
        osc.stop(now + 0.08);
    }

    /**
     * 能量提升音效
     */
    playPowerUp(volume = 1.0) {
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);

        gainNode.gain.setValueAtTime(this.masterVolume * volume * 0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.type = 'sine';
        osc.start(now);
        osc.stop(now + 0.3);
    }

    /**
     * 升级音效
     */
    playLevelUp(volume = 1.0) {
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // 演奏一个和弦
        const frequencies = [523.25, 659.25, 783.99]; // C, E, G

        frequencies.forEach((freq, index) => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.frequency.setValueAtTime(freq, now + index * 0.1);

            gainNode.gain.setValueAtTime(0, now + index * 0.1);
            gainNode.gain.linearRampToValueAtTime(this.masterVolume * volume * 0.15, now + index * 0.1 + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + index * 0.1 + 0.4);

            osc.type = 'sine';
            osc.start(now + index * 0.1);
            osc.stop(now + index * 0.1 + 0.4);
        });
    }

    /**
     * Boss出现音效
     */
    playBossAppear(volume = 1.0) {
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 1.0);

        gainNode.gain.setValueAtTime(this.masterVolume * volume * 0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.0);

        osc.type = 'sawtooth';
        osc.start(now);
        osc.stop(now + 1.0);
    }

    /**
     * 道具收集音效
     */
    playItemCollect(volume = 1.0) {
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);

        gainNode.gain.setValueAtTime(this.masterVolume * volume * 0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.type = 'sine';
        osc.start(now);
        osc.stop(now + 0.15);
    }

    /**
     * 护盾音效
     */
    playShield(volume = 1.0) {
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.2);
        osc.frequency.linearRampToValueAtTime(400, now + 0.4);

        gainNode.gain.setValueAtTime(this.masterVolume * volume * 0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        osc.type = 'triangle';
        osc.start(now);
        osc.stop(now + 0.4);
    }

    /**
     * 炸弹音效
     */
    playBomb(volume = 1.0) {
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // 低频冲击波
        const osc1 = ctx.createOscillator();
        const gainNode1 = ctx.createGain();

        osc1.connect(gainNode1);
        gainNode1.connect(ctx.destination);

        osc1.frequency.setValueAtTime(80, now);
        osc1.frequency.exponentialRampToValueAtTime(20, now + 0.8);

        gainNode1.gain.setValueAtTime(this.masterVolume * volume * 0.4, now);
        gainNode1.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

        osc1.type = 'sine';
        osc1.start(now);
        osc1.stop(now + 0.8);

        // 高频爆炸声
        this.playExplosion(volume * 1.5);
    }

    /**
     * 设置主音量
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }

    /**
     * 切换音效开关
     */
    toggle() {
        this.enabled = !this.enabled;
        console.log('音效:', this.enabled ? '开启' : '关闭');
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}
