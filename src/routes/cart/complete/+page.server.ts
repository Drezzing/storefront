import { handleError } from "$lib/error.js";

export const csr = true;

export const load = async ({ url, cookies }) => {
    const redirectStatus = url.searchParams.get("redirect_status") as "succeeded" | "pending" | "failed" | null;
    if (!redirectStatus) {
        return handleError(400, "CART_COMPLETE_LOAD.MISSING_PARAM");
    }

    if (redirectStatus === "succeeded") {
        cookies.delete("panier", { path: "/" });
    }

    return {
        status: redirectStatus,
    };
};
