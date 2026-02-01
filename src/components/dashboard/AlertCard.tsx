import { AlertTriangle, Package, Users, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: "stock" | "client" | "payment";
  message: string;
  severity: "warning" | "critical";
}

interface AlertCardProps {
  alerts: Alert[];
}

const alertIcons = {
  stock: Package,
  client: Users,
  payment: AlertTriangle,
};

const severityConfig = {
  warning: {
    bg: "bg-[#F9C74F]/10",
    border: "border-[#F9C74F]/30",
    icon: "text-[#B45309]",
    badge: "bg-[#F9C74F]/20 text-[#B45309]",
  },
  critical: {
    bg: "bg-[#C62828]/10",
    border: "border-[#C62828]/30",
    icon: "text-[#C62828]",
    badge: "bg-[#C62828]/20 text-[#C62828]",
  },
};

export function AlertCard({ alerts }: AlertCardProps) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <h3 className="text-lg font-semibold text-[#1F2937] mb-4">À surveiller</h3>
        <p className="text-sm text-[#6B7280]">Aucune alerte en cours</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#1F2937]">À surveiller</h3>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#1F3A5F]/10 text-[#1F3A5F]">
          {alerts.length}
        </span>
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => {
          const Icon = alertIcons[alert.type];
          const config = severityConfig[alert.severity];
          
          return (
            <div
              key={alert.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border",
                config.bg,
                config.border
              )}
            >
              <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", config.icon)} />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#1F2937]">{alert.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn("px-2 py-0.5 rounded text-xs font-medium", config.badge)}>
                    {alert.severity === "critical" ? "Critique" : "Attention"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <button className="w-full mt-4 text-sm text-[#1F3A5F] font-medium hover:underline flex items-center justify-center gap-1">
        Voir toutes les alertes <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
