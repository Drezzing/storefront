<script lang="ts">
    import * as FormPrimitive from "formsnap";
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "$lib/utils.js";

    type $$Props = Omit<HTMLAttributes<HTMLSpanElement>, "class"> & { class?: string | null | undefined };
    let className: string | undefined | null = undefined;
    export { className as class };
</script>

<FormPrimitive.Description class={cn("text-sm text-muted-foreground", className)} {...$$restProps} let:descriptionAttrs>
    <slot {descriptionAttrs} />
</FormPrimitive.Description>
