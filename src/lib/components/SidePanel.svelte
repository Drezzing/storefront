<script lang="ts">
    import { onMount } from "svelte";
    import { fly } from "svelte/transition";
    import { X } from "lucide-svelte";

    export let isOpen: boolean = false;
    export let onClose: () => void;

    function handleClickOutside(event: Event) {
        const sidebar = document.querySelector("nav");
        if (sidebar && !sidebar.contains(event.target as Node) && !(event.target as HTMLElement).closest("button")) {
            onClose();
            document.removeEventListener("click", handleClickOutside);
        }
    }

    // Ensure document-related code runs only on the client-side
    onMount(() => {
        if (typeof document !== "undefined" && isOpen) {
            document.addEventListener("click", handleClickOutside);
        }

        return () => {
            if (typeof document !== "undefined") {
                document.removeEventListener("click", handleClickOutside);
            }
        };
    });

    $: if (isOpen) {
        // Ensure document-related code runs only on the client-side
        if (typeof document !== "undefined") {
            document.addEventListener("click", handleClickOutside);
        }
    } else {
        if (typeof document !== "undefined") {
            document.removeEventListener("click", handleClickOutside);
        }
    }
</script>

{#if isOpen}
    <nav
        class="fixed left-0 top-0 z-[100] h-screen w-[200px] bg-white shadow md:w-[300px]"
        transition:fly={{ x: -250, duration: 350 }}
    >
        <button
            class="hover:bg-dgray ml-3 mt-3 flex size-[32px] items-center justify-center rounded-full transition-colors duration-100 ease-in-out"
            on:click={onClose}
        >
            <X class="text-d-darkgray" />
        </button>

        <div class="max-h-screen overflow-y-auto p-4">
            <slot />
        </div>
    </nav>
{/if}
