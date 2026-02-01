import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Payées", value: 68, color: "#2E7D32" },
  { name: "Partielles", value: 22, color: "#F9C74F" },
  { name: "Impayées", value: 10, color: "#C62828" },
];

export function InvoiceDistributionChart() {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[#1F2937]">Factures</h3>
        <p className="text-sm text-[#6B7280]">Répartition par statut</p>
      </div>
      <div className="h-[220px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [`${value}%`, name]}
              contentStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#1F2937]">100%</p>
            <p className="text-xs text-[#6B7280]">Total</p>
          </div>
        </div>
      </div>
      {/* Legend */}
      <div className="flex justify-center gap-4 mt-4">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-[#6B7280]">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
