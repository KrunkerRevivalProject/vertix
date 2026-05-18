<script lang="ts">
	interface Props {
		currentPage: string;
	}
	const { currentPage }: Props = $props();
</script>
<nav>
	<ul id="n" class="clearfix">
		<li><a target="_blank" href="/">Play</a></li>
		<li class:sel={currentPage === "profile"}><a href="#">Profile</a></li>
		<li><a href="#">Achievements</a></li>
		<li><a href="#">Clans</a></li>
		<li class:sel={currentPage === "leaderboards"}><a href="./leaderboards.html">Leaderboards</a></li>
		<li><a href="#">Find Friends</a></li>
		<li class:sel={currentPage === "donate"}><a href="./donate.html">Donate</a></li>
	</ul>
</nav>
<style>
</style>
