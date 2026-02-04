import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

type Period = "day" | "month" | "year";

interface HangarRevenueChartProps {
  period?: Period;
}

const dataByPeriod = {
  day: [
    { name: "8h", hangar1: 150000, hangar2: 80000, hangar3: 120000 },
    { name: "10h", hangar1: 280000, hangar2: 150000, hangar3: 200000 },
    { name: "12h", hangar1: 350000, hangar2: 200000, hangar3: 280000 },
    { name: "14h", hangar1: 420000, hangar2: 280000, hangar3: 350000 },
    { name: "16h", hangar1: 520000, hangar2: 350000, hangar3: 420000 },
    { name: "18h", hangar1: 620000, hangar2: 420000, hangar3: 520000 },
  ],
  month: [
    { name: "Jan", hangar1: 8500000, hangar2: 4200000, hangar3: 5500000 },
    { name: "Fév", hangar1: 7200000, hangar2: 3800000, hangar3: 5100000 },
    { name: "Mar", hangar1: 9100000, hangar2: 4500000, hangar3: 5800000 },
    { name: "Avr", hangar1: 8800000, hangar2: 4300000, hangar3: 5600000 },
    { name: "Mai", hangar1: 9500000, hangar2: 4800000, hangar3: 6200000 },
    { name: "Jun", hangar1: 10200000, hangar2: 5100000, hangar3: 6800000 },
  ],
  year: [
    { name: "Jan", hangar1: 45000000, hangar2: 22000000, hangar3: 28000000 },
    { name: "Fév", hangar1: 42000000, hangar2: 20000000, hangar3: 26000000 },
    { name: "Mar", hangar1: 48000000, hangar2: 24000000, hangar3: 30000000 },
    { name: "Avr", hangar1: 46000000, hangar2: 23000000, hangar3: 29000000 },
    { name: "Mai", hangar1: 52000000, hangar2: 26000000, hangar3: 33000000 },
    { name: "Jun", hangar1: 55000000, hangar2: 28000000, hangar3: 35000000 },
  ],
};

const summaryDataByPeriod = {
  day: [
    { name: "H1", value: 2340000, color: "#1F3A5F", articles: "Bananes" },
    { name: "H2", value: 1480000, color: "#2E7D32", articles: "Mangues, Ananas" },
    { name: "H3", value: 1890000, color: "#F9C74F", articles: "Papayes, Oranges" },
  ],
  month: [
    { name: "H1", value: 53300000, color: "#1F3A5F", articles: "Bananes" },
    { name: "H2", value: 26700000, color: "#2E7D32", articles: "Mangues, Ananas" },
    { name: "H3", value: 35000000, color: "#F9C74F", articles: "Papayes, Oranges" },
  ],
  year: [
    { name: "H1", value: 288000000, color: "#1F3A5F", articles: "Bananes" },
    { name: "H2", value: 143000000, color: "#2E7D32", articles: "Mangues, Ananas" },
    { name: "H3", value: 181000000, color: "#F9C74F", articles: "Papayes, Oranges" },
  ],
};

export function HangarRevenueChart({ period = "month" }: HangarRevenueChartProps) {
  const data = dataByPeriod[period];
  const summaryData = summaryDataByPeriod[period];
  const total = summaryData.reduce((sum, h) => sum + h.value, 0);

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#1F2937]">Encaissements par hangar</h3>
        <p className="text-sm text-[#6B7280]">Répartition du CA par entrepôt</p>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {summaryData.map((item, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-[#E5E7EB] p-4"
            style={{ borderLeftColor: item.color, borderLeftWidth: '4px' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#1F2937]">{item.name}</span>
              <span className="text-xs font-medium text-[#6B7280]">
                {Math.round((item.value / total) * 100)}%
              </span>
            </div>
            <p className="text-xl font-bold text-[#1F3A5F]">
              {(item.value / 1000000).toFixed(1)}M F
            </p>
            <p className="text-xs text-[#6B7280] mt-1 truncate">{item.articles}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#6B7280" }}
              axisLine={{ stroke: "#E5E7EB" }}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
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
            <Legend />
            <Bar dataKey="hangar1" name="Hangar 1" fill="#1F3A5F" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="hangar2" name="Hangar 2" fill="#2E7D32" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="hangar3" name="Hangar 3" fill="#F9C74F" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Total */}
      <div className="mt-4 p-3 bg-[#F9FAFB] rounded-lg flex justify-between">
        <span className="text-sm font-medium text-[#1F2937]">Total</span>
        <span className="text-sm font-bold text-[#1F3A5F]">{(total / 1000000).toFixed(1)}M F</span>
      </div>
    </div>
  );
}
