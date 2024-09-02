<script>
    import { page } from "$app/stores";
</script>

<div class="flex h-[75vh] flex-col items-center justify-center gap-4">
    <h1 class="text-3xl font-bold">Une erreur est survenue</h1>
    <p>Code erreur : {$page.status} - {$page.error?.message}</p>
</div>
