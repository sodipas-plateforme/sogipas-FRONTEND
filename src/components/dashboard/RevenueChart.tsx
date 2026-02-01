import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { name: "Jan", encaissement: 4200000, objectif: 4500000 },
  { name: "Fév", encaissement: 3800000, objectif: 4500000 },
  { name: "Mar", encaissement: 5100000, objectif: 4800000 },
  { name: "Avr", encaissement: 4700000, objectif: 4800000 },
  { name: "Mai", encaissement: 5500000, objectif: 5000000 },
  { name: "Jun", encaissement: 6200000, objectif: 5000000 },
];

export function RevenueChart() {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-[#1F2937]">Encaissements</h3>
          <p className="text-sm text-[#6B7280]">Comparaison vs objectif</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#1F3A5F]" />
            <span className="text-[#6B7280]">Encaissé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#2E7D32]" />
            <span className="text-[#6B7280]">Objectif</span>
          </div>
        </div>
      </div>
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
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              tick={{ fontSize: 12, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
              dx={-10}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value.toLocaleString()} FCFA`,
                name === "encaissement" ? "Encaissé" : "Objectif"
              ]}
              contentStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              labelStyle={{ color: "#1F2937", fontWeight: 600 }}
            />
            <Bar 
              dataKey="encaissement" 
              fill="#1F3A5F" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={50}
            />
            <Bar 
              dataKey="objectif" 
              fill="#2E7D32" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
