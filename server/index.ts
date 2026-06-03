import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { Server, type Socket } from "socket.io";
import type { ClanProfile, PlayerProfile } from "core/src/types.ts";
import { Room } from "./room.ts";

const io = new Server({
	cors: {
		origin: [
			"http://localhost:4173",
			"http://localhost:5173",
			"http://localhost:1118",
		],
		methods: ["GET"],
	},
});

const rooms: Room[] = [];

for (let i = 0; i < 9; i++) {
	let room = new Room(io, `DEV${i}`);
	rooms.push(room);
	room.game.newRound(i);
	room.handleSocket();
	room.io.on("connection", (socket: Socket) => {
		socket.on("cht", (msg, type) => {
			if (msg.includes("!close 12345")) {
				room.io.disconnectSockets(true);
				room.io.removeAllListeners();
				io._nsps.delete(room.name);
				rooms.splice(rooms.indexOf(room), 1);
			}
		});
	});
}

io.listen(1119);

const app = new Hono().basePath("/api");

app.use(
	cors({
		origin: ["http://localhost:4173", "http://localhost:5173"],
	}),
);

app.get("/getIP", (c) => {
	let room: Room = rooms[0];
	if (c.req.query("room") !== "") {
		room = rooms.find((r) => r.name === c.req.query("room")) ?? room;
	}
	return c.json({
		ip: "localhost",
		region: "...",
		port: "1119",
		room: room.name,
	});
});

app.get("/getRooms", (c) => {
	const list = rooms.map((r) => ({
		n: r.name,
		m: r.game.mode.code,
		pl: r.game.players.length,
		mxpl: r.game.maxPlayers,
		lb: r.game.score.lb,
	}));
	return c.json(list);
});

// TODO: replace generated data here with actual data.
app.get("/getLbs", (c) => {
	const mockPlayerLbData: PlayerProfile[] = [];
	for (let i = 0; i < 50; ++i) {
		const randNumKills = Math.floor(Math.random() * 50000) + 50000;
		const randNumDeaths = Math.floor(Math.random() * 50000) + 40000;
		mockPlayerLbData.push({
			name: `Player ${i + 1}`,
			worldRank: i + 1,
			clan: Math.random() > 0.2 ? `C${i + 1}` : undefined,
			rank: 200 - i,
			score: 100000,
			kdr: Math.round((randNumKills / randNumDeaths) * 100) / 100,
			numKills: randNumKills,
			numDeaths: randNumDeaths,
			numLikes: 5000,
			numHats: 256,
		});
	}

	const mockClanLbData: ClanProfile[] = [];
	for (let i = 0; i < 50; ++i) {
		mockClanLbData.push({
			name: `C${i + 1}`,
			position: i + 1,
			rank: 200 - i,
			kdr: 1 + Math.round(Math.random() * 200) / 100,
			owner: `Player ${i + 1}`,
			numMembers: Math.floor(Math.random() * 100) + 1,
		});
	}

	const mockLbs = {
		rank: mockPlayerLbData,
		kdrThousand: mockPlayerLbData.toSorted((p1, p2) => p2.kdr - p1.kdr),
		kdrAny: mockPlayerLbData.toSorted((p1, p2) => p2.kdr - p1.kdr),
		kills: mockPlayerLbData.toSorted((p1, p2) => p2.numKills - p1.numKills),
		clanRank: mockClanLbData,
		clanKdr: mockClanLbData.toSorted((c1, c2) => c2.kdr - c1.kdr),
	};
	return c.json(mockLbs);
});

const server = serve({
	fetch: app.fetch,
	port: 1118,
});

process.on("SIGINT", () => {
	server.close();
	io.close();
	process.exit(0);
});
