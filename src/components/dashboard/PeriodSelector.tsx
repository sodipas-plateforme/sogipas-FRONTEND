import { cn } from "@/lib/utils";

type Period = "day" | "month" | "year";

interface PeriodSelectorProps {
  value: Period;
  onChange: (period: Period) => void;
}

const periods: { value: Period; label: string }[] = [
  { value: "day", label: "Jour" },
  { value: "month", label: "Mois" },
  { value: "year", label: "Année" },
];

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="inline-flex rounded-lg bg-[#E5E7EB] p-1">
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onChange(period.value)}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-all",
            value === period.value
              ? "bg-[#1F3A5F] text-white shadow-sm"
              : "text-[#6B7280] hover:text-[#1F2937]"
          )}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}
