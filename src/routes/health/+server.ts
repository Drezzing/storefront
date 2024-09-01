import { MEDUSA_BACKEND_URL } from "$env/static/private";

export const GET = async ({ fetch }) => {
    const response = await fetch(MEDUSA_BACKEND_URL + "/health");

    if (response.ok) {
        return new Response("OK", { status: 200 });
    } else {
        return new Response("DEAD", { status: 500 });
    }
};
