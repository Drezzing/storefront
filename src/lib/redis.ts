import { Redis } from "ioredis";
import { REDIS_URL } from "$env/static/private";

export enum CacheTTL {
    Short = 5,
    Medium = 60,
    Long = 60 * 6,
}

const redis = new Redis(REDIS_URL);

class RedisConnection {
    private readonly redis: Redis = redis;
    private readonly prefix: string;

    constructor(prefix: string) {
        this.prefix = prefix;
    }

    async get<T>(key: string): Promise<T | null> {
        const object = await this.redis.get(this.prefix + ":" + key);

        if (object != null) {
            return JSON.parse(object) as T;
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
