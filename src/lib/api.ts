import { z } from "zod/v4-mini";

const limitSchema = z.coerce.number().check(z.minimum(1), z.maximum(10));

export const getLimit = (url: URL, defaultLimit: number = 8) => {
    const limitParsed = limitSchema.safeParse(url.searchParams.get("limit"));
    return limitParsed.success ? limitParsed.data : defaultLimit;
};

function replacer(key: string, value: unknown) {
    if (value instanceof Map) {
        const obj: Record<string, unknown> = {};
        for (const [mapKey, mapValue] of value.entries()) {
            obj[mapKey] = mapValue;
        }
        return obj;
    } else if (value instanceof Set) {
        return Array.from(value.values());
    } else {
        return value;
    }
}

/**
 * Modified version of SvelteKit's json function that uses a custom replacer to handle Maps and Sets.
 * Create a JSON `Response` object from the supplied data.
 * @param data The value that will be serialized as JSON.
 * @param init Options such as `status` and `headers` that will be added to the response. `Content-Type: application/json` and `Content-Length` headers will be added automatically.
 */
export function json(data: unknown, init?: ResponseInit) {
    const body = JSON.stringify(data, replacer);

    const headers = new Headers(init?.headers);
    if (!headers.has("content-length")) {
        headers.set("content-length", new TextEncoder().encode(body).byteLength.toString());
    }

    if (!headers.has("content-type")) {
        headers.set("content-type", "application/json");
    }

    return new Response(body, {
        ...init,
        headers,
    });
}
