import Medusa from "@medusajs/medusa-js";

export const medusa = new Medusa({
    baseUrl: "http://localhost:9000",
    maxRetries: 3,
    publishableApiKey: "pk_01J4CB4JD25KFVKK7Z06EQE0G3"
});