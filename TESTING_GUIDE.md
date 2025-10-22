# 🎮 新功能测试指南

## 快速开始

打开游戏后，你可以通过修改 `src/scenes/GameScene.js` 中的玩家初始化来测试不同的战机类型。

### 步骤 1: 选择战机类型

找到 `GameScene.js` 文件中的玩家初始化代码（大约在第50-60行附近），修改为：

```javascript
// 在 GameScene 的 constructor 中
this.player = new Player(
    GameConfig.PLAYER.START_X,
    GameConfig.PLAYER.START_Y,
    'ASSAULT'  // 这里修改战机类型
);
```

### 可选战机类型

| 战机类型 | 代码 | 特点 |
|---------|------|------|
| 标准型 | `'STANDARD'` | 默认，平衡 |
| 突击型 | `'ASSAULT'` | 激光穿透，高射速 |
| 重型坦克 | `'TANK'` | 双倍血量，等离子炮 |
| 拦截机 | `'INTERCEPTOR'` | 极速移动，散弹 |
| 猎杀者 | `'HUNTER'` | 追踪导弹 |

---

## 测试子弹类型

### 1. 测试激光（ASSAULT战机）

```javascript
this.player = new Player(
    GameConfig.PLAYER.START_X,
    GameConfig.PLAYER.START_Y,
    'ASSAULT'
);
```

**测试重点**:
- ✅ 激光可以穿透3个敌人
- ✅ 红色激光束视觉效果
- ✅ 高射速（120ms间隔）
- ✅ 移动速度稍慢（4）

**如何验证**: 排列多个敌人，观察一发激光能击中几个

### 2. 测试追踪导弹（HUNTER战机）

```javascript
this.player = new Player(
    GameConfig.PLAYER.START_X,
    GameConfig.PLAYER.START_Y,
    'HUNTER'
);
```

**测试重点**:
- ✅ 导弹会自动追踪最近的敌人
- ✅ 导弹旋转朝向目标
- ✅ 带有尾焰轨迹效果
- ✅ 射速较慢（400ms）但单发高伤

**如何验证**:
1. 向一个方向射击
2. 观察导弹是否会自动转向追踪敌人
3. 查看导弹的旋转动画和轨迹

### 3. 测试散弹（INTERCEPTOR战机）

```javascript
this.player = new Player(
    GameConfig.PLAYER.START_X,
    GameConfig.PLAYER.START_Y,
    'INTERCEPTOR'
);
```

**测试重点**:
- ✅ 一次发射5发子弹
- ✅ 子弹呈扇形散开（30度角）
- ✅ 绿色能量球视觉效果
- ✅ 超高移动速度（8）

**如何验证**:
1. 按空格射击
2. 观察是否同时发射5发子弹
3. 确认子弹呈扇形分布

### 4. 测试等离子炮（TANK战机）

```javascript
this.player = new Player(
    GameConfig.PLAYER.START_X,
    GameConfig.PLAYER.START_Y,
    'TANK'
);
```

**测试重点**:
- ✅ 无限穿透所有敌人
- ✅ 紫色大型能量球
- ✅ 双倍生命值（200HP）
- ✅ 移动速度慢（3）

**如何验证**:
1. 让敌人排成一列
2. 射击观察是否穿透所有敌人
3. 确认高血量能承受更多伤害

---

## 性能测试

### 散弹性能测试

```javascript
// 在控制台中快速切换为拦截机
gameScene.player.changeShipType('INTERCEPTOR');
```

**测试**: 连续快速射击，观察是否有性能下降
- 预期：同屏最多25发子弹（5发x5次射击）
- 检查帧率是否稳定

### 追踪导弹AI测试

```javascript
// 切换为猎杀者
gameScene.player.changeShipType('HUNTER');
```

**测试**:
1. 让屏幕上有多个敌人
2. 观察导弹是否总是追踪最近的敌人
3. 检查导弹转向是否平滑

---

## 战机切换测试

### 运行时切换战机

在游戏运行过程中，可以打开浏览器控制台（F12），输入：

```javascript
// 切换为突击型
gameScene.player.changeShipType('ASSAULT');

// 切换为坦克型
gameScene.player.changeShipType('TANK');

// 切换为拦截机
gameScene.player.changeShipType('INTERCEPTOR');

// 切换为猎杀者
gameScene.player.changeShipType('HUNTER');

// 切换回标准型
gameScene.player.changeShipType('STANDARD');
```

**测试重点**:
- ✅ 生命值百分比保持不变
- ✅ 战机颜色立即改变
- ✅ 子弹类型立即切换
- ✅ 移动速度立即改变

---

## 视觉效果检查清单

### 子弹视觉
- [ ] 普通弹：青色三角形 + 白色核心
- [ ] 激光：红色光束 + 白色中线
- [ ] 导弹：橙色 + 尾焰 + 旋转动画
- [ ] 散弹：绿色小球
- [ ] 等离子：紫色大球 + 外层光晕

### 战机视觉
- [ ] 标准型：蓝色
- [ ] 突击型：红色
- [ ] 重型坦克：绿色
- [ ] 拦截机：橙色
- [ ] 猎杀者：紫色
- [ ] Power Up时所有战机变紫色

---

## 已知问题

### 目前限制
1. ⚠️ 暂无战机选择UI菜单（需要手动修改代码选择）
2. ⚠️ 新敌机类型配置已添加但行为未实现
3. ⚠️ 等离子炮的溅射范围未实现

### 计划中
- [ ] 添加战机选择菜单
- [ ] 实现新敌机行为
- [ ] 添加键盘快捷键切换战机（1-5数字键）
- [ ] 添加等离子炮溅射伤害

---

## 调试技巧

### 查看当前战机信息

在控制台输入：
```javascript
console.log('当前战机:', gameScene.player.shipName);
console.log('子弹类型:', gameScene.player.bulletType);
console.log('生命值:', gameScene.player.health + '/' + gameScene.player.maxHealth);
console.log('速度:', gameScene.player.speed);
console.log('射速:', gameScene.player.fireRate + 'ms');
```

### 查看所有配置

```javascript
console.log('战机配置:', GameConfig.SHIP_TYPES);
console.log('子弹配置:', GameConfig.BULLET_TYPES);
```

---

## 报告问题

如果发现bug，请记录：
1. 使用的战机类型
2. 触发问题的操作步骤
3. 浏览器控制台的错误信息
4. 截图（如果是视觉问题）

---

## 下一步

查看 `NEW_FEATURES.md` 了解所有新功能的详细说明。
