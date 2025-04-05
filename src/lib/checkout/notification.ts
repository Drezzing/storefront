import { env } from "$env/dynamic/private";
import { paymentNotificationCache } from "$lib/redis";

export type NotificationStatus = "success" | "failed";

export class PaymentNotification {
    private readonly controllerMap: Map<string, ReadableStreamDefaultController | null>;

    constructor() {
        this.controllerMap = new Map();
    }

    static async generateNotificationToken(clientSecret: string) {
        const message = new TextEncoder().encode(clientSecret + env.CHECKOUT_NOTIFICATION_KEY); // server-only key to prevent reproductability from client
        const hashBuffer = await crypto.subtle.digest("SHA-512", message);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
        return hashHex;
    }

    setController(key: string, controller: ReadableStreamDefaultController) {
        const data = this.controllerMap.get(key);
        if (!data) {
            this.controllerMap.set(key, controller);
        } else {
            this.controllerMap.set(key, controller);
        }
    }

    getController(key: string) {
        const controller = this.controllerMap.get(key);
        if (!controller) return null;

        return controller;
    }

    async setStatus(key: string, status: NotificationStatus) {
        const controller = this.controllerMap.get(key);

        await paymentNotificationCache.set(key, status, 5);

        if (controller) {
            try {
                controller.enqueue(`message: payment\ndata: ${status}\n\n`);
            } catch {
                // client is disconnected
                return;
            }
        }
    }

    async getStatus(key: string) {
        const status = await paymentNotificationCache.get<NotificationStatus>(key);
        return status;
    }

    async deleteController(key: string) {
        const data = this.controllerMap.get(key);
        if (data) {
            this.controllerMap.delete(key);
        }
    }
}

export const paymentNotification = new PaymentNotification();
