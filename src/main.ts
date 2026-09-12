import './style.css'
import { AethelclockEngine } from './aethelclock'

const engine = new AethelclockEngine();

const mechCanvas = document.getElementById('mechanicsCanvas') as HTMLCanvasElement;
const cosCanvas = document.getElementById('cosmosCanvas') as HTMLCanvasElement;
const crankSlider = document.getElementById('crankSlider') as HTMLInputElement;
const telemetryPanel = document.getElementById('telemetryPanel') as HTMLDivElement;

const ctxMech = mechCanvas.getContext('2d');
const ctxCos = cosCanvas.getContext('2d');

function renderSystem() {
  const daysElapsed = parseFloat(crankSlider.value);
  const systemState = engine.ComputeFullSystemState(daysElapsed);

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
  ctxCos!.fill();

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
    ctxCos!.stroke();

    ctxCos!.beginPath();
    ctxCos!.arc(midX + p.coord.x, midY + p.coord.y, 5, 0, 2 * Math.PI);
    ctxCos!.fillStyle = p.color;
    ctxCos!.fill();
  })
}

crankSlider.addEventListener('input', renderSystem);

renderSystem;