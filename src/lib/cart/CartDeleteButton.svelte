<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import trash from "$lib/images/trash.svg?raw";

    import LoaderCircle from "@lucide/svelte/icons/loader-circle";

    type OnclickEvent =
        | (MouseEvent & {
              currentTarget: EventTarget & HTMLButtonElement;
          })
        | (MouseEvent & {
              currentTarget: EventTarget & HTMLAnchorElement;
          });

    let { onclick }: { onclick: (e: OnclickEvent) => unknown } = $props();

    let buttonState = $state(0);

    const onclickWrapper = async (e: OnclickEvent) => {
        buttonState = 1;
        await onclick(e);
        buttonState = 0;
    };
</script>

<Button
    class="h-7 bg-transparent stroke-black py-1 font-normal text-black ring-[1.5px] ring-black transition-all duration-75 hover:bg-transparent hover:stroke-red-600 hover:ring-red-600"
    onclick={(e) => onclickWrapper(e)}
    disabled={Boolean(buttonState)}
>
    {#if buttonState == 0}
        {/* eslint-disable-next-line svelte/no-at-html-tags */ null}
        <div class="h-5 w-4 fill-none text-transparent">{@html trash}</div>
    {:else if buttonState == 1}
        <LoaderCircle size={16} strokeWidth={1.75} class="motion-safe:animate-spin" />
    {/if}
</Button>
