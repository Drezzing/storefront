import { fail } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

import { contactFormSchema } from "$lib/contact/schema";
import { sendContact } from "$lib/contact/contact.js";

export const prerender = false;

export const load = async () => {
    return {
        contactForm: await superValidate(zod(contactFormSchema), { id: "contact" }),
    };
};

export const actions = {
    default: async (event) => {
        const form = await superValidate(event, zod(contactFormSchema));
        if (!form.valid) {
            return fail(400, { form });
        }

        await sendContact(form.data);

        return { form };
    },
};
