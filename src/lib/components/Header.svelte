<script lang="ts">
    import Menu from "@lucide/svelte/icons/menu";

    import SidePanel from "$lib/components/SidePanel.svelte";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import cart from "$lib/images/cart.svg?raw";
    import drezzing from "$lib/images/drezzing.png";
</script>

<header class="sticky z-50 mb-6 grid h-14 w-full grid-cols-3 items-center px-4 shadow lg:px-12">
    <div class="lg:hidden">
        <SidePanel>
            {#snippet trigger()}
                <Menu strokeWidth={2} size={28} class="mt-1 stroke-d-darkgray" />
            {/snippet}

            <ul class="ml-2 mt-4 space-y-4 text-lg">
                <li><a href="/">Accueil</a></li>
                <li><a href="/collections">Collections</a></li>
                <li><a href="/categories">Catégories</a></li>
                <Separator class="my-6 mr-2 h-[2px] w-auto bg-[#EEEEEE] md:rounded-full" />
                <li><a href="/about">À propos</a></li>
                <li><a href="/contact">Contact</a></li>
            </ul>
        </SidePanel>
    </div>

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
            {/* eslint-disable-next-line svelte/no-at-html-tags */ null}
            <a href="/cart">{@html cart}</a>
        </div>
    </div>
</header>
