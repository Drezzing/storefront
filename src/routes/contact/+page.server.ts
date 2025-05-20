import { fail } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";

import { sendContact } from "$lib/contact/contact";
import { zod4Mini } from "$lib/schemas/adapters.js";
import { contactFormSchema } from "$lib/schemas/contact";

export const prerender = false;

export const load = async () => {
    return {
        contactForm: await superValidate(zod4Mini(contactFormSchema), { id: "contact" }),
    };
};

export const actions = {
    default: async (event) => {
        const form = await superValidate(event, zod4Mini(contactFormSchema));
        if (!form.valid) {
            return fail(400, { form });
        }

        await sendContact(form.data);

        return { form };
    },
};
