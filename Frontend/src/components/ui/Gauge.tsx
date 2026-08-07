interface GaugeProps {
  value: number; // 0–100
  size?: number;
}

/**
 * Semi-circle progress gauge, decorative percentage display (matches
 * the "Earnings 80%" style gauge from the reference design). Pure SVG,
 * no chart library needed for something this simple.
 */
export default function Gauge({ value, size = 160 }: GaugeProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = 70;
  const circumference = Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <svg viewBox="0 0 160 90" width={size} height={size * 0.5625}>
      <path
        d="M10,80 A70,70 0 0,1 150,80"
        fill="none"
        stroke="#DCD2B4"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d="M10,80 A70,70 0 0,1 150,80"
        fill="none"
        stroke="#2F4A3D"
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
      />
    </svg>
  );
}
