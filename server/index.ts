import Fastify from "fastify";
import path from "node:path";
import statc from "@fastify/static";
import cors from "@fastify/cors";
import { Server, type Socket } from "socket.io";

const server = Fastify({
	logger: {
		name: "static",
		level: "warn",
	},
});
server.register(cors, {
	origin: /localhost:1118|localhost:1119/
})
server.register(statc, {
	root: path.join(import.meta.dirname, "..", "public"),
});

server.get("/getIP", (req, res) => {
	return { ip: "localhost", region: "...", port: "1119" };
});

server.listen({ port: 1118 });

const io = new Server({
	cors: {
		origin: "http://localhost:1118",
		methods: ["GET"]
	}
});

let lastPlayerID = 0;
let players = {};

io.on("connection", (socket: Socket) => {
	console.log("con", socket.id);

	let player = {
		index: lastPlayerID++,
		name: "Sidney",
		type: "player",
		team: "blue",
		weapons: [{ weaponIndex: 0, ammo: 30 }],
		dead: true,
		speed: 1,
		classIndex: 0,
		currentWeapon: 0,
		health: 100,
		score: 0,
		angle: 0,
		frameCountdown: 0,
	};
	players[socket.id] = player;

	socket.emit("welcome", { id: 0, room: "DEV" }, {});
	socket.on("create", (room, servPass, lgKey, userName) => {

	})

	socket.conn.on("packet", ({ type, data }) => {
		if (data?.includes("ping1") || data?.includes("hdt") || data?.includes('2["0",')) return;
		console.log(data);
	});

	socket.on("cht", (msg, type) => {
		socket.emit("cht", [-1, "blehhhhh"]);
		socket.emit("5", "woah!!!");
	});
	socket.on("ping1", () => {
		socket.emit("pong1");
	});
	socket.on("gotit", (lobby, unknown, currentTime) => {
		console.log("gotit", lobby, unknown, currentTime);
	});
	socket.on("disconnect", () => {
		io.emit("rem", player.index);
		delete players[socket.id];
		console.log("disconnected");
	});
	socket.on("respawn", () => {
		player.dead = false;
		player.health = 100;
		player.weapons = [{ weaponIndex: 0, ammo: 30 }];
		player.currentWeapon = 0;
		player.angle = 0;

		const gameSetup = {
			mapData: {
				gameMode: {
					name: "Team Deathmatch",
					score: 50,
					desc1: "you are team RED",
					desc2: "you are team BLUE"
				},
				clutter: [],
				genData: { "width": 16, "height": 16, "data": [255, 0, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255] },
				pickups: [],
			},

			maxScreenWidth: 1920,
			maxScreenHeight: 1080,
			viewMult: 2,
			tileScale: 256,

			usersInRoom: [],
			you: { ...player }
		};

		socket.emit("gameSetup", JSON.stringify(gameSetup), true, true,);
		socket.emit("rsd", [4, 0, 0, 0]);
		socket.emit("tprt", { indx: 0, newX: 0, newY: 0 })
		socket.emit("add", JSON.stringify({ ...player }));
	});

	//TODO: socket.emit stuff
	//socket.emit("rsd", {}) //receiveServerData
	//socket.emit("upd", {)  //updateUserValue
	//socket.emit("2", {})   //someoneShot
	//socket.emit("r", {})   //currentWeapon
	//socket.emit("jum", {}) //otherJump

	//TODO: socket.on stuff
	socket.on("1", (x, y, jumpY, targetF, targetD, currentTime) => {
		//console.log("1", x, y, jumpY, targetF, targetD, currentTime);
	});
	socket.on("4", (data) => {
		let horizontalDT = data.hdt
		let verticalDT = data.vdt
		let currentTime = data.ts
		let inputNumber = data.isn
		//console.log("4", horizontalDT, verticalDT, currentTime, inputNumber);
	});
	socket.on("sw", (currentWeapon) => {
		//console.log(currentWeapon)
	});
	socket.on("r", () => {

	});
	socket.on("0", (targetF) => {
		//console.log(targetF)
	});
	socket.on("ftc", (playerID) => {
		//console.log(playerID)
	});
});

io.listen(1119);
