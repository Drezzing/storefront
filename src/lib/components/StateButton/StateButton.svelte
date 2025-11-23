<script lang="ts">
    import type { Snippet } from "svelte";
    import type { ClassValue } from "clsx";

    import { Button, type ButtonProps, type ButtonVariant } from "$lib/components/ui/button/index.js";
    import * as Form from "$lib/components/ui/form/index.js";

    import { ButtonStateEnum } from "./stateButton";
    import { cn } from "$lib/utils";

    type Props = {
        state: ButtonStateEnum;
        class?: ClassValue;
        type?: "submit" | "reset" | "button" | "formSubmit";
        disabled?: boolean;
        onclick?: ButtonProps["onclick"];
        idle?: Snippet<[]>;
        updating?: Snippet<[]>;
        success?: Snippet<[]>;
        fail?: Snippet<[]>;
    };

    let {
        state,
        class: className,
        type = "button",
        disabled = false,
        onclick,
        idle,
        updating,
        success,
        fail,
    }: Props = $props();

    let variant = $derived.by((): ButtonVariant => {
        switch (state) {
            case ButtonStateEnum.Idle:
                return "drezzing";
            case ButtonStateEnum.Updating:
                return "updating";
            case ButtonStateEnum.Success:
                return "success";
            case ButtonStateEnum.Fail:
                return "error";
        }
    });
</script>

{#snippet content()}
    {#if state == ButtonStateEnum.Idle}
        {@render idle?.()}
    {:else if state == ButtonStateEnum.Updating}
        {@render updating?.()}
    {:else if state == ButtonStateEnum.Success}
        {@render success?.()}
    {:else if state == ButtonStateEnum.Fail}
        {@render fail?.()}
    {/if}
{/snippet}

{#if type !== "formSubmit"}
    <Button
        {type}
        {variant}
        {onclick}
        disabled={state !== ButtonStateEnum.Idle || disabled}
        class={cn("h-12 transition-colors motion-reduce:transition-none", className)}
    >
        <div class="flex items-center gap-3">
            {@render content()}
        </div>
    </Button>
{:else}
    <Form.Button
        type="submit"
        {variant}
        {onclick}
        disabled={state !== ButtonStateEnum.Idle || disabled}
        class={cn("h-12 transition-colors motion-reduce:transition-none", className)}
    >
        <div class="flex items-center gap-3">
            {@render content()}
        </div>
    </Form.Button>
{/if}
