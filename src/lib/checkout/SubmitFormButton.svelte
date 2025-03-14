<script lang="ts">
    import type { Snippet } from "svelte";

    import { ButtonState } from "$lib/components/StateButton/stateButton";
    import * as Form from "$lib/components/ui/form/index.js";

    let { buttonState, children }: { buttonState: ButtonState; children: Snippet } = $props();

    let cssBg = $derived.by(() => {
        switch (buttonState) {
            case ButtonState.Idle:
                return "bg-[#2C2C2C] hover:bg-[#363636] ring-[#2C2C2C]";

            case ButtonState.Updating:
                return "bg-[#363636] hover:bg-[#363636] ring-[#363636]";

            case ButtonState.Success:
                return "bg-green-600 disabled:bg-green-600 ring-green-600 disabled:opacity-100";

            case ButtonState.Fail:
                return "bg-red-600 hover:bg-red-600 ring-red-600 disabled:opacity-100";
        }
    });
</script>

<Form.Button
    disabled={buttonState !== ButtonState.Idle}
    class="h-12 ring-[1.5px] transition motion-reduce:transition-none {cssBg}"
>
    <div class="flex items-center gap-3">
        {@render children()}
    </div>
</Form.Button>
