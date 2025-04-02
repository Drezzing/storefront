<script lang="ts">
    import * as Table from "$lib/components/ui/table";
    import PatronTaille from "$lib/images/patron-guide-taille.webp";
</script>

<svelte:head>
    <title>Promo 2024 - Guide des tailles</title>
    <meta property="og:title" content="Promo 2024 - Guide des tailles" />
    <meta name="description" content="Guide des tailles de la collection Promo 2024" />
    <meta property="og:description" content="Guide des tailles de la collection Promo 2024" />
</svelte:head>

<article class="max-w-[1024px] space-y-10 px-4 md:px-8 lg:m-auto">
    <div class="space-y-4 text-center">
        <h1 class="text-3xl font-bold">Promo 2024 - Guide des tailles</h1>
    </div>
    <div class="space-y-8 text-justify">
        <section class="space-y-2">
            <h2 class="font-extrabold">Prise des mesures</h2>
            <p>
                Les tailles indiqués pour le Hoodie, le Teddy et le Tee-shirt doivent êtres mesurés en suivant le patron
                ci-dessous :
            </p>
        </section>

        <img
            class="mx-auto object-scale-down"
            src={PatronTaille}
            width="400"
            height="400"
            alt="Patron de mesures des tailles"
        />

        <section class="space-y-2">
            <h2 class="font-extrabold">Hoodie</h2>
            <Table.Root>
                <Table.Caption>Guide des tailles pour le Hoodie</Table.Caption>
                <Table.Header>
                    <Table.Row>
                        <Table.Head>Mesure (en cm)</Table.Head>
                        <Table.Head>XS</Table.Head>
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
                        <Table.Cell>49</Table.Cell>
                        <Table.Cell>51</Table.Cell>
                        <Table.Cell>56</Table.Cell>
                        <Table.Cell>61</Table.Cell>
                        <Table.Cell>65</Table.Cell>
                        <Table.Cell>69</Table.Cell>
                        <Table.Cell>73</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell class="font-medium">B</Table.Cell>
                        <Table.Cell>64</Table.Cell>
                        <Table.Cell>67</Table.Cell>
                        <Table.Cell>70</Table.Cell>
                        <Table.Cell>73</Table.Cell>
                        <Table.Cell>76</Table.Cell>
                        <Table.Cell>79</Table.Cell>
                        <Table.Cell>82</Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table.Root>
        </section>

        <section class="space-y-2">
            <h2 class="font-extrabold">Teddy</h2>
            <Table.Root>
                <Table.Caption>Guide des tailles pour le Teddy</Table.Caption>
                <Table.Header>
                    <Table.Row>
                        <Table.Head>Mesure (en cm)</Table.Head>
                        <Table.Head>XS</Table.Head>
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
                        <Table.Cell>44</Table.Cell>
                        <Table.Cell>48</Table.Cell>
                        <Table.Cell>52</Table.Cell>
                        <Table.Cell>56</Table.Cell>
                        <Table.Cell>60</Table.Cell>
                        <Table.Cell>64</Table.Cell>
                        <Table.Cell>68</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell class="font-medium">B</Table.Cell>
                        <Table.Cell>62</Table.Cell>
                        <Table.Cell>65</Table.Cell>
                        <Table.Cell>68</Table.Cell>
                        <Table.Cell>71</Table.Cell>
                        <Table.Cell>74</Table.Cell>
                        <Table.Cell>77</Table.Cell>
                        <Table.Cell>80</Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table.Root>
        </section>

        <section class="space-y-2">
            <h2 class="font-extrabold">Tee-shirt</h2>
            <Table.Root>
                <Table.Caption>Guide des tailles pour le Tee-shirt</Table.Caption>
                <Table.Header>
                    <Table.Row>
                        <Table.Head>Mesure (en cm)</Table.Head>
                        <Table.Head>XS</Table.Head>
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
                        <Table.Cell>45</Table.Cell>
                        <Table.Cell>48</Table.Cell>
                        <Table.Cell>51</Table.Cell>
                        <Table.Cell>54</Table.Cell>
                        <Table.Cell>57</Table.Cell>
                        <Table.Cell>60</Table.Cell>
                        <Table.Cell>63</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell class="font-medium">B</Table.Cell>
                        <Table.Cell>68</Table.Cell>
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
            <h2 class="font-extrabold">Casquette</h2>
            <p>La casquette est disponible en taille unique.</p>
        </section>

        <section class="space-y-2">
            <h2 class="font-extrabold">Sac Banane</h2>
            <p>Le sac banane est disponible en taille unique et mesure 38x8x14 cm. La contenance est de 2,5 litres.</p>
        </section>

        <section class="space-y-2">
            <h2 class="font-extrabold">Tote Bag</h2>
            <p>Le tote bag est disponible en taille unique et mesure 38x42 cm. La poignée mesure 70 cm.</p>
        </section>
    </div>
</article>
