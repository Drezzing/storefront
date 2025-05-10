import env from "$lib/env/private";

export const prerender = false;

export const GET = async ({ fetch }) => {
    const response = await fetch(env.get("MEDUSA_BACKEND_URL") + "/health");

    if (response.ok) {
        return new Response("OK", { status: 200 });
    } else {
        return new Response("DEAD", { status: 500 });
    }
};
