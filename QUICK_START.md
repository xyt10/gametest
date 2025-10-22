# 快速参考指南 - 雷霆战机

## 🚀 5分钟快速上手

### 1. 启动游戏
```bash
cd /home/xyt/gametest
./start.sh
```

### 2. 打开浏览器
访问: `http://localhost:8080`

### 3. 开始游戏
点击屏幕开始游戏

## 🎮 操作速查

| 操作 | 键盘 | 鼠标/触摸 |
|------|------|-----------|
| 移动 | 方向键/WASD | 移动鼠标/手指 |
| 射击 | 空格键 | 点击/按住 |
| 暂停 | ESC | - |

## 📊 游戏数据速查

### 玩家战机
- 初始生命: 100
- 初始伤害: 10
- 射击间隔: 200ms
- 移动速度: 5

### 敌机类型
| 类型 | 生命 | 分数 | 掉落率 |
|------|------|------|--------|
| 小型 | 20 | 10 | 低 |
| 中型 | 50 | 30 | 中 |
| 大型 | 100 | 50 | 高 |
| Boss | 1000 | 500 | 必掉 |

### 道具效果
| 道具 | 效果 | 持续时间 |
|------|------|----------|
| HP | +30生命 | 立即 |
| PWR | 伤害x2 | 5秒 |
| SLD | 免疫伤害 | 8秒 |
| BOMB | 清屏 | 立即 |

## 🔧 常用配置位置

### 调整难度
文件: `src/config/GameConfig.js`

```javascript
// 玩家属性
PLAYER: {
    MAX_HEALTH: 100,    // 增加生命值
    BASE_DAMAGE: 10,    // 增加伤害
    FIRE_RATE: 200,     // 减少射速(ms)
}

// 敌机生成
SPAWN: {
    INITIAL_INTERVAL: 2000,  // 增加间隔=降低难度
}
```

### 修改道具掉落率
```javascript
ITEM_TYPES: {
    HEALTH: {
        DROP_RATE: 0.15,    // 15%掉落
    }
}
```

## 🐛 调试技巧

### 打开浏览器控制台
- Chrome/Edge: `F12` 或 `Ctrl+Shift+I`
- Firefox: `F12`
- Safari: `Option+Cmd+I`

### 常用调试命令
```javascript
// 查看游戏状态
console.log(gameScene);

// 生成Boss
gameScene.enemySpawner.spawnBoss();

// 给玩家加经验
gameScene.player.addExp(500);

// 给玩家加生命
gameScene.player.heal(50);

// 激活护盾
gameScene.player.activateShield(10000);
```

## 📁 项目结构速查

```
gametest/
├── index.html              # 🌐 入口页面
├── start.sh               # ▶️  启动脚本
├── README.md              # 📖 完整文档
├── PROJECT_SUMMARY.md     # 📝 项目总结
└── src/
    ├── Main.js           # 🎯 主程序
    ├── config/
    │   └── GameConfig.js # ⚙️  配置文件(重要!)
    ├── entities/         # 🎮 游戏实体
    │   ├── Player.js
    │   ├── Enemy.js
    │   ├── Boss.js
    │   ├── Bullet.js
    │   └── Item.js
    ├── systems/          # 🔧 游戏系统
    │   ├── EnemySpawner.js
    │   ├── CollisionManager.js
    │   └── UpgradeSystem.js
    ├── ui/              # 🖼️  用户界面
    │   ├── GameHUD.js
    │   └── MainMenu.js
    └── scenes/          # 🎬 游戏场景
        └── GameScene.js
```

## ⚡ 性能优化建议

### 降低性能消耗
1. 减少敌机生成频率
2. 降低子弹密度
3. 简化特效渲染

### 提升性能表现
1. 使用Chrome浏览器
2. 关闭开发者工具
3. 全屏运行游戏

## 🎯 游戏技巧

1. **躲避优先**: 生存最重要
2. **边打边躲**: 不要停止移动
3. **道具优先**: 看到就拾取
4. **升级速度**: 快速升到3级
5. **Boss模式**:
   - 环形: 站在间隙
   - 追踪: 快速移动
   - 扇形: 侧向躲避

## 🔥 常见问题

### Q: 游戏不显示?
A: 检查控制台错误,确保所有JS文件加载成功

### Q: 操作无响应?
A: 点击游戏画面获取焦点

### Q: 帧率太低?
A: 关闭其他标签页,使用Chrome浏览器

### Q: 找不到Boss?
A: 控制台输入: `gameScene.enemySpawner.spawnBoss()`

### Q: 想要无敌?
A: 控制台输入: `gameScene.player.shields = true; gameScene.player.shieldEndTime = Infinity;`

## 📞 寻求帮助

1. 查看 `README.md` 完整文档
2. 查看 `PROJECT_SUMMARY.md` 技术细节
3. 检查浏览器控制台错误信息
4. 阅读源代码注释

## 🎨 自定义建议

### 简单修改(5-10分钟)
- 修改颜色: `GameConfig.COLORS`
- 调整速度: `PLAYER.SPEED`, `ENEMY_TYPES.*.SPEED`
- 改变伤害: `PLAYER.BASE_DAMAGE`, `ENEMY_TYPES.*.DAMAGE`

### 中等修改(30-60分钟)
- 添加新敌机类型
- 实现新道具
- 添加新攻击模式

### 高级修改(2-4小时)
- 实现多关卡
- 添加音效系统
- 实现粒子效果

---

**准备好了吗? 开始游戏吧!** 🚀🎮
