import { ArrowRight } from "lucide-react";

type Period = "day" | "month" | "year";

interface Client {
  id: string;
  name: string;
  phone: string;
  totalSpent: number;
  status: "good" | "warning" | "critical";
  ca: number;
}

interface TopClientsTableProps {
  period?: Period;
}

const clientsByPeriod = {
  day: [
    { id: "1", name: "Seydou Diop - Dakar", phone: "+221 77 123 45 67", totalSpent: 450000, ca: 45, status: "good" },
    { id: "2", name: "Mamadou Bah - Conakry", phone: "+224 624 12 34 56", totalSpent: 320000, ca: 32, status: "good" },
    { id: "3", name: "Fatou Ndiaye - Saint-Louis", phone: "+221 70 987 65 43", totalSpent: 280000, ca: 28, status: "warning" },
  ],
  month: [
    { id: "1", name: "Seydou Diop - Dakar", phone: "+221 77 123 45 67", totalSpent: 12500000, ca: 68, status: "good" },
    { id: "2", name: "Mamadou Bah - Conakry", phone: "+224 624 12 34 56", totalSpent: 8700000, ca: 47, status: "good" },
    { id: "3", name: "Fatou Ndiaye - Saint-Louis", phone: "+221 70 987 65 43", totalSpent: 6200000, ca: 34, status: "warning" },
    { id: "4", name: "Aminata Touré - Kaolack", phone: "+221 76 555 66 77", totalSpent: 3900000, ca: 21, status: "critical" },
  ],
  year: [
    { id: "1", name: "Seydou Diop - Dakar", phone: "+221 77 123 45 67", totalSpent: 45000000, ca: 72, status: "good" },
    { id: "2", name: "Mamadou Bah - Conakry", phone: "+224 624 12 34 56", totalSpent: 32000000, ca: 52, status: "good" },
    { id: "3", name: "Fatou Ndiaye - Saint-Louis", phone: "+221 70 987 65 43", totalSpent: 28000000, ca: 45, status: "warning" },
    { id: "4", name: "Aminata Touré - Kaolack", phone: "+221 76 555 66 77", totalSpent: 15000000, ca: 24, status: "critical" },
  ],
};

const statusConfig = {
  good: { label: "À jour", bg: "bg-[#2E7D32]/10", text: "text-[#2E7D32]" },
  warning: { label: "En retard", bg: "bg-[#F9C74F]/20", text: "text-[#B45309]" },
  critical: { label: "Critique", bg: "bg-[#C62828]/10", text: "text-[#C62828]" },
};

export function TopClientsTable({ period = "month" }: TopClientsTableProps) {
  const clients = clientsByPeriod[period];
  const maxCA = Math.max(...clients.map(c => c.ca));

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-[#1F2937]">Top clients</h3>
          <p className="text-sm text-[#6B7280]">Par chiffre d'affaires</p>
        </div>
        <button className="text-sm text-[#1F3A5F] font-medium hover:underline flex items-center gap-1">
          Voir tout <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-4">
        {clients.map((client) => {
          const status = statusConfig[client.status];
          const caPercent = (client.ca / maxCA) * 100;
          
          return (
            <div key={client.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 min-w-[140px]">
                    <span className="text-sm font-medium text-[#1F2937]">{client.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                  </div>
                  <span className="text-sm text-[#6B7280]">{client.totalSpent.toLocaleString()} F</span>
                </div>
                <span className="text-sm font-semibold text-[#1F2937]">{client.ca}%</span>
              </div>
              <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#1F3A5F] rounded-full transition-all"
                  style={{ width: `${caPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
