import { env } from "$env/dynamic/private";

export const prerender = false;

export const GET = async ({ fetch }) => {
    const response = await fetch(env.MEDUSA_BACKEND_URL + "/health");

    if (response.ok) {
        return new Response("OK", { status: 200 });
    } else {
        return new Response("DEAD", { status: 500 });
    }
};
