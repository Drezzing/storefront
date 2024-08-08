<script>
    import drezzing from '$lib/images/drezzing.png';
    import cart from "$lib/images/cart.svg?raw"
    import profile from "$lib/images/profile.svg?raw"
    import menu from "$lib/images/menu.svg?raw"
    import close from "$lib/images/close.svg?raw"
    import { fly } from 'svelte/transition';

    let menuOpen = $state(false);

</script>


<header class="sticky grid grid-cols-3 h-14 items-center px-4 shadow w-full lg:px-12 mb-6">
    <button onclick={() => menuOpen = !menuOpen} class="grow lg:hidden">
        {@html menu}
    </button>
    
    {#if menuOpen}  
        <nav class="fixed left-0 top-0 w-[200px] h-screen shadow bg-white" transition:fly={{x: -200, duration: 350}}>
            <div class="flex flex-row items-center h-14 pl-[12px]">
                <button
                    class="transition-colors duration-100 ease-in-out bg-white hover:bg-dgray rounded-full size-[32px] flex items-center justify-center"
                    onclick={() => menuOpen = !menuOpen}
                >
                    {@html close}
                </button>
                <ul>
                    <li>Acceuil</li>
                    <li>Collections</li>
                </ul>
            </div>
        </nav>
    {/if}
            

    <div class="justify-self-center lg:justify-self-start">
        <img src={drezzing} alt="logo-drezzing" class="h-12" />
    </div>

    <nav class="hidden lg:block justify-self-center">
        <ul class="flex flex-row gap-8">
            <li>Collections</li>
            <li>A propos</li>
        </ul>    
    </nav>


    <div class="justify-self-end">
        <div class="flex flex-row gap-2 lg:gap-8">
            {@html profile}
            {@html cart}
        </div>
    </div>

</header>

<style>
    /* 
    .corner {
        width: 32px;
        height: 32px;
    } */

    /* ul {
        list-style: none;
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 32px;
        padding-left: 16px;
        padding-right: 16px;
    } */

    /* .corner a {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
    }

    .corner img {
        width: 2em;
        height: 2em;
        object-fit: contain;
    }

    nav {
        display: flex;
        justify-content: center;
        --background: rgba(255, 255, 255, 0.7);
    }

    svg {
        width: 2em;
        height: 3em;
        display: block;
    }

    path {
        fill: var(--background);
    }

    ul {
        position: relative;
        padding: 0;
        margin: 0;
        height: 3em;
        display: flex;
        justify-content: center;
        align-items: center;
        list-style: none;
        background: var(--background);
        background-size: contain;
    }

    li {
        position: relative;
        height: 100%;
    }

    li[aria-current='page']::before {
        --size: 6px;
        content: '';
        width: 0;
        height: 0;
        position: absolute;
        top: 0;
        left: calc(50% - var(--size));
        border: var(--size) solid transparent;
        border-top: var(--size) solid var(--color-theme-1);
    }

    nav a {
        display: flex;
        height: 100%;
        align-items: center;
        padding: 0 0.5rem;
        color: var(--color-text);
        font-weight: 700;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        text-decoration: none;
        transition: color 0.2s linear;
    }

    a:hover {
        color: var(--color-theme-1);
    } */
</style>
