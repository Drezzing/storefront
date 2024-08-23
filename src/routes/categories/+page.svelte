<script lang="ts">
  import { Separator } from "$lib/components/ui/separator/index.js";
</script>

<svelte:head>
    <title>Catégories</title>
    <meta name="description" content="Catégories page" />
</svelte:head>

<div class="max-w-[1024px] justify-center md:px-8 lg:m-auto lg:space-y-16">
  <section class="justify-center space-y-8 text-center">
    <h1 class="text-3xl font-bold">Catégories</h1>
    <div class="grid grid-cols-2 items-center justify-center gap-6 px-4 md:grid-cols-3 lg:grid-cols-4">
        <!-- TODO: replace each item with a snippet -->
        <!-- TODO: SM: 4 items, MD: 6 items, LG: 8 itms -->
        <div class="space-y-4">
            <img src="https://via.placeholder.com/600x600" alt="mljqsmlf" class="rounded-full" />
            <p>Hoodie </p>
        </div>
        <div class="space-y-4">
            <img src="https://via.placeholder.com/600x600" alt="mljqsmlf" class="rounded-full" />
            <p>Polo </p>
        </div>
        <div class="space-y-4">
            <img src="https://via.placeholder.com/600x600" alt="mljqsmlf" class="rounded-full" />
            <p>T-Shirt</p>
        </div>
        <div class="space-y-4">
            <img src="https://via.placeholder.com/600x600" alt="mljqsmlf" class="rounded-full" />
            <p>Patch</p>
        </div>
        <div class="space-y-4">
            <img src="https://via.placeholder.com/600x600" alt="mljqsmlf" class="rounded-full" />
            <p>Polo Isima</p>
        </div>
        <div class="space-y-4">
            <img src="https://via.placeholder.com/600x600" alt="mljqsmlf" class="rounded-full" />
            <p>Polo Isima</p>
        </div>
    </div>
  </section>
  
  <Separator class="my-8 h-8 bg-[#EEEEEE] md:h-4 md:rounded-full lg:hidden" />

  <section class="justify-center space-y-8">
    <h2 class="text-center font-bold">Les produits les plus populaires</h2>
    <div class="grid grid-cols-2 items-center gap-2 px-4">
        <div class="justify-self-end">
          <img src="https://via.placeholder.com/600x600" alt="mljqsmlf" class="rounded-full" />
          <p>Polo Isima</p>        
        </div>
        <div class="justify-self-start">
          <img src="https://via.placeholder.com/600x600" alt="mljqsmlf" class="rounded-full" />
          <p>Polo Isima</p>        
        </div>
    </div>
</section>
</div>