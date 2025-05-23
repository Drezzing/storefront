import env from "$lib/env/private";
import { handleError } from "$lib/error.js";
import { type ContactFromType } from "$lib/schemas/contact";

const escape_md = (input: string) => {
    return input.replace(/([`\-#*_~|])/g, "\\$1");
};

export const sendContact = async (data: ContactFromType) => {
    const { email, subject, content } = data;
    const discordMessage = {
        content: `**Nouvelle soumission de formulaire :**\n**Email :** \`${escape_md(email)}\`\n**Objet :** \`${escape_md(subject)}\`\n**Message :**\n\`\`\`${escape_md(content)}\`\`\``,
    };

    const discordResponse = await fetch(env.get("DISCORD_WEBHOOK"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(discordMessage),
    }).catch(() => {
        return handleError(500, "CONTACT_POST.WEBHOOK_POST_FAILED");
    });

    if (!discordResponse.ok) {
        return handleError(500, "CONTACT_POST.INVALID_WEBHOOK_POST", await discordResponse.json());
    }
};
