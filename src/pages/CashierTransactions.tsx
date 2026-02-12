
import { useState, useEffect } from "react";
import { 
  History, DollarSign, FileText, Package, 
  Search, ChevronLeft, ChevronRight, Download,
  Filter, Calendar, RefreshCw, CheckCircle, Lock
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { KPICard } from "@/components/dashboard/KPICard";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Transaction {
  id: string;
  type: "payment" | "invoice" | "cageots_in" | "cageots_out";
  description: string;
  amount: number;
  clientName: string;
  createdAt: string;
  status: "completed" | "pending" | "cancelled";
}

const mockTransactions: Transaction[] = [
  { id: "TX001", type: "payment", description: "Paiement facture INV-2024-001", amount: 450000, clientName: "Supermarché Central", createdAt: "2024-01-15 09:30:00", status: "completed" },
  { id: "TX002", type: "invoice", description: "Nouvelle facture", amount: 280000, clientName: "Restaurant Le Palmier", createdAt: "2024-01-15 10:15:00", status: "completed" },
  { id: "TX003", type: "payment", description: "Paiement partiel", amount: 150000, clientName: "Hôtel Ivoire Palace", createdAt: "2024-01-15 11:00:00", status: "completed" },
  { id: "TX004", type: "cageots_in", description: "Ajout cageots", amount: 0, clientName: "Marché de la Ville", createdAt: "2024-01-15 11:45:00", status: "completed" },
  { id: "TX005", type: "invoice", description: "Nouvelle facture", amount: 520000, clientName: "Casino Supérette", createdAt: "2024-01-15 14:30:00", status: "completed" },
  { id: "TX006", type: "payment", description: "Paiement complet", amount: 480000, clientName: "Supermarché Central", createdAt: "2024-01-14 16:00:00", status: "completed" },
  { id: "TX007", type: "cageots_out", description: "Retrait cageots", amount: 0, clientName: "Restaurant Le Palmier", createdAt: "2024-01-14 14:20:00", status: "completed" },
  { id: "TX008", type: "invoice", description: "Facture INV-2024-008", amount: 350000, clientName: "Hôtel Ivoire Palace", createdAt: "2024-01-14 11:00:00", status: "completed" },
];

const ITEMS_PER_PAGE = 10;

export default function CashierTransactions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        // In production: await fetch(`${API_ENDPOINTS.CASHIER_TRANSACTIONS}`, { headers: auth })
        setTransactions(mockTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [user]);

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || tx.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedTransactions = filteredTransactions.slice(startIndex, endIndex);

  const totalPayments = transactions.filter(tx => tx.type === "payment").reduce((sum, tx) => sum + tx.amount, 0);
  const totalInvoices = transactions.filter(tx => tx.type === "invoice").reduce((sum, tx) => sum + tx.amount, 0);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "payment": return "bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/20";
      case "invoice": return "bg-[#1F3A5F]/10 text-[#1F3A5F] border-[#1F3A5F]/20";
      case "cageots_in": return "bg-[#F9C74F]/10 text-[#B45309] border-[#F9C74F]/30";
      case "cageots_out": return "bg-[#C62828]/10 text-[#C62828] border-[#C62828]/20";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "payment": return "Paiement";
      case "invoice": return "Facture";
      case "cageots_in": return "Cageots +";
      case "cageots_out": return "Cageots -";
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "payment": return <DollarSign className="h-4 w-4" />;
      case "invoice": return <FileText className="h-4 w-4" />;
      case "cageots_in": 
      case "cageots_out": return <Package className="h-4 w-4" />;
      default: return <History className="h-4 w-4" />;
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;

    doc.setFillColor(31, 58, 95);
    doc.rect(0, 0, pageWidth, 45, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("HISTORIQUE DES TRANSACTIONS", pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Caissier: ${user?.name || "N/A"}`, pageWidth / 2, 30, { align: "center" });
    doc.text(`Date: ${format(new Date(), "dd/MM/yyyy", { locale: fr })}`, pageWidth / 2, 38, { align: "center" });

    y = 55;
    doc.setTextColor(31, 58, 95);
    doc.setFontSize(14);
    doc.text(`Total: ${filteredTransactions.length} transactions`, margin, y);
    y += 10;
    doc.setDrawColor(31, 58, 95);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    doc.setFillColor(31, 58, 95);
    doc.rect(margin, y, pageWidth - margin * 2, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text("ID", margin + 3, y + 7);
    doc.text("TYPE", margin + 25, y + 7);
    doc.text("CLIENT", margin + 55, y + 7);
    doc.text("MONTANT", pageWidth - margin - 40, y + 7, { align: "right" });
    y += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    filteredTransactions.forEach((tx, index) => {
      const rowBg = index % 2 === 0 ? 255 : 248;
      if (rowBg < 255) { doc.setFillColor(rowBg, rowBg, rowBg); doc.rect(margin, y, pageWidth - margin * 2, 8, "F"); }
      doc.text(tx.id, margin + 3, y + 5);
      doc.text(getTypeLabel(tx.type), margin + 25, y + 5);
      doc.text(tx.clientName.substring(0, 20), margin + 55, y + 5);
      doc.text(`${tx.amount.toLocaleString()} F`, pageWidth - margin - 5, y + 5, { align: "right" });
      y += 8;
    });

    doc.setDrawColor(31, 58, 95);
    doc.line(margin, y, pageWidth - margin, y);
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(8);
    doc.text(`Généré le ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: fr })}`, pageWidth / 2, y + 10, { align: "center" });

    doc.save(`transactions-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    toast({ title: "Export réussi", description: "L'historique a été téléchargé" });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-[#1F3A5F]" />
          <span className="ml-2 text-[#6B7280]">Chargement...</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1F2937]">Historique des Transactions</h1>
            <p className="text-sm text-[#6B7280]">{user?.hangar && `Hangar: ${user.hangar}`}</p>
          </div>
          <Button onClick={exportPDF} variant="outline" className="border-[#E5E7EB] text-[#1F3A5F] hover:bg-[#F8FAFC]">
            <Download className="mr-2 h-4 w-4" />Exporter PDF
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <KPICard title="Total Transactions" value={transactions.length.toString()} icon={History} isPositive={true} isNegative={false} />
          <KPICard title="Total Paiements" value={`${(totalPayments / 1000000).toFixed(2)}M F`} icon={DollarSign} isPositive={true} isNegative={false} />
          <KPICard title="Total Factures" value={`${(totalInvoices / 1000000).toFixed(2)}M F`} icon={FileText} isPositive={true} isNegative={false} />
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <Input placeholder="Rechercher..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} className="pl-10 border-[#E5E7EB]" />
          </div>
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#1F2937]">
            <option value="all">Tous les types</option>
            <option value="payment">Paiements</option>
            <option value="invoice">Factures</option>
            <option value="cageots_in">Cageots +</option>
            <option value="cageots_out">Cageots -</option>
          </select>
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase">Client</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-[#6B7280] uppercase">Montant</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-[#6B7280] uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {displayedTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-4 font-medium text-[#1F3A5F]">{tx.id}</td>
                    <td className="px-6 py-4">
                      <Badge className={getTypeColor(tx.type)}>{getTypeLabel(tx.type)}</Badge>
                    </td>
                    <td className="px-6 py-4 text-[#1F2937]">{tx.description}</td>
                    <td className="px-6 py-4 text-[#6B7280]">{tx.clientName}</td>
                    <td className="px-6 py-4 text-right font-semibold text-[#2E7D32]">
                      {tx.amount > 0 ? `${tx.amount.toLocaleString()} F` : "-"}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-[#6B7280]">
                      {format(new Date(tx.createdAt), "dd/MM/yyyy HH:mm")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#E5E7EB]">
            <p className="text-sm text-[#6B7280]">
              Affichage de {startIndex + 1} à {Math.min(endIndex, filteredTransactions.length)} sur {filteredTransactions.length}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="border-[#E5E7EB]">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">{page} / {totalPages || 1}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="border-[#E5E7EB]">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

