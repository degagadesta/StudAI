import { useState } from "react";
import type { ActivityBreakdown, ActivityBucket } from "../../api/AnalyticsApi";

type Range = "daily" | "weekly" | "monthly";

const RANGE_CONFIG: Record
  Range,
  { label: string; unit: string; max: number; helper: string }
> = {
  daily: { label: "Daily", unit: "h", max: 24, helper: "Hours spent, last 6 days" },
  weekly: { label: "Weekly", unit: "d", max: 7, helper: "Days active, past 4 weeks" },
  monthly: { label: "Monthly", unit: "d", max: 31, helper: "Days active, past 12 months" },
};

function Bars({
  buckets,
  unit,
  max,
}: {
  buckets: ActivityBucket[];
  unit: string;
  max: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const scaleMax = Math.max(max, ...buckets.map((b) => b.value));

  return (
    <div className="relative flex items-end justify-between gap-2 h-48 mt-6">
      {buckets.map((b, i) => {
        const heightPct = (b.value / scaleMax) * 100;
        const isActive = hovered === i;
        return (
          <div
            key={`${b.label}-${i}`}
            className="flex-1 flex flex-col items-center gap-2 h-full justify-end relative"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {isActive && (
              <div className="absolute -top-9 bg-[#253D31] text-[#F6F1E3] text-xs font-mono px-2.5 py-1 rounded-lg whitespace-nowrap">
                {b.value}
                {unit}
              </div>
            )}
            <div
              className={`w-full rounded-lg transition-colors ${
                isActive ? "bg-[#8CA37E]" : "bg-[#EFE8D4]"
              }`}
              style={{ height: `${Math.max(heightPct, 3)}%` }}
            />
            <span className="text-xs text-[#A9A18A]">{b.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function ActivityBarChart({ data }: { data: ActivityBreakdown }) {
  const [range, setRange] = useState<Range>("daily");
  const config = RANGE_CONFIG[range];
  const buckets = data[range];

  return (
    <div className="bg-[#FFFDF7] border border-[#DCD2B4] rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-serif text-lg text-[#253D31]">Time spent</p>
          <p className="text-xs text-[#5B6156] mt-0.5">{config.helper}</p>
        </div>
        <div className="flex bg-[#F4EFDD] rounded-full p-1">
          {(Object.keys(RANGE_CONFIG) as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                range === r
                  ? "bg-[#253D31] text-[#F6F1E3]"
                  : "text-[#5B6156] hover:text-[#253D31]"
              }`}
            >
              {RANGE_CONFIG[r].label}
            </button>
          ))}
        </div>
      </div>
      <Bars buckets={buckets} unit={config.unit} max={config.max} />
    </div>
  );
}