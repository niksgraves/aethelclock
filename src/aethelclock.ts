export interface PlanetaryMetrics {
    radius: number;
    period: number;
    eccentricity: number;
    color: string;
}

export interface PlanetState {
    planetName: string;
    gearTeeth: number;
    inputAngle: number;
    outputAngle: number;
    coord: { x: number, y: number};
    color: string;
}

export class AethelclockEngine {
    public readonly baseTeeth = 64;

    public readonly ephemeris: Record<string, PlanetaryMetrics> = {
    // --- Inner Terrestrial Train ---
    MERCURY: { radius: 25,  period: 87.969,   eccentricity: 0.2056, color: '#8a8d8f' },
    VENUS:   { radius: 45,  period: 224.701,  eccentricity: 0.0067, color: '#e3bb76' },
    EARTH:   { radius: 70,  period: 365.256,  eccentricity: 0.0167, color: '#4ba3e3' },
    MARS:    { radius: 95,  period: 686.980,  eccentricity: 0.0934, color: '#c15c3d' },
    
    // --- Outer Gas Giant Train (Scaled Radii) ---
    JUPITER: { radius: 125, period: 4332.59,  eccentricity: 0.0489, color: '#b07f35' }, // ~11.86 Earth Years
    SATURN:  { radius: 150, period: 10759.22, eccentricity: 0.0555, color: '#ead6b8' }, // ~29.46 Earth Years
    URANUS:  { radius: 175, period: 30688.50, eccentricity: 0.0472, color: '#4b70dd' }, // ~84.02 Earth Years
    NEPTUNE: { radius: 195, period: 60195.00, eccentricity: 0.0086, color: '#274687' }  // ~164.8 Earth Years
    };

    public ComputeFullSystemState(daysElapsed: number): PlanetState[] {
        const earth = this.ephemeris.EARTH;

        return Object.keys(this.ephemeris).map((name) => {
            const planet = this.ephemeris[name];
            
            const ratio = planet.period / earth.period;
            const morphingTeeth = Math.round(this.baseTeeth * ratio);

            const inputAngle = (daysElapsed / planet.period) * 360 % 360;

            // Keplerian Modulation
            const radInput = inputAngle * (Math.PI / 180);
            const radOutput = Math.atan2(Math.sin(radInput), Math.cos(radInput) - planet.eccentricity);
            const outputAngle = (radOutput * (180 / Math.PI) + 360) % 360;

            const trueAnomalyRad = outputAngle * (Math.PI / 180);
            const orbitRadius = (planet.radius * (1 - Math.pow(planet.eccentricity, 2))) / (1 + planet.eccentricity * Math.cos(trueAnomalyRad));

            return {
                planetName: name,
                gearTeeth: morphingTeeth,
                inputAngle: inputAngle,
                outputAngle: outputAngle,
                color: planet.color,
                coord: {
                    x: orbitRadius * Math.cos(trueAnomalyRad),
                    y: orbitRadius * Math.sin(trueAnomalyRad)
                }
            };
        });
    }
}