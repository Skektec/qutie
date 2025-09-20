<script lang="ts">
	let round = 1;
	let score = 2;
	let upcoming = ['shi', 'mb'];
</script>

<div>
	<div class="sameLine">
		<div>
			<div class="white">Round</div>
			<div class="yellow">{{ round }}</div>
		</div>
		<div>
			{{ upcoming }}
		</div>
		<div>
			<div class="yellow">{{ score }}</div>
			<div class="white">SCORE</div>
		</div>
	</div>
	<div><!-- stratagem info --></div>
	<div><!-- stratagem sequence --></div>
	<div><!-- time left --></div>
</div>

<style>
	.sameLine {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.yellow {
		font-family: 'Chakra Petch', Arial, sans-serif;
		color: yellow;
	}
	.white {
		font-family: 'Chakra Petch', Arial, sans-serif;
		color: white;
	}
</style>
