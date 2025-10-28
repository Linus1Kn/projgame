const body = document.getElementById("body")
const c = document.getElementById("canvas")
const ctx = c.getContext("2d")

//Sprites
const imgSources = [
	{
		name: "slime_idle1",
		src: "./sprites/enemies/slime/slime_idle1.png",
	},
	{
		name: "slime_idle2",
		src: "./sprites/enemies/slime/slime_idle2.png",
	},
	{
		name: "slime_jump",
		src: "./sprites/enemies/slime/slime_jump.png",
	},
	{
		name: "slime_charge",
		src: "./sprites/enemies/slime/slime_charge.png",
	},
	{
		name: "slime_particle1",
		src: "./sprites/enemies/slime/slime_particle1.png",
	},
	{
		name: "slime_particle2",
		src: "./sprites/enemies/slime/slime_particle2.png",
	},

	{
		name: "skeleton_idle1",
		src: "./sprites/enemies/skeleton/skeleton_idle1.png",
	},
	{
		name: "bone_particle1",
		src: "./sprites/enemies/skeleton/bone_particle1.png",
	},
	{
		name: "bone_particle2",
		src: "./sprites/enemies/skeleton/bone_particle2.png",
	},

	{
		name: "charger_idle1",
		src: "./sprites/enemies/charger/charger_idle1.png",
	},

	{
		name: "smoke_particle1",
		src: "./sprites/generic/smoke_particle1.png",
	},
	{
		name: "smoke_particle2",
		src: "./sprites/generic/smoke_particle2.png",
	},
	
	{
		name: "bullet",
		src: "./sprites/projectiles/bullet.png",
	},
	{
		name: "temp",
		src: "./sprites/player/temp.png",
	},
	{
		name: "shadow",
		src: "./sprites/enemies/shadow.png",
	},

	{
		name: "pistol",
		src: "./sprites/weapons/pistol.png",
	},
	{
		name: "rifle",
		src: "./sprites/weapons/rifle.png",
	},
	{
		name: "shotgun",
		src: "./sprites/weapons/shotgun.png",
	},
	{
		name: "tommy",
		src: "./sprites/weapons/tommy.png",
	},
	{
		name: "star",
		src: "./sprites/weapons/star.png",
	},
	{
		name: "star_empty",
		src: "./sprites/weapons/star_empty.png",
	},

	{
		name: "chest",
		src: "./sprites/chests/chest.png",
	},
	{
		name: "chest_open",
		src: "./sprites/chests/chest_open.png",
	},
	{
		name: "coin",
		src: "./sprites/pickups/coin.png",
	},
	{
		name: "heart",
		src: "./sprites/pickups/heart.png",
	},
	{
		name: "orb",
		src: "./sprites/pickups/orb.png",
	},
	{
		name: "pw_bullet",
		src: "./sprites/pickups/pw_bullet.png",
	},
	{
		name: "pw_lower_cooldown",
		src: "./sprites/pickups/pw_lower_cooldown.png",
	},
	{
		name: "pw_higher_cooldown",
		src: "./sprites/pickups/pw_higher_cooldown.png",
	},
	{
		name: "pw_lower_spread",
		src: "./sprites/pickups/pw_lower_spread.png",
	},
	{
		name: "pw_higher_spread",
		src: "./sprites/pickups/pw_higher_spread.png",
	},
]
const sprites = {}
imgSources.forEach(function (item) {
	const img = new Image();
	img.src = item.src
	sprites[item.name] = img
})

//Audio
let sounds = {
	damage: new Audio('./audio/damage.wav'),
	hit: new Audio('./audio/hit.wav'),
	shoot: new Audio('./audio/shoot.wav'),
	coin: new Audio('./audio/coin.wav'),
	powerup: new Audio('./audio/powerup.wav'),
	music: new Audio('./audio/nokia_blue_ice.wav'),
	death: new Audio('./audio/death.wav'),
}
function playSnd(name) {
	const snd = sounds[name]
	snd.currentTime = 0;
	snd.play();
}

const music = sounds["music"]
music.loop = true
music.playbackRate = 1
music.preservesPitch = false

async function tryPlayAudio() {
  try {
    await music.play();
    console.log('Audio is playing!');
  } catch (err) {
    console.warn('Autoplay prevented, waiting for user interaction...');
    // Retry after user interacts
    document.addEventListener('click', retryOnUserAction, { once: true });
  }
}

function retryOnUserAction() {
  music.play().then(() => {
    console.log('Audio started after user interaction');
  }).catch(err => {
    console.error('Still failed to play:', err);
  });
}
tryPlayAudio()

//FUNCTIONS

function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max)
}
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
function lerp(a, b, t) {
	return a + (b - a) * t
}

let vec = {}
vec.magnitudeSquared = function (vec) {
	return (Math.abs(vec.x) + Math.abs(vec.y)) / 2
}
vec.normalize = function (vec) {
	const length = Math.hypot(vec.x, vec.y); // same as sqrt(x*x + y*y)

	if (length === 0) return { x: 0, y: 0 }; // avoid division by zero
	return {
		x: vec.x / length,
		y: vec.y / length
	};
}
vec.lerp = function (vec, targetVec, t) {
	return {
		x: lerp(vec.x, targetVec.x, t),
		y: lerp(vec.y, targetVec.y, t)
	}
}
vec.dot = function (vec1, vec2) {
	return vec1.x * vec2.x + vec1.y * vec2.y;
}
vec.add = function (vec1, vec2) {
	return {
		x: vec1.x + vec2.x,
		y: vec1.y + vec2.y
	}
}
vec.sub = function (vec1, vec2) {
	return {
		x: vec1.x - vec2.x,
		y: vec1.y - vec2.y
	}
}
vec.mulNum = function (vec1, num) {
	return {
		x: vec1.x * num,
		y: vec1.y * num
	}
}
vec.divNum = function (vec1, num) {
	return {
		x: vec1.x / num,
		y: vec1.y / num
	}
}
vec.normalToDeg = function (normal) {
	const rad = Math.atan2(normal.y, normal.x);  // returns angle in radians between -π and π
	let deg = rad * 180 / Math.PI;
	if (deg < 0) deg += 360;  // optional: normalize angle to [0, 360)
	return deg;
}
vec.new = function (x, y) {
	return { x: x, y: y }
}

let deg = {}
deg.rotate = function (degree, amount) {
	let result = degree + amount
	if (result >= 360) result -= 360
	return result
}
deg.getNormalVec = function (degree) {
	const rad = degree * (Math.PI / 180)
	return {
		x: Math.cos(rad),
		y: Math.sin(rad)
	}
}
deg.slerp = function (a, b, t) {
	// Normalize angles to [0, 360)
	a = ((a % 360) + 360) % 360;
	b = ((b % 360) + 360) % 360;

	// Calculate difference, wrapped to [-180, 180]
	let diff = b - a;
	if (diff > 180) {
		diff -= 360;
	} else if (diff < -180) {
		diff += 360;
	}

	// Interpolate and wrap result to [0, 360)
	let result = a + diff * t;
	return ((result % 360) + 360) % 360;
}
deg.getDegreePointing = function (vec, target) {
	const dx = target.x - vec.x;
	const dy = target.y - vec.y;

	const angleRad = Math.atan2(dy, dx);

	let angleDeg = angleRad * (180 / Math.PI);

	if (angleDeg < 0) {
		angleDeg += 360;
	}

	return angleDeg;
}
deg.getRelation = function (dir1, dir2) {
	// Normalize both to 0-360
	dir1 = ((dir1 % 360) + 360) % 360;
	dir2 = ((dir2 % 360) + 360) % 360;

	// Calculate the difference from dir2 to dir1
	let diff = dir1 - dir2;

	// Normalize difference to -180 to +180
	if (diff > 180) diff -= 360;
	if (diff < -180) diff += 360;

	return diff
}
deg.rad = function (degree, offset) {
	return (degree + (offset || 0)) * (Math.PI / 180)
}
deg.radToVec = function (radians) {
	return {
		x: Math.cos(radians),
		y: Math.sin(radians)
	}
}
deg.dist = function (a, b) {
	let diff = Math.abs(a - b) % 360;
	return diff > 180 ? 360 - diff : diff;
}

function rectOverlappingRect(posA, sizeA, posB, sizeB){
	return (
        posA.x < posB.x + sizeB.x &&
        posA.x + sizeA.x > posB.x &&
        posA.y < posB.y + sizeB.y &&
        posA.y + sizeA.y > posB.y
    )
}

//

let mousePos = vec.new(0, 0)
function getMousePosition(event) {

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    mousePos.x = x
    mousePos.y = y
}
document.addEventListener("mousemove", getMousePosition);

//sigma

const middlePos = vec.new(canvas.width/2, canvas.height/2)
let camera = {
	pos: vec.new(0, 0),
	_pos: vec.new(0, 0),
	framePos: vec.new(0, 0),
	screenshake: 0,
}
let entities = []
let particles = []

function debugText(pos, text){
	ctx.font = "bold 16px sans-serif"
	ctx.fillStyle = "rgba(255, 0, 0, 1)"
	ctx.fillText(text, pos.x, pos.y);
}

function renderShadow(framePos, size){
	ctx.drawImage(sprites.shadow, framePos.x, framePos.y, size, size)
}
function renderSprite(sprite, pos, rot, size, flip, bright, flipY){
	const angleInRadians = rot * Math.PI / 180
	ctx.save();

    ctx.translate(pos.x + size/2, pos.y + size/2)
    ctx.rotate(angleInRadians);

	if (bright){ctx.filter = "contrast(0.2) brightness(1.75)"}
	ctx.scale((flip && -1) || 1, (flipY && -1) || 1)

    ctx.drawImage(sprite, -size/2, -size/2, size, size)

    ctx.restore();
	//ctx.filter = "none"
}

function killEntity(entity){
	if (entity.death){entity.death()}

	let index = entities.indexOf(entity)
	entities.splice(index, 1);
}

function damageEntity(entity, damage){
	entity.health -= damage
	if (entity == plr){
		playSnd("damage")
	}else{
		playSnd("hit")
	}
	if (entity.onDamage){entity.onDamage(damage)}
	if (entity.health <= 0){
		killEntity(entity)
		return true
	}
	return false
}
function attackEntity(entity, damage, knockbackNormal, knockback){
	entity.vel = vec.add(vec.mulNum(entity.vel, 0.5), vec.mulNum(knockbackNormal, knockback))
	return damageEntity(entity, damage)
}

function emitParticles(particleClass, pos, radius, amount, normal){
	for (let i = 0; i < (amount || 8); i++){
		let particle = new particleClass(vec.add(pos, vec.mulNum(vec.new(Math.random()-0.5, Math.random()-0.5), radius)), null, null, null, null, normal)
		particles.push(particle)
	}
}

function spawnCoins(pos, amount){
	for (let i = 0; i < (amount || 8); i++){
		entities.push(new Coin(pos))
	}
}

function displayString(str, pos, elapsed, color, rightAlign) {
	const letterSize = 20
		ctx.font = "normal 32px Tiny5"
		ctx.fillStyle = color || "rgb(75, 75, 75)"
		for (let i = 0; i < str.length; i++) {
			const letter = str[i]
			ctx.fillText(letter, pos.x + ((rightAlign && (i+1)) || (i - str.length/2)) * letterSize + (letterSize/2), pos.y + (elapsed && Math.sin(elapsed * 0.005 + i) * 5) || 0);
		}
	}

class BaseParticle {
	constructor(pos, vel, velDamp, grav, lifetime, normal) {
		this.pos = pos || middlePos;
		this._pos = pos || middlePos;
		this.midPos = pos || middlePos;

		this.vel = vel || (normal && vec.add(vec.mulNum(normal, 5+Math.random()*10), vec.mulNum(vec.new((Math.random()-0.5), (Math.random()-0.5)), 8))) || vec.mulNum(vec.new((Math.random()-0.5), (Math.random()-0.5)), 40);
		this.velDamp = velDamp || 0.95;
		this.grav = grav || 0;
		this.lifetime = lifetime || 5+Math.random()*10

		this.size = 64

		this.sprite = sprites.slime_particle1
	}
	_tick(t) {
		this.lifetime --
		if (this.lifetime <= 0){
			let index = particles.indexOf(this)
			particles.splice(index, 1);
		}
	}
	tick(t) {
		this._tick(t)
	}
	render(dt, elapsed, tickDelta, t) {
		let framePos = vec.add(vec.lerp(this._pos, this.pos, tickDelta), camera.framePos)
		renderSprite(this.sprite, framePos, 0, this.size, true)
		//debugText(framePos, Math.round(this.elevation*10)/10)
	}
}
class GravParticle extends BaseParticle {
	constructor(pos, vel, velDamp, grav, lifetime, normal) {
		super(pos, vel, velDamp, grav, lifetime);

		this.pos = pos || middlePos;
		this._pos = pos || middlePos;
		this.midPos = pos || middlePos;

		this.vel = vel || vec.mulNum(vec.new((Math.random()-0.5), (-Math.random())), 40);
		this.velDamp = velDamp || 1;
		this.grav = grav || 2.5;
		this.lifetime = lifetime || 30+Math.random()*20
		this.elevation = -20 + (Math.random()-0.5) *64

		this.size = 64

		this.sprite = sprites.slime_particle2
	}
	tick(t) {
		this._tick(t)
		this.elevation += this.vel.y
		if (this.elevation > 0){
			this.pos.y -= this.elevation
			this.elevation = 0
			this.vel.y *= -0.6
			this.vel.x *= 0.4
		}
	}
}
class SlimeParticle extends GravParticle {
	constructor(pos, vel, velDamp, grav, lifetime, normal) {
		super(pos, vel, velDamp, grav, lifetime, normal);
		this.sprite = (getRandomInt(1, 2) == 1 && sprites.slime_particle1) || sprites.slime_particle2
	}
}
class BoneParticle extends GravParticle {
	constructor(pos, vel, velDamp, grav, lifetime, normal) {
		super(pos, vel, velDamp, grav, lifetime, normal);
		this.sprite = (getRandomInt(1, 2) == 1 && sprites.bone_particle1) || sprites.bone_particle2
	}
}
class SmokeParticle extends BaseParticle {
	constructor(pos, vel, velDamp, grav, lifetime, normal) {
		super(pos, vel, velDamp, grav, lifetime, normal);
		this.sprite = (getRandomInt(1, 2) == 1 && sprites.smoke_particle1) || sprites.smoke_particle2
	}
}

class BaseWeapon {
	constructor() {
		this.name = "Default"
		this.damage = 5
		this.cooldown = 10
		this.spread = 0
		this.amount = 1
		this.projectile = PlayerProjectile
		this.sprite = sprites.pistol
		this.screenshake = 1

		this.powerups = 0
	}
}

class WeaponPistol extends BaseWeapon {
	constructor() {
		super()
		this.name = "Pistol"
		this.damage = 5
		this.cooldown = 10
		this.spread = 0
		this.amount = 1
		this.projectile = PlayerProjectile
		this.sprite = sprites.pistol
		this.screenshake = 1
	}
}

class WeaponTommy extends BaseWeapon {
	constructor() {
		super()
		this.name = "Tommy"
		this.damage = 2
		this.cooldown = 4
		this.spread = 10
		this.amount = 1
		this.projectile = PlayerProjectile
		this.sprite = sprites.tommy
		this.screenshake = 1
	}
}

class WeaponRifle extends BaseWeapon {
	constructor() {
		super()
		this.name = "Rifle"
		this.damage = 25
		this.cooldown = 30
		this.spread = 0
		this.amount = 1
		this.projectile = PlayerProjectile
		this.sprite = sprites.rifle
		this.screenshake = 3
	}
}

class WeaponShotgun extends BaseWeapon{
	constructor() {
		super()
		this.name = "Shotty"
		this.damage = 4
		this.cooldown = 20
		this.spread = 30
		this.amount = 5
		this.projectile = TestProj
		this.sprite = sprites.shotgun
		this.screenshake = 3
	}
}

function getRandomWeapon(){
	const list = [WeaponPistol, WeaponShotgun, WeaponRifle, WeaponTommy]
	return new list[getRandomInt(0, list.length-1)]
}

class BaseEntity {
	constructor(pos, rot, vel, velDamp, size) {
		this.pos = pos || middlePos;
		this._pos = pos || middlePos;
		this.midPos = pos || middlePos;

		this.rot = rot || 0;
		this._rot = rot || 0;

		this.vel = vel || vec.new(0, 0);
		this.velDamp = velDamp || 0.7;

		this.size = size || 64;
		this.overlapping = [];

		this.sprite = sprites.temp
	}
	tick(t) {
		
	}
	render(dt, elapsed, tickDelta, t) {
		let framePos = vec.add(vec.lerp(this._pos, this.pos, tickDelta), camera.framePos)
		let frameRot = 0

		renderSprite(this.sprite, framePos, 0, this.size, (deg.rotate(this.rot, 90) > 180))
	}
}

class Chest extends BaseEntity {
	constructor(pos, rot, vel, velDamp, size) {
		super(pos, rot, vel, velDamp, size);

		this.sprite = sprites.chest
		this.opened = false
		this.ignoreCollisions = true

		this.lifetime = 100
		this.cost = 10
	}
	onHit(entity) {
		if (entity == plr && plr.inputs.space){
			if (plr.coins < this.cost){return}
			plr.coins = plr.coins - this.cost
			this.opened = true
			this.sprite = sprites.chest_open
			emitParticles(SmokeParticle, this.pos, this.size/2, 3, null)
			
			if (Math.random() > 0.7){
				entities.push(new ItemWeapon(getRandomWeapon(), vec.add(this.pos, vec.new(0, -64)), vec.new(0, -15, 0)))
			}else if (Math.random() > 0.7){
				entities.push(new ItemHeal(vec.add(this.pos, vec.new(0, -64)), vec.new(0, -15, 0)))
			}else{
				entities.push(new ItemPowerup(vec.add(this.pos, vec.new(0, -64)), vec.new(0, -15, 0)))
			}
			//plr.inv.push(getRandomWeapon())
		}
	}
	render(dt, elapsed, tickDelta, t){
		let framePos = vec.add(vec.lerp(this._pos, this.pos, tickDelta), camera.framePos)
		let frameRot = 0

		renderSprite(this.sprite, framePos, 0, this.size, (deg.rotate(this.rot, 90) > 180))
		if (this.opened == false){displayString("cost: "+this.cost, vec.add(framePos, vec.new(this.size/2, 0)), elapsed)}
	}
	tick(t) {
		
		if (this.opened){
			this.lifetime = this.lifetime - 1
			if (this.lifetime <= 0){killEntity(this)}
			return
		}
		
		for (let j in this.overlapping) {
			let entity = this.overlapping[j]
			this.onHit(entity)
		}

	}
}

class BaseItem extends BaseEntity {
	constructor(pos, vel, size) {
		super(pos, 0, vel, undefined, size);

		this.ignoreCollisions = true
		this.sprite = sprites.heart

		this.lifetime = 1200
	}
	onPickup(entity) {
		emitParticles(SmokeParticle, this.pos, this.size/2, 3, null)
		//plr.inv.push(getRandomWeapon())
		killEntity(this)
	}
	tick(t) {
		for (let j in this.overlapping) {
			let entity = this.overlapping[j]
			
			if (entity == plr && plr.inputs.space){
				this.onPickup(entity)
				return
			}
		}

		this.lifetime = this.lifetime - 1
		if (this.lifetime <= 0){killEntity(this)}
	}
}

class ItemWeapon extends BaseItem {
	constructor(weapon, pos, vel, size) {
		super(pos, vel, size);

		this.weapon = weapon
		this.sprite = this.weapon.sprite

	}
	onPickup(entity) {
		emitParticles(SmokeParticle, this.pos, this.size/2, 3, null)
		plr.inv.push(this.weapon)
		killEntity(this)
	}
	render(dt, elapsed, tickDelta, t) {
		let framePos = vec.add(vec.lerp(this._pos, this.pos, tickDelta), camera.framePos)
		let frameRot = 0

		renderSprite(this.sprite, vec.add(framePos, vec.new(0, Math.sin(elapsed/150)*3, 0)), 0, this.size, (deg.rotate(this.rot, 90) > 180))
		displayString(this.weapon.name, vec.add(framePos, vec.new(this.size/2, 0)), elapsed)
	}
}

class ItemPowerup extends BaseItem {
	constructor(pos, vel, size) {
		super(pos, vel, size);

		this.powers = []

		for (let i = 0; i < getRandomInt(2, 3); i++){
			this.addRandomPower()
		}
	}
	powerups = [
		{
			name: "25% faster cooldown",
			sprite: sprites.pw_lower_cooldown,
			tag: "cooldown",
			incompats: ["cooldown"],
			func: function(weapon){
				weapon.cooldown *= 0.75
			},
		},
		{
			name: "50% less spread",
			sprite: sprites.pw_lower_spread,
			tag: "spread",
			incompats: ["spread"],
			func: function(weapon){
				weapon.spread *= 0.5
			},
		},
		{
			name: "30% more spread",
			sprite: sprites.pw_higher_spread,
			tag: "spread",
			incompats: ["spread"],
			func: function(weapon){
				weapon.spread = Math.max(weapon.spread, 5) * 1.3
			},
		},
		{
			name: "15% slower cooldown",
			sprite: sprites.pw_higher_cooldown,
			tag: "cooldown",
			incompats: ["cooldown"],
			func: function(weapon){
				weapon.cooldown *= 1.15
			},
		},
		{
			name: "+1 bullet per shot",
			sprite: sprites.pw_bullet,
			tag: "bullet",
			incompats: [],
			func: function(weapon){
				weapon.amount ++
			},
		},
	]
	addRandomPower(){
		while (true){
			const newPower = this.powerups[getRandomInt(0, this.powerups.length-1)]

			if (this.powers.includes(newPower)){continue}

			let fail = false
			for (let i in this.powers){
				const power = this.powers[i]
				if (power.incompats.includes(newPower.tag) || newPower.incompats.includes(power.tag)){
					fail = true
					break
				}
			}
			if (fail){continue}
			
			this.powers.push(newPower)
			break
		}
	}
	onPickup(entity) {
		if (plr.weapon.powerups >= 3){return}
		plr.weapon.powerups ++
		emitParticles(SmokeParticle, this.pos, this.size/2, 3, null)
		for (let i in this.powers){
			const power = this.powers[i]
			power.func(plr.weapon)
		}
		playSnd("powerup")
		killEntity(this)
	}
	render(dt, elapsed, tickDelta, t) {
		let framePos = vec.add(vec.lerp(this._pos, this.pos, tickDelta), camera.framePos)
		let frameRot = 0

		const s = (16+Math.sin(elapsed/400)*16)
		renderSprite(sprites.orb, vec.sub(framePos, vec.new(s/2, s/2)), elapsed/6, this.size+s)
		for (let i in this.powers){
			const power = this.powers[i]
			const t = elapsed/600 + (i * (Math.PI * 2 / this.powers.length))
			renderSprite(power.sprite, vec.add(framePos, vec.new(Math.cos(t)*24, Math.sin(t)*24)), 0, this.size)
			displayString(power.name, vec.add(framePos, vec.new(this.size/2, -i*32)), elapsed)
		}
	}
}

class ItemHeal extends BaseItem {
	constructor(pos, vel, size) {
		super(pos, vel, size);
		this.sprite = sprites.heart
	}
	addRandomPower(){
		this.powers.push(this.powerups[getRandomInt(0, this.powerups.length-1)])
	}
	onPickup(entity) {
		emitParticles(SmokeParticle, this.pos, this.size/2, 3, null)
		plr.health = Math.min(plr.health+50, plr.maxHealth)
		playSnd("powerup")
		killEntity(this)
	}
	render(dt, elapsed, tickDelta, t) {
		let framePos = vec.add(vec.lerp(this._pos, this.pos, tickDelta), camera.framePos)

		renderSprite(this.sprite, vec.add(framePos, vec.new(0, Math.sin(elapsed/150)*3, 0)), 0, this.size)
		displayString("+50 HP", vec.add(framePos, vec.new(this.size/2, 0)), elapsed)
	}
}



class LivingEntity extends BaseEntity {
	constructor(pos, rot, vel, velDamp, size) {
		super(pos, rot, vel, velDamp, size);

		this.maxHealth = 100
		this.health = this.maxHealth

		this.sprite = sprites.temp
	}
	tick(t) {
		
	}
	render(dt, elapsed, tickDelta, t) {
		let framePos = vec.add(vec.lerp(this._pos, this.pos, tickDelta), camera.framePos)
		let frameRot = 0

		renderSprite(this.sprite, framePos, 0, this.size, (deg.rotate(this.rot, 90) > 180))
	}
}

class Projectile extends BaseEntity {
	constructor(pos, rot, damage, vel, velDamp, size) {
		super(pos, rot, damage, vel, velDamp, size);

		this.hitDamage = damage || 5

		this.sprite = sprites.bullet
		this.ignoreCollisions = true
		this.lifetime = 20

		this.targetNormal = deg.getNormalVec(this.rot)
		this.vel = vec.mulNum(this.targetNormal, 50)
		this.velDamp = 1
	}
	onHit(entity) {
		if (entity.maxHealth){
			const died = attackEntity(entity, this.hitDamage, this.targetNormal, 20)
			if (died) {camera.screenshake += 3}
			killEntity(this)
			return true
		}
		return false
	}
	_tick(t) {
		this.lifetime = this.lifetime - 1
		if (this.lifetime <= 0){killEntity(this); return}
		
		for (let j in this.overlapping) {
			let entity = this.overlapping[j]
			const didHit = this.onHit(entity)
			if (didHit){return}
		}
	}
	tick(t) {
		this._tick(t)
	}
	render(dt, elapsed, tickDelta, t) {
		let framePos = vec.add(vec.lerp(this._pos, this.pos, tickDelta), camera.framePos)

		renderSprite(this.sprite, framePos, this.rot, this.size, false)
	}
}

class PlayerProjectile extends Projectile {
	constructor(pos, rot, damage, speed, velDamp, size) {
		super(pos, rot, damage, speed, velDamp, size);
		
		this.hitDamage = damage || 5
		this.knockback = 20

		this.sprite = sprites.bullet
		this.ignoreCollisions = true
		this.lifetime = 20

		this.targetNormal = deg.getNormalVec(this.rot)
		this.vel = vec.mulNum(this.targetNormal, speed || 50)
		this.velDamp = 1
	}
	onHit(entity) {
		if (entity.maxHealth && entity.isEnemy){
			const died = attackEntity(entity, this.hitDamage, this.targetNormal, this.knockback)
			if (died) {camera.screenshake += 3}
			killEntity(this)
			return true
		}
		return false
	}
	render(dt, elapsed, tickDelta, t) {
		let framePos = vec.add(vec.lerp(this._pos, this.pos, tickDelta), camera.framePos)

		renderSprite(this.sprite, framePos, this.rot, this.size, false)
	}
}
class TestProj extends PlayerProjectile {
	constructor(pos, rot, damage, speed, velDamp, size) {
		super(pos, rot, damage, speed, velDamp, size);
		
		this.knockback = 15

		this.sprite = sprites.bullet
		this.ignoreCollisions = true
		this.lifetime = 10

		this.targetNormal = deg.getNormalVec(this.rot)
		this.vel = vec.mulNum(this.targetNormal, speed || 50+Math.random()*15)
		this.velDamp = 0.9
	}
}

class EnemyProjectile extends Projectile {
	constructor(pos, rot, damage, speed, velDamp, size) {
		super(pos, rot, damage, speed, velDamp, size);

		this.sprite = sprites.bullet
		this.ignoreCollisions = true
		this.lifetime = 20

		this.targetNormal = deg.getNormalVec(this.rot)
		this.vel = vec.mulNum(this.targetNormal, 30)
		this.velDamp = 1
	}
	onHit(entity) {
		if (entity.maxHealth && !entity.isEnemy){
			camera.screenshake += 3
			const died = attackEntity(entity, this.hitDamage, this.targetNormal, 40)
			killEntity(this)
			return true
		}
		return false
	}
	render(dt, elapsed, tickDelta, t) {
		let framePos = vec.add(vec.lerp(this._pos, this.pos, tickDelta), camera.framePos)

		renderSprite(this.sprite, framePos, this.rot, this.size, false)
	}
}

class ControllerEntity extends LivingEntity {
	constructor(pos, rot, vel, velDamp, size) {
		super(pos, rot, vel, velDamp, size); // call the parent constructor
		this.inputs = {
			w: false,
			a: false,
			s: false,
			d: false,
			attack: false,
		};
		this.attackCooldown = 0
		this.inv = [
			new WeaponPistol()
		]
		this.equippedSlot = 0
		this.weapon = this.inv[this.equippedSlot]
		this._weaponNormal = vec.new(0, 0, 0)
		this.weaponNormal = vec.new(0, 0, 0)
		this.coins = 0
	}
	equipWeapon(slot) {
		this.equippedSlot = slot
		this.weapon = this.inv[this.equippedSlot]
	}
	dropEquippedWeapon() {
		if (this.inv.length == 1){return}
		entities.push(new ItemWeapon(this.weapon, this.pos, vec.new(0, -15, 0)))
		this.inv.splice(this.equippedSlot, 1)
		this.equipWeapon(Math.max(0, this.equippedSlot-1))
	}
	render(dt, elapsed, tickDelta, t) {
		let framePos = vec.add(vec.lerp(this._pos, this.pos, tickDelta), camera.framePos)
		let frameRot = 0
		if (vec.magnitudeSquared(this.vel) > 1){
			framePos.y -= Math.abs(Math.sin(t*1.5)*10)
			frameRot = Math.sin(t*1.5)*10
		}

		renderSprite(this.sprite, framePos, frameRot, this.size, (deg.rotate(this.rot, 90) > 180))

		renderSprite(this.weapon.sprite, vec.add(vec.sub(framePos, vec.new(this.size/2, this.size/2)), vec.lerp(this._weaponNormal, this.weaponNormal, tickDelta)), deg.slerp(this._rot, this.rot, tickDelta), this.size*2, false, null, (deg.rotate(this.rot, 90) > 180))

		//debugText(framePos, Math.round(this.health))
	}
	tick(t) {
		const relativePos = vec.add(this.pos, camera.framePos)
		this._rot = this.rot
		this.rot = deg.getDegreePointing(vec.add(relativePos, vec.new(this.size/2, this.size/2)), mousePos)

		this._weaponNormal = this.weaponNormal
		let p = 1-(this.attackCooldown/this.weapon.cooldown)
		this.targetNormal = deg.getNormalVec(this.rot)
		this.weaponNormal = vec.mulNum(this.targetNormal, 20*p)

		const spd = 5
		if (this.inputs.w){
			this.vel.y -= spd
		}
		if (this.inputs.s){
			this.vel.y += spd
		}
		if (this.inputs.d){
			this.vel.x += spd
		}
		if (this.inputs.a){
			this.vel.x -= spd
		}
		for (let j in this.overlapping) {
			let entity = this.overlapping[j]
			if (entity.damage && entity.dmgCooldown == 0){
				damageEntity(this, entity.damage)
				entity.dmgCooldown = 10
				camera.screenshake += 5
			}
		}
		if (this.attackCooldown > 0){this.attackCooldown = this.attackCooldown - 1}
		if (this.inputs.attack && this.attackCooldown <= 0){
			this.attackCooldown = this.weapon.cooldown
			camera.screenshake += this.weapon.screenshake
			emitParticles(SmokeParticle, vec.add(this.pos, this.weaponNormal), this.size/2, 3, this.targetNormal)
			playSnd("shoot")
			for (let i = 0; i < this.weapon.amount; i++){
				entities.push(new this.weapon.projectile(this.pos, deg.rotate(this.rot, (Math.random()-0.5)*this.weapon.spread), this.weapon.damage))
			}
			
		}

		if (this.iFrames){this.iFrames--}
	}
	death() {
		console.log("Player has died")
		playSnd("death")
		music.playbackRate = 0.5
	}
}

class Coin extends BaseEntity {
	constructor(pos, rot, vel, velDamp, size) {
		super(pos, rot, vel, velDamp, size); // call the parent constructor
		this.sprite = sprites.coin
		this.vel = vec.mulNum(vec.new(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5), 60)
		this.velDamp = 1
		this.moveCooldown = 3
		this.ignoreCollisions = true
	}
	onCollect(entity){
		plr.coins = plr.coins + 1
		playSnd("coin")
		killEntity(this)
	}
	tick(t) {
		for (let j in this.overlapping) {
			let entity = this.overlapping[j]
			if (entity.maxHealth && !entity.isEnemy){
				this.onCollect(entity)
				return
			}
		}
		if (this.moveCooldown > 0) {
			this.moveCooldown = this.moveCooldown - 1
			if(this.moveCooldown == 0){this.velDamp = 0.8}
			return
		}

		const rot = deg.getDegreePointing(this.midPos, plr.midPos)
		this.targetNormal = deg.getNormalVec(rot)
		this.vel = vec.add(this.vel, vec.mulNum(this.targetNormal, 25))
	}
}

class EnemyBase extends LivingEntity {
	constructor(pos, rot, vel, velDamp, size) {
		super(pos, rot, vel, velDamp, size); // call the parent constructor
		this.targetNormal = vec.new(0, 0)
		this.damage = 10
		this.dmgCooldown = 0
		this.isEnemy = true
		this.impactTicks = 0
	}
	onDamage(amount) {
		this.impactTicks = 3
	}
	_tick(t) {
		if (this.dmgCooldown > 0){this.dmgCooldown--}
		if (this.impactTicks > 0){this.impactTicks--}
	}
	render(dt, elapsed, tickDelta, t) {
		let framePos = vec.add(vec.lerp(this._pos, this.pos, tickDelta), camera.framePos)
		let frameRot = 0

		renderSprite(this.sprite, framePos, frameRot, this.size, (deg.rotate(this.rot, 90) > 180), (this.impactTicks > 0))
	}
}

class Slime extends EnemyBase {
	constructor(pos, rot, vel, velDamp, size) {
		super(pos, rot, vel, velDamp, size); // call the parent constructor
		this._jumpY = 0
		this.jumpY = 0
		this.jumpVel = 0
		this.jumpCooldown = Math.ceil(Math.random()*30)
		this.targetNormal = vec.new(0, 0)
		this.damage = 20
		this.maxHealth = 20
		this.health = this.maxHealth
	}
	tick(t) {
		this._tick(t)

		let s = Math.floor((t/5))
		const inAir = (this.jumpY > 0)
		this.sprite = 	(inAir && sprites.slime_jump) || 
						(this.jumpCooldown < 10 && sprites.slime_charge) || 
						(s % 2 == 0 && sprites.slime_idle1) || 
						sprites.slime_idle2
		
		this.velDamp = (inAir && 0.95) || 0.8

		if (this.jumpCooldown > 0 && this.jumpY == 0){
			this.jumpCooldown --
			if (this.jumpCooldown == 0){
				this.jumpVel = 10
				this.jumpCooldown = 25

				this.vel = vec.add(this.vel, vec.mulNum(this.targetNormal, 25))
			}
		}

		this.jumpVel -= 1
		this._jumpY = this.jumpY
		this.jumpY = Math.max(this.jumpY+this.jumpVel, 0)

		this.rot = deg.getDegreePointing(this.midPos, plr.midPos)
		this.targetNormal = deg.getNormalVec(this.rot)
	}
	render(dt, elapsed, tickDelta, t) {
		let framePos = vec.add(vec.lerp(this._pos, this.pos, tickDelta), camera.framePos)
		let frameRot = 0
		
		framePos.y -= lerp(this._jumpY, this.jumpY, tickDelta)

		renderSprite(this.sprite, framePos, frameRot, this.size, (deg.rotate(this.rot, 90) > 180), (this.impactTicks > 0))
		//debugText(framePos, Math.round(this.jumpCooldown))
	}
	death() {
		emitParticles(SlimeParticle, this.pos, this.size/2)
		spawnCoins(this.pos, 1)
	}
}

class Skeleton extends EnemyBase {
	constructor(pos, rot, vel, velDamp, size) {
		super(pos, rot, vel, velDamp, size); // call the parent constructor
		this.targetNormal = vec.new(0, 0)
		this.damage = 20
		this.maxHealth = 30
		this.health = this.maxHealth
		this.attackCooldown = 10
	}
	tick(t) {
		this._tick(t)

		let s = Math.floor((t/5))
		this.sprite = 	(s % 2 == 0 && sprites.skeleton_idle1) || 
						sprites.skeleton_idle1
		
		this.rot = deg.getDegreePointing(this.midPos, plr.midPos)
		this.targetNormal = deg.getNormalVec(this.rot)

		
		const plrDist = vec.magnitudeSquared(vec.sub(plr.pos, this.pos))
		if (plrDist > 200){
			this.vel = vec.add(this.vel, vec.mulNum(this.targetNormal, 2))
		}else{
			if (this.attackCooldown > 0){this.attackCooldown = this.attackCooldown - 1}
			if (this.attackCooldown <= 0){
				this.attackCooldown = 15
				entities.push(new EnemyProjectile(this.pos, deg.rotate(this.rot, (Math.random()-0.5)*25)))
				this.vel = vec.add(this.vel, vec.mulNum(this.targetNormal, -20))
				emitParticles(SmokeParticle, this.pos, this.size/2, 3, this.targetNormal)
			}
		}
	}
	render(dt, elapsed, tickDelta, t) {
		let framePos = vec.add(vec.lerp(this._pos, this.pos, tickDelta), camera.framePos)
		let frameRot = 0
		if (vec.magnitudeSquared(this.vel) > 1){
			framePos.y -= Math.abs(Math.sin(t*1.5)*10)
			frameRot = Math.sin(t*1.5)*10
		}

		renderSprite(this.sprite, framePos, frameRot, this.size, (deg.rotate(this.rot, 90) > 180), (this.impactTicks > 0))
		//debugText(framePos, Math.round(this.health))
	}
	death() {
		emitParticles(BoneParticle, this.pos, this.size/2)
		spawnCoins(this.pos, 3)
	}
}

class Charger extends EnemyBase {
	constructor(pos, rot, vel, velDamp, size) {
		super(pos, rot, vel, velDamp, size); // call the parent constructor
		this.targetNormal = vec.new(0, 0)
		this.damage = 25
		this.maxHealth = 25
		this.health = this.maxHealth
		this.attackCooldown = 10
		this.charging = 0
	}
	tick(t) {
		this._tick(t)

		let s = Math.floor((t/5))
		this.sprite = 	(s % 2 == 0 && sprites.charger_idle1) || 
						sprites.charger_idle1
		
		if (this.charging > 0){
			this.charging = this.charging - 1
			this.vel = vec.add(this.vel, vec.mulNum(this.targetNormal, 12))
			return
		}
		this.rot = deg.getDegreePointing(this.midPos, plr.midPos)
		this.targetNormal = deg.getNormalVec(this.rot)

		
		const plrDist = vec.magnitudeSquared(vec.sub(plr.pos, this.pos))
		if (plrDist > 200){
			this.vel = vec.add(this.vel, vec.mulNum(this.targetNormal, 4))
		}else{
			if (this.attackCooldown > 0){this.attackCooldown = this.attackCooldown - 1}
			if (this.attackCooldown <= 0){
				this.attackCooldown = 15
				
				this.charging = 30
				emitParticles(SmokeParticle, this.pos, this.size/2, 3, vec.mulNum(this.targetNormal, -1))
			}
		}
	}
	render(dt, elapsed, tickDelta, t) {
		let framePos = vec.add(vec.lerp(this._pos, this.pos, tickDelta), camera.framePos)
		let frameRot = 0
		if (vec.magnitudeSquared(this.vel) > 1){
			framePos.y -= Math.abs(Math.sin(t*1.5)*10)
			frameRot = Math.sin(t*1.5)*10
		}

		renderSprite(this.sprite, framePos, frameRot, this.size, (deg.rotate(this.rot, 90) > 180), (this.impactTicks > 0))
		//debugText(framePos, Math.round(this.health))
	}
	death() {
		emitParticles(BoneParticle, this.pos, this.size/2)
		spawnCoins(this.pos, 2)
	}
}

let plr = null
function restart(){
	music.playbackRate = 1
	entities = []
	plr = new ControllerEntity(null, null, null, null, null)
	entities.push(plr)
	camera.pos = vec.new(0, 0)
	console.log("Started new game")
}
restart()


//entities.push(new Skeleton(vec.new(128, i*32)))
//entities.push(new Slime(vec.new(60, i*16)))

function getSpawn(){
	const screen = Math.max(canvas.height, canvas.width)/2
	const radius = screen+500
	const minDist = screen
	while (true){
		const rand = vec.mulNum(vec.new(Math.random()-0.5, Math.random()-0.5), 2)
		const pos = vec.add(plr.pos, vec.mulNum(rand, radius))
		const diff = vec.sub(plr.pos, pos)
		const dist = vec.magnitudeSquared(diff)
		if (dist > minDist){
			return pos
		}
	}
}

setInterval(() => {
	if (plr.health <= 0){return}

	for (let i = 0; i < 4; i++){
		entities.push(new Slime(getSpawn()))
		if (Math.random() > 0.9){
			entities.push(new Skeleton(getSpawn()))
		}
		if (Math.random() > 0.9){
			entities.push(new Charger(getSpawn()))
		}
	}

}, 7000);

setInterval(() => {
	if (plr.health <= 0){return}

	if (Math.random() > 0.8){
		entities.push(new Chest(getSpawn()))
	}

}, 400);

//RENDERING

function render(dt, elapsed, tickDelta) {

	if (plr.health <= 0){
		ctx.fillStyle = "rgba(200, 0, 0, 0.7)"
		ctx.fillRect(0, 0, canvas.width, canvas.height)
		displayString("space to restart", middlePos, elapsed, "white")
	}

	
	displayString("HP: "+(Math.round((plr.health/plr.maxHealth)*100))+"%", vec.new(5, 50), elapsed, (plr.health < plr.maxHealth/3 && "rgb(200, 0, 0)"), true)
	displayString("COINS: "+(plr.coins), vec.new(5, 100), elapsed, null, true)

	for (let i in plr.inv){
		const weapon = plr.inv[i]
		const isEquipped = (plr.equippedSlot == i)

		const weaponPos = vec.new((isEquipped && 16) || 0, canvas.height-i*56 - 128)
		renderSprite(weapon.sprite, weaponPos, 0, 128)

		for (let i = 0; i < 3; i++){
			renderSprite(((i < weapon.powerups && sprites.star) || sprites.star_empty), vec.add(weaponPos, vec.new(4, i*19-19 + 128/2)), 0, 16)
		}
	}
}





//TICKING

const tickTime = 50
let lastTickTime = performance.now();

let lastElapsed = 0
function gameLoop(elapsed) {
	const t = performance.now()/100
	const dt = Math.min((elapsed - lastElapsed) / 1000, 0.5)
	lastElapsed = elapsed

	const now = performance.now();
	const timeSinceLastTick = now - lastTickTime;
	const tickDelta = Math.min(timeSinceLastTick / tickTime, 1);

	camera.framePos = vec.lerp(camera._pos, camera.pos, tickDelta)
	if (camera.screenshake > 0) {
		camera.framePos = vec.add(camera.framePos,
			{
				x: getRandomInt(-camera.screenshake, camera.screenshake),
				y: getRandomInt(-camera.screenshake, camera.screenshake)
			}
		)
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.imageSmoothingEnabled = false

	for (let i in entities) {
		let entity = entities[i]
		let framePos = vec.add(vec.lerp(entity._pos, entity.pos, tickDelta), camera.framePos)
		renderShadow(framePos, entity.size)
	}


	for (let i in particles) {
		let particle = particles[i]
		particle.render(dt, elapsed, tickDelta, t)
	}

	for (let i in entities) {
		let entity = entities[i]
		entity.render(dt, elapsed, tickDelta, t)

		let framePos = vec.add(vec.lerp(entity._pos, entity.pos, tickDelta), camera.framePos)
		if (!entity.maxHealth || entity.maxHealth == entity.health){continue}
		const p = entity.health/entity.maxHealth

		ctx.fillStyle = "rgb(35, 5, 5)"
		ctx.fillRect(framePos.x, framePos.y+entity.size, entity.size, 5)
		ctx.fillStyle = "rgb(230, 0, 0)"
		ctx.fillRect(framePos.x, framePos.y+entity.size, p*entity.size, 5)
	}
	render(dt, elapsed, tickDelta, t)


	requestAnimationFrame(gameLoop)
}

function tick(t) {
	lastTickTime = performance.now()

	const dt = tickTime / 1000

	//console.log(plr.pos)
	entities.sort((a, b) => a.pos.y - b.pos.y);
	//for (let i in entities) {
		//let entity = entities[i]

		
	//}

	entities.forEach(function(entity){
		entity.overlapping = []
		for (let j in entities) {
			let entityB = entities[j]
			if (entityB != entity && rectOverlappingRect(
				vec.add(entityB.pos, vec.new(entityB.size, entityB.size*0.5)), vec.new(entityB.size, entityB.size*0.5), 
				vec.add(entity.pos, vec.new(entity.size, entity.size*0.5)), vec.new(entity.size, entity.size*0.5))
			){
				entity.overlapping.push(entityB)
			}
		}

		for (let j in entity.overlapping) {
			let entityB = entity.overlapping[j]
			let rot = deg.getDegreePointing(entityB.midPos, entity.midPos)
			if (entity.ignoreCollisions || entityB.ignoreCollisions){continue}
			let targetNormal = deg.getNormalVec(rot)
			entity.vel = vec.add(vec.mulNum(entity.vel, 0.5), vec.mulNum(targetNormal, 5))
			entityB.vel = vec.add(vec.mulNum(entityB.vel, 0.5), vec.mulNum(targetNormal, -5))
		}

		entity._pos = entity.pos
		entity.vel = vec.mulNum(entity.vel, entity.velDamp)
		entity.pos = vec.add(entity.pos, entity.vel)
		entity.midPos = vec.add(entity.pos, vec.divNum(vec.new(entity.size, entity.size), 2))
		entity.tick(t)
	})

	for (let i in particles) {
		let particle = particles[i]
		particle._pos = particle.pos
		particle.vel = vec.add(particle.vel, vec.new(0, particle.grav))
		particle.vel = vec.mulNum(particle.vel, particle.velDamp)
		particle.pos = vec.add(particle.pos, particle.vel)
		particle.tick(t)
	}

	

	camera._pos = {
		x: camera.pos.x,
		y: camera.pos.y
	}
	const pos = vec.add(plr.pos, vec.mulNum(plr.vel, 0.5))
	const camTarget = vec.mulNum(vec.add(pos, vec.new(-canvas.width / 2, -canvas.height / 2)), -1)
	camera.pos = vec.lerp(camera.pos, camTarget, 0.1)

	if (camera.screenshake > 0) { camera.screenshake *= 0.7 }

}
gameLoop(performance.now())

setInterval(() => {
	tick(performance.now()/100)
}, tickTime);

document.addEventListener("keydown", function (event) {
	if (event.key.toLowerCase() === "w") {
		plr.inputs.w = true
		return
	}
	if (event.key.toLowerCase() === "a") {
		plr.inputs.a = true
		return
	}
	if (event.key.toLowerCase() === "s") {
		plr.inputs.s = true
		return
	}
	if (event.key.toLowerCase() === "d") {
		plr.inputs.d = true
		return
	}
	if (event.key.toLowerCase() === " ") {
		plr.inputs.space = true
		if (plr.health <= 0){
			restart()
		}
		return
	}
	if (event.key.toLowerCase() === "q") {
		plr.dropEquippedWeapon()
		return
	}
})

document.addEventListener("mousedown", function (event) {
	plr.inputs.attack = true
})
document.addEventListener("mouseup", function (event) {
	plr.inputs.attack = false
})

document.addEventListener("keyup", function (event) {
	if (event.key.toLowerCase() === "w") {
		plr.inputs.w = false
		return
	}
	if (event.key.toLowerCase() === "a") {
		plr.inputs.a = false
		return
	}
	if (event.key.toLowerCase() === "s") {
		plr.inputs.s = false
		return
	}
	if (event.key.toLowerCase() === "d") {
		plr.inputs.d = false
		return
	}
	if (event.key.toLowerCase() === " ") {
		plr.inputs.space = false
		return
	}
	const num = Number(event.key)
	if (num) {
		plr.equipWeapon(clamp(num-1, 0, plr.inv.length-1))
		return
	}
})

document.addEventListener("wheel", function (event) {
	const add = (event.deltaY > 0 && -1) || 1
	let newSlot = plr.equippedSlot + add

	if (newSlot > plr.inv.length-1){
		newSlot = 0
	}
	if (newSlot < 0){
		newSlot = plr.inv.length-1
	}

	plr.equipWeapon(newSlot)
})


