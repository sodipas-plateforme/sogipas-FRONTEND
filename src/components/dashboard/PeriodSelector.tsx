import { useState } from "react";
import { cn } from "@/lib/utils";
import { Calendar, ChevronDown } from "lucide-react";

type Period = "day" | "month" | "year";

interface PeriodSelectorProps {
  value: Period;
  date?: string;
  onChange: (period: Period, date?: string) => void;
}

const periods: { value: Period; label: string }[] = [
  { value: "day", label: "Jour" },
  { value: "month", label: "Mois" },
  { value: "year", label: "Année" },
];

export function PeriodSelector({ value, date, onChange }: PeriodSelectorProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(date || new Date().toISOString().split('T')[0]);

  const handlePeriodChange = (period: Period) => {
    onChange(period, undefined);
  };

  const handleDateConfirm = () => {
    onChange('day', tempDate);
    setShowDatePicker(false);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="relative flex items-center gap-2">
      {/* Period Selector */}
      <div className="inline-flex rounded-lg bg-[#E5E7EB] p-1">
        {periods.map((period) => (
          <button
            key={period.value}
            onClick={() => handlePeriodChange(period.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
              value === period.value
                ? "bg-[#1F3A5F] text-white shadow-sm"
                : "text-[#6B7280] hover:text-[#1F2937]"
            )}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Date Picker Button */}
      <div className="relative">
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-all",
            date 
              ? "border-[#1F3A5F] bg-[#1F3A5F]/5 text-[#1F3A5F]" 
              : "border-[#E5E7EB] text-[#6B7280] hover:border-[#1F3A5F]"
          )}
        >
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">{formatDate(date || '')}</span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", showDatePicker && "rotate-180")} />
        </button>

        {/* Date Picker Dropdown */}
        {showDatePicker && (
          <div className="absolute right-0 top-full mt-2 z-50 rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-lg">
            <div className="space-y-3">
              <input
                type="date"
                value={tempDate}
                onChange={(e) => setTempDate(e.target.value)}
                className="w-full rounded-md border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#1F3A5F] focus:outline-none focus:ring-1 focus:ring-[#1F3A5F]"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setTempDate(new Date().toISOString().split('T')[0])}
                  className="flex-1 rounded-md bg-[#E5E7EB] px-3 py-1.5 text-sm font-medium text-[#6B7280] hover:bg-[#D1D5DB]"
                >
                  Aujourd'hui
                </button>
                <button
                  onClick={handleDateConfirm}
                  className="flex-1 rounded-md bg-[#1F3A5F] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#1a2d4a]"
                >
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {showDatePicker && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDatePicker(false)}
        />
      )}
    </div>
  );
}
