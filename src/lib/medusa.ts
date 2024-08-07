import Medusa from "@medusajs/medusa-js";
import { MEDUSA_PKEY } from "$env/static/private"

export const medusa = new Medusa({
    baseUrl: "http://localhost:9000",
    maxRetries: 3,
    publishableApiKey: MEDUSA_PKEY
});