import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

interface Client {
  id: string;
  name: string;
  phone: string;
  totalSpent: number;
  status: "good" | "warning" | "critical";
  ca: number;
}

const clients: Client[] = [
  { id: "1", name: "Supermarché Central", phone: "+225 07 88 12 34 56", totalSpent: 12500000, ca: 68, status: "good" },
  { id: "2", name: "Restaurant Le Palmier", phone: "+225 05 67 89 01 23", totalSpent: 8700000, ca: 47, status: "good" },
  { id: "3", name: "Hôtel Ivoire Palace", phone: "+225 01 23 45 67 89", totalSpent: 6200000, ca: 34, status: "warning" },
  { id: "4", name: "Casino Supérette", phone: "+225 05 55 66 77 88", totalSpent: 3900000, ca: 21, status: "critical" },
];

const statusConfig = {
  good: { label: "À jour", bg: "bg-[#2E7D32]/10", text: "text-[#2E7D32]" },
  warning: { label: "En retard", bg: "bg-[#F9C74F]/20", text: "text-[#B45309]" },
  critical: { label: "Critique", bg: "bg-[#C62828]/10", text: "text-[#C62828]" },
};

export function TopClientsTable() {
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
