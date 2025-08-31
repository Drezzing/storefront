<script lang="ts">
    import { Debounced } from "runed";
    import { onDestroy, onMount } from "svelte";
    import { MapLibre, NavigationControl, ScaleControl, Marker, Popup } from "svelte-maplibre-gl";
    import SearchIcon from "@lucide/svelte/icons/search";
    import LocateIcon from "@lucide/svelte/icons/locate";

    import { browser } from "$app/environment";
    import { getCityFromName, getParcelFromCity } from "$lib/mondial-relay/mondial-relay.remote.js";
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Label from "$lib/components/ui/label/label.svelte";

    import { ParcelSelector } from "./parcelSelector.svelte.js";
    import { cn } from "$lib/utils.js";

    const parcelSelector = new ParcelSelector();

    let inputData = $state({
        ville: "",
        cp: "",
    });
    let cpInputInvalid = $state(false);
    let inputDataDebounced = new Debounced(() => {
        return { ville: inputData.ville, cp: inputData.cp };
    }, 250);

    let displaySuggestion = $state(false);
    let suggestionList = $state<HTMLUListElement | null>(null);
    let suggestions = $derived.by(async () => {
        if (inputDataDebounced.current.ville === "") return [];
        if (inputDataDebounced.current.ville.length < 3) return [];

        return await getCityFromName(inputDataDebounced.current);
    });

    let hoverParcel = $state<string | null>(null);

    $inspect("raw data", inputData);
    $inspect("debounced data", inputDataDebounced.current);
    $inspect("parcels", parcelSelector.parcels);
    $inspect(hoverParcel);
    $inspect("selected", parcelSelector.selected);

    const handleClick = (e: PointerEvent) => {
        if (e.target) {
            const targetElId = (e.target as HTMLElement).id;
            if (targetElId === "ville" || targetElId === "cp" || targetElId.startsWith("suggestion-")) {
                return;
            }
        }
        displaySuggestion = false;
    };

    onMount(() => document.addEventListener("click", handleClick));
    onDestroy(() => {
        if (browser) {
            document.removeEventListener("click", handleClick);
        }
    });
</script>

{#snippet openingTimeFromMondialRelay(day: string, times: string[])}
    {@const [timeMorning, timeAfternoon] = ParcelSelector.formatOpeningTime(times)}
    <tr>
        <th class="w-24 pl-1 text-left font-semibold">{day}</th>
        <td class="w-28 text-center">{timeMorning}</td>
        <td class="w-28 text-center">{timeAfternoon}</td>
    </tr>
{/snippet}

<div class="mx-8 flex flex-col gap-4">
    <div class="flex flex-col items-start gap-4 md:flex-row md:items-end">
        <div class="w-full grow space-y-2">
            <Label for="ville">Ville</Label>
            <div class="relative w-full">
                <Input
                    bind:value={
                        () => inputData.ville,
                        (v) => {
                            inputData.ville = v;
                            if (inputData.cp.length >= 1 && inputData.cp.length < 5) {
                                cpInputInvalid = true;
                                inputDataDebounced.cancel();
                            }
                        }
                    }
                    class="w-full"
                    id="ville"
                    placeholder="Ville"
                    onfocus={() => (displaySuggestion = true)}
                    onblur={(e) => {
                        if (e.relatedTarget && (e.relatedTarget as HTMLElement).id.startsWith("suggestion-")) {
                            return;
                        }
                    }}
                />
                {#if displaySuggestion}
                    {#await suggestions then suggestionsList}
                        {#if suggestionsList.length > 0}
                            <ul
                                bind:this={suggestionList}
                                class="absolute right-0 left-0 z-10 mt-1 max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg"
                            >
                                {#each suggestionsList as suggestion (suggestion.Ville + suggestion.CP)}
                                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                                    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                                    <li
                                        id={`suggestion-${suggestion.Ville}-${suggestion.CP}`}
                                        class="cursor-pointer px-3 py-2 hover:bg-gray-100"
                                        onclick={() => {
                                            displaySuggestion = false;
                                            inputData.ville = suggestion.Ville;
                                            inputData.cp = suggestion.CP;
                                            inputDataDebounced.cancel();
                                        }}
                                    >
                                        {suggestion.Ville} ({suggestion.CP})
                                    </li>
                                {/each}
                            </ul>
                        {/if}
                    {/await}
                {/if}
            </div>
        </div>
        <div class="w-full space-y-2 md:w-auto">
            <Label for="cp" aria-invalid={cpInputInvalid}>Code postal</Label>
            <Input
                class="md:w-64"
                bind:value={
                    () => inputData.cp,
                    (v) => {
                        inputData.cp = v;
                        if (v.length > 0 && v.length < 5) {
                            inputDataDebounced.cancel();
                        } else {
                            cpInputInvalid = false;
                        }
                    }
                }
                aria-invalid={cpInputInvalid}
                id="cp"
                placeholder="Code postal"
            />
        </div>
        <div class="flex flex-row gap-1">
            <Button
                size="icon"
                class="w-auto px-2.5"
                onclick={async () => parcelSelector.addParcels(await getParcelFromCity(inputData))}
                ><SearchIcon class="hidden md:block" />
                <p class="md:hidden">Rechercher</p></Button
            >
            <Button size="icon"><LocateIcon /></Button>
        </div>
    </div>
    <div class="flex h-full flex-col gap-2 md:flex-row">
        <div class="max-h-64 w-full overflow-y-auto md:max-h-96 md:w-2/3">
            <div class="pr-2 pl-1">
                {#each parcelSelector.parcels as [, parcel], i (parcel.Num)}
                    <button
                        class={cn(
                            "peer/{i} my-1 w-full cursor-pointer rounded px-2 py-1 text-left",
                            hoverParcel === parcel.Num ? "bg-gray-100" : "bg-white",
                            parcelSelector.selected?.Num === parcel.Num ? "outline-2" : "outline-0",
                        )}
                        onmouseenter={() => (hoverParcel = parcel.Num)}
                        onmouseleave={() => (hoverParcel = null)}
                        onclick={() => (parcelSelector.selected = parcel)}
                    >
                        <div>
                            <p class="capitalize">{i + 1} - {parcel.LgAdr1}</p>
                            <p class="text-sm">{parcel.LgAdr3}</p>
                            <p class="text-sm">{parcel.Ville} - {parcel.CP}</p>
                        </div>
                    </button>
                {/each}
            </div>
        </div>
        <MapLibre
            class="h-96 w-full"
            zoom={14}
            style="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
            bind:center={parcelSelector.currPos}
        >
            <NavigationControl />
            <ScaleControl />
            {#each parcelSelector.parcels as [, parcel], i (parcel.Num)}
                <Marker
                    lnglat={{
                        lat: parseFloat(parcel.Latitude.replace(",", ".")),
                        lon: parseFloat(parcel.Longitude.replace(",", ".")),
                    }}
                >
                    {#snippet content()}
                        <div
                            role="button"
                            tabindex="0"
                            class={cn(
                                "size-5 cursor-pointer rounded-full text-center shadow outline-black",
                                hoverParcel === parcel.Num ? "bg-gray-100" : "bg-white",
                                parcelSelector.selected?.Num === parcel.Num ? "font-bold outline-2" : "outline-1",
                            )}
                            onmouseenter={() => (hoverParcel = parcel.Num)}
                            onmouseleave={() => (hoverParcel = null)}
                        >
                            {i + 1}
                        </div>
                    {/snippet}
                    <Popup
                        closeButton={false}
                        onopen={() => {
                            hoverParcel = parcel.Num;
                            parcelSelector.selected = parcel;
                        }}
                        maxWidth="376px"
                    >
                        <div class="flex flex-col gap-2 px-[5px]">
                            <span class="text-[16px] font-semibold">{parcel.LgAdr1}</span>
                            <table>
                                <tbody class="[&>*:nth-child(odd)]:bg-gray-100">
                                    {@render openingTimeFromMondialRelay("Lundi", parcel.Horaires_Lundi.string)}
                                    {@render openingTimeFromMondialRelay("Mardi", parcel.Horaires_Mardi.string)}
                                    {@render openingTimeFromMondialRelay("Mercredi", parcel.Horaires_Mercredi.string)}
                                    {@render openingTimeFromMondialRelay("Jeudi", parcel.Horaires_Jeudi.string)}
                                    {@render openingTimeFromMondialRelay("Vendredi", parcel.Horaires_Vendredi.string)}
                                    {@render openingTimeFromMondialRelay("Samedi", parcel.Horaires_Samedi.string)}
                                    {@render openingTimeFromMondialRelay("Dimanche", parcel.Horaires_Dimanche.string)}
                                </tbody>
                            </table>
                        </div>
                    </Popup>
                </Marker>
            {/each}
        </MapLibre>
    </div>
</div>
