<script lang="ts">
	import type { ClanLeaderboardEntry, Leaderboard, PlayerLeaderboardEntry } from "../types";
	import NavigationBar from "./NavigationBar.svelte";

	let linkedBoard = $state("rank");

	window.onload = async () => {
        const rankLeaderboard = document.getElementById("rankLeaderboard")!;
        const kdrAnyLeaderboard = document.getElementById("kdrAnyLeaderboard")!;
        const kdrThousandLeaderboard = document.getElementById("kdrThousandLeaderboard")!;
        const killsLeaderboard = document.getElementById("killsLeaderboard")!;
        const clnRankLeaderboard = document.getElementById("clnRankLeaderboard")!;
        const clnKdrLeaderboard = document.getElementById("clnKdrLeaderboard")!;

		const res = await fetch("http://localhost:1118/getLbs");
		const lbData: Leaderboard[] = await res.json();

		for (const lb of lbData) {
			let tmpHTML = "";
			switch (lb.type) {
				case "playerRank": {
                    const entries = lb.entries as PlayerLeaderboardEntry[];
					for (let i = 0; i < entries.length; ++i) {
						tmpHTML +=
							"<div onclick='showUserStatPage(\"" +
							entries[i].name +
							"\")' class='leaderboardItemWrapper'>" +
							(i + 1) +
							". <span class='clanDisplay'>" +
							(entries[i].clan.length ? `[${entries[i].clan.toUpperCase()}] ` : "") +
							"</span><span class='leaderNameDisplay'>" +
							entries[i].name +
							" RNK " +
							entries[i].rank +
							"</span></div>";
					}
					rankLeaderboard.innerHTML = tmpHTML;
					break;
                }
				case "kills": {
                    const entries = lb.entries as PlayerLeaderboardEntry[];
					for (let i = 0; i < entries.length; ++i) {
						tmpHTML +=
							"<div onclick='showUserStatPage(\"" +
							entries[i].name +
							"\")' class='leaderboardItemWrapper'>" +
							(i + 1) +
							". <span class='clanDisplay'>" +
							(entries[i].clan.length ? `[${entries[i].clan.toUpperCase()}] ` : "") +
							"</span><span class='leaderNameDisplay'>" +
							entries[i].name +
							" " +
							entries[i].numKills +
							" KILLS</span></div>";
					}
					killsLeaderboard.innerHTML = tmpHTML;
					break;
                }
				case "clanRank":
				case "clanKdr": {
                    const entries = lb.entries as ClanLeaderboardEntry[];
					for (let i = 0; i < entries.length; ++i) {
                        const clanKdr = ((Math.max(1, entries[i].numKills) / Math.max(1, entries[i].numDeaths)).toFixed(2));
						tmpHTML +=
							"<div class='leaderboardItemWrapper'>" +
							(i + 1) +
							". <span class='clanDisplay'>[" +
							entries[i].name +
							"] (" +
							entries[i].numMembers +
							" members)</span><span class='leaderNameDisplay'> RNK " +
							entries[i].rank +
							" KDR " +
							clanKdr +
							"</span></div>";
					}
                    const lbElement = lb.type === "clanRank" ? clnRankLeaderboard : clnKdrLeaderboard;
                    lbElement.innerHTML = tmpHTML;
					break;
                }
				case "kdrThousand":
				case "kdrAny": {
                    const entries = lb.entries as PlayerLeaderboardEntry[];
					for (let i = 0; i < entries.length; ++i) {
                        const kdr = ((Math.max(1, entries[i].numKills) / Math.max(1, entries[i].numDeaths)).toFixed(2));
						tmpHTML +=
							"<div onclick='showUserStatPage(\"" +
							entries[i].name +
							"\")' class='leaderboardItemWrapper'>" +
							(i + 1) +
							". <span class='clanDisplay'>" +
							(entries[i].clan.length ? `[${entries[i].clan.toUpperCase()}] ` : "") +
							"</span><span class='leaderNameDisplay'>" +
							entries[i].name +
							" KDR " +
							kdr +
							" (" +
							entries[i].numKills +
							"/" +
							entries[i].numDeaths +
							")</span></div>";
					}
                    const lbElement = lb.type === "kdrThousand" ? kdrThousandLeaderboard : kdrAnyLeaderboard;
                    lbElement.innerHTML = tmpHTML;
					break;
                }
				default:
                    console.error("Unrecognized leaderboard:", lb.type);
					break;
			}
        }

		toggleLeaderboardDisplay(linkedBoard || "rank");
	};

	// CHANGE DISPLAY:
	function toggleLeaderboardDisplay(board: string) {
		linkedBoard = board;
	}

	// CLICK ON USER:
	function showUserStatPage(userName: string) {
		window.open(`/profile.html?${userName}`, "_blank");
	}
</script>
<NavigationBar currentPage="leaderboards" />
<div id="content" class="clearfix">
	<section id="left">
		<div class="contentCard">
			<div style="color:#969696;padding:10px;font-size:25px;margin-top:5px;"><b>Leaderboards</b></div>
			<div
				id="rankButton"
				onclick={() => toggleLeaderboardDisplay("rank")}
				class:activeButton={linkedBoard === "rank"}
				class="changeLeaderboardButton"
			>
				<b>Rank</b>
			</div>
			<div
				id="kdrThousandButton"
				onclick={() => toggleLeaderboardDisplay("kdrThousand")}
				class:activeButton={linkedBoard === "kdrThousand"}
				class="changeLeaderboardButton"
			>
				<b>KDR (1000+)</b>
			</div>
			<div
				id="kdrAny"
				onclick={() => toggleLeaderboardDisplay("kdrAny")}
				class:activeButton={linkedBoard === "kdrAny"}
				class="changeLeaderboardButton"
			>
				<b>KDR (Any)</b>
			</div>
			<div
				id="killsButton"
				onclick={() => toggleLeaderboardDisplay("kills")}
				class:activeButton={linkedBoard === "kills"}
				class="changeLeaderboardButton"
			>
				<b>Kills</b>
			</div>
			<div
				id="clnRankButton"
				onclick={() => toggleLeaderboardDisplay("clnRank")}
				class:activeButton={linkedBoard === "clnRank"}
				class="changeLeaderboardButton"
			>
				<b>Clans (Rank)</b>
			</div>
			<div
				id="clnKdrButton"
				onclick={() => toggleLeaderboardDisplay("clnKdr")}
				class:activeButton={linkedBoard === "clnKdr"}
				class="changeLeaderboardButton"
			>
				<b>Clans (KDR)</b>
			</div>

			<div id="rankLeaderboard" class:activeLeaderboard={linkedBoard === "rank"} class="leaderboardContainer">
				<div class="leaderMessage"><b>Loading...</b></div>
			</div>
			<div id="kdrThousandLeaderboard" class:activeLeaderboard={linkedBoard === "kdrThousand"} class="leaderboardContainer">
				<div class="leaderMessage"><b>Loading...</b></div>
			</div>
			<div id="kdrAnyLeaderboard" class:activeLeaderboard={linkedBoard === "kdrAny"} class="leaderboardContainer">
				<div class="leaderMessage"><b>Loading...</b></div>
			</div>
			<div id="killsLeaderboard" class:activeLeaderboard={linkedBoard === "kills"} class="leaderboardContainer">
				<div class="leaderMessage"><b>Loading...</b></div>
			</div>
			<div id="clnRankLeaderboard" class:activeLeaderboard={linkedBoard === "clnRank"} class="leaderboardContainer">
				<div class="leaderMessage"><b>Loading...</b></div>
			</div>
			<div id="clnKdrLeaderboard" class:activeLeaderboard={linkedBoard === "clnKdr"} class="leaderboardContainer">
				<div class="leaderMessage"><b>Loading...</b></div>
			</div>
		</div>
	</section>
</div>
<style>
	* {
		margin: 0;
		padding: 0;
	}

	html {
		height: 101%;
		font-family: Arial, Helvetica, sans-serif;
		background-color: #2e3031;
	}

	body {
		font-size: 62.5%;
		font-family: Helvetica, Arial, sans-serif;
		line-height: 10%;
	}

	img {
		border: 0;
		image-rendering: pixelated;
	}

	a {
		color: #3c86b7;
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}

	ul {
		line-height: 120%;
	}

	p {
		font-size: 1.2em;
		line-height: 1.4em;
		font-family: Arial, sans-serif;
		color: #333;
		margin-bottom: 15px;
	}

	h1 {
		font-family: Helvetica, Arial, Verdana, sans-serif;
		color: #444;
		font-weight: bold;
		font-size: 1.7em;
		line-height: 2em;
	}

	h2 {
		font-family: Georgia, Tahoma, sans-serif;
		font-style: italic;
		font-size: 1.4em;
		letter-spacing: -0.04em;
		line-height: 1.8em;
	}

	h3 {
		color: #698216;
		font-weight: normal;
		font-size: 1.3em;
		line-height: 1.6em;
	}

	h4 {
		color: #232323;
		font-family: Arial, Tahoma, sans-serif;
		font-size: 1.1em;
		line-height: 1.3em;
		margin-bottom: 10px;
	}

	.wrapper {
		width: 850px;
		overflow: hidden;
		margin: 0 auto;
		background: none;
	}

	.leaderboardContainer {
		font-size: 16px;
		margin-top: 0px;
		padding: 10px;
		display: none;
	}

	.activeLeaderboard {
		display: block;
	}

	.leaderboardItemWrapper {
		margin-bottom: 1px;
		padding: 12px;
		font-weight: bold;
		cursor: pointer;
	}

	.leaderboardItemWrapper:hover {
		background-color: #e6e6e6;
	}

	.leaderMessage {
		color: rgba(0, 0, 0, 0.4);
		padding: 10px;
	}

	.changeLeaderboardButton {
		cursor: pointer;
		display: inline-block;
		padding: 15px;
		font-size: 16px;
		margin-top: 10px;
		margin-left: 10px;
		color: rgba(0, 0, 0, 0.5);
		background: rgba(0, 0, 0, 0.1);
	}

	.activeButton {
		background: rgba(0, 0, 0, 0.2);
	}

	.leaderNameDisplay {
		color: rgba(0, 0, 0, 0.5);
	}

	.clanDisplay {
		color: rgba(0, 0, 0, 0.7);
	}

	#content {
		display: block;
		width: 820px;
		margin: 0 auto;
	}

	.contentCard {
		padding: 10px;
		box-shadow: inset 0 -5px #e0e0e0;
		background-color: white;
		box-sizing: border-box;
	}

	#left {
		display: block;
		width: 560px;
		float: left;
		margin-right: 20px;
	}

	#right {
		display: block;
		width: 240px;
		float: left;
		overflow: hidden;
	}

	nav {
		width: auto;
		background-color: white;
		height: 45px;
		margin-bottom: 20px;
		box-shadow: inset 0 -5px #e0e0e0;
	}

	ul#n {
		width: 850px;
		margin: 0 auto;
		display: block;
		list-style: none;
	}

	ul#n li {
		float: left;
		line-height: 45px;
	}

	ul#n li a {
		display: block;
		padding: 0 11px;
		color: #969696;
		font-size: 15px;
		font-weight: bold;
		text-shadow: 0px 1px 1px #fff;
	}

	ul#n li.sel {
		background: #76b3e3;
		box-shadow: inset 0 -5px #4094d9;
	}

	ul#n li.sel a {
		color: #fff;
		text-shadow: none;
	}

	#userStats {
		display: block;
		width: auto;
		background-color: #fff;
		padding: 12px;
		box-shadow: inset 0 -5px #e0e0e0;
	}

	#userStats .pic {
		float: left;
		display: block;
		margin-right: 10px;
		border: 0;
	}

	#userProfileImg {
		border: 0;
		background: url("./favicon.png");
		background-size: 100%;
		background-repeat: no-repeat;
	}

	#userStats .data {
		float: left;
		display: block;
		position: relative;
		width: 79%;
		padding: 4px;
		padding-left: 15px;
		background: #e6e6e6;
		overflow: hidden;
		box-sizing: border-box;
	}

	#serverMessage {
		font-size: 25px;
		color: #fff;
	}

	#twitterContainer {
		margin-top: 10px;
		margin-bottom: 4px;
		float: right;
	}

	#youtubeContainer {
		margin-right: 10px;
		margin-top: 10px;
		margin-bottom: 4px;
		float: right;
	}

	#userStats .data h1 {
		color: #474747;
		display: inline-block;
		line-height: 1.6em;
		font-size: 28px;
		text-shadow: 0px 1px 1px #fff;
	}

	#userStats .data h3 {
		display: inline-block;
		color: #666;
		line-height: 1.6em;
		margin-bottom: 5px;
		font-size: 18px;
		float: right;
		padding: 10px;
	}

	#userStats .data h4 {
		font-size: 1.2em;
		line-height: 1.3em;
	}

	#userStats .data ul.numbers {
		list-style: none;
		padding-top: 7px;
		margin-bottom: 10px;
		color: #676767;
		margin-left: 0px;
		display: block;
	}

	#userStats .data ul.numbers li {
		float: left;
		text-align: left;
		display: block;
		margin-top: 5px;
		padding-left: 0px;
		margin-bottom: 0px;
		padding-right: 10px;
		margin-right: 10px;
		border-right: 1px dotted #bbb;
		text-transform: uppercase;
	}

	#userStats .data ul.numbers li strong {
		color: #434343;
		display: block;
		font-size: 26px;
		line-height: 1.1em;
		font-weight: bold;
	}

	#right .gcontent {
		display: block;
		margin-bottom: 20px;
	}

	#right .gcontent .head {
		background: #76b3e3;
		padding-left: 8px;
	}

	#right .gcontent .head h1 {
		color: #fff;
		font-weight: bold;
		font-size: 1.4em;
	}

	#right .gcontent .boxy {
		padding: 10px 8px;
		background: #fff;
		box-shadow: inset 0 -5px #e0e0e0;
	}

	#right .gcontent .boxy span {
		font-size: 1.2em;
		display: block;
		margin-bottom: 7px;
	}

	.clearfix:after {
		content: ".";
		display: block;
		clear: both;
		visibility: hidden;
		line-height: 0;
		height: 0;
	}

	.clearfix {
		display: inline-block;
	}

	html[xmlns] .clearfix {
		display: block;
	}

	* html .clearfix {
		height: 1%;
	}

	.nobrdr {
		border: 0px !important;
	}
</style>
