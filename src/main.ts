import './style.css'
import { AethelclockEngine } from './aethelclock'

const engine = new AethelclockEngine();

const mechCanvas = document.getElementById('mechanicsCanvas') as HTMLCanvasElement;
const cosCanvas = document.getElementById('cosmosCanvas') as HTMLCanvasElement;
const crankCanvas = document.getElementById('crankWheel') as HTMLCanvasElement;
const telemetryPanel = document.getElementById('telemetryPanel') as HTMLDivElement;

const ctxMech = mechCanvas.getContext('2d');
const ctxCos = cosCanvas.getContext('2d');
const ctxCrank = crankCanvas.getContext('2d');

// Crank state
const DAYS_PER_ROTATION = 30;
const FRICTION = 0.96;
const STOP_EPSILON = 0.0008;

let daysElapsed = 0;
let rotation = 0;
let angularVelocity = 0;

let dragging = false;
let lastPointerAngle = 0;
let lastMoveTime = 0;

function crankCenter() {
	return { cx: crankCanvas.width / 2, cy: crankCanvas.height / 2 };
}

function pointerAngle(e: PointerEvent) {
	const rect = crankCanvas.getBoundingClientRect();
	const { cx, cy } = crankCenter();
	const x = e.clientX - rect.left - cx;
	const y = e.clientY - rect.top - cy;
	return Math.atan2(y, x);
}

function shortestAngleDelta(from: number, to: number) {
	let d = to - from;
	while (d > Math.PI) d -= 2 * Math.PI;
	while (d < -Math.PI) d += 2 * Math.PI;
	return d;
}

crankCanvas.addEventListener('pointerdown', (e) => {
	dragging = true;
	angularVelocity = 0;
	lastPointerAngle = pointerAngle(e);
	lastMoveTime = performance.now();
	crankCanvas.setPointerCapture(e.pointerId);
	crankCanvas.classList.add('grabbing');
});

crankCanvas.addEventListener('pointermove', (e) => {
	if (!dragging) return;
	const now = performance.now();
	const dt = Math.max(now - lastMoveTime, 1);
	const angle = pointerAngle(e);
	const delta = shortestAngleDelta(lastPointerAngle, angle);

	rotation += delta;
	daysElapsed += (delta / (2 * Math.PI)) * DAYS_PER_ROTATION;

	const instVelocity = delta / (dt / 16.67);
	angularVelocity = angularVelocity * 0.5 + instVelocity * 0.5;

	lastPointerAngle = angle;
	lastMoveTime = now;

	renderSystem();
});

function endDrag(e: PointerEvent) {
	if (!dragging) return;
	dragging = false;
	crankCanvas.releasePointerCapture(e.pointerId);
	crankCanvas.classList.remove('dragging');
	requestAnimationFrame(coastLoop);
}

crankCanvas.addEventListener('pointerup', endDrag);
crankCanvas.addEventListener('pointercancel', endDrag);

function coastLoop() {
	if (dragging) return;
	if (Math.abs(angularVelocity) < STOP_EPSILON) {
		angularVelocity = 0;
		return;
	}

	rotation += angularVelocity;
	daysElapsed += (angularVelocity / (2 * Math.PI)) * DAYS_PER_ROTATION;
	angularVelocity *= FRICTION;

	renderSystem();
	requestAnimationFrame(coastLoop);
}

function drawCrank() {
	if (!ctxCrank) return;
	const { cx, cy } = crankCenter();
	const r = Math.min(cx, cy) - 10;
	const visualRotation = rotation; // lazy fix

	ctxCrank.clearRect(0, 0, crankCanvas.width, crankCanvas.height);

	ctxCrank.beginPath();
	ctxCrank.arc(cx, cy, r, 0, 2 * Math.PI);
	ctxCrank.strokeStyle = '#45f3ff';
	ctxCrank.lineWidth = 2;
	ctxCrank.stroke();

	const teeth = 24;
	for (let i = 0; i < teeth; i++) {
		const a = visualRotation + (i / teeth) * 2 * Math.PI;
		const x1 = cx + Math.cos(a) * (r - 4);
		const y1 = cy + Math.sin(a) * (r - 4);
		const x2 = cx + Math.cos(a) * (r + 4);
		const y2 = cy + Math.sin(a) * (r + 4);
		ctxCrank.beginPath();
		ctxCrank.moveTo(x1, y1);
		ctxCrank.lineTo(x2, y2);
		ctxCrank.strokeStyle = 'rgba(197, 198, 199, 0.5)';
		ctxCrank.lineWidth = 1.5;
		ctxCrank.stroke();
	}

	// handle indicator, points at current rotation
	ctxCrank.beginPath();
	ctxCrank.moveTo(cx, cy);
	ctxCrank.lineTo(cx + Math.cos(visualRotation) * (r - 15), cy + Math.sin(visualRotation) * (r - 15));
	ctxCrank.strokeStyle = '#FFD700';
	ctxCrank.lineWidth = 3;
	ctxCrank.stroke();

	ctxCrank.beginPath();
	ctxCrank.arc(cx, cy, 6, 0, 2 * Math.PI);
	ctxCrank.fillStyle = '#45f3ff';
	ctxCrank.fill();
}

// calculating the planet positions, client side so this is just drawing, the ratios themselves RATIOOO, are in aethelclock.ts
function renderSystem() {
	const systemState = engine.ComputeFullSystemState(daysElapsed);

	// this is the uhhhh the little boxes that show the data, cool looking
	telemetryPanel.innerHTML = systemState.map(p => `
    <div class="telemetry-col" style="border-left: 3px solid ${p.color}">
      <strong style="color ${p.color}">${p.planetName}</strong><br/>
      Teeth: ${p.gearTeeth}<br/>
      In: ${p.inputAngle.toFixed(0)}&deg; | Out: ${p.outputAngle.toFixed(0)}&deg;
    </div>
    `).join('');

	ctxMech!.clearRect(0, 0, 400, 400);
	const cx = 200, cy = 200;

	ctxMech!.beginPath();
	ctxMech!.arc(cx, cy, 25, 0, 2 * Math.PI);
	ctxMech!.strokeStyle = '#45f3ff';
	ctxMech!.lineWidth = 2;
	ctxMech!.stroke();

	systemState.forEach((p, idx) => {
		const mechanicalStackRadius = 45 + (idx * 30);
		const offsetDistance = engine.ephemeris[p.planetName].eccentricity * 20;

		ctxMech!.beginPath();
		ctxMech!.arc(cx, cy, mechanicalStackRadius, 0, 2 * Math.PI);
		ctxMech!.strokeStyle = 'rgba(197, 198, 199, 0.15)';
		ctxMech!.lineWidth = 1;
		ctxMech!.stroke();

		const outRad = p.outputAngle * (Math.PI / 180);
		ctxMech!.beginPath();
		ctxMech!.moveTo(cx, cy);
		ctxMech!.lineTo(cx + (mechanicalStackRadius + offsetDistance) * Math.cos(outRad), cy + (mechanicalStackRadius + offsetDistance) * Math.sin(outRad));
		ctxMech!.strokeStyle = p.color;
		ctxMech!.lineWidth = 2;
		ctxMech!.stroke();
	});

	ctxCos!.clearRect(0, 0, 400, 400);
	const midX = 200, midY = 200;

	ctxCos!.beginPath();
	ctxCos!.arc(midX, midY, 8, 0, 2 * Math.PI);
	ctxCos!.fillStyle = '#FFD700';
	ctxCos!.fill(); // WOAH!

	systemState.forEach((p) => {
		const config = engine.ephemeris[p.planetName];

		ctxCos!.beginPath();
		for (let a = 0; a <= 360; a += 2) {
			const rRad = a * (Math.PI / 180);
			const r = (config.radius * (1 - Math.pow(config.eccentricity, 2))) / (1 + config.eccentricity * Math.cos(rRad));

			ctxCos!.lineTo(midX + r * Math.cos(rRad), midY + r * Math.sin(rRad));
		}
		ctxCos!.strokeStyle = 'rgba(102, 252, 241, 0.08)';
		ctxCos!.lineWidth = 1;
		ctxCos!.stroke(); // balright

		ctxCos!.beginPath();
		ctxCos!.arc(midX + p.coord.x, midY + p.coord.y, 5, 0, 2 * Math.PI);
		ctxCos!.fillStyle = p.color;
		ctxCos!.fill(); // 👀
	})

	drawCrank();
}

crankCanvas.addEventListener('input', renderSystem);

renderSystem();