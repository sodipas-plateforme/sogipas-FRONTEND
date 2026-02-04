import { useState, useMemo, useRef } from "react";
import { Truck, Package, DollarSign, AlertTriangle, RefreshCw, Download } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { AppLayout } from "@/components/layout/AppLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { InvoiceDistributionChart } from "@/components/dashboard/InvoiceDistributionChart";
import { TopClientsTable } from "@/components/dashboard/TopClientsTable";
import { HangarRevenueChart } from "@/components/dashboard/HangarRevenueChart";

type Period = "day" | "month" | "year";

// Données simulées par période
const kpiData = {
  day: {
    collected: "2.5M F",
    trucks: 8,
    stocks: "156 T",
    debt: "3.2M F",
    collectedTrend: 12,
    trucksTrend: 5,
    stocksTrend: -3,
    debtTrend: -8,
  },
  month: {
    collected: "12.4M F",
    trucks: 24,
    stocks: "156 T",
    debt: "3.2M F",
    collectedTrend: 15,
    trucksTrend: 12,
    stocksTrend: -5,
    debtTrend: -5,
  },
  year: {
    collected: "145M F",
    trucks: 320,
    stocks: "156 T",
    debt: "3.2M F",
    collectedTrend: 22,
    trucksTrend: 18,
    stocksTrend: 8,
    debtTrend: -12,
  },
};

const alertsData = {
  day: [
    { id: "1", type: "stock" as const, message: "Stock de bananes faible au Hangar 2", severity: "warning" as const },
    { id: "2", type: "client" as const, message: "Seydou Diop - Dakar - Dette critique : 850,000 F", severity: "critical" as const },
  ],
  month: [
    { id: "1", type: "stock" as const, message: "Stock de bananes faible au Hangar 2", severity: "warning" as const },
    { id: "2", type: "client" as const, message: "Seydou Diop - Dakar - Dette critique : 850,000 F", severity: "critical" as const },
    { id: "3", type: "stock" as const, message: "Rupture imminente : Mangues (Hangar 1)", severity: "critical" as const },
  ],
  year: [
    { id: "1", type: "stock" as const, message: "Stock de bananes faible au Hangar 2", severity: "warning" as const },
    { id: "2", type: "client" as const, message: "Seydou Diop - Dakar - Dette critique : 850,000 F", severity: "critical" as const },
    { id: "3", type: "stock" as const, message: "Rupture imminente : Mangues (Hangar 1)", severity: "critical" as const },
    { id: "4", type: "stock" as const, message: "Ananas en baisse (Hangar 2)", severity: "warning" as const },
  ],
};

export default function Dashboard() {
  const [period, setPeriod] = useState<Period>("month");
  const [date, setDate] = useState<string | undefined>();

  // Récupérer les données selon la période sélectionnée
  const currentData = useMemo(() => {
    return kpiData[period];
  }, [period]);

  const currentAlerts = useMemo(() => {
    return alertsData[period];
  }, [period]);

  const handlePeriodChange = (newPeriod: Period, newDate?: string) => {
    setPeriod(newPeriod);
    setDate(newDate);
  };

  const handleExportPDF = async () => {
    const dashboardElement = document.getElementById("dashboard-content");
    if (!dashboardElement) return;

    try {
      const canvas = await html2canvas(dashboardElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: dashboardElement.scrollWidth,
        windowHeight: dashboardElement.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;

      // Add title
      pdf.setFontSize(16);
      pdf.setTextColor(31, 41, 55);
      pdf.text(`Tableau de bord SODIPAS - ${getPeriodLabel()}`, 10, 15);
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128);
      pdf.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, 10, 22);

      // Add image
      pdf.addImage(imgData, "PNG", 10, 30, pdfWidth - 20, scaledHeight * (pdfWidth - 20) / scaledWidth);

      pdf.save(`dashboard-sodipas-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
    }
  };

  const getPeriodLabel = () => {
    if (date) {
      return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    return period === "month" ? "ce mois" : period === "year" ? "cette année" : "aujourd'hui";
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1F2937]">Tableau de bord</h1>
            <p className="text-sm text-[#6B7280]">
              Vue globale des activités de SODIPAS • {getPeriodLabel()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PeriodSelector value={period} date={date} onChange={handlePeriodChange} />
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-[#1F3A5F] rounded-lg hover:bg-[#1F3A5F]/90 transition-colors"
            >
              <Download className="h-4 w-4" />
              PDF
            </button>
          </div>
        </div>

        {/* Dashboard Content - ID for PDF export */}
        <div id="dashboard-content">
          {/* KPI Grid - 4 KPIs with main color background */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Montant encaissé"
              value={currentData.collected}
              period={getPeriodLabel()}
              trend={currentData.collectedTrend}
              icon={DollarSign}
              isPositive={currentData.collectedTrend > 0}
              isNegative={currentData.collectedTrend < 0}
            />
            <KPICard
              title="Camions reçus"
              value={currentData.trucks.toString()}
              period={getPeriodLabel()}
              trend={currentData.trucksTrend}
              icon={Truck}
              isPositive={currentData.trucksTrend > 0}
              isNegative={currentData.trucksTrend < 0}
            />
            <KPICard
              title="Stocks disponibles"
              value={currentData.stocks}
              period={getPeriodLabel()}
              trend={currentData.stocksTrend}
              icon={Package}
              isPositive={currentData.stocksTrend > 0}
              isNegative={currentData.stocksTrend < 0}
            />
            <KPICard
              title="Dettes totales"
              value={currentData.debt}
              period={getPeriodLabel()}
              trend={currentData.debtTrend}
              icon={AlertTriangle}
              isPositive={currentData.debtTrend < 0}
              isNegative={currentData.debtTrend > 0}
            />
          </div>

          {/* Charts Row - 2 columns */}
          <div className="grid gap-6 lg:grid-cols-2">
            <RevenueChart period={period} />
            <InvoiceDistributionChart period={period} />
          </div>

          {/* Hangar Revenue Chart - Full width */}
          <HangarRevenueChart period={period} />

          {/* Bottom Row */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <TopClientsTable period={period} />
            </div>
            <AlertCard alerts={currentAlerts} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
