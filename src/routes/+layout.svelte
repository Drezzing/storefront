<script>
	import Header from '../lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import '../app.css';
</script>

<div class="app">
	<Header></Header>

	<main class="min-h-screen">
		<slot></slot>
	</main>

	<Footer></Footer>
</div>

<style>
	.app {
		font-family: "Inter";
	}
</style>
