<script>
    import { Toaster } from "$lib/components/ui/sonner";

    import Header from "../lib/components/Header.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import "../app.css";
</script>

<div class="app">
    <Header></Header>

    <Toaster richColors closeButton duration={2500} />

    <main class="min-h-screen">
        <slot></slot>
    </main>

    <Footer></Footer>
</div>

<style>
    .app {
        font-family: "Inter";
    }
</style>
