<script lang="ts">
    import { Input, type FormInputEvent } from "$lib/components/ui/input";
    import { Button } from "$lib/components/ui/button/index.js";

    let { value = $bindable(), min, max, step = 1}: {value: number, min: number, max: number, step?: number} = $props();

	function validateValue(input: FormInputEvent<InputEvent>): void {
        // @ts-ignore
		const inputValue = input.target?.value as string;
        let parsedInput = Number.parseInt(inputValue)

        if (Number.isNaN(parsedInput) || parsedInput < 1) {
            parsedInput = 1
        } else if (parsedInput > 99) {
            parsedInput = 99
        }

        value = parsedInput
	}
</script>

{#snippet button(text: string, onclick: () => void, disabled: boolean)}
    <Button {disabled} class="bg-transparent px-3 py-6 text-black w-1 rounded-md hover:bg-gray-200" {onclick}>{text}</Button>
{/snippet}

<div class="flex flex-row ring-[1.5px] rounded-md h-12 w-fit items-center ring-black">
    {@render button("-", () => {value -= step}, value <= min)}
    <!-- <Button class="bg-transparent text-black w-1 rounded-sm">-</Button> -->
    <Input bind:value={value} on:input={(input) => validateValue(input)} class="text-center border-0 h-12 py-0 focus-visible:ring-0 w-[5ch] focus-visible:ring-offset-0"/>
    {@render button("+", () => {value += step}, value >= max)}
</div>