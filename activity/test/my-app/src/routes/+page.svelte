<script lang="ts">
	import { goto } from '$app/navigation';

	function handleKeyPress() {
		goto('/game');
	}

	import { onMount } from 'svelte';
	onMount(() => {
		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
	});
</script>

<div
	style="
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        font-family: 'Chakra Petch', Arial, sans-serif;
    "
>
	<h1 style="color: white; font-size: 3rem; font-family: inherit;">Stratagem Hero</h1>
	<p style="color: yellow; font-size: 1.5rem; font-family: inherit;">Press any Key to start</p>
</div>
