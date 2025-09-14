<script lang="ts">
    // Temp test page
    import ParcelSelector from "$lib/components/ParcelSelector/ParcelSelector.svelte";
    let selectedParcel = $state(null);
    $inspect("parcelNum", selectedParcel);
</script>

<ParcelSelector bind:selectedParcel></ParcelSelector>
