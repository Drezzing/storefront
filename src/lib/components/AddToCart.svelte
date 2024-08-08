<script lang="ts">
    import { CartButtonState } from "$lib/medusa/cart.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import type { Snippet } from "svelte";

    let { buttonState, children }: { buttonState: CartButtonState; children: Snippet } = $props();

    // let cssBg = $state("bg-[#2C2C2C] hover:bg-[#363636]")
    let cssBg = $derived.by(() => {
        switch (buttonState) {
            case CartButtonState.Idle:
                return "bg-[#2C2C2C] hover:bg-[#363636] ring-[#2C2C2C]";

            case CartButtonState.Updating:
                return "bg-[#363636] hover:bg-[#363636] ring-[#363636]";

            case CartButtonState.Success:
                return "bg-green-600 disabled:bg-green-600 ring-green-600 disabled:opacity-100";

            case CartButtonState.Fail:
                return "bg-red-600 hover:bg-red-600 ring-red-600 disabled:opacity-100";
        }
    });

    $inspect("in", buttonState, cssBg);
</script>

<Button
    on:click
    disabled={buttonState !== CartButtonState.Idle}
    class="h-12 w-full ring-[1.5px] transition motion-reduce:transition-none {cssBg}"
>
    <div class="flex items-center gap-3">
        {@render children()}
    </div>
</Button>
