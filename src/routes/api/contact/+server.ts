import { json } from "@sveltejs/kit";

import { env } from "$env/dynamic/private";
import { contactObject } from "$lib/contact.js";
import { handleError } from "$lib/error.js";

const escape_md = (input: string) => {
    return input.replace(/([`\-#*_~|])/g, "\\$1");
};

export const POST = async ({ request, fetch }) => {
    const reqJson = await request.json().catch(async () => {
        return handleError(400, "CONTACT_POST.INVALID_BODY", { body: await request.text() });
    });

    const contactPostValid = contactObject.safeParse(reqJson);
    if (!contactPostValid.success) {
        return handleError(422, "CONTACT_POST.INVALID_DATA", { data: reqJson });
    }

    const { email, subject, content } = contactPostValid.data;
    const discordMessage = {
        content: `**Nouvelle soumission de formulaire :**\n**Email :** \`${escape_md(email)}\`\n**Objet :** \`${escape_md(subject)}\`\n**Message :**\n\`\`\`${escape_md(content)}\`\`\``,
    };

    const discordResponse = await fetch(env.DISCORD_WEBHOOK, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(discordMessage),
    }).catch(() => {
        return handleError(500, "CONTACT_POST.WEBHOOK_POST_FAILED");
    });

    if (discordResponse.ok) {
        // sending empty json since the fetching functions expect json response
        // TODO : remove this requirement
        return json({});
    } else {
        return handleError(500, "CONTACT_POST.INVALID_WEBHOOK_POST", await discordResponse.json());
    }
};
