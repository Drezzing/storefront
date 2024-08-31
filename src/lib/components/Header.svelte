<script>
    import drezzing from "$lib/images/drezzing.png";
    import cart from "$lib/images/cart.svg?raw";
    import profile from "$lib/images/profile.svg?raw";
    import { fly } from "svelte/transition";
    import { X, Menu } from "lucide-svelte";

    import { afterNavigate } from "$app/navigation";

    //  le menu se ferme a chaque fois qu'on change de page
    afterNavigate(() => {
        menuOpen = false;
    });

    let menuOpen = $state(false);
</script>

<svelte:head>
    <link rel="shortcut icon" href={drezzing} type="image/x-icon" />
</svelte:head>

<header class="sticky z-50 mb-6 grid h-14 w-full grid-cols-3 items-center px-4 shadow lg:px-12">
    <button onclick={() => (menuOpen = !menuOpen)} class="grow lg:hidden">
        <Menu strokeWidth={2} size={28} class="stroke-d-darkgray" />
    </button>

    {#if menuOpen}
        <nav class="fixed left-0 top-0 h-screen w-[200px] bg-white shadow" transition:fly={{ x: -200, duration: 350 }}>
            <button
                class="hover:bg-dgray ml-3 mt-3 flex size-[32px] items-center justify-center rounded-full bg-white transition-colors duration-100 ease-in-out"
                onclick={() => (menuOpen = !menuOpen)}
            >
                <X stroke-width={1} class="stroke-d-darkgray" />
            </button>

            <div class="ml-4 mt-6 space-y-16 text-lg">
                <ul class="space-y-4">
                    <li><a href="/">Accueil</a></li>
                    <li><a href="/collections">Collections</a></li>
                    <li><a href="/categories">Catégories</a></li>
                </ul>
                <ul class="space-y-4">
                    <li><a href="/about">À propos</a></li>
                    <li><a href="/contact">Contact</a></li>
                </ul>
            </div>
        </nav>
    {/if}

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
            <!-- <a href="/profile">{@html profile}</a> -->
            <a href="/cart">{@html cart}</a>
        </div>
    </div>
</header>
