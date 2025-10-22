/**
 * 对象池 - 用于优化性能,复用游戏对象
 * 避免频繁创建和销毁对象造成的性能开销
 */

class ObjectPool {
    constructor(createFunc, resetFunc, initialSize = 20) {
        this.createFunc = createFunc;   // 创建对象的函数
        this.resetFunc = resetFunc;     // 重置对象的函数
        this.pool = [];                 // 对象池数组
        this.activeObjects = [];        // 活动对象数组

        // 预创建对象
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFunc());
        }
    }

    /**
     * 从对象池获取对象
     */
    get() {
        let obj;
        if (this.pool.length > 0) {
            obj = this.pool.pop();
        } else {
            obj = this.createFunc();
        }
        this.activeObjects.push(obj);
        return obj;
    }

    /**
     * 归还对象到对象池
     */
    return(obj) {
        const index = this.activeObjects.indexOf(obj);
        if (index > -1) {
            this.activeObjects.splice(index, 1);
            this.resetFunc(obj);
            this.pool.push(obj);
        }
    }

    /**
     * 归还所有活动对象
     */
    returnAll() {
        while (this.activeObjects.length > 0) {
            const obj = this.activeObjects.pop();
            this.resetFunc(obj);
            this.pool.push(obj);
        }
    }

    /**
     * 获取活动对象数量
     */
    getActiveCount() {
        return this.activeObjects.length;
    }

    /**
     * 获取池中可用对象数量
     */
    getAvailableCount() {
        return this.pool.length;
    }

    /**
     * 清空对象池
     */
    clear() {
        this.pool = [];
        this.activeObjects = [];
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ObjectPool;
}
