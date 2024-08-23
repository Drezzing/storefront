import { error } from "@sveltejs/kit";

export const load = async ({ url, cookies }) => {
    const redirectStatus = url.searchParams.get("redirect_status") as "succeeded" | "pending" | "failed" | null;
    if (!redirectStatus) error(400);

    if (redirectStatus === "succeeded") {
        cookies.delete("cart_id", { path: "/" });
    }

    return {
        status: redirectStatus,
    };
};
