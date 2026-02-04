import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Period = "day" | "month" | "year";

interface RevenueChartProps {
  period?: Period;
}

// Données simulées par période
const dataByPeriod = {
  day: [
    { name: "8h", encaissement: 420000 },
    { name: "10h", encaissement: 850000 },
    { name: "12h", encaissement: 1200000 },
    { name: "14h", encaissement: 1800000 },
    { name: "16h", encaissement: 2200000 },
    { name: "18h", encaissement: 2500000 },
  ],
  month: [
    { name: "Jan", encaissement: 4200000 },
    { name: "Fév", encaissement: 3800000 },
    { name: "Mar", encaissement: 5100000 },
    { name: "Avr", encaissement: 4700000 },
    { name: "Mai", encaissement: 5500000 },
    { name: "Jun", encaissement: 6200000 },
  ],
  year: [
    { name: "Jan", encaissement: 12000000 },
    { name: "Fév", encaissement: 11500000 },
    { name: "Mar", encaissement: 14000000 },
    { name: "Avr", encaissement: 13500000 },
    { name: "Mai", encaissement: 15000000 },
    { name: "Jun", encaissement: 16500000 },
  ],
};

export function RevenueChart({ period = "month" }: RevenueChartProps) {
  const data = dataByPeriod[period];

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-[#1F2937]">Évolution des encaissements</h3>
          <p className="text-sm text-[#6B7280]">Historique des revenus</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#1F3A5F]" />
          <span className="text-sm text-[#6B7280]">Encaissements</span>
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1F3A5F" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#1F3A5F" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#6B7280" }}
              axisLine={{ stroke: "#E5E7EB" }}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              tick={{ fontSize: 12, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
              dx={-10}
            />
            <Tooltip
              formatter={(value: number) => [`${value.toLocaleString()} F`, "Encaissé"]}
              contentStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              labelStyle={{ color: "#1F2937", fontWeight: 600 }}
            />
            <Area 
              type="monotone"
              dataKey="encaissement" 
              stroke="#1F3A5F"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
