<script>
    import { Toaster } from "$lib/components/ui/sonner";

    import Header from "../lib/components/Header.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import "../app.css";

    import { page } from "$app/state";
</script>

<svelte:head>
    <meta property="og:url" content={page.url.href} />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="DreZZing" />
    <meta property="og:locale" content="fr_FR" />
</svelte:head>

<div class="app">
    <Header></Header>

    <Toaster richColors closeButton duration={2500} />

    <main class="min-h-screen">
        <slot></slot>
    </main>

    <Footer></Footer>
</div>

<style>
    @font-face {
        font-family: "Inter";
        font-style: italic;
        font-weight: 100 900;
        font-display: swap;
        src: url(/fonts/Inter/Inter-Italic.woff2) format("woff2");
        unicode-range:
            U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F,
            U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }

    @font-face {
        font-family: "Inter";
        font-style: normal;
        font-weight: 100 900;
        font-display: swap;
        src: url(/fonts/Inter/Inter.woff2) format("woff2");
        unicode-range:
            U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F,
            U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }

    .app {
        font-family: "Inter";
    }
</style>
