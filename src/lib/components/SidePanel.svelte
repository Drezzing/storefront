<script lang="ts">
    import { type Snippet } from "svelte";

    import { beforeNavigate } from "$app/navigation";
    import * as Sheet from "$lib/components/ui/sheet";

    beforeNavigate((nav) => {
        if (nav.from?.url.pathname !== nav.to?.url.pathname) {
            isOpen = false;
        }
    });

    type Props = {
        trigger: Snippet;
        children: Snippet;
        isOpen?: boolean;
        title?: Snippet;
        description?: Snippet;
    };

    let { trigger, children, isOpen = $bindable(false), title, description }: Props = $props();
</script>

<Sheet.Root bind:open={isOpen}>
    <Sheet.Trigger>
        {@render trigger()}
    </Sheet.Trigger>
    <Sheet.Content side="left" inTransitionConfig={{ x: -250, duration: 350 }}>
        {#if title || description}
            <Sheet.Header>
                {#if title}
                    <Sheet.Title>{@render title()}</Sheet.Title>
                {/if}
                {#if description}
                    <Sheet.Description>{@render description()}</Sheet.Description>
                {/if}
            </Sheet.Header>
        {/if}

        {@render children()}
    </Sheet.Content>
</Sheet.Root>
