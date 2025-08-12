import { error, isHttpError } from "@sveltejs/kit";
import { toast } from "svelte-sonner";

import { dev } from "$app/environment";
import { logger } from "$lib/logger";

type SuccessResponse<T> = {
    success: true;
    response: Response;
    data: T;
};

type ErrorResponse = {
    success: false;
    response: Response;
    errorID: string;
    errorMessage?: string;
};

export const handleError = (
    status: number,
    message: string | { message: string; userMessage: string },
    obj?: Record<string, unknown>,
) => {
    let errID: string;
    if (dev) {
        const byteArray = new Uint8Array(16);
        const hexArray = new Array(16);
        crypto.getRandomValues(byteArray).forEach((x, i) => (hexArray[i] = x.toString(16).padStart(2, "0")));
        errID = hexArray.join("");
    } else {
        errID = crypto.randomUUID();
    }

    const errObj = {
        errID,
        ...obj,
    };

    let logMessage: string;
    if (typeof message === "string") {
        logMessage = `${status} - ${message}`;
    } else {
        logMessage = `${status} - ${message.message}`;
    }
    if (status >= 400 && status <= 499) {
        logger.warn(errObj, logMessage);
    } else if (status >= 500 && status <= 599) {
        logger.error(errObj, logMessage);
    } else {
        throw new Error("invalid status");
    }

    if (typeof message === "string") {
        error(status, { message: errID });
    } else {
        error(status, { message: errID, userMessage: message.userMessage });
    }
};

export const displayRemoteFunctionError = (e: unknown) => {
    if (isHttpError(e)) {
        toast.error(e.body.userMessage ?? "Une erreur est survenue.", {
            description: `Code erreur : ${e.body.message}`,
            action: {
                label: "Copier",
                onClick: () => {
                    navigator.clipboard.writeText(e.body.message);
                },
            },
        });
    } else {
        throw e;
    }
};

/**
 * @deprecated Use remote functions instead
 */
export const clientRequest = async <T>(
    requester: string,
    url: string,
    init?: RequestInit,
): Promise<SuccessResponse<T> | ErrorResponse> => {
    const response = await fetch(url, init).catch((err) => {
        return handleError(500, requester + ".FETCH_FAILED", err);
    });

    const reqJson = await response.json().catch((err) => {
        return handleError(500, requester + ".INVALID_RESPONSE_DATA", err);
    });

    if (response.ok) {
        return { success: true, response: response, data: reqJson as T };
    } else {
        return {
            success: false,
            response: response,
            errorID: reqJson.message as string,
            errorMessage: reqJson.userMessage as string | undefined,
        };
    }
};

/**
 * @deprecated Use remote functions with displayRemoteFunctionError instead
 */
export const displayClientError = async (response: ErrorResponse, message?: string) => {
    if (response.response.status === 429) {
        const retryAfter = response.response.headers.get("Retry-after");
        toast.error("Vous effectuez trop de requêtes.", {
            description: retryAfter ? `Veuillez réessayer dans ${retryAfter} secondes.` : undefined,
        });
    } else {
        toast.error(message ?? response.errorMessage ?? "Une erreur est survenue.", {
            description: `Code erreur : ${response.errorID}`,
        });
    }
};
