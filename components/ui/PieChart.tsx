"use client";

import { useState } from "react";

interface PieChartData {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  size?: number;
}

export default function PieChart({ data, size = 120 }: PieChartProps) {
  const [hoveredSector, setHoveredSector] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  // Filtrer les données avec valeur > 0
  const filteredData = data.filter((item) => item.value > 0);

  if (filteredData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[120px] text-sm text-[var(--color-neutral-500)]">
        Aucune donnée
      </div>
    );
  }

  // Calculer le total
  const total = filteredData.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-[120px] text-sm text-[var(--color-neutral-500)]">
        Aucune donnée
      </div>
    );
  }

  // Calculer les angles pour chaque secteur
  let currentAngle = -90; // Commencer en haut
  const radius = size / 2 - 10;
  const center = size / 2;

  const sectors = filteredData.map((item) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    // Calculer les coordonnées pour le secteur
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startAngleRad);
    const y1 = center + radius * Math.sin(startAngleRad);
    const x2 = center + radius * Math.cos(endAngleRad);
    const y2 = center + radius * Math.sin(endAngleRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      "Z",
    ].join(" ");

    return {
      ...item,
      pathData,
      percentage: percentage.toFixed(1),
      startAngle,
      endAngle,
    };
  });

  const handleMouseEnter = (index: number, event: React.MouseEvent<SVGPathElement>) => {
    setHoveredSector(index);
    updateTooltipPosition(event.clientX, event.clientY);
  };

  const handleMouseMove = (event: React.MouseEvent<SVGPathElement>) => {
    if (hoveredSector !== null) {
      updateTooltipPosition(event.clientX, event.clientY);
    }
  };

  const updateTooltipPosition = (clientX: number, clientY: number) => {
    // Ajuster la position pour éviter que le tooltip sorte de l'écran
    const tooltipWidth = 150; // Estimation de la largeur du tooltip
    const tooltipHeight = 80; // Estimation de la hauteur du tooltip
    const margin = 10;

    let x = clientX + margin;
    let y = clientY - margin;

    // Vérifier les bords de l'écran
    if (x + tooltipWidth > window.innerWidth) {
      x = clientX - tooltipWidth - margin;
    }
    if (y - tooltipHeight < 0) {
      y = clientY + margin;
    }

    setTooltipPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setHoveredSector(null);
    setTooltipPosition(null);
  };

  return (
    <div className="flex flex-col items-center relative">
      <svg width={size} height={size} className="mb-3">
        {sectors.map((sector, index) => (
          <path
            key={index}
            d={sector.pathData}
            fill={sector.color}
            stroke="white"
            strokeWidth="2"
            onMouseEnter={(e) => handleMouseEnter(index, e)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="cursor-pointer transition-opacity"
            style={{
              opacity: hoveredSector !== null && hoveredSector !== index ? 0.5 : 1,
            }}
          />
        ))}
      </svg>
      {hoveredSector !== null && tooltipPosition && (
        <div
          className="fixed z-50 bg-[var(--color-dark)] text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none whitespace-nowrap"
          style={{
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y - 10}px`,
            transform: "translateY(-100%)",
          }}
        >
          <div className="font-semibold mb-1">{sectors[hoveredSector].label}</div>
          <div className="text-white/90 space-y-0.5">
            <div>Valeur : {sectors[hoveredSector].value}</div>
            <div>Pourcentage : {sectors[hoveredSector].percentage}%</div>
          </div>
        </div>
      )}
      <div className="w-full space-y-1">
        {sectors.map((sector, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: sector.color }}
              />
              <span className="text-[var(--color-neutral-600)]">{sector.label}</span>
            </div>
            <span className="font-medium text-[var(--color-dark)]">
              {sector.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

