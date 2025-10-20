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
		name: "slime_particle",
		src: "./sprites/enemies/slime/slime_particle.png",
	},

	{
		name: "coin",
		src: "./sprites/pickups/coin.png",
	},
	{
		name: "heart",
		src: "./sprites/pickups/heart.png",
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
	flap: new Audio('./audio/flap.mp3'),
}
function playSnd(name) {
	const snd = sounds[name]
	snd.pause();
	snd.currentTime = 0;
	snd.play();
}


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
vec.magnitude = function (vec) {
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

//sigma

const middlePos = vec.new(canvas.width/2, canvas.height/2)
let camera = {
	pos: vec.new(0, 0),
	_pos: vec.new(0, 0),
	framePos: vec.new(0, 0),
	screenshake: 0,
}
let entities = []

class BaseEntity {
	constructor(pos, rot, vel, velDamp, size) {
		this.pos = pos || middlePos;
		this._pos = pos || middlePos;

		this.rot = rot || 0;
		this._rot = rot || 0;

		this.vel = vel || vec.new(0, 0);
		this.velDamp = velDamp || 0.8;

		this.size = size || vec.new(32, 32);

		this.sprite = sprites.slime_idle1
	}
	tick(elapsed) {

	}
	render(dt, elapsed, tickDelta) {
		const angleInDegrees = 0 + plr.rot;
        const angleInRadians = angleInDegrees * Math.PI / 180;
		const framePos = vec.add(vec.lerp(plr._pos, plr.pos, tickDelta), camera.framePos)

        ctx.save();
		
        ctx.translate(framePos + plr.size/2, framePos + plr.size/2);
        ctx.rotate(angleInRadians);

        ctx.fillStyle = "red"
        ctx.fillRect(-plr.size/2, -plr.size/2, plr.size, plr.size)
        ctx.filter = "none"

        ctx.drawImage(this.sprite, -plr.size/2, -plr.size/2, plr.size, plr.size)

        ctx.restore(); // Restore to the original state
	}
}

class ControllerEntity extends BaseEntity {
	constructor(pos, rot, vel, velDamp, size) {
		super(pos, rot, vel, velDamp, size); // call the parent constructor
		this.inputs = {
			w: false,
			a: false,
			s: false,
			d: false,
			attack: false,
		};
	}
	tick(elapsed) {
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
	}
}

let plr = new ControllerEntity(null, null, null, null, null)
entities.push(plr)



//RENDERING

function render(dt, elapsed, tickDelta) {

	ctx.font = "bold 32px cursive"
	ctx.fillStyle = "rgb(75, 75, 75)"
	function displayString(str, x, y) {
		for (let i = 0; i < str.length; i++) {
			const letter = str[i]
			const pos = {
				x: x + i * 30,
				y: y + Math.sin(elapsed * 0.005 + i) * 5
			}
			ctx.fillText(letter, pos.x, pos.y);
		}
	}
	displayString("Hello World", 20, 50)
}








//TICKING

const tickTime = 50
let lastTickTime = performance.now();

let lastElapsed = 0
function gameLoop(elapsed) {
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
		entity.render(dt, elapsed, tickDelta)
	}
	render(dt, elapsed, tickDelta)

	requestAnimationFrame(gameLoop)
}

function tick() {
	lastTickTime = performance.now()

	const dt = tickTime / 1000

	console.log(plr.pos)
	for (let i in entities) {
		let entity = entities[i]

		entity._pos = entity.pos
		entity.vel = vec.mulNum(entity.vel, entity.velDamp)
		entity.pos = vec.add(entity.pos, entity.vel)
		entity.tick()
	}

	

	camera._pos = {
		x: camera.pos.x,
		y: camera.pos.y
	}
	const pos = vec.add(plr.pos, vec.mulNum(plr.vel, 0.5))
	const camTarget = vec.mulNum(vec.add(pos, vec.new(-canvas.width / 2, -canvas.height / 2)), -1)
	camera.pos = vec.lerp(camera.pos, camTarget, 0.1)

	if (camera.screenshake > 0) { camera.screenshake -= dt * 10 }

}
gameLoop(performance.now())

setInterval(() => {
	tick()
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
		plr.inputs.attack = true
		return
	}
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
		plr.inputs.attack = false
		return
	}
})
