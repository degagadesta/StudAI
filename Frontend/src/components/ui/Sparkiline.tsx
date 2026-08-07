interface SparklineProps {
  points: number[]; // arbitrary-scale values, will be normalized
  color?: string;
  width?: number;
  height?: number;
}

/**
 * Decorative trend line for stat cards. Currently fed static/derived
 * shapes since the backend doesn't return historical time-series data
 * yet — swap `points` for real values (e.g. progress over the last 7
 * days) once that endpoint exists.
 */
export default function Sparkline({
  points,
  color = "#2F4A3D",
  width = 72,
  height = 28,
}: SparklineProps) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const coords = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        points={coords}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
