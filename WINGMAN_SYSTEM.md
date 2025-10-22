# 僚机系统文档

## 🛩️ 僚机功能概述

僚机是跟随玩家战机的辅助单位，提供额外的火力支援。玩家最多可以拥有2个僚机（左右各一个）。

---

## ✨ 核心特性

### 1. **自动跟随**
- 僚机会自动跟随玩家移动
- 平滑的跟随动画
- 左右僚机分别位于玩家两侧
- 轻微的上下浮动效果（更有生命力）

### 2. **自动瞄准射击**
- 自动锁定前方最近的敌人
- 智能射击角度计算
- 独立的射击冷却时间
- 射击范围：400像素

### 3. **独立生命值**
- 每个僚机有独立的生命值
- 可以被敌机子弹击中
- 可以被敌机撞击
- 死亡时产生爆炸效果

### 4. **视觉连接线**
- 虚线连接玩家和僚机
- 表示僚机与主机的联系
- 增强视觉反馈

---

## 🎮 如何获得僚机

### 方法1: 拾取道具

僚机道具会从被击毁的敌机掉落：

```javascript
// 道具掉落配置
WINGMAN: {
    COLOR: '#ff00ff',        // 紫色道具
    DROP_RATE: 0.06,         // 6%掉落率
    WINGMAN_TYPE: 'STANDARD' // 默认标准型僚机
}
```

**道具外观**: 紫色能量球

### 方法2: 手动添加（测试用）

在浏览器控制台输入：

```javascript
// 添加左侧僚机
gameScene.wingmen.push(new Wingman(gameScene.player, 'LEFT', 'STANDARD'));

// 添加右侧僚机
gameScene.wingmen.push(new Wingman(gameScene.player, 'RIGHT', 'ASSAULT'));
```

---

## 🤖 僚机类型

### STANDARD（标准型）
- **生命值**: 50
- **伤害**: 8
- **射速**: 300ms
- **跟随速度**: 6
- **子弹类型**: NORMAL
- **颜色**: 蓝色 (#00aaff)
- **特点**: 平衡型，稳定输出

### ASSAULT（突击型）
- **生命值**: 40（较低）
- **伤害**: 12（高）
- **射速**: 200ms（快）
- **跟随速度**: 7
- **子弹类型**: LASER（穿透）
- **颜色**: 红色 (#ff4444)
- **特点**: 高DPS，激光穿透

### DEFENDER（防御型）
- **生命值**: 80（高）
- **伤害**: 6
- **射速**: 400ms
- **跟随速度**: 5
- **子弹类型**: NORMAL
- **颜色**: 绿色 (#44ff44)
- **特点**: 高血量，肉盾型

### SNIPER（狙击型）
- **生命值**: 30（脆皮）
- **伤害**: 20（极高）
- **射速**: 600ms（慢）
- **跟随速度**: 5
- **子弹类型**: NORMAL
- **颜色**: 橙色 (#ffaa00)
- **特点**: 单发高伤，精准打击

---

## 💡 战术应用

### 配置建议

#### 1. **均衡输出流**
```javascript
// 左: 标准型 + 右: 标准型
// 稳定持续输出
gameScene.wingmen.push(new Wingman(gameScene.player, 'LEFT', 'STANDARD'));
gameScene.wingmen.push(new Wingman(gameScene.player, 'RIGHT', 'STANDARD'));
```

#### 2. **爆发伤害流**
```javascript
// 左: 突击型 + 右: 狙击型
// 高爆发，适合快速清场
gameScene.wingmen.push(new Wingman(gameScene.player, 'LEFT', 'ASSAULT'));
gameScene.wingmen.push(new Wingman(gameScene.player, 'RIGHT', 'SNIPER'));
```

#### 3. **生存防御流**
```javascript
// 左: 防御型 + 右: 防御型
// 双肉盾，吸收大量伤害
gameScene.wingmen.push(new Wingman(gameScene.player, 'LEFT', 'DEFENDER'));
gameScene.wingmen.push(new Wingman(gameScene.player, 'RIGHT', 'DEFENDER'));
```

#### 4. **混合战术**
```javascript
// 左: 防御型（肉盾） + 右: 突击型（输出）
// 攻守兼备
gameScene.wingmen.push(new Wingman(gameScene.player, 'LEFT', 'DEFENDER'));
gameScene.wingmen.push(new Wingman(gameScene.player, 'RIGHT', 'ASSAULT'));
```

---

## 🎯 僚机AI逻辑

### 目标选择
```javascript
// 优先级
1. 距离最近
2. 位于前方（y < wingman.y）
3. 在射程内（400像素）
```

### 射击逻辑
```javascript
// 自动瞄准计算
const dx = target.x - this.x;
const dy = target.y - this.y;
const distance = Math.sqrt(dx * dx + dy * dy);

// 计算子弹速度向量
const speed = GameConfig.BULLET.SPEED;
const vx = (dx / distance) * speed;
const vy = (dy / distance) * speed;
```

### 跟随算法
```javascript
// 平滑跟随
const dx = targetX - this.x;
const dy = targetY - this.y;
const distance = Math.sqrt(dx * dx + dy * dy);

if (distance > 1) {
    const moveDistance = Math.min(this.followSpeed, distance);
    this.x += (dx / distance) * moveDistance;
    this.y += (dy / distance) * moveDistance;
}
```

---

## 🎨 视觉效果

### 1. **僚机外观**
- 三角形战机（比玩家小）
- 青色驾驶舱
- 位置标识（L或R）
- 引擎尾焰粒子

### 2. **连接线**
- 虚线连接到玩家
- rgba(0, 255, 255, 0.2)
- 5px虚线间隔

### 3. **生命条**
- 仅在受伤时显示
- 绿色（健康）/红色（危险）
- 3像素高度

### 4. **爆炸效果**
- 死亡时产生彩色爆炸
- 粒子数量：15个
- 粒子大小：2

---

## 📊 性能优化

### 僚机数量限制
```javascript
// 最多2个僚机
if (wingmen.length >= 2) {
    console.log('僚机数量已达上限！');
    return;
}
```

### 射程限制
```javascript
// 400像素射程，避免无效计算
const maxRange = 400;
if (distanceSquared < maxRange * maxRange) {
    // 执行瞄准和射击
}
```

### 更新优化
```javascript
// 死亡僚机立即移除
if (wingman.isDead()) {
    this.wingmen.splice(i, 1);
}
```

---

## 🐛 调试命令

### 查看僚机状态
```javascript
console.log('僚机数量:', gameScene.wingmen.length);
gameScene.wingmen.forEach((w, i) => {
    console.log(`僚机${i+1}:`, {
        位置: w.position,
        类型: w.name,
        生命值: `${w.health}/${w.maxHealth}`,
        坐标: `(${Math.floor(w.x)}, ${Math.floor(w.y)})`
    });
});
```

### 强制添加僚机
```javascript
// 快速添加两个僚机
gameScene.wingmen = [
    new Wingman(gameScene.player, 'LEFT', 'ASSAULT'),
    new Wingman(gameScene.player, 'RIGHT', 'SNIPER')
];
```

### 移除所有僚机
```javascript
gameScene.wingmen = [];
```

### 测试僚机受伤
```javascript
// 对第一个僚机造成30点伤害
if (gameScene.wingmen[0]) {
    gameScene.wingmen[0].takeDamage(30);
}
```

---

## 🔧 技术实现

### 文件结构
```
src/
├── entities/
│   └── Wingman.js          # 僚机实体类
├── config/
│   └── GameConfig.js       # 僚机配置（WINGMAN_TYPES）
├── systems/
│   └── CollisionManager.js # 僚机碰撞检测
└── scenes/
    └── GameScene.js        # 僚机游戏循环集成
```

### 核心方法

**Wingman.js**:
- `constructor()`: 初始化僚机
- `update()`: 更新位置和射击
- `autoShoot()`: 自动瞄准射击
- `render()`: 渲染僚机

**CollisionManager.js**:
- `checkEnemyBulletsVsWingmen()`: 敌弹击中僚机
- `checkEnemiesVsWingmen()`: 敌机撞击僚机
- `spawnWingman()`: 生成僚机

**GameScene.js**:
- `wingmen[]`: 僚机数组
- 更新循环集成
- 渲染循环集成

---

## 🎮 游戏平衡

### 僚机优势
- ✅ 增加火力输出（最多3倍）
- ✅ 自动瞄准，无需手动操作
- ✅ 分担敌火（吸收伤害）
- ✅ 提升清屏效率

### 僚机限制
- ❌ 最多2个（避免过于强大）
- ❌ 独立生命值（会被击毁）
- ❌ 射程限制（400px）
- ❌ 依赖道具掉落（6%概率）

---

## 📝 更新日志

### v1.0 - 初始版本
- ✅ 基础僚机系统
- ✅ 4种僚机类型
- ✅ 自动跟随和射击
- ✅ 碰撞检测
- ✅ 道具掉落系统
- ✅ 视觉效果和动画

---

## 🚀 未来计划

- [ ] 僚机升级系统
- [ ] 僚机技能系统（特殊技能）
- [ ] 僚机编队系统（V字形、横排等）
- [ ] 僚机合体攻击
- [ ] 更多僚机类型
- [ ] 僚机装备系统

---

## 💬 使用示例

### 完整测试流程

```javascript
// 1. 开始游戏
// 点击画面开始

// 2. 添加僚机（控制台）
gameScene.wingmen.push(new Wingman(gameScene.player, 'LEFT', 'ASSAULT'));
gameScene.wingmen.push(new Wingman(gameScene.player, 'RIGHT', 'DEFENDER'));

// 3. 观察僚机行为
// - 跟随玩家移动
// - 自动射击敌人
// - 被敌弹击中

// 4. 查看状态
console.log('僚机状态:', gameScene.wingmen);

// 5. 测试不同类型
gameScene.wingmen = [];  // 清空
gameScene.wingmen.push(new Wingman(gameScene.player, 'LEFT', 'SNIPER'));
// 观察狙击型的高伤害低射速
```

---

## 🎯 最佳实践

1. **保护僚机**: 避免让僚机直接暴露在敌火下
2. **合理搭配**: 根据战局选择僚机类型
3. **主动拾取**: 优先收集僚机道具
4. **战术走位**: 利用僚机位置吸引敌火
5. **火力集中**: 让僚机和主机同时攻击同一目标

僚机系统为游戏带来了全新的战术深度和玩法乐趣！
