<script lang="ts">
    import discord from "$lib/images/discord.svg?raw";
    import instagram from "$lib/images/instagram.svg?raw";
</script>

<div class="bg-dblack mt-6 flex w-full flex-col items-center gap-8 py-6 text-base text-white lg:gap-16 lg:py-12">
    <div class="flex flex-row gap-16 lg:gap-64">
        <div class="justify-self-end">
            <div class="flex flex-col gap-8">
                <p>Association<br />Drezzing</p>
                <div class="flex h-6 flex-row gap-4 fill-white">
                    {@html discord}
                    {@html instagram}
                </div>
            </div>
        </div>

        <div class="space-y-8 justify-self-start">
            <p class="font-medium">Liens utiles</p>
            <div class="flex flex-col gap-y-2">
                <a href="/">FAQ</a>
                <a href="/">Contact</a>
                <a href="https://isima.fr">Site de l'ISIMA</a>
            </div>
        </div>
    </div>

    <hr class="border-1 w-full border-white lg:hidden" />

    <div class="col-span-2 flex flex-col items-center gap-4 justify-self-center lg:flex-row lg:gap-48">
        <a href="/cgv">Conditions générales de vente</a>
        <a href="/privacy">Politique de confidentialité</a>
        <a href="/legal">Mentions légales</a>
    </div>
</div>
