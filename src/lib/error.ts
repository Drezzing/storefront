import { error } from "@sveltejs/kit";
import { logger } from "$lib/logger";
import { dev } from "$app/environment";
import { toast } from "svelte-sonner";

type SuccessResponse<T> = {
    success: true;
    response: Response;
    data: T;
};

type ErrorResponse = {
    success: false;
    httpResponse: Response;
    errorID: string;
};

export const handleError = (status: number, message: string, obj?: Record<string, unknown>) => {
    const logMessage = `${status} - ${message}`;

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

    if (status >= 400 && status <= 499) {
        logger.warn(errObj, logMessage);
    } else if (status >= 500 && status <= 599) {
        logger.error(errObj, logMessage);
    } else {
        throw new Error("invalid status");
    }

    error(status, errID);
};

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
        return { success: false, httpResponse: response, errorID: reqJson.message as string };
    }
};

export const displayClientError = async (response: ErrorResponse, message?: string) => {
    if (response.httpResponse.status === 429) {
        const retryAfter = response.httpResponse.headers.get("Retry-after");
        toast.error("Vous effectuez trop de requêtes.", {
            description: retryAfter ? `Veuillez réessayer dans ${retryAfter} secondes.` : "",
        });
    } else {
        toast.error(message ?? "Une erreur est survenue.", { description: `Code erreur : ${response.errorID}` });
    }
};
