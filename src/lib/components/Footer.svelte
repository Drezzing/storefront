<script lang="ts">
    import Discord from "$lib/images/discord.svg?raw";
    import Instagram from "$lib/images/instagram.svg?raw";
</script>

<footer class="bg-dblack mt-6 flex w-full flex-col items-center gap-8 py-6 text-white lg:gap-16 lg:py-12">
    <div class="grid grid-cols-2 gap-16 lg:gap-64">
        <div class="justify-self-end">
            <div class="flex flex-col gap-8">
                <p>Association<br />Drezzing</p>
                <div class="flex h-8 flex-row items-center gap-4 fill-white">
                    <a href="https://discord.gg/cpZCgnkCBx" target="_blank" class="size-7 fill-white">
                        {/* eslint-disable-next-line svelte/no-at-html-tags */ null}
                        {@html Discord}
                    </a>
                    <a href="https://www.instagram.com/drezzing_isima" target="_blank" class="size-7 fill-white">
                        {/* eslint-disable-next-line svelte/no-at-html-tags */ null}
                        {@html Instagram}
                    </a>
                </div>
            </div>
        </div>

        <div class="space-y-8 justify-self-start">
            <p class="font-medium">Liens utiles</p>
            <div class="flex flex-col gap-y-2">
                <a href="/faq">FAQ</a>
                <a href="/contact">Contact</a>
                <a href="https://isima.fr" target="_blank">Site de l'ISIMA</a>
            </div>
        </div>
    </div>

    <hr class="w-full border-1 border-white lg:hidden" />

    <div class="grid grid-rows-2 items-center justify-items-center gap-4 lg:grid-cols-2 lg:grid-rows-1 lg:gap-24">
        <a href="/cgv" class="text-center lg:justify-self-end"
            >Conditions générales<br class="hidden lg:block" /> de vente (CGV)</a
        >
        <a href="/legal" class="lg:justify-self-start">Mentions légales</a>
    </div>
</footer>
