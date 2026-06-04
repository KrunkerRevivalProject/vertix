<script lang="ts">
	import { st } from "../state.svelte";
	import type { Player } from "../types";
	import { getItemRarityColor, TeamColors } from "../utils";

	type StatTableRow = {
		player: Player;
		cells: StatTableCell[];
	};

	type StatTableCell = {
		className: string;
		text: string | number;
		color: string;
		canClick?: boolean;
		hoverInfo?: StatTableCellHoverInfo;
		pos?: number;
	};

	type StatTableCellHoverInfo = {
		id: string;
		type: "hat" | "shirt" | "camo";
		name: string;
		chance: number;
		duplicate: boolean;
		desc?: string;
		weaponName?: string;
		creator?: string;
	};

	const isZoneWar = $derived(st.gameMap?.gameMode.code === "zmtch");

	const data = $derived.by(() => {
		const rows: StatTableRow[] = [];

		const sortedPlayers = st.players.toSorted(sortPlayersByScore);
		for (const player of sortedPlayers) {
			if (!player.team) continue;

			rows.push({
				player,
				cells: [
					{
						text: player.name,
						className: "contL",
						canClick: player.loggedIn,
						color:
							player.index === st.player.index
								? "#fff"
								: player.team !== st.player.team
									? TeamColors.Red
									: TeamColors.Blue,
					},
					{
						text: player.score || 0,
						className: "contC",
						color: "#fff",
					},
					{
						text: player.kills || 0,
						className: "contC",
						color: "#fff",
					},
					{
						text: player.deaths || 0,
						className: "contC",
						color: "#fff",
					},
					{
						text: player.totalDamage || 0,
						className: "contC",
						color: "#fff",
					},
					{
						text: (isZoneWar ? player.totalGoals : player.totalHealing) || 0,
						className: "contC",
						color: "#fff",
					},
					{
						text: player.lastItem?.name ?? "No Reward",
						className: "rewardText",
						color: player.lastItem ? getItemRarityColor(player.lastItem.chance) : "#fff",
						hoverInfo: player.lastItem,
					},
					{
						text: player.likes || 0,
						className: "contC",
						color: "#fff",
						pos: player.index,
					},
				],
			});
		}

		return rows;
	});

	function sortPlayersByScore(a: Player, b: Player) {
		if (a.score !== b.score) {
			return b.score - a.score;
		}
		return b.id - a.id;
	}

	function onClickCell(cell: StatTableCell) {
		if (cell.className === "contL" && cell.canClick) {
			window.open(`/profile.html?${cell.text}`, "_blank");
		}
	}

	function onNice(playerId: number) {
		document.getElementById("cvs")!.focus();
		st.socket?.emit("like", playerId);
		st.currentLiked = st.currentLiked === playerId ? null : playerId;
	}
</script>

<div id="gameStatWrapper">
	<p id="nextGameTimer"></p>
	<div id="gameStatsContainer">
		<p id="winningTeamText"></p>
		<table id="gameStatBoard" style:width="100%">
			<thead>
				<tr>
					<th class="headerL">NAME</th>
					<th class="headerC">SCORE</th>
					<th class="headerC">KILLS</th>
					<th class="headerC">DEATHS</th>
					<th class="headerC">DAMAGE</th>
					<th class="headerC">{isZoneWar ? "GOALS" : "HEALING"}</th>
					<th class="headerC">REWARD</th>
				</tr>
			</thead>
			<tbody>
				{#each data as row}
					<tr>
						{#each row.cells as cell}
							<td class={cell.className} style:color={cell.color} onclick={() => onClickCell(cell)}>
								<span>{cell.text}</span>
								{#if cell.hoverInfo}
									<div class="hoverTooltip">
										{#if cell.hoverInfo.type === "hat"}
											<img class="hatDisplayImage" src={`/images/hats/${cell.hoverInfo.id}/d.png`}>
											<div class="rewardName" style:color={cell.color}>
												{cell.hoverInfo.name}
											</div>
											<div class="rewardDropRate">droprate {cell.hoverInfo.chance}%</div>
											<div class="rewardSubText" style:color={cell.hoverInfo.duplicate ? "#e04141" : "#d8d8d8"}>
												<i>{cell.hoverInfo.duplicate ? "Duplicate" : "Wearable"}</i>
											</div>
											<div class="rewardDescription">{cell.hoverInfo.desc}</div>
											{#if cell.hoverInfo.creator !== "EatMyApples"}
												<div class="rewardCreator">
													<i>Artist: {cell.hoverInfo.creator}</i>
												</div>
											{/if}
										{:else if cell.hoverInfo.type === "shirt"}
											<img class="shirtDisplayImage" src={`/images/shirts/${cell.hoverInfo.id}/d.png`}>
											<div class="rewardName" style:color={cell.color}>
												{cell.hoverInfo.name}
											</div>
											<div class="rewardDropRate">droprate {cell.hoverInfo.chance}%</div>
											<div class="rewardSubText" style:color={cell.hoverInfo.duplicate ? "#e04141" : "#d8d8d8"}>
												<i>{cell.hoverInfo.duplicate ? "Duplicate" : "Wearable"}</i>
											</div>
											<div class="rewardDescription">{cell.hoverInfo.desc}</div>
										{:else}
											<img class="camoDisplayImage" src={`/images/camos/${cell.hoverInfo.id + 1}.png`}>
											<div class="rewardName" style:color={cell.color}>
												{cell.hoverInfo.name}
											</div>
											<div class="rewardDropRate">droprate {cell.hoverInfo.chance}%</div>
											<div class="rewardSubText" style:color={cell.hoverInfo.duplicate ? "#e04141" : "#d8d8d8"}>
												<i>{cell.hoverInfo.duplicate ? "Duplicate" : "weapon camo"}</i>
											</div>
											<div class="rewardDescription">{cell.hoverInfo.weaponName}</div>
										{/if}
									</div>
								{/if}
							</td>
						{/each}
						{#if row.player.id !== st.player.id}
							<td>
								<button
									type="button"
									class={row.player.id === st.currentLiked ? "gameStatLikeButtonA" : "gameStatLikeButton"}
									onclick={() => onNice(row.player.id)}
								>
									NICE
								</button>
							</td>
							<td>
								<span class="likeStat">{st.player.likes ?? 0}</span>
							</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<div id="voteModeContainer"></div>
</div>

<style>
	#gameStatWrapper {
		text-align: center;
		display: none;
		pointer-events: none;
		z-index: 2;
		position: absolute;
		top: 45%;
		left: 50%;
		margin-right: -50%;
		transform: translate(-50%, -50%) scale(1);
	}

	#voteModeContainer {
		pointer-events: none;
		width: 100%;
		margin-bottom: 8px;
	}

	.modeVoteButton {
		cursor: pointer;
		pointer-events: auto;
		background: rgba(0, 0, 0, 0.15);
		color: white;
		margin: 8px;
		font-size: 14px;
		width: 28%;
		display: inline-block;
		text-align: center;
		vertical-align: middle;
		line-height: 36px;
		border: 0;
	}

	.modeVoteButton:active {
		background-color: rgba(255, 255, 255, 0.2);
	}

	.modeVoteButton:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.modeVoteButtonA {
		cursor: pointer;
		pointer-events: auto;
		background: rgba(255, 255, 255, 0.2);
		color: white;
		margin: 8px;
		font-size: 14px;
		width: 28%;
		display: inline-block;
		text-align: center;
		vertical-align: middle;
		line-height: 36px;
		border: 0;
	}

	.modeVoteButtonA:active {
		background-color: rgba(255, 255, 255, 0.25);
	}

	.modeVoteButtonA:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}

	#winningTeamText {
		margin-top: 2px;
		margin-bottom: 2px;
		font-size: 20px;
	}

	#nextGameTimer {
		color: var(--white);
		font-size: 18px;
	}

	#gameStatsContainer {
		display: inline-block;
		padding: 20px;
		background-color: rgba(0, 0, 0, 0.2);
		margin-bottom: 10px;
		vertical-align: top;
		color: var(--white);
		text-align: center;
		font-size: 19px;
	}

	#gameStatBoard {
		text-align: center;
		border-collapse: separate;
		border-spacing: 22px 5px;
	}

	#gameStatBoard .headerL {
		text-align: left;
		font-size: 17px;
		color: var(--white);
	}

	#gameStatBoard .headerC {
		font-size: 17px;
		color: var(--white);
	}

	#gameStatBoard .contL {
		pointer-events: all;
		cursor: pointer;
		text-align: left;
		max-width: 250px;
		overflow: hidden;
		font-size: 13px;
		text-overflow: ellipsis;
		position: relative;
	}

	#gameStatBoard .contC {
		font-size: 13px;
	}

	.gameStatLikeButton {
		font-size: 15px;
		color: #232323;
		background-color: #eaeaea;
		pointer-events: auto;
	}

	.gameStatLikeButton:active {
		background-color: #a2a2a2;
	}

	.gameStatLikeButton:hover {
		background-color: #cecece;
	}

	.likeStat {
		font-size: 13px;
	}

	.gameStatLikeButtonA {
		font-size: 15px;
		color: #232323;
		background-color: #a2a2a2;
		pointer-events: auto;
	}

	.rewardName {
		font-size: 16px;
		margin-top: 5px;
	}

	.rewardDropRate {
		color: "#ffd100";
		font-size: 12px;
		margin-top: 0px;
	}

	.rewardSubText {
		color: "#e04141";
		font-size: 8px;
		margin-top: 1px;
	}

	.rewardDescription {
		font-size: 12px;
		margin-top: 5px;
	}

	.rewardCreator {
		color: "#d8d8d8";
		font-size: 8px;
		margin-top: 5px;
	}
</style>
