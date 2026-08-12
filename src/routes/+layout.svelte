<script>
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.svg';
	import  '../app.css'

	let { children } = $props();

	onMount(() => {
		if (localStorage.getItem('examapp-theme') === 'bauhaus') {
			document.documentElement.dataset.theme = 'bauhaus';
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
