<script>
    import { RenderScan } from "svelte-render-scan";

    import { Toaster } from "$lib/components/ui/sonner";

    import Header from "../lib/components/Header.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import "../app.css";

    import { page } from "$app/state";
    import { dev } from "$app/environment";
</script>

<svelte:head>
    <meta property="og:url" content={page.url.href} />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="DreZZing" />
    <meta property="og:locale" content="fr_FR" />
</svelte:head>

{#if dev}
    <RenderScan />
{/if}

<Header></Header>

<Toaster richColors closeButton duration={2500} theme="light" />

<main class="min-h-screen">
    <slot></slot>
</main>

<Footer></Footer>
