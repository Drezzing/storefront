import env from "$lib/env/private";

export const prerender = false;

export const GET = async ({ fetch, url }) => {
    // In some scenarios (like docker healthcheck) we only want to check if the sveltekit server is good
    const partial = url.searchParams.get("partial");
    if (partial === "true") {
        return new Response("OK", { status: 200 });
    }

    let backendRunning: boolean;
    try {
        const response = await fetch(env.get("MEDUSA_BACKEND_URL") + "/health");
        backendRunning = response.ok;
    } catch {
        backendRunning = false;
    }

    if (backendRunning) {
        return new Response("OK", { status: 200 });
    } else {
        return new Response("DEAD", { status: 500 });
    }
};
