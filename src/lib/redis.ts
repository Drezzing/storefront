import { Redis } from "ioredis";

import env from "$lib/env/private";

export enum CacheTTL {
    Short = 5,
    Medium = 60,
    Long = 60 * 6,
}

const redis = new Redis(env.get("REDIS_URL"), { lazyConnect: true });

export const redisInit = async () => {
    if (redis.status === "connect" || redis.status === "connecting" || redis.status === "ready") return;
    await redis.connect().catch((err) => {
        console.error("Redis connection error:", err);
        process.exit(1);
    });
};

class RedisConnection {
    private readonly redis: Redis = redis;
    private readonly prefix: string;

    constructor(prefix: string) {
        this.prefix = prefix;
    }

    async get<T>(key: string, parseFunc: ((arg0: string) => unknown) | null = null): Promise<T | null> {
        const object = await this.redis.get(this.prefix + ":" + key);

        if (object != null) {
            return (parseFunc ? parseFunc(object) : object) as T;
        } else {
            return null;
        }
    }

    async set(key: string, object: object | string, minutes_ttl: CacheTTL | number) {
        let objectStr;
        if (typeof object === "object") {
            objectStr = JSON.stringify(object);
        } else {
            objectStr = object;
        }

        await this.redis.set(this.prefix + ":" + key, objectStr, "EX", minutes_ttl * 60);
    }

    async delete(key: string) {
        this.redis.del(this.prefix + ":" + key);
    }
}

export const paymentNotificationCache = new RedisConnection("payment_notification");
export const thumbnailCache = new RedisConnection("thumbnail");
