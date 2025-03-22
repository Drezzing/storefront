<script lang="ts">
  import * as Select from "$lib/components/ui/select";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  

  import { Send } from "lucide-svelte";
  import { clientRequest, displayClientError } from "$lib/error";

  import { toast } from "svelte-sonner";
  import { forgotpasswordObject } from "$lib/forgotpassword";

  let email = $state("");
  
  const fieldMap: Record<string, string> = {
        email: "Adresse mail"
    };

  

  const sendMessage = async () => {
      const forgotpasswordObjectValid = forgotpasswordObject.safeParse( email );

      if (!forgotpasswordObjectValid.success) {
          const errorFields = forgotpasswordObjectValid.error.errors.map((err) => fieldMap[err.path[0]]);
          return toast.error("Champ(s) invalide(s) : " + errorFields.join(", "));
      }

      const response = await clientRequest("CONTACT_POST", "/api/contact", {
          method: "POST",
          body: JSON.stringify(forgotpasswordObjectValid.data),
          headers: {
              "Content-Type": "application/json",
          },
      });

      if (!response.success) {
          displayClientError(response);
      } else {
          toast.success("Mail envoyé avec succes.");
          email = "";
      }
  };
</script>

<svelte:head>
  <title>Forgot password</title>
  <meta name="description" content="Mot de passe oublé" />
</svelte:head>

<div class="max-w-[1024px] space-y-4 px-4 md:px-8 lg:m-auto">
  <h1 class="text-center text-3xl font-bold">Mot de passe oublié</h1>

  <section class="space-y-4">
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

      
  </section>

  <div class="flex justify-center">
      <Button variant="drezzing" onclick={sendMessage} class="flex gap-4 px-8 py-2">
          <Send class="mr-2" /> Envoyer
      </Button>
  </div>
  <div class="justify-start">
      <br>
      <a href="/account/login" class="underline">Retour</a>
  </div>
</div>
