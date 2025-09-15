<script lang="ts">
    import * as Table from "$lib/components/ui/table";
    import PatronTaille from "$lib/images/patron-guide-taille.webp";
</script>

<svelte:head>
    <title>Isima - Guide des tailles</title>
    <meta property="og:title" content="Isima - Guide des tailles" />
    <meta name="description" content="Guide des tailles de la collection Isima" />
    <meta property="og:description" content="Guide des tailles de la collection Isima" />
</svelte:head>

<article class="max-w-[1024px] space-y-10 px-4 md:px-8 lg:m-auto">
    <div class="space-y-4 text-center">
        <h1 class="text-3xl font-bold">Isima - Guide des tailles</h1>
    </div>
    <div class="space-y-8 text-justify">
        <section class="space-y-2">
            <h2 class="font-extrabold">Prise des mesures</h2>
            <p>Les tailles indiqués pour le Polo doivent êtres mesurés en suivant le patron ci-dessous :</p>
        </section>

        <img
            class="mx-auto object-scale-down"
            src={PatronTaille}
            width="400"
            height="400"
            alt="Patron de mesures des tailles"
        />

        <section class="space-y-2">
            <h2 class="font-extrabold">Polo (Homme)</h2>
            <Table.Root>
                <Table.Caption>Guide des tailles pour le Polo (Homme)</Table.Caption>
                <Table.Header>
                    <Table.Row>
                        <Table.Head>Mesure (en cm)</Table.Head>
                        <Table.Head>S</Table.Head>
                        <Table.Head>M</Table.Head>
                        <Table.Head>L</Table.Head>
                        <Table.Head>XL</Table.Head>
                        <Table.Head>XXL</Table.Head>
                        <Table.Head>3XL</Table.Head>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    <Table.Row>
                        <Table.Cell class="font-medium">A</Table.Cell>
                        <Table.Cell>49.5</Table.Cell>
                        <Table.Cell>52.5</Table.Cell>
                        <Table.Cell>55.5</Table.Cell>
                        <Table.Cell>58.5</Table.Cell>
                        <Table.Cell>61.5</Table.Cell>
                        <Table.Cell>64.5</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell class="font-medium">B</Table.Cell>
                        <Table.Cell>70</Table.Cell>
                        <Table.Cell>72</Table.Cell>
                        <Table.Cell>74</Table.Cell>
                        <Table.Cell>76</Table.Cell>
                        <Table.Cell>78</Table.Cell>
                        <Table.Cell>80</Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table.Root>
        </section>

        <section class="space-y-2">
            <h2 class="font-extrabold">Polo (Femme)</h2>
            <Table.Root>
                <Table.Caption>Guide des tailles pour le Polo (Femme)</Table.Caption>
                <Table.Header>
                    <Table.Row>
                        <Table.Head>Mesure (en cm)</Table.Head>
                        <Table.Head>S</Table.Head>
                        <Table.Head>M</Table.Head>
                        <Table.Head>L</Table.Head>
                        <Table.Head>XL</Table.Head>
                        <Table.Head>XXL</Table.Head>
                        <Table.Head>3XL</Table.Head>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    <Table.Row>
                        <Table.Cell class="font-medium">A</Table.Cell>
                        <Table.Cell>40.5</Table.Cell>
                        <Table.Cell>43.5</Table.Cell>
                        <Table.Cell>46.5</Table.Cell>
                        <Table.Cell>49.5</Table.Cell>
                        <Table.Cell>52.5</Table.Cell>
                        <Table.Cell>55.5</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell class="font-medium">B</Table.Cell>
                        <Table.Cell>61.5</Table.Cell>
                        <Table.Cell>63.5</Table.Cell>
                        <Table.Cell>65.5</Table.Cell>
                        <Table.Cell>67.5</Table.Cell>
                        <Table.Cell>69.5</Table.Cell>
                        <Table.Cell>71.5</Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table.Root>
        </section>
    </div>
</article>
