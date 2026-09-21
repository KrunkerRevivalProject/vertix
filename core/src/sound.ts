import { st } from "./state.svelte.ts";
import { getDistance } from "./utils.ts";

// todo logic cleanup

let ctx: AudioContext | undefined;
let soundList: Record<
	string,
	{
		loc: string;
		id: string;
		buffer: AudioBuffer;
		loop: boolean;
		onload?: () => void;
	}
> = {};
// active one-shot sources, so stopAllSounds can cut them off
const activeSources = new Set<AudioBufferSourceNode>();
// persistent sources for the looping music tracks
const trackSources: Record<string, AudioBufferSourceNode | undefined> = {};
const trackGains: Record<string, GainNode | undefined> = {};
const soundMeta = [
	{
		loc: "weapons/smg",
		id: "shot0",
		loop: false,
	},
	{
		loc: "weapons/revolver",
		id: "shot1",
		loop: false,
	},
	{
		loc: "weapons/sniper",
		id: "shot2",
		loop: false,
	},
	{
		loc: "weapons/toygun",
		id: "shot3",
		loop: false,
	},
	{
		loc: "weapons/shotgun",
		id: "shot4",
		loop: false,
	},
	{
		loc: "weapons/grenades",
		id: "shot5",
		loop: false,
	},
	{
		loc: "weapons/rockets",
		id: "shot6",
		loop: false,
	},
	{
		loc: "weapons/pistol",
		id: "shot7",
		loop: false,
	},
	{
		loc: "weapons/minigun",
		id: "shot8",
		loop: false,
	},
	{
		loc: "weapons/flamethrower",
		id: "shot9",
		loop: false,
	},
	{
		loc: "characters/footstep1",
		id: "step1",
		loop: false,
	},
	{
		loc: "characters/jump1",
		id: "jump1",
		loop: false,
	},
	{
		loc: "characters/death1",
		id: "death1",
		loop: false,
	},
	{
		loc: "characters/kill1",
		id: "kill1",
		loop: false,
	},
	{
		loc: "special/explosion",
		id: "explosion",
		loop: false,
	},
	{
		loc: "special/score",
		id: "score",
		loop: false,
	},
	{
		loc: "tracks/track1",
		id: "track1",
		loop: true,
		onload: () => {
			if (st.player.dead && !st.startingGame) {
				playTrack("track1");
				currentTrack = 1;
			}
		},
	},
	{
		loc: "tracks/track2",
		id: "track2",
		loop: true,
		onload: () => {
			if (!st.player.dead && st.gameStart && !st.gameOver) {
				playTrack("track2");
				currentTrack = 2;
			}
		},
	},
];
export function loadSounds(base: string) {
	if (!st.doSounds) {
		return false;
	}
	soundList = {};
	for (const meta of soundMeta) {
		const tmpSound = localStorage.getItem(`${base + meta.loc}data`);
		const tmpFormat = localStorage.getItem(`${base + meta.loc}format`);
		if (!tmpSound || !tmpFormat) {
			console.error(`sound info for ${meta.id} ${meta.loc} is missing from localstorage`);
			continue;
		}
		loadSound(tmpSound, meta);
	}
}
async function loadSound(src: string, sound: (typeof soundMeta)[number]) {
	try {
		stopTrack(sound.id);
		const res = await fetch(src);
		const data = await res.arrayBuffer();
		ctx ??= new AudioContext();
		const buffer = await ctx.decodeAudioData(data);
		soundList[sound.id] = {
			...sound,
			buffer,
		};
		sound.onload?.();
	} catch (e) {
		console.error(`failed to load sound ${sound.id} ${sound.loc}`, e);
	}
}
function getCtx() {
	ctx ??= new AudioContext();
	// autoplay policy: context starts suspended until a user gesture
	if (ctx.state === "suspended") {
		ctx.resume().catch(() => {});
	}
	return ctx;
}
function playBuffer(buffer: AudioBuffer, loop: boolean, volume: number, gainNode?: GainNode) {
	const audioCtx = getCtx();
	const source = audioCtx.createBufferSource();
	source.buffer = buffer;
	source.loop = loop;
	const gain = gainNode ?? audioCtx.createGain();
	gain.gain.value = volume;
	source.connect(gain);
	gain.connect(audioCtx.destination);
	source.onended = () => activeSources.delete(source);
	source.start();
	activeSources.add(source);
	return source;
}
function playTrack(id: string) {
	const entry = soundList[id];
	if (!entry || !ctx) {
		return;
	}
	stopTrack(id);
	const gain = ctx.createGain();
	trackGains[id] = gain;
	trackSources[id] = playBuffer(entry.buffer, entry.loop, 0, gain);
	fadeGain(gain, 0, 1, 1000);
}
function stopTrack(id: string) {
	const source = trackSources[id];
	if (source) {
		try {
			source.stop();
		} catch {
			// already stopped
		}
		source.disconnect();
		trackSources[id] = undefined;
		trackGains[id]?.disconnect();
		trackGains[id] = undefined;
	}
}
function fadeGain(gain: GainNode, from: number, to: number, durationMs: number) {
	const audioCtx = getCtx();
	const now = audioCtx.currentTime;
	gain.gain.cancelScheduledValues(now);
	gain.gain.setValueAtTime(from, now);
	gain.gain.linearRampToValueAtTime(to, now + durationMs / 1000);
}
var currentTrack = 0;
export function startSoundTrack(id: number) {
	if (!st.doSounds || !soundList.track1 || !soundList.track2) {
		return false;
	}
	try {
		if (id === 1) {
			if (currentTrack !== id) {
				currentTrack = id;
				playTrack("track1");
			}
			stopTrack("track2");
		} else {
			if (currentTrack !== id) {
				currentTrack = id;
				playTrack("track2");
			}
			stopTrack("track1");
		}
	} catch (b) {
		console.log(b);
	}
}
var maxHearDist = 1500;
export function playSound(soundId: string, x: number, y: number) {
	if (!st.kicked && st.doSounds) {
		try {
			const dist = getDistance(st.player.x, st.player.y, x, y);
			if (dist <= maxHearDist) {
				const soundEntry = soundList[soundId];
				if (soundEntry !== undefined) {
					playBuffer(
						soundEntry.buffer,
						soundEntry.loop,
						Math.round((1 - dist / maxHearDist) * 10) / 10,
					);
				}
			}
		} catch (e) {
			console.log(e);
		}
	}
}
export function stopAllSounds() {
	if (!st.doSounds) {
		return false;
	}
	for (const meta of soundMeta) {
		stopTrack(meta.id);
	}
	for (const source of activeSources) {
		try {
			source.stop();
		} catch {
			// already stopped
		}
	}
	activeSources.clear();
}
