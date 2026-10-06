<script lang="ts">
	import { st } from "../state.svelte";

	const entries = $derived.by(() => {
		const entries: { rank: number; player: (typeof st.players)[number] }[] = [];
		for (let i = 0; i < st.leaderboard.length; i++) {
			const player = st.players.find((p) => p.index === st.leaderboard[i]);
			if (!player) continue;
			entries.push({ rank: i + 1, player });
		}
		return entries;
	});
</script>

<span class="title">LEADERBOARD</span>
{#each entries as entry}
	<br>
	{#if entry.player.index === st.player.index}
		<span class="me">
			{entry.rank}. {st.player.name}{st.player.account.clan ? ` [${st.player.account.clan}]` : ""}
		</span>
	{:else if entry.player.name}
		<span class={entry.player.team !== st.player.team ? "red" : "blue"}> {entry.rank}. {entry.player.name} </span>
		{#if entry.player.account.clan}
			<span class="me"> [{entry.player.account.clan}]</span>
		{/if}
	{/if}
{/each}
