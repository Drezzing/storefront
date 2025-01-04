import { Redis } from "ioredis";
import { REDIS_URL } from "$env/static/private";

export enum CacheTTL {
    Short = 5,
    Medium = 60,
    Long = 60 * 6,
}

const redis = new Redis(REDIS_URL);

export const redisGetObject = async <T>(key: string): Promise<T | null> => {
    const object = await redis.get(key);

    if (object != null) {
        return JSON.parse(object) as T;
    } else {
        return null;
    }
};

export const redisSetObject = async (key: string, object: object | string, minutes_ttl: CacheTTL | number) => {
    let objectStr;
    if (typeof object === "object") {
        objectStr = JSON.stringify(object);
    } else {
        objectStr = object;
    }

    redis.set(key, objectStr, "EX", minutes_ttl * 60);
};

export const redisDeleteObject = async (key: string) => {
    redis.del(key);
};
