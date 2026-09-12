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
        MERCURY: { radius: 35, period: 87.97, eccentricity: 0.2056, color: '#8a8d8f' },
        VENUS: { radius: 65, period: 244.70, eccentricity: 0.0067, color: '#8a8d8f' },
        EARTH: { radius: 100, period: 365.26, eccentricity: 0.0167, color: '#8a8d8f' },
        MARS: { radius: 145, period: 686.98, eccentricity: 0.0934, color: '#8a8d8f' }
    }

    /**
     * ComputeFullSystemState
     */
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