<script lang="ts">
    import * as Select from "$lib/components/ui/select";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Textarea } from "$lib/components/ui/textarea";

    import { Send } from "lucide-svelte";
    import { clientRequest, displayClientError } from "$lib/error";

    import { contactObject } from "$lib/contact";
    import { toast } from "svelte-sonner";

    let email = $state("");
    let subject = $state("");
    let content = $state("");

    const fieldMap: Record<string, string> = {
        email: "Adresse mail",
        subject: "Objet",
        content: "Message",
    };

    const sendMessage = async () => {
        const contactObjectValid = contactObject.safeParse({ email, subject, content });

        if (!contactObjectValid.success) {
            const errorFields = contactObjectValid.error.errors.map((err) => fieldMap[err.path[0]]);
            return toast.error("Champ(s) invalide(s) : " + errorFields.join(", "));
        }

        const response = await clientRequest("CONTACT_POST", "/api/contact", {
            method: "POST",
            body: JSON.stringify(contactObjectValid.data),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.success) {
            displayClientError(response);
        } else {
            toast.success("Votre message a bien été transmis.");
            email = "";
            subject = "";
            content = "";
        }
    };
</script>

<svelte:head>
    <title>Contact</title>
    <meta name="description" content="Page de contact" />
</svelte:head>

<div class="max-w-[1024px] space-y-4 px-4 md:px-8 lg:m-auto">
    <h1 class="text-center text-3xl font-bold">Contact</h1>

    <section class="space-y-4">
        <div class="space-y-1">
            <Label for="email">Adresse mail</Label>
            <Input
                type="email"
                id="email"
                placeholder="nom.prenom@mail.fr"
                bind:value={email}
                class="ring-offset-0 focus-visible:ring-1 focus-visible:ring-d-darkgray focus-visible:ring-offset-0"
            />
        </div>

        <div class="space-y-1">
            <Label for="object">Objet</Label>
            <Select.Root
                onSelectedChange={(v) => {
                    if (v && v.value) subject = v.value as string;
                }}
                selected={{ value: subject }}
            >
                <Select.Trigger
                    id="object"
                    class="ring-offset-0 focus-visible:ring-1 focus-visible:ring-d-darkgray focus-visible:ring-offset-0"
                >
                    <Select.Value placeholder="Objet" />
                </Select.Trigger>
                <Select.Content>
                    <Select.Item value="Livraison" label="Livraison">Livraison</Select.Item>
                    <Select.Item value="Paiement" label="Paiement">Paiement</Select.Item>
                    <Select.Item value="Autre" label="Autre">Autre</Select.Item>
                </Select.Content>
            </Select.Root>
        </div>

        <div class="space-y-1">
            <Label for="message">Message</Label>
            <Textarea
                id="content"
                bind:value={content as string | null}
                cols={30}
                rows={10}
                placeholder="Rédigez votre message"
                class="ring-offset-0 focus-visible:ring-1 focus-visible:ring-d-darkgray focus-visible:ring-offset-0"
            />
        </div>
    </section>

    <div class="flex justify-center">
        <Button variant="drezzing" onclick={sendMessage} class="flex gap-4 px-8 py-2">
            <Send class="mr-2" /> Envoyer
        </Button>
    </div>
</div>
