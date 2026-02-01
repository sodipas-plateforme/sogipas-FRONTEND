import { useState } from "react";
import { Truck, Package, DollarSign, AlertTriangle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { InvoiceDistributionChart } from "@/components/dashboard/InvoiceDistributionChart";
import { TopClientsTable } from "@/components/dashboard/TopClientsTable";

const alerts = [
  { id: "1", type: "stock" as const, message: "Stock de bananes faible au Hangar 2", severity: "warning" as const },
  { id: "2", type: "client" as const, message: "Casino Supérette - Dette critique : 850,000 F", severity: "critical" as const },
  { id: "3", type: "stock" as const, message: "Rupture imminente : Mangues (Hangar 1)", severity: "critical" as const },
];

export default function Dashboard() {
  const [period, setPeriod] = useState<"day" | "month" | "year">("month");

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1F2937]">Tableau de bord</h1>
            <p className="text-sm text-[#6B7280]">Vue globale des activités de SODIPAS</p>
          </div>
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>

        {/* KPI Grid - 4 KPIs with main color background */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Camions reçus"
            value="24"
            period={period === "month" ? "ce mois" : period === "year" ? "cette année" : "aujourd'hui"}
            trend={12}
            icon={Truck}
            isPositive={true}
          />
          <KPICard
            title="Stocks disponibles"
            value="156 T"
            period={period === "month" ? "ce mois" : period === "year" ? "cette année" : "aujourd'hui"}
            trend={-5}
            icon={Package}
            isNegative={true}
          />
          <KPICard
            title="Montant encaissé"
            value="12.4M F"
            period={period === "month" ? "ce mois" : period === "year" ? "cette année" : "aujourd'hui"}
            trend={15}
            icon={DollarSign}
            isPositive={true}
          />
          <KPICard
            title="Dettes totales"
            value="3.2M F"
            period={period === "month" ? "ce mois" : period === "year" ? "cette année" : "aujourd'hui"}
            trend={-5}
            icon={AlertTriangle}
            isNegative={true}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <InvoiceDistributionChart />
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TopClientsTable />
          </div>
          <AlertCard alerts={alerts} />
        </div>
      </div>
    </AppLayout>
  );
}
