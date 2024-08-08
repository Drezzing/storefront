<script lang="ts">
    import discord from "$lib/images/discord.svg?raw"
    import instagram from "$lib/images/instagram.svg?raw"
</script>

<div class="w-full bg-dblack text-white flex flex-col items-center text-base py-6 gap-8 mt-6 lg:py-12 lg:gap-16">
    <div class="flex flex-row gap-16 lg:gap-64">
        <div class="justify-self-end">
            <div class="flex flex-col gap-8 ">
                <p>Association<br>Drezzing</p>
                <div class="flex flex-row gap-4 fill-white h-6">
                    {@html discord}
                    {@html instagram}
                </div>
            </div>
        </div>
    
        <div class="justify-self-start space-y-8">
            <p class="font-medium">Liens utiles</p>
            <div class="flex flex-col gap-y-2">
                <a href="/faq">FAQ</a>
                <a href="/contact">Contact</a>
                <a href="https://isima.fr">Site de l'ISIMA</a>
            </div>
        </div>
    </div>

    <hr class="border-white border-1 w-full lg:hidden">

    <div class="col-span-2 justify-self-center flex flex-col gap-4 items-center lg:flex-row lg:gap-48">
        <a href="/cgv">Conditions générales de vente</a>
        <a href="/privacy">Politique de confidentialité</a>
        <a href="/legal">Mentions légales</a>
    </div>
</div>