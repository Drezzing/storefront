<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { type NotificationStatus } from "$lib/checkout/notification.js";
    import { LoaderCircle, Check, X } from "lucide-svelte";

    let { data } = $props();
    let { subscriberKey, currentStatus } = $state(data);

    const isStatusNull = (status: string | null) => {
        return status === null || status === "pending";
    };

    let eventSource: EventSource | null = null;
    onMount(() => {
        if (isStatusNull(currentStatus)) {
            eventSource = new EventSource("/api/checkout/notification?subscriber_key=" + subscriberKey);
            eventSource.onmessage = (ev) => (currentStatus = ev.data as NotificationStatus);
        }
    });

    onDestroy(() => {
        if (eventSource && eventSource.OPEN) {
            eventSource.close();
        }
    });
</script>

<svelte:head>
    <title>Panier - Status</title>
    <meta property="og:title" content="Panier - Status" />
    <meta
        name="description"
        content="Consultez le statut de votre commande et suivez la validation de votre paiement."
    />
    <meta
        property="og:description"
        content="Consultez le statut de votre commande et suivez la validation de votre paiement."
    />

    <meta name="robots" content="noindex,nofollow" />
</svelte:head>

<div class="h-full max-w-[1024px] px-4 md:px-8 lg:m-auto">
    <div class="mt-[40vh] flex w-full flex-col items-center justify-center">
        {#if currentStatus === null}
            <LoaderCircle class="animate-spin" />
            <p class="mt-4 italic">Validation de votre paiement en cours</p>
        {:else if currentStatus === "success"}
            <Check class="stroke-green-500" />
            <p class="mt-4 italic">Paiement réussi</p>
        {:else if currentStatus === "failed"}
            <X class="stroke-red-500" />
            <p class="mt-4 italic">Le paiement à échoué</p>
        {/if}
    </div>
</div>
