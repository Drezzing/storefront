import { handleError } from "$lib/error.js";
import { z } from "zod";

const searchParam = z.union([z.literal("succeeded"), z.literal("pending"), z.literal("failed")]);

export const csr = true;

export const load = async ({ url, cookies }) => {
    const redirectStatus = url.searchParams.get("redirect_status");
    if (!redirectStatus) {
        return handleError(400, "CART_COMPLETE_LOAD.MISSING_PARAM");
    }

    const redirectStatusValid = searchParam.safeParse(redirectStatus);
    if (!redirectStatusValid.success) {
        return handleError(400, "CART_COMPLETE_LOAD.INVALID_PARAM");
    }

    if (redirectStatus === "succeeded") {
        cookies.delete("panier", { path: "/" });
    }

    return {
        status: redirectStatus,
    };
};
