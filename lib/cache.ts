// 简单的内存缓存实现
// 适用于单实例部署，生产环境建议使用Redis

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class SimpleCache {
  private cache: Map<string, CacheItem<any>>;
  private defaultTTL: number;

  constructor(defaultTTL: number = 60000) {
    this.cache = new Map();
    this.defaultTTL = defaultTTL; // 默认1分钟
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // 检查是否过期
    if (Date.now() - item.timestamp > this.defaultTTL) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });

    // 设置过期清理
    if (ttl || this.defaultTTL) {
      setTimeout(() => {
        this.cache.delete(key);
      }, ttl || this.defaultTTL);
    }
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // 批量删除（支持通配符）
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern.replace('*', '.*'));
    const keysToDelete: string[] = [];

    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // 获取缓存统计
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// 导出单例
export const cache = new SimpleCache(60000); // 1分钟TTL

// 缓存键生成器
export const CacheKeys = {
  user: (userId: string) => `user:${userId}`,
  group: (groupId: string) => `group:${groupId}`,
  groupMembers: (groupId: string) => `group:${groupId}:members`,
  meeting: (meetingId: string) => `meeting:${meetingId}`,
  meetings: (groupId: string) => `meetings:group:${groupId}`,
  report: (reportId: string) => `report:${reportId}`,
  reports: (userId: string) => `reports:user:${userId}`,
  notifications: (userId: string) => `notifications:${userId}`,
};

// 缓存失效辅助函数
export const invalidateCache = {
  user: (userId: string) => {
    cache.delete(CacheKeys.user(userId));
  },

  group: (groupId: string) => {
    cache.delete(CacheKeys.group(groupId));
    cache.delete(CacheKeys.groupMembers(groupId));
    cache.deletePattern(`meetings:group:${groupId}*`);
  },

  meeting: (meetingId: string, groupId: string) => {
    cache.delete(CacheKeys.meeting(meetingId));
    cache.delete(CacheKeys.meetings(groupId));
  },

  report: (reportId: string, userId: string) => {
    cache.delete(CacheKeys.report(reportId));
    cache.delete(CacheKeys.reports(userId));
  },

  notifications: (userId: string) => {
    cache.delete(CacheKeys.notifications(userId));
  },
};
