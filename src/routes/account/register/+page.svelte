<script lang="ts">
  import * as Select from "$lib/components/ui/select";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";

  import { LogIn } from "lucide-svelte";
  import { clientRequest, displayClientError } from "$lib/error";

  
  import { toast } from "svelte-sonner";
  let nom= $state("");
  let prenom= $state("");
  let email = $state("");
  let password = $state("");
  let confirmpassword = $state("");

</script>

<svelte:head>
  <title>Register</title>
  <meta name="description" content="Page d'enregistrement'" />
</svelte:head>

<div class="max-w-[1024px] space-y-4 px-4 md:px-8 lg:m-auto">
  <h1 class="text-center text-3xl font-bold">S'inscrire</h1>

  <section class="space-y-4">
      <div class="space-y-1">
          <Label for="nom">Nom</Label>
          <Input
              type="text"
              id="nom"
              placeholder="Nom"
              bind:value={nom}
              class="ring-offset-0 focus-visible:ring-1 focus-visible:ring-d-darkgray focus-visible:ring-offset-0"
          />
      </div>

      <div class="space-y-1">
          <Label for="prenom">Prénom</Label>
          <Input
              type="text"
              id="prenom"
              placeholder="Prénom"
              bind:value={prenom}
              class="ring-offset-0 focus-visible:ring-1 focus-visible:ring-d-darkgray focus-visible:ring-offset-0"
          />
      </div>

      <div class="space-y-1">
          <Label for="email">Adresse mail</Label>
          <Input
              type="email"
              id="email"
              placeholder="nom.prenom@mail.fr"
              bind:value={email}
              class="ring-offset-0 focus-visible:ring-1 focus-visible:ring-d-darkgray focus-visible:ring-offset-0"
          />
      </div>

      <div class="space-y-1">
          <Label for="object">Mot de passe</Label>
          <Input
          type="password"
          id="password"
          placeholder="**********"
          bind:value={password}
          class="ring-offset-0 focus-visible:ring-1 focus-visible:ring-d-darkgray focus-visible:ring-offset-0"
          />
      </div>

      <div class="space-y-1">
          <Label for="object">Confirmer le mot de passe</Label>
          <Input
          type="password"
          id="confirmpassword"
          placeholder="**********"
          bind:value={confirmpassword}
          class="ring-offset-0 focus-visible:ring-1 focus-visible:ring-d-darkgray focus-visible:ring-offset-0"
          />
          {#if confirmpassword && confirmpassword !== password}
          <p class="text-red-500 text-sm">Les mots de passe ne correspondent pas.</p>
          {/if}
      </div>
  </section>

  <div class="flex justify-center">
      <Button variant="drezzing"  class="flex gap-4 px-8 py-2">
        S'enregistrer 
      </Button>
  </div>
  <div class="justify-start">
    <br>
    <a href="/account/login" class="text-center ">Se connecter</a>
  </div>
</div>
