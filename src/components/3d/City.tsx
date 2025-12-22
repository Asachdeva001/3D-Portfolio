import { useState, useEffect } from "react";
import Building from "./Building";
import { cityConfig } from "@/data/cityConfig";

interface BuildingData {
  id: number;
  position: [number, number, number];
  height: number;
  width: number;
  depth: number;
  neonColor: string;
  windowPattern: number;
}

/* ------------------ Pure generator ------------------ */
function generateBuildings(): BuildingData[] {
  const buildingArray: BuildingData[] = [];
  const { count, minHeight, maxHeight, spacing, neonColors } =
    cityConfig.buildings;

  const buildingsPerSide = Math.sqrt(count);

  for (let i = 0; i < count; i++) {
    const x =
      ((i % buildingsPerSide) - buildingsPerSide / 2) * spacing +
      (Math.random() - 0.5) * spacing * 0.3;

    const z =
      (Math.floor(i / buildingsPerSide) - buildingsPerSide / 2) * spacing +
      (Math.random() - 0.5) * spacing * 0.3;

    if (Math.abs(x) < 15 && Math.abs(z) < 15) continue;

    const height = minHeight + Math.random() * (maxHeight - minHeight);
    const width = 3 + Math.random() * 4;
    const depth = 3 + Math.random() * 4;
    const neonColor =
      neonColors[Math.floor(Math.random() * neonColors.length)];

    buildingArray.push({
      id: i,
      position: [x, height / 2, z],
      height,
      width,
      depth,
      neonColor,
      windowPattern: 0.2 + Math.random() * 0.4,
    });
  }

  return buildingArray;
}

export default function City() {
  /* ---------- Lazy initialization ---------- */
  const [buildings, setBuildings] = useState<BuildingData[]>(() =>
    generateBuildings()
  );

  /* ---------- Sync (future-proof) ---------- */
  useEffect(() => {
    setBuildings(generateBuildings());
  }, []);

  return (
    <group>
      {buildings.map((building) => (
        <Building
          key={building.id}
          position={building.position}
          height={building.height}
          width={building.width}
          depth={building.depth}
          neonColor={building.neonColor}
          windowPattern={building.windowPattern}
        />
      ))}
    </group>
  );
}
