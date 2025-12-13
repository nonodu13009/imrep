"use client";

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

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="mb-3">
        {sectors.map((sector, index) => (
          <path
            key={index}
            d={sector.pathData}
            fill={sector.color}
            stroke="white"
            strokeWidth="2"
          />
        ))}
      </svg>
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

