import * as utils from "./utils.ts";

const {
	getCurrentWeapon,
	getDistance,
	randomFloat,
} = utils;

export function Projectile(currentTime, clutter, tiles, players, player) {
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
	var a = 0;
	var b = 0;
	var d = 0;
	var e = 0;
	this.update = function (delta: number) {
		if (this.active) {
			e = currentTime - this.startTime;
			if (this.skipMove) {
				e = 0;
				this.startTime = currentTime;
			}
			for (var g = 0; g < this.updateAccuracy; ++g) {
				var h = this.speed * delta;
				if (this.active) {
					a = (h * Math.cos(this.dir)) / this.updateAccuracy;
					b = (h * Math.sin(this.dir)) / this.updateAccuracy;
					if (this.active && !this.skipMove && this.speed > 0) {
						this.x += a;
						this.y += b;
						if (
							getDistance(this.startX, this.startY, this.x, this.y) >=
							this.trailMaxLength
						) {
							this.startX += a;
							this.startY += b;
						}
					}
					this.cEndX =
						this.x +
						((h + this.height) * Math.cos(this.dir)) / this.updateAccuracy;
					this.cEndY =
						this.y +
						((h + this.height) * Math.sin(this.dir)) / this.updateAccuracy;
					for (h = 0; h < clutter.length; ++h) {
						k = clutter[h];
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
						for (var h = 0; h < tiles.length; ++h) {
							if (this.active) {
								k = tiles[h];
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
					if (this.active && this.owner.index == player.index) {
						for (
							h = 0;
							h < players.length &&
							((k = players[h]),
							k.index == this.owner.index ||
								!(this.lastHit.indexOf(`,${k.index},`) < 0) ||
								k.team == this.owner.team ||
								k.type != "player" ||
								k.onScreen ||
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
												console.log("HIT!!!"),
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
											this.pierceCount > 0 && this.pierceCount--,
											this.pierceCount <= 0 && (this.active = false))),
								this.active));
							++h
						);
					}
					if (this.maxLifeTime != null && e >= this.maxLifeTime) {
						this.active = false;
					}
				}
			}
			if (this.spriteIndex == 1) {
				d -= delta;
				if (d <= 0) {
					//stillDustParticle(this.x, this.y, true);
					d = 20;
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
	var f = 0;
	var h = 0;
	this.canSeeObject = function (a, b) {
		f = Math.abs(this.cEndX - a.x);
		h = Math.abs(this.cEndY - a.y);
		return f <= (b + this.height) * 2 && h <= (b + this.height) * 2;
	};
	this.deactivate = function () {
		this.active = false;
	};
	this.hitSomething = function (a, b) {
		if (this.spriteIndex != 2) {
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
		for (var f = 100, h = this.cEndX, g = this.cEndY; f > 0; ) {
			f--;
			if (this.dotInRect(h, g, a, b, d, e)) {
				f = 0;
			} else {
				h += Math.cos(this.dir + Math.PI) * 2;
				g += Math.sin(this.dir + Math.PI) * 2;
			}
		}
		for (f = 100; f > 0; ) {
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
function getNextBullet(bullets: any) {
	bulletIndex++;
	if (bulletIndex >= bullets.length) {
		bulletIndex = 0;
	}
	return bullets[bulletIndex];
}
export function shootNextBullet(a: any, player: any, targetD, currentTime, bullets: any) {
	var d = getNextBullet(bullets);
	if (d !== undefined) {
		d.serverIndex = a.si;
		d.x = a.x - 1;
		d.startX = a.x;	
		d.y = a.y;
		d.startY = a.y;
		d.dir = a.d;
		d.speed = getCurrentWeapon(player).bSpeed;
		d.updateAccuracy = getCurrentWeapon(player).cAcc;
		d.width = getCurrentWeapon(player).bWidth;
		d.height = getCurrentWeapon(player).bHeight;
		var e = getCurrentWeapon(player).bRandScale;
		if (e != null) {
			e = randomFloat(e[0], e[1]);
			d.width *= e;
			d.height *= e;
			d.speed *=
				1 + getCurrentWeapon(player).spread[getCurrentWeapon(player).spreadIndex];
		}
		d.trailWidth = d.width * 0.7;
		d.trailMaxLength = Math.round(d.height * 5);
		d.trailAlpha = getCurrentWeapon(player).bTrail;
		d.weaponIndex = getCurrentWeapon(player).weaponIndex;
		d.spriteIndex = getCurrentWeapon(player).bSprite;
		d.yOffset = getCurrentWeapon(player).yOffset;
		d.jumpY = player.jumpY;
		d.owner = player;
		d.dmg = getCurrentWeapon(player).dmg;
		d.bounce = getCurrentWeapon(player).bounce;
		d.startTime = currentTime;
		d.maxLifeTime = getCurrentWeapon(player).maxLife;
		if (getCurrentWeapon(player).distBased) {
			d.maxLifeTime = targetD / d.speed;
		}
		d.glowWidth = getCurrentWeapon(player).glowWidth;
		d.glowHeight = getCurrentWeapon(player).glowHeight;
		d.explodeOnDeath = getCurrentWeapon(player).explodeOnDeath;
		d.pierceCount = getCurrentWeapon(player).pierce;
		d.activate();
	}
	d = null;
}
