
import { useState, useEffect } from "react";
import { 
  DollarSign, Users, FileText, Package, 
  Plus, Search, Phone, ChevronRight,
  TrendingUp, Clock, AlertCircle, CheckCircle,
  RefreshCw, Download, Lock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { KPICard } from "@/components/dashboard/KPICard";
import { API_ENDPOINTS } from "@/config/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { PaymentForm } from "@/components/cashier/PaymentForm";
import { InvoiceForm } from "@/components/cashier/InvoiceForm";
import { CageotsForm } from "@/components/cashier/CageotsForm";
import jsPDF from "jspdf";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  debt: number;
  debtLimit?: number;
  totalPurchases?: number;
  cageots: number;
  lastPurchase?: string;
  status: "good" | "warning" | "critical";
}

interface Transaction {
  id: string;
  type: "payment" | "invoice" | "cageots";
  description: string;
  amount: number;
  clientName: string;
  createdAt: string;
}

interface DailyClosure {
  id: string;
  date: string;
  status: "open" | "closed";
  openingBalance: number;
  closingBalance: number;
  totalAmount: number;
  transactionsCount: number;
}

const mockClients: Client[] = [
  { id: "1", name: "Moussa Diop", phone: "+221 77 123 45 67", email: "moussa.diop@gmail.com", address: "42 Rue de la Corniche, Dakar", debt: 0, debtLimit: 500000, cageots: 45, lastPurchase: "2024-01-15", status: "good" },
  { id: "2", name: "Aminata Sall", phone: "+221 76 234 56 78", email: "aminata.sall@gmail.com", address: "15 Avenue Cheikh Anta Diop, Thiès", debt: 250000, debtLimit: 500000, cageots: 22, lastPurchase: "2024-01-14", status: "warning" },
  { id: "3", name: "Ousmane Ndiaye", phone: "+221 70 345 67 89", email: "ousmane.ndiaye@gmail.com", address: "28 Boulevard de la Liberté, Saint-Louis", debt: 480000, debtLimit: 500000, cageots: 38, lastPurchase: "2024-01-13", status: "warning" },
  { id: "4", name: "Fatou Fall", phone: "+221 77 456 78 90", email: "fatou.fall@gmail.com", address: "Rue du Marché, Kaolack", debt: 0, debtLimit: 300000, cageots: 15, lastPurchase: "2024-01-15", status: "good" },
  { id: "5", name: "Cheikh Sy", phone: "+221 75 567 89 01", email: "cheikh.sy@gmail.com", address: "55 Rue Principal, Ziguinchor", debt: 850000, debtLimit: 500000, cageots: 60, lastPurchase: "2024-01-10", status: "critical" },
];

const mockTransactions: Transaction[] = [
  { id: "TX001", type: "payment", description: "Paiement facture INV-2024-001", amount: 450000, clientName: "Moussa Diop", createdAt: "2024-01-15 09:30:00" },
  { id: "TX002", type: "invoice", description: "Nouvelle facture", amount: 280000, clientName: "Aminata Sall", createdAt: "2024-01-15 10:15:00" },
  { id: "TX003", type: "payment", description: "Paiement partiel", amount: 150000, clientName: "Ousmane Ndiaye", createdAt: "2024-01-15 11:00:00" },
  { id: "TX004", type: "cageots", description: "Ajout cageots", amount: 0, clientName: "Fatou Fall", createdAt: "2024-01-15 11:45:00" },
  { id: "TX005", type: "invoice", description: "Nouvelle facture", amount: 520000, clientName: "Cheikh Sy", createdAt: "2024-01-15 14:30:00" },
];

export default function CashierDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDayClosed, setIsDayClosed] = useState(false);
  const [closure, setClosure] = useState<DailyClosure | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Dialog states
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [cageotsOpen, setCageotsOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les clients depuis l'API (même source que la page Clients)
        const clientsResponse = await fetch(API_ENDPOINTS.CLIENTS);
        if (clientsResponse.ok) {
          const clientsData = await clientsResponse.json();
          setClients(clientsData);
        } else {
          setClients(mockClients);
        }
        
        setTransactions(mockTransactions);
        setClosure({
          id: "CL-" + format(new Date(), "yyyy-MM-dd"),
          date: format(new Date(), "yyyy-MM-dd"),
          status: "open",
          openingBalance: 0,
          closingBalance: 0,
          totalAmount: 880000,
          transactionsCount: 5,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setClients(mockClients);
        setTransactions(mockTransactions);
        setClosure({
          id: "CL-" + format(new Date(), "yyyy-MM-dd"),
          date: format(new Date(), "yyyy-MM-dd"),
          status: "open",
          openingBalance: 0,
          closingBalance: 0,
          totalAmount: 880000,
          transactionsCount: 5,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  );

  const todayRevenue = transactions.filter(tx => tx.type === "payment").reduce((sum, tx) => sum + tx.amount, 0);
  const pendingDebt = clients.reduce((sum, c) => sum + c.debt, 0);
  const totalCageots = clients.reduce((sum, c) => sum + c.cageots, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good": return "bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/20";
      case "warning": return "bg-[#F9C74F]/10 text-[#B45309] border-[#F9C74F]/30";
      case "critical": return "bg-[#C62828]/10 text-[#C62828] border-[#C62828]/20";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "payment": return <DollarSign className="h-4 w-4 text-[#2E7D32]" />;
      case "invoice": return <FileText className="h-4 w-4 text-[#1F3A5F]" />;
      case "cageots": return <Package className="h-4 w-4 text-[#F9C74F]" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const handlePayment = (client: Client) => {
    setSelectedClient(client);
    setPaymentOpen(true);
  };

  const handleInvoice = (client: Client) => {
    setSelectedClient(client);
    setInvoiceOpen(true);
  };

  const handleCageots = (client: Client) => {
    setSelectedClient(client);
    setCageotsOpen(true);
  };

  const handleDetails = (client: Client) => {
    navigate(`/clients/${client.id}`);
  };

  const handleCloseDay = async () => {
    // Naviguer vers la page de clôture sans fermer ici
    // La clôture réelle se fait dans la page CashierClosure
    navigate('/caisse/cloture');
  };

  const generateDailyReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;

    doc.setFillColor(31, 58, 95);
    doc.rect(0, 0, pageWidth, 45, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("RAPPORT QUOTIDIEN - CAISSE", pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${format(new Date(), "dd/MM/yyyy", { locale: fr })}`, pageWidth / 2, 30, { align: "center" });
    doc.text(`Caissier: ${user?.name || "N/A"}`, pageWidth / 2, 38, { align: "center" });
    
    y = 55;
    doc.setTextColor(31, 58, 95);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("RÉSUMÉ DE LA JOURNÉE", margin, y);
    y += 10;
    doc.setDrawColor(31, 58, 95);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    const summaryData = [
      ["Total des transactions", closure?.transactionsCount.toString() || "0"],
      ["Montant total encaissé", `${(todayRevenue / 1000000).toFixed(2)}M F`],
      ["Clients actifs", clients.length.toString()],
      ["Cageots en circulation", totalCageots.toString()],
    ];
    summaryData.forEach(([label, value]) => {
      doc.text(label, margin, y);
      doc.text(value, pageWidth - margin, y, { align: "right" });
      y += 8;
    });

    y += 10;
    doc.setTextColor(31, 58, 95);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("DÉTAIL DES TRANSACTIONS", margin, y);
    y += 10;
    doc.setDrawColor(31, 58, 95);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;
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
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    transactions.forEach((tx, index) => {
      const rowBg = index % 2 === 0 ? 255 : 248;
      if (rowBg < 255) { doc.setFillColor(rowBg, rowBg, rowBg); doc.rect(margin, y, pageWidth - margin * 2, 8, "F"); }
      doc.text(tx.id, margin + 3, y + 5);
      doc.text(tx.type.toUpperCase(), margin + 25, y + 5);
      doc.text(tx.clientName.substring(0, 20), margin + 55, y + 5);
      doc.text(`${tx.amount.toLocaleString()} F`, pageWidth - margin - 5, y + 5, { align: "right" });
      y += 8;
    });

    y += 10;
    doc.setDrawColor(31, 58, 95);
    doc.line(margin, y, pageWidth - margin, y);
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(8);
    doc.text(`Généré le ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: fr })}`, pageWidth / 2, y + 10, { align: "center" });
    doc.text("SODIPAS - Gestion de Caisse", pageWidth / 2, y + 16, { align: "center" });

    doc.save(`rapport-caisse-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    toast({ title: "Rapport téléchargé", description: "Le rapport quotidien a été téléchargé avec succès" });
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
            <h1 className="text-2xl font-bold text-[#1F2937]">Caisse SODIPAS</h1>
            <p className="text-sm text-[#6B7280]">
              {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
            </p>
          </div>
          <div className="flex gap-3">
            {closure?.status === "open" ? (
              <Button onClick={handleCloseDay} className="bg-[#2E7D32] hover:bg-[#2E7D32]/90">
                <Lock className="mr-2 h-4 w-4" />Clôturer la journée
              </Button>
            ) : (
              <Button variant="outline" disabled className="border-[#E5E7EB] text-[#6B7280]">
                <CheckCircle className="mr-2 h-4 w-4" />Journée clôturée
              </Button>
            )}
            <Button variant="outline" onClick={generateDailyReport} className="border-[#E5E7EB] text-[#1F3A5F] hover:bg-[#F8FAFC]">
              <Download className="mr-2 h-4 w-4" />Rapport PDF
            </Button>
          </div>
        </div>

        {isDayClosed && (
          <div className="bg-[#F9C74F]/10 border border-[#F9C74F]/30 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-[#B45309]" />
              <p className="text-sm text-[#B45309] font-medium">La journée a été clôturée. Vous êtes en mode consultation uniquement.</p>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard title="Encaissé aujourd'hui" value={`${(todayRevenue / 1000000).toFixed(2)}M F`} icon={DollarSign} isPositive={true} isNegative={false} />
          <KPICard title="Transactions" value={transactions.length.toString()} icon={TrendingUp} isPositive={true} isNegative={false} />
          <KPICard title="Dette clients" value={`${(pendingDebt / 1000000).toFixed(1)}M F`} icon={AlertCircle} isPositive={false} isNegative={pendingDebt > 0} />
          <KPICard title="Cageots en circulation" value={totalCageots.toString()} icon={Package} isPositive={true} isNegative={false} />
        </div>

        {/* Zone d'actions client sélectionné */}
        {selectedClient && (
          <div className="bg-[#1F3A5F] text-white rounded-xl p-4 shadow-lg">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
                  <span className="text-xl font-bold">{selectedClient.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
                </div>
                <div>
                  <p className="text-xl font-bold">{selectedClient.name}</p>
                  <p className="text-white/80">{selectedClient.phone}</p>
                </div>
              </div>
              <div className="flex gap-3 flex-wrap justify-center">
                <Button 
                  onClick={() => setInvoiceOpen(true)}
                  className="bg-white text-[#1F3A5F] hover:bg-white/90 h-auto py-3 flex-col gap-1"
                >
                  <FileText className="h-5 w-5" />
                  <span>Nouvelle facture</span>
                </Button>
                <Button 
                  onClick={() => setPaymentOpen(true)}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 h-auto py-3 flex-col gap-1 bg-transparent"
                >
                  <DollarSign className="h-5 w-5 text-[#2E7D32]" />
                  <span>Paiement</span>
                </Button>
                <Button 
                  onClick={() => setCageotsOpen(true)}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 h-auto py-3 flex-col gap-1 bg-transparent"
                >
                  <Package className="h-5 w-5 text-[#F9C74F]" />
                  <span>Cageots</span>
                </Button>
                <Button 
                  onClick={() => navigate(`/clients/${selectedClient.id}`)}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 h-auto py-3 flex-col gap-1 bg-transparent"
                >
                  <Users className="h-5 w-5" />
                  <span>Dossier</span>
                </Button>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20 flex gap-6 text-sm flex-wrap">
              <div>
                <span className="text-white/60">Dette: </span>
                <span className={selectedClient.debt > 0 ? "text-[#F9C74F]" : "text-[#2E7D32]"}>
                  {selectedClient.debt > 0 ? `${selectedClient.debt.toLocaleString()} F` : "Aucune"}
                </span>
              </div>
              <div>
                <span className="text-white/60">Cageots: </span>
                <span className="font-bold">{selectedClient.cageots}</span>
              </div>
              <div>
                <span className="text-white/60">Statut: </span>
                <Badge className={selectedClient.status === "good" ? "bg-[#2E7D32]" : selectedClient.status === "warning" ? "bg-[#F9C74F] text-black" : "bg-[#C62828]"}>
                  {selectedClient.status === "good" ? "Bon" : selectedClient.status === "warning" ? "Alerte" : "Critique"}
                </Badge>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#E5E7EB]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-lg font-semibold text-[#1F2937]">Clients SODIPAS</h2>
                <div className="relative max-w-xs flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                  <Input 
                    placeholder="Rechercher un client..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="pl-10 border-[#E5E7EB]" 
                  />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase">Client</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase">Téléphone</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-[#6B7280] uppercase">Dette</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-[#6B7280] uppercase">Statut</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-[#6B7280] uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredClients.slice(0, 10).map((client) => (
                    <tr 
                      key={client.id} 
                      onClick={() => setSelectedClient(client)}
                      className={`cursor-pointer transition-colors ${selectedClient?.id === client.id ? "bg-[#1F3A5F]/10" : "hover:bg-[#F8FAFC]"}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${selectedClient?.id === client.id ? "bg-[#1F3A5F]" : "bg-[#1F3A5F]"}`}>
                            <span className="text-sm font-medium text-white">{client.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
                          </div>
                          <div>
                            <p className="font-medium text-[#1F2937]">{client.name}</p>
                            <p className="text-sm text-[#6B7280]">{client.cageots} cageots</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-[#6B7280]" />
                          <span className="text-sm text-[#1F2937]">{client.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={client.debt > 0 ? "text-[#C62828] font-medium" : "text-[#2E7D32]"}>{client.debt > 0 ? `${client.debt.toLocaleString()} F` : "Aucune"}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge className={getStatusColor(client.status)}>{client.status === "good" ? "Bon" : client.status === "warning" ? "Alerte" : "Critique"}</Badge>
                      </td>
                      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={selectedClient?.id === client.id ? "text-[#1F3A5F]" : "text-[#6B7280]"}
                        >
                          {selectedClient?.id === client.id ? "✓ Sélectionné" : "Sélectionner"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-[#E5E7EB] bg-[#F8FAFC]">
              <Button variant="ghost" onClick={() => navigate('/clients')} className="w-full text-[#1F3A5F] hover:text-[#1F3A5F]">
                Voir tous les clients<ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#E5E7EB]">
              <h2 className="text-lg font-semibold text-[#1F2937]">Transactions récentes</h2>
              <p className="text-sm text-[#6B7280]">Aujourd'hui</p>
            </div>
            <div className="divide-y divide-[#E5E7EB]">
              {transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="p-4 hover:bg-[#F8FAFC] transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getTransactionIcon(tx.type)}</div>
                      <div>
                        <p className="font-medium text-[#1F2937] text-sm">{tx.description}</p>
                        <p className="text-xs text-[#6B7280]">{tx.clientName}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3 text-[#9CA3AF]" />
                          <span className="text-xs text-[#9CA3AF]">{format(new Date(tx.createdAt), "HH:mm")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {tx.amount > 0 ? <p className="font-semibold text-[#2E7D32]">+{tx.amount.toLocaleString()} F</p> : <p className="font-medium text-[#6B7280]">-</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-[#E5E7EB] bg-[#F8FAFC]">
              <Button variant="ghost" onClick={() => navigate('/caisse/transactions')} className="w-full text-[#1F3A5F] hover:text-[#1F3A5F]">
                Voir tout l'historique<ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Dialogs */}
        {selectedClient && (
          <>
            <PaymentForm
              open={paymentOpen}
              onOpenChange={setPaymentOpen}
              clientId={selectedClient.id}
              clientName={selectedClient.name}
            />
            <InvoiceForm
              open={invoiceOpen}
              onOpenChange={setInvoiceOpen}
              clientId={selectedClient.id}
              clientName={selectedClient.name}
            />
            <CageotsForm
              open={cageotsOpen}
              onOpenChange={setCageotsOpen}
              clientId={selectedClient.id}
              clientName={selectedClient.name}
              currentCageots={selectedClient.cageots}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
}
