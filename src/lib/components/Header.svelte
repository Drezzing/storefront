<script lang="ts">
    import drezzing from "$lib/images/drezzing.png";
    import cart from "$lib/images/cart.svg?raw";
    import { Menu } from "lucide-svelte";
    import SidePanel from "./SidePanel.svelte";
    import { afterNavigate } from "$app/navigation";
    import { Separator } from "$lib/components/ui/separator/index.js";
    let menuOpen = false;

    afterNavigate(() => {
        menuOpen = false;
    });
</script>

<header class="sticky z-50 mb-6 grid h-14 w-full grid-cols-3 items-center px-4 shadow lg:px-12">
    <button on:click={() => (menuOpen = !menuOpen)} class="grow lg:hidden">
        <Menu strokeWidth={2} size={28} class="stroke-d-darkgray" />
    </button>
    <SidePanel isOpen={menuOpen} onClose={() => (menuOpen = false)}>
        <ul class="ml-4 mt-6 space-y-4 text-lg">
            <li><a href="/">Accueil</a></li>
            <li><a href="/collections">Collections</a></li>
            <li><a href="/categories">Catégories</a></li>
            <Separator class="mx-2 my-6 h-[2px] w-auto bg-[#EEEEEE] md:rounded-full" />
            <li><a href="/about">À propos</a></li>
            <li><a href="/contact">Contact</a></li>
        </ul>
    </SidePanel>

    <div class="justify-self-center lg:justify-self-start">
        <a href="/">
            <img src={drezzing} alt="logo-drezzing" class="h-12" />
        </a>
    </div>

    <nav class="hidden justify-self-center lg:block">
        <ul class="flex flex-row gap-8">
            <li><a href="/collections">Collections</a></li>
            <li><a href="/categories">Catégories</a></li>
            <li><a href="/about">À propos</a></li>
        </ul>
    </nav>

    <div class="justify-self-end">
        <div class="flex flex-row gap-2 lg:gap-8">
            <a href="/cart">{@html cart}</a>
        </div>
    </div>
</header>
