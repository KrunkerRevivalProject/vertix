import * as utils from "./utils.ts";

const { getCurrentWeapon, getDistance, randomFloat } = utils;

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
	this.update = function (delta: number, currentTime, clutter, tiles, players) {
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
											this.pierceCount > 0 && this.pierceCount--,
											console.log("hit"),
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
	player: any,
	targetD: number,
	currentTime: number,
	bullet: any,
) {
	//let bullet = getNextBullet(bullets);
	let weapon = getCurrentWeapon(player);
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
		bullet.jumpY = player.jumpY;
		bullet.owner = player;
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
