export function Projectile() {
	this.speed =
		this.width =
		this.height =
		this.jumpY =
		this.yOffset =
		this.dir =
		this.cEndY =
		this.cEndX =
		this.startY =
		this.y =
		this.startX =
		this.x =
			0;
	this.active = false;
	this.weaponIndex = this.spriteIndex = this.pierceCount = 0;
	this.glowHeight = this.glowWidth = null;
	this.speed = this.trailWidth = this.trailMaxLength = this.trailAlpha = 0;
	this.owner = null;
	this.dmg = 0;
	this.lastHit = "";
	this.serverIndex = null;
	this.skipMove = true;
	this.startTime = 0;
	this.maxLifeTime = null;
	this.explodeOnDeath = false;
	this.updateAccuracy = 3;
	this.bounce = false;
	this.dustTimer = 0;
	this.update = function (
		delta: number,
		currentTime: number,
		clutter: any,
		tiles: any,
		players: any,
	) {
		if (this.active) {
			let lifetime = currentTime - this.startTime;
			if (this.skipMove) {
				lifetime = 0;
				this.startTime = currentTime;
			}
			for (let g = 0; g < this.updateAccuracy; ++g) {
				let vel = this.speed * delta;
				if (this.active) {
					let changeX = (vel * Math.cos(this.dir)) / this.updateAccuracy;
					let changeY = (vel * Math.sin(this.dir)) / this.updateAccuracy;
					if (this.active && !this.skipMove && this.speed > 0) {
						this.x += changeX;
						this.y += changeY;
						if (
							getDistance(this.startX, this.startY, this.x, this.y) >=
							this.trailMaxLength
						) {
							this.startX += changeX;
							this.startY += changeY;
						}
					}
					this.cEndX =
						this.x +
						((vel + this.height) * Math.cos(this.dir)) / this.updateAccuracy;
					this.cEndY =
						this.y +
						((vel + this.height) * Math.sin(this.dir)) / this.updateAccuracy;
					for (vel = 0; vel < clutter.length; ++vel) {
						k = clutter[vel];
						if (
							this.active &&
							k.type == "clutter" &&
							k.active &&
							k.hc &&
							this.canSeeObject(k, k.h) &&
							k.h * k.tp >= this.yOffset &&
							this.lineInRect(k.x, k.y - k.h, k.w, k.h - this.yOffset, true)
						) {
							if (this.bounce) {
								this.bounceDir(
									this.cEndY <= k.y - k.h || this.cEndY >= k.y - this.yOffset,
								);
							} else {
								this.active = false;
								this.hitSomething(false, 2);
							}
						}
					}
					if (this.active) {
						var k;
						for (var h = 0; vel < tiles.length; ++vel) {
							if (this.active) {
								k = tiles[vel];
								if (k.wall && k.hasCollision && this.canSeeObject(k, k.scale)) {
									if (k.bottom) {
										if (this.lineInRect(k.x, k.y, k.scale, k.scale, true)) {
											this.active = false;
										}
									} else if (
										this.lineInRect(
											k.x,
											k.y,
											k.scale,
											k.scale - this.owner.height - this.jumpY,
											true,
										)
									) {
										this.active = false;
									}
									if (!this.active) {
										if (this.bounce) {
											this.bounceDir(
												!(this.cEndX <= k.x) && !(this.cEndX >= k.x + k.scale),
											);
										} else {
											this.hitSomething(
												!(this.cEndX <= k.x) && !(this.cEndX >= k.x + k.scale),
												2,
											);
										}
									}
								}
							}
						}
					}
					if (this.active) {
						for (
							let i = 0;
							i < players.length &&
							((k = players[i]),
							k.index == this.owner.index ||
								!(this.lastHit.indexOf(`,${k.index},`) < 0) ||
								k.team == this.owner.team ||
								k.type != "player" ||
								!k.onScreen ||
								k.dead ||
								(this.lineInRect(
									k.x - k.width / 2,
									k.y - k.height - k.jumpY,
									k.width,
									k.height,
									this.pierceCount <= 1,
								) &&
									k.spawnProtection <= 0 &&
									(this.explodeOnDeath
										? (this.active = false)
										: this.dmg > 0 &&
											((this.lastHit += `${k.index},`),
											this.spriteIndex != 2 &&
												//(particleCone(
												//	12,
												//	k.x,
												//	k.y - k.height / 2 - k.jumpY,
												//	this.dir + Math.PI,
												//	Math.PI / randomInt(5, 7),
												//	0.5,
												//	16,
												//	0,
												//	true,
												//),
												//createLiquid(k.x, k.y, this.dir, 4)),
												this.pierceCount > 0 &&
												this.pierceCount--,
											this.pierceCount <= 0 && (this.active = false))),
								this.active));
							++i
						);
					}
					if (this.maxLifeTime != null && lifetime >= this.maxLifeTime) {
						this.active = false;
					}
				}
			}
			if (this.spriteIndex === 1) {
				this.dustTimer -= delta;
				if (this.dustTimer <= 0) {
					//stillDustParticle(this.x, this.y, true);
					this.dustTimer = 20;
				}
			}
		} else if (!this.active && this.trailAlpha > 0) {
			this.trailAlpha -= delta * 0.001;
			if (this.trailAlpha <= 0) {
				this.trailAlpha = 0;
			}
		}
		this.skipMove = false;
	};
	this.activate = function () {
		this.skipMove = true;
		this.lastHit = ",";
		this.active = true;
		//playSound(`shot${this.weaponIndex}`, this.x, this.y);
	};
	this.canSeeObject = function (a, b) {
		let f = Math.abs(this.cEndX - a.x);
		let h = Math.abs(this.cEndY - a.y);
		return f <= (b + this.height) * 2 && h <= (b + this.height) * 2;
	};
	this.deactivate = function () {
		this.active = false;
	};
	this.hitSomething = function (a, b) {
		if (this.spriteIndex !== 2) {
			//particleCone(
			//	10,
			//	this.cEndX,
			//	this.cEndY,
			//	this.dir + Math.PI,
			//	Math.PI / randomInt(5, 7),
			//	0.5,
			//	16,
			//	b,
			//	a,
			//);
		}
	};
	this.bounceDir = function (a) {
		this.dir = a ? Math.PI * 2 - this.dir : Math.PI - this.dir;
		this.active = true;
		this.speed *= 0.65;
		this.x = this.cEndX;
		this.y = this.cEndY;
	};
	this.lineInRect = function (a, b, d, e, f) {
		var g = this.x;
		var h = this.y;
		var k = g;
		var l = this.cEndX;
		if (k > l) {
			k = this.cEndX;
			l = g;
		}
		if (l > a + d) {
			l = a + d;
		}
		if (k < a) {
			k = a;
		}
		if (k > l) {
			return false;
		}
		var m = h;
		var p = this.cEndY;
		var q = this.cEndX - g;
		if (Math.abs(q) > 1e-7) {
			p = (this.cEndY - h) / q;
			g = h - p * g;
			m = p * k + g;
			p = p * l + g;
		}
		if (m > p) {
			k = p;
			p = m;
			m = k;
		}
		if (p > b + e) {
			p = b + e;
		}
		if (m < b) {
			m = b;
		}
		if (m > p) {
			return false;
		}
		if (f) {
			this.adjustOnCollision(a, b, d, e);
		}
		return true;
	};
	this.dotInRect = (a, b, d, e, f, h) =>
		a >= d && a <= d + f && b >= e && b <= e + h;
	this.adjustOnCollision = function (a, b, d, e) {
		let h = this.cEndX,
			g = this.cEndY;
		for (let f = 100; f > 0; ) {
			f--;
			if (this.dotInRect(h, g, a, b, d, e)) {
				f = 0;
			} else {
				h += Math.cos(this.dir + Math.PI) * 2;
				g += Math.sin(this.dir + Math.PI) * 2;
			}
		}
		for (let f = 100; f > 0; ) {
			f--;
			if (this.dotInRect(h, g, a, b, d, e)) {
				h += Math.cos(this.dir + Math.PI) * 2;
				g += Math.sin(this.dir + Math.PI) * 2;
			} else {
				f = 0;
			}
		}
		this.cEndX = h;
		this.cEndY = g;
		this.x = this.cEndX;
		this.y = this.cEndY;
	};
}
var bulletIndex = 0;
export function getNextBullet(bullets: any) {
	bulletIndex++;
	if (bulletIndex >= bullets.length) {
		bulletIndex = 0;
	}
	return bullets[bulletIndex];
}
export function shootNextBullet(
	init: any,
	source: any,
	targetD: number,
	currentTime: number,
	bullet: any,
) {
	let weapon = getCurrentWeapon(source);
	if (bullet !== undefined) {
		bullet.serverIndex = init.si;
		bullet.x = init.x - 1;
		bullet.startX = init.x;
		bullet.y = init.y;
		bullet.startY = init.y;
		bullet.dir = init.d;
		bullet.speed = weapon.bSpeed;
		bullet.updateAccuracy = weapon.cAcc;
		bullet.width = weapon.bWidth;
		bullet.height = weapon.bHeight;
		var randScale = weapon.bRandScale;
		if (randScale != null) {
			randScale = randomFloat(randScale[0], randScale[1]);
			bullet.width *= randScale;
			bullet.height *= randScale;
			bullet.speed *= 1 + weapon.spread[weapon.spreadIndex];
		}
		bullet.trailWidth = bullet.width * 0.7;
		bullet.trailMaxLength = Math.round(bullet.height * 5);
		bullet.trailAlpha = weapon.bTrail;
		bullet.weaponIndex = weapon.weaponIndex;
		bullet.spriteIndex = weapon.bSprite;
		bullet.yOffset = weapon.yOffset;
		bullet.jumpY = source.jumpY;
		bullet.owner = source;
		bullet.dmg = weapon.dmg;
		bullet.bounce = weapon.bounce;
		bullet.startTime = currentTime;
		bullet.maxLifeTime = weapon.maxLife;
		if (weapon.distBased) {
			bullet.maxLifeTime = targetD / bullet.speed;
		}
		bullet.glowWidth = weapon.glowWidth;
		bullet.glowHeight = weapon.glowHeight;
		bullet.explodeOnDeath = weapon.explodeOnDeath;
		bullet.pierceCount = weapon.pierce;
		bullet.activate();
	}
	bullet = null;
}
export function setupMap(a: any, mapTileScale: number) {
	var b = a.genData;
	var d = -(mapTileScale * 2);
	var e = -(mapTileScale * 2);
	var f = 0;
	var h = b.height;
	a.tilePerCol = h;
	a.width = (b.width - 4) * mapTileScale;
	a.height = (b.height - 4) * mapTileScale;
	a.scoreToWin = a.gameMode.score;
	var l = b.data.data || b.data;
	for (let i = 0; i < b.width; i++) {
		for (let j = 0; j < b.height; j++) {
			const tileDataBaseIdx = (b.width * j + i) << 2;
			let p =
				l[tileDataBaseIdx] +
				" " +
				l[tileDataBaseIdx + 1] +
				" " +
				l[tileDataBaseIdx + 2];
			const n = {
				index: f,
				scale: mapTileScale,
				x: 0,
				y: 0,
				wall: false,
				spriteIndex: 0,
				left: 0,
				right: 0,
				top: 0,
				bottom: 0,
				topLeft: 0,
				topRight: 0,
				bottomLeft: 0,
				bottomRight: 0,
				neighbours: 0,
				hasCollision: false,
				hardPoint: false,
				objTeam: "e",
				edgeTile: false,
			};
			n.x = d + mapTileScale * i;
			n.y = e + mapTileScale * j;
			if (i === 0 && j === 0) {
				p = "0 0 0";
			}
			let tmpTile: any;
			if (p === "0 0 0") {
				n.wall = true;
				n.hasCollision = true;
				tmpTile = a.tiles[f - h];
				if (tmpTile !== undefined) {
					if (tmpTile.wall) {
						n.left = 1;
						n.neighbours += 1;
					}
					tmpTile.right = 1;
					tmpTile.neighbours += 1;
				}
				tmpTile = a.tiles[f - h - 1];
				if (tmpTile?.wall) {
					tmpTile.spriteIndex = 0;
				}
				tmpTile = a.tiles[f - h - 1];
				if (tmpTile?.wall) {
					n.topLeft = 1;
					tmpTile.bottomRight = 1;
				}
				tmpTile = a.tiles[f - h + 1];
				if (tmpTile !== undefined) {
					tmpTile.topRight = 1;
					if (tmpTile.wall) {
						n.bottomLeft = 1;
					}
				}
				tmpTile = a.tiles[f - 1];
				if (tmpTile !== undefined) {
					if (tmpTile.wall) {
						n.top = 1;
						n.neighbours += 1;
					}
					tmpTile.bottom = 1;
					tmpTile.neighbours += 1;
				}
				if (i <= 0 || j <= 0 || i >= b.width - 1 || j >= b.height - 1) {
					n.left = 1;
					n.right = 1;
					n.top = 1;
					n.bottom = 1;
					n.neighbours = 4;
					n.edgeTile = true;
				}
				if (n.spriteIndex === 0 && randomInt(0, 2) === 0) {
					n.spriteIndex = randomInt(1, 2);
				}
			} else {
				tmpTile = randomInt(0, 10);
				n.spriteIndex = 0;
				if (tmpTile <= 0) {
					n.spriteIndex = 1;
				}
				n.wall = false;
				tmpTile = a.tiles[f - h];
				if (tmpTile?.wall) {
					n.left = 1;
					n.neighbours += 1;
				}
				tmpTile = a.tiles[f - 1];
				if (tmpTile?.wall) {
					n.top = 1;
					n.neighbours += 1;
				}
				tmpTile = a.tiles[f - h - 1];
				if (tmpTile?.wall) {
					n.topLeft = 1;
				}
				if (p === "0 255 0") {
					n.spriteIndex = 2;
				} else if (p === "255 255 0") {
					if (
						a.gameMode.name === "Hardpoint" ||
						a.gameMode.name === "Zone War"
					) {
						n.hardPoint = true;
						if (a.gameMode.name === "Zone War") {
							n.objTeam = i < b.width / 2 ? "red" : "blue";
						}
					} else {
						n.spriteIndex = 1;
					}
				}
			}
			a.tiles.push(n);
			f++;
		}
	}
	// tmpY = tmpShad = null;
	for (b = 0; b < a.tiles.length; ++b) {
		if (a.tiles[b].edgeTile) {
			a.tiles[b].hasCollision = false;
		} else if (!a.tiles[b].wall && a.tiles[b].hardPoint) {
			/*
			if (
				canPlaceFlag(a.tiles[b - h], true) &&
				canPlaceFlag(a.tiles[b - 1], false)
			) {
				gameObjects.push({
					type: "flag",
					team: a.tiles[b].objTeam,
					x: a.tiles[b].x + 40,
					y: a.tiles[b].y + 40,
					w: 70,
					h: 152,
					ai: randomInt(0, 2),
					ac: 0,
				});
			}
			if (
				canPlaceFlag(a.tiles[b + h], true) &&
				canPlaceFlag(a.tiles[b - 1], false)
			) {
				gameObjects.push({
					type: "flag",
					team: a.tiles[b].objTeam,
					x: a.tiles[b].x + mapTileScale - 30 - 40,
					y: a.tiles[b].y + 40,
					w: 70,
					h: 152,
					ai: randomInt(0, 2),
					ac: 0,
				});
			}
			if (
				canPlaceFlag(a.tiles[b + h], true) &&
				canPlaceFlag(a.tiles[b + 1], false)
			) {
				gameObjects.push({
					type: "flag",
					team: a.tiles[b].objTeam,
					x: a.tiles[b].x + mapTileScale - 30 - 40,
					y: a.tiles[b].y + mapTileScale - 30 - 40,
					w: 70,
					h: 152,
					ai: randomInt(0, 2),
					ac: 0,
				});
			}
			if (
				canPlaceFlag(a.tiles[b - h], true) &&
				canPlaceFlag(a.tiles[b + 1], false)
			) {
				gameObjects.push({
					type: "flag",
					team: a.tiles[b].objTeam,
					x: a.tiles[b].x + 40,
					y: a.tiles[b].y + mapTileScale - 30 - 40,
					w: 70,
					h: 152,
					ai: randomInt(0, 2),
					ac: 0,
				});
			}
            */
		}
	}
}
function canPlaceFlag(tile, b) {
	if (b) {
		return tile !== undefined && !tile.wall && !tile.hardPoint;
	} else {
		return tile !== undefined && !tile.hardPoint;
	}
}
export function wallCol(player, gameMap, gameObjects) {
	if (player.dead) return;
	player.nameYOffset = 0;
	for (let i = 0; i < gameMap.tiles.length; ++i) {
		if (gameMap.tiles[i].wall && gameMap.tiles[i].hasCollision) {
			const tmpTile = gameMap.tiles[i];
			if (
				player.x + player.width / 2 >= tmpTile.x &&
				player.x - player.width / 2 <= tmpTile.x + tmpTile.scale &&
				player.y >= tmpTile.y &&
				player.y <= tmpTile.y + tmpTile.scale
			) {
				if (player.oldX <= tmpTile.x) {
					player.x = tmpTile.x - player.width / 2 - 2;
				} else if (
					player.oldX - player.width / 2 >=
					tmpTile.x + tmpTile.scale
				) {
					player.x = tmpTile.x + tmpTile.scale + player.width / 2 + 2;
				}
				if (player.oldY <= tmpTile.y) {
					player.y = tmpTile.y - 2;
				} else if (player.oldY >= tmpTile.y + tmpTile.scale) {
					player.y = tmpTile.y + tmpTile.scale + 2;
				}
			}
			if (
				!tmpTile.hardPoint &&
				player.x > tmpTile.x &&
				player.x < tmpTile.x + tmpTile.scale &&
				player.y - player.jumpY - player.height * 0.85 >
					tmpTile.y - tmpTile.scale / 2 &&
				player.y - player.jumpY - player.height * 0.85 <= tmpTile.y
			) {
				player.nameYOffset = Math.round(
					player.y -
						player.jumpY -
						player.height * 0.85 -
						(tmpTile.y - tmpTile.scale / 2),
				);
			}
		}
	}
	for (let i = 0; i < gameObjects.length; ++i) {
		if (gameObjects[i].type === "clutter" && gameObjects[i].active) {
			const tmpObj = gameObjects[i];
			if (
				tmpObj.hc &&
				//canSee(b.x - startX, b.y - startY, b.w, b.h) &&
				player.x + player.width / 2 >= tmpObj.x &&
				player.x - player.width / 2 <= tmpObj.x + tmpObj.w &&
				player.y >= tmpObj.y - tmpObj.h * tmpObj.tp &&
				player.y <= tmpObj.y
			) {
				if (player.oldX + player.width / 2 <= tmpObj.x) {
					player.x = tmpObj.x - player.width / 2 - 1;
				} else if (player.oldX - player.width / 2 >= tmpObj.x + tmpObj.w) {
					player.x = tmpObj.x + tmpObj.w + player.width / 2 + 1;
				}
				if (player.oldY >= tmpObj.y) {
					player.y = tmpObj.y + 1;
				} else if (player.oldY <= tmpObj.y - tmpObj.h * tmpObj.tp) {
					player.y = tmpObj.y - tmpObj.h * tmpObj.tp - 1;
				}
			}
		}
	}
}
export function getCurrentWeapon(player) {
	if (
		player.weapons !== undefined &&
		player.weapons[player.currentWeapon] !== undefined
	) {
		return player.weapons[player.currentWeapon];
	} else {
		return null;
	}
}
export function roundNumber(num: number, fractionDigits: number) {
	return +num.toFixed(fractionDigits);
}
export function getAngleDifference(angleA: number, angleB: number) {
	const anglDif = Math.abs(angleB - angleA) % (Math.PI * 2);
	if (anglDif > Math.PI) {
		return Math.PI * 2 - anglDif;
	} else {
		return anglDif;
	}
}
export function jsonByteCount(obj: object) {
	return byteCount(JSON.stringify(obj));
}
export function byteCount(str: string) {
	return encodeURI(str).split(/%..|./).length - 1;
}
export function getDistance(x1: number, y1: number, x2: number, y2: number) {
	return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}
export function getAngle(x1: number, y1: number, x2: number, y2: number) {
	return Math.atan2(y2 - y1, x2 - x1);
}
export function shadeColor(hexColor: string, percent: number) {
	var r = parseInt(hexColor.substring(1, 3), 16);
	var g = parseInt(hexColor.substring(3, 5), 16);
	var b = parseInt(hexColor.substring(5, 7), 16);
	r = (r * (100 + percent)) / 100;
	g = (g * (100 + percent)) / 100;
	b = (b * (100 + percent)) / 100;
	r = r < 255 ? r : 255;
	g = g < 255 ? g : 255;
	b = b < 255 ? b : 255;
	var rstr =
		r.toString(16).length === 1 ? `0${r.toString(16)}` : r.toString(16);
	var gstr =
		g.toString(16).length === 1 ? `0${g.toString(16)}` : g.toString(16);
	var bstr =
		b.toString(16).length === 1 ? `0${b.toString(16)}` : b.toString(16);
	return `#${rstr}${gstr}${bstr}`;
}
export function randomFloat(min: number, max: number) {
	return min + Math.random() * (max - min);
}
export function randomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function linearInterpolate(
	current: number,
	target: number,
	step: number,
) {
	var delta = current - target;
	if (delta * delta > step * step) {
		return target + step;
	} else {
		return current;
	}
}
