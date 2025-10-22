# 僚机功能 - 快速开始指南

## 🎮 如何测试僚机功能

### 方法1: 通过游戏内道具获得（推荐）

1. 启动游戏
2. 击毁敌机
3. 拾取**紫色道具**（僚机道具，6%掉落率）
4. 僚机会自动出现并跟随你

### 方法2: 控制台命令（测试用）

打开浏览器控制台（按F12），输入以下命令：

#### 快速添加僚机
```javascript
// 添加左侧标准型僚机
gameScene.wingmen.push(new Wingman(gameScene.player, 'LEFT', 'STANDARD'));

// 添加右侧突击型僚机（激光）
gameScene.wingmen.push(new Wingman(gameScene.player, 'RIGHT', 'ASSAULT'));
```

#### 添加双狙击僚机（高伤害）
```javascript
gameScene.wingmen = [
    new Wingman(gameScene.player, 'LEFT', 'SNIPER'),
    new Wingman(gameScene.player, 'RIGHT', 'SNIPER')
];
```

#### 添加双防御僚机（高血量）
```javascript
gameScene.wingmen = [
    new Wingman(gameScene.player, 'LEFT', 'DEFENDER'),
    new Wingman(gameScene.player, 'RIGHT', 'DEFENDER')
];
```

---

## 🤖 僚机类型快速对比

| 类型 | 血量 | 伤害 | 射速 | 特点 | 颜色 |
|------|------|------|------|------|------|
| STANDARD | 50 | 8 | 300ms | 平衡 | 蓝色 |
| ASSAULT | 40 | 12 | 200ms | 高输出+激光 | 红色 |
| DEFENDER | 80 | 6 | 400ms | 肉盾 | 绿色 |
| SNIPER | 30 | 20 | 600ms | 爆发 | 橙色 |

---

## ✨ 僚机功能一览

### ✅ 会做什么
- 自动跟随玩家移动
- 自动瞄准最近的敌人
- 自动射击（射程400px）
- 可以被敌机击毁
- 死亡时爆炸

### ❌ 不会做什么
- 不会主动寻找远处的敌人
- 不会躲避敌弹
- 不会修复自身
- 不会超过2个

---

## 🎯 推荐配置

### 新手配置
```javascript
// 双标准型 - 稳定输出
gameScene.wingmen = [
    new Wingman(gameScene.player, 'LEFT', 'STANDARD'),
    new Wingman(gameScene.player, 'RIGHT', 'STANDARD')
];
```

### 进攻配置
```javascript
// 突击+狙击 - 高爆发
gameScene.wingmen = [
    new Wingman(gameScene.player, 'LEFT', 'ASSAULT'),
    new Wingman(gameScene.player, 'RIGHT', 'SNIPER')
];
```

### 防守配置
```javascript
// 双防御 - 吸收伤害
gameScene.wingmen = [
    new Wingman(gameScene.player, 'LEFT', 'DEFENDER'),
    new Wingman(gameScene.player, 'RIGHT', 'DEFENDER')
];
```

### 混合配置
```javascript
// 防御+突击 - 攻守兼备
gameScene.wingmen = [
    new Wingman(gameScene.player, 'LEFT', 'DEFENDER'),
    new Wingman(gameScene.player, 'RIGHT', 'ASSAULT')
];
```

---

## 🔍 调试命令

### 查看僚机状态
```javascript
console.log('僚机数量:', gameScene.wingmen.length);
gameScene.wingmen.forEach((w, i) => {
    console.log(`僚机${i+1}: ${w.name}, 生命:${w.health}/${w.maxHealth}`);
});
```

### 移除所有僚机
```javascript
gameScene.wingmen = [];
```

### 让僚机受伤（测试）
```javascript
gameScene.wingmen[0].takeDamage(20);
```

---

## 🎨 视觉识别

- **连接线**: 虚线连接到玩家
- **位置标识**: 头顶显示 "L" 或 "R"
- **引擎尾焰**: 蓝色粒子
- **生命条**: 受伤时显示在头顶
- **颜色**: 根据类型不同（蓝/红/绿/橙）

---

## 📝 完整示例

```javascript
// 1. 开始游戏
// （点击屏幕开始）

// 2. 打开控制台（F12）

// 3. 添加僚机
gameScene.wingmen.push(new Wingman(gameScene.player, 'LEFT', 'ASSAULT'));
gameScene.wingmen.push(new Wingman(gameScene.player, 'RIGHT', 'SNIPER'));

// 4. 观察：
// - 两个僚机出现在玩家两侧
// - 虚线连接到玩家
// - 自动跟随移动
// - 自动射击敌人

// 5. 查看效果
console.log('左侧僚机:', gameScene.wingmen[0].name);
console.log('右侧僚机:', gameScene.wingmen[1].name);
```

---

## ⚠️ 注意事项

1. **最多2个僚机**：第3个会被拒绝
2. **独立生命值**：僚机会被击毁
3. **射程限制**：400像素内才射击
4. **自动瞄准**：无需手动控制

---

## 🎊 享受游戏！

僚机大幅提升了火力和生存能力，让你的战机编队所向披靡！

查看完整文档：`WINGMAN_SYSTEM.md`
