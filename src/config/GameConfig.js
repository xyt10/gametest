/**
 * 游戏配置文件
 * 定义所有游戏常量和配置参数
 */

const GameConfig = {
    // 画布尺寸
    CANVAS_WIDTH: 480,
    CANVAS_HEIGHT: 800,

    // 玩家战机配置
    PLAYER: {
        SPEED: 5,                    // 移动速度
        MAX_HEALTH: 100,             // 最大生命值
        FIRE_RATE: 200,              // 射击间隔(毫秒)
        START_X: 240,                // 初始X坐标
        START_Y: 650,                // 初始Y坐标
        WIDTH: 60,                   // 战机宽度
        HEIGHT: 80,                  // 战机高度
        BASE_DAMAGE: 10,             // 基础伤害
    },

    // 战机类型配置
    SHIP_TYPES: {
        STANDARD: {
            NAME: '标准型',
            DESC: '平衡的攻击与防御',
            SPEED: 5,
            MAX_HEALTH: 100,
            FIRE_RATE: 200,
            DAMAGE_MULTIPLIER: 1.0,
            WIDTH: 60,
            HEIGHT: 80,
            COLOR_PRIMARY: '#00aaff',
            COLOR_SECONDARY: '#0066cc',
            BULLET_TYPE: 'NORMAL',
        },
        ASSAULT: {
            NAME: '突击型',
            DESC: '高火力高射速',
            SPEED: 4,
            MAX_HEALTH: 80,
            FIRE_RATE: 120,          // 更快射速
            DAMAGE_MULTIPLIER: 1.5,
            WIDTH: 55,
            HEIGHT: 75,
            COLOR_PRIMARY: '#ff4444',
            COLOR_SECONDARY: '#cc0000',
            BULLET_TYPE: 'LASER',
        },
        TANK: {
            NAME: '重型坦克',
            DESC: '超高血量低速度',
            SPEED: 3,
            MAX_HEALTH: 200,         // 双倍血量
            FIRE_RATE: 300,          // 较慢射速
            DAMAGE_MULTIPLIER: 1.2,
            WIDTH: 70,
            HEIGHT: 85,
            COLOR_PRIMARY: '#44ff44',
            COLOR_SECONDARY: '#00cc00',
            BULLET_TYPE: 'PLASMA',
        },
        INTERCEPTOR: {
            NAME: '拦截机',
            DESC: '极速移动散弹攻击',
            SPEED: 8,                // 超高速度
            MAX_HEALTH: 60,
            FIRE_RATE: 250,
            DAMAGE_MULTIPLIER: 0.8,
            WIDTH: 50,
            HEIGHT: 70,
            COLOR_PRIMARY: '#ffaa00',
            COLOR_SECONDARY: '#ff6600',
            BULLET_TYPE: 'SPREAD',
        },
        HUNTER: {
            NAME: '猎杀者',
            DESC: '追踪导弹专精',
            SPEED: 5,
            MAX_HEALTH: 90,
            FIRE_RATE: 400,          // 慢射速但强力
            DAMAGE_MULTIPLIER: 1.3,
            WIDTH: 58,
            HEIGHT: 78,
            COLOR_PRIMARY: '#ff00ff',
            COLOR_SECONDARY: '#cc00cc',
            BULLET_TYPE: 'MISSILE',
        }
    },

    // 子弹配置
    BULLET: {
        SPEED: 8,                    // 子弹速度
        WIDTH: 8,
        HEIGHT: 20,
        DAMAGE: 10,
    },

    // 子弹类型配置
    BULLET_TYPES: {
        NORMAL: {
            NAME: '普通弹',
            SPEED: 8,
            DAMAGE: 10,
            WIDTH: 8,
            HEIGHT: 20,
            PIERCE: false,           // 是否穿透
            HOMING: false,           // 是否追踪
            COLOR: '#00ffff',
        },
        LASER: {
            NAME: '激光',
            SPEED: 12,
            DAMAGE: 15,
            WIDTH: 6,
            HEIGHT: 30,
            PIERCE: true,            // 穿透敌人
            HOMING: false,
            COLOR: '#ff0000',
            PIERCE_COUNT: 3,         // 最大穿透次数
        },
        MISSILE: {
            NAME: '追踪导弹',
            SPEED: 5,
            DAMAGE: 25,
            WIDTH: 10,
            HEIGHT: 15,
            PIERCE: false,
            HOMING: true,            // 追踪最近的敌人
            HOMING_STRENGTH: 0.15,   // 追踪力度
            COLOR: '#ffaa00',
        },
        SPREAD: {
            NAME: '散弹',
            SPEED: 7,
            DAMAGE: 8,
            WIDTH: 6,
            HEIGHT: 12,
            PIERCE: false,
            HOMING: false,
            COLOR: '#00ff00',
            SPREAD_COUNT: 5,         // 散弹数量
            SPREAD_ANGLE: Math.PI / 6, // 散射角度
        },
        PLASMA: {
            NAME: '等离子炮',
            SPEED: 6,
            DAMAGE: 30,
            WIDTH: 15,
            HEIGHT: 15,
            PIERCE: true,
            HOMING: false,
            COLOR: '#ff00ff',
            PIERCE_COUNT: 999,       // 无限穿透
            SPLASH_RADIUS: 40,       // 溅射范围
        }
    },

    // 敌机类型配置
    ENEMY_TYPES: {
        SMALL: {
            HEALTH: 20,
            SPEED: 2,
            SCORE: 10,
            WIDTH: 40,
            HEIGHT: 40,
            FIRE_RATE: 2000,         // 射击间隔
            DAMAGE: 10,
            BEHAVIOR: 'normal',
        },
        MEDIUM: {
            HEALTH: 50,
            SPEED: 1.5,
            SCORE: 30,
            WIDTH: 60,
            HEIGHT: 60,
            FIRE_RATE: 1500,
            DAMAGE: 20,
            BEHAVIOR: 'normal',
        },
        LARGE: {
            HEALTH: 100,
            SPEED: 1,
            SCORE: 50,
            WIDTH: 80,
            HEIGHT: 80,
            FIRE_RATE: 1000,
            DAMAGE: 30,
            BEHAVIOR: 'normal',
        },
        // 新增敌机类型
        FAST: {
            HEALTH: 15,
            SPEED: 4,                // 双倍速度
            SCORE: 20,
            WIDTH: 35,
            HEIGHT: 35,
            FIRE_RATE: 2500,
            DAMAGE: 8,
            BEHAVIOR: 'fast',        // 快速之字形
        },
        SNIPER: {
            HEALTH: 30,
            SPEED: 0.8,
            SCORE: 40,
            WIDTH: 45,
            HEIGHT: 45,
            FIRE_RATE: 3000,
            DAMAGE: 35,              // 高伤害
            BEHAVIOR: 'sniper',      // 远程狙击
        },
        TANK: {
            HEALTH: 200,             // 超高血量
            SPEED: 0.5,
            SCORE: 80,
            WIDTH: 90,
            HEIGHT: 90,
            FIRE_RATE: 2000,
            DAMAGE: 25,
            BEHAVIOR: 'tank',        // 缓慢直行
        },
        KAMIKAZE: {
            HEALTH: 25,
            SPEED: 3,
            SCORE: 35,
            WIDTH: 40,
            HEIGHT: 40,
            FIRE_RATE: 999999,       // 不射击
            DAMAGE: 50,              // 高撞击伤害
            BEHAVIOR: 'kamikaze',    // 冲向玩家
        },
        ELITE: {
            HEALTH: 150,
            SPEED: 2,
            SCORE: 100,
            WIDTH: 70,
            HEIGHT: 70,
            FIRE_RATE: 800,
            DAMAGE: 40,
            BEHAVIOR: 'elite',       // 复杂移动+高射速
        }
    },

    // Boss配置
    BOSS: {
        HEALTH: 1000,
        SPEED: 2,
        SCORE: 500,
        WIDTH: 150,
        HEIGHT: 150,
        FIRE_RATE: 800,
        DAMAGE: 50,
    },

    // 敌机生成配置
    SPAWN: {
        INITIAL_INTERVAL: 2000,      // 初始生成间隔(毫秒)
        MIN_INTERVAL: 500,           // 最小生成间隔
        DIFFICULTY_INCREASE: 0.95,   // 难度增加系数(间隔缩短)
    },

    // 道具类型
    ITEM_TYPES: {
        HEALTH: {
            VALUE: 30,               // 恢复生命值
            COLOR: '#00ff00',        // 绿色
            DROP_RATE: 0.15,         // 掉落概率
        },
        POWER_UP: {
            DURATION: 5000,          // 持续时间(毫秒)
            MULTIPLIER: 2,           // 伤害倍数
            COLOR: '#ff0000',        // 红色
            DROP_RATE: 0.1,
        },
        SHIELD: {
            DURATION: 8000,
            COLOR: '#00ffff',        // 青色
            DROP_RATE: 0.08,
        },
        BOMB: {
            RADIUS: 300,             // 爆炸半径
            DAMAGE: 200,             // 伤害
            COLOR: '#ffff00',        // 黄色
            DROP_RATE: 0.05,
        },
        WINGMAN: {
            COLOR: '#ff00ff',        // 紫色
            DROP_RATE: 0.06,         // 掉落概率
            WINGMAN_TYPE: 'STANDARD', // 默认僚机类型
        }
    },

    // 僚机类型配置
    WINGMAN_TYPES: {
        STANDARD: {
            NAME: '标准僚机',
            HEALTH: 50,
            DAMAGE: 8,
            FIRE_RATE: 300,          // 射击间隔
            FOLLOW_SPEED: 6,         // 跟随速度
            WIDTH: 30,
            HEIGHT: 35,
            COLOR: '#00aaff',
            BULLET_TYPE: 'NORMAL',
            AUTO_AIM: true,          // 自动瞄准
        },
        ASSAULT: {
            NAME: '突击僚机',
            HEALTH: 40,
            DAMAGE: 12,
            FIRE_RATE: 200,          // 高射速
            FOLLOW_SPEED: 7,
            WIDTH: 28,
            HEIGHT: 32,
            COLOR: '#ff4444',
            BULLET_TYPE: 'LASER',
            AUTO_AIM: true,
        },
        DEFENDER: {
            NAME: '防御僚机',
            HEALTH: 80,              // 高血量
            DAMAGE: 6,
            FIRE_RATE: 400,
            FOLLOW_SPEED: 5,
            WIDTH: 35,
            HEIGHT: 40,
            COLOR: '#44ff44',
            BULLET_TYPE: 'NORMAL',
            AUTO_AIM: true,
        },
        SNIPER: {
            NAME: '狙击僚机',
            HEALTH: 30,
            DAMAGE: 20,              // 高伤害
            FIRE_RATE: 600,          // 低射速
            FOLLOW_SPEED: 5,
            WIDTH: 25,
            HEIGHT: 30,
            COLOR: '#ffaa00',
            BULLET_TYPE: 'NORMAL',
            AUTO_AIM: true,
        }
    },

    // 升级系统
    UPGRADE: {
        EXP_PER_LEVEL: 100,          // 每级所需经验
        LEVEL_MULTIPLIER: 1.5,       // 升级经验倍数
        MAX_LEVEL: 10,               // 最大等级
        STATS_INCREASE: {
            DAMAGE: 5,               // 每级伤害增加
            HEALTH: 20,              // 每级生命值增加
            FIRE_RATE: -20,          // 每级射速提升(减少间隔)
        }
    },

    // 关卡配置
    STAGES: [
        {
            id: 1,
            name: '第一关：启程',
            duration: 60000,         // 关卡时长(毫秒)
            enemySpawnRate: 2000,
            bossAppears: true,
        },
        {
            id: 2,
            name: '第二关：激战',
            duration: 90000,
            enemySpawnRate: 1500,
            bossAppears: true,
        },
        {
            id: 3,
            name: '第三关：危机',
            duration: 120000,
            enemySpawnRate: 1000,
            bossAppears: true,
        }
    ],

    // 颜色配置(临时使用,后续替换为图片)
    COLORS: {
        PLAYER: '#00aaff',
        ENEMY_SMALL: '#ff4444',
        ENEMY_MEDIUM: '#ff8800',
        ENEMY_LARGE: '#ff00ff',
        BOSS: '#aa00ff',
        BULLET_PLAYER: '#00ffff',
        BULLET_ENEMY: '#ffff00',
        BACKGROUND: '#000033',
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameConfig;
}
