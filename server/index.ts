import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { Server, type Socket } from "socket.io";
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

const app = new Hono();

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

// Temp data.
const MOCK_PLAYER_LB_ENTRIES = [
	{
		name: "Lord Melorak",
		position: 1,
		clan: " A1 ",
		rank: 383,
		score: 42006308,
		kdr: 3.67,
		numKills: 308045,
		numDeaths: 83959,
		numLikes: 13086,
		numHats: 156,
	},
	{
		name: "Dr.K",
		position: 2,
		clan: "ＮＯＶＡ",
		rank: 339,
		score: 36470728,
		kdr: 2.48,
		numKills: 318081,
		numDeaths: 128460,
		numLikes: 11111,
		numHats: 256,
	},
];
const MOCK_CLAN_LB_ENTRIES = [
	{
		name: "s8n",
		position: 1,
		rank: 209,
		kdr: 11.44,
		owner: "meatman2tasty",
		numMembers: 136,
	},
	{
		name: "Ani",
		position: 2,
		rank: 198,
		kdr: 2.08,
		owner: "Animaker",
		numMembers: 93,
	},
];

app.get("/getLbs", (c) => {
	const mockLbs = {
		rank: MOCK_PLAYER_LB_ENTRIES,
		kdrThousand: MOCK_PLAYER_LB_ENTRIES,
		kdrAny: MOCK_PLAYER_LB_ENTRIES,
		kills: MOCK_PLAYER_LB_ENTRIES,
		clanRank: MOCK_CLAN_LB_ENTRIES,
		clanKdr: MOCK_CLAN_LB_ENTRIES,
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
