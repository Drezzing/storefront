import { Stripe } from "stripe";

import env from "$lib/env/private";

export const stripe = new Stripe(env.get("STRIPE_API_KEY"), { apiVersion: "2024-06-20" });
