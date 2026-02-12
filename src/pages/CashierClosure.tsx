
import { useState, useEffect } from "react";
import { 
  Lock, CheckCircle, DollarSign, FileText, Package,
  AlertCircle, RefreshCw, Download, Calendar, ChevronLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { KPICard } from "@/components/dashboard/KPICard";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";
import jsPDF from "jspdf";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Transaction {
  id: string;
  type: "payment" | "invoice" | "cageots";
  description: string;
  amount: number;
  clientName: string;
  createdAt: string;
  hangar: string;
}

// Mock data for the cashier's assigned hangar
const mockTransactions: Transaction[] = [
  { id: "TX001", type: "payment", description: "Paiement facture INV-2024-001", amount: 450000, clientName: "Supermarché Central", createdAt: "2024-01-15 09:30:00", hangar: "Hangar 1" },
  { id: "TX002", type: "invoice", description: "Nouvelle facture", amount: 280000, clientName: "Restaurant Le Palmier", createdAt: "2024-01-15 10:15:00", hangar: "Hangar 1" },
  { id: "TX003", type: "payment", description: "Paiement partiel", amount: 150000, clientName: "Hôtel Ivoire Palace", createdAt: "2024-01-15 11:00:00", hangar: "Hangar 1" },
  { id: "TX004", type: "cageots", description: "Ajout cageots", amount: 0, clientName: "Mme Diop", createdAt: "2024-01-15 13:00:00", hangar: "Hangar 1" },
  { id: "TX005", type: "payment", description: "Règlement complet", amount: 320000, clientName: "École Primaire Centre", createdAt: "2024-01-15 15:30:00", hangar: "Hangar 1" },
];

export default function CashierClosure() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isClosing, setIsClosing] = useState(false);
  const [notes, setNotes] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDayClosed, setIsDayClosed] = useState(false);

  // Get cashier's assigned hangar
  const cashierHangar = user?.hangar || "Hangar 1";

  useEffect(() => {
    // Fetch transactions for cashier's hangar
    const fetchData = async () => {
      try {
        setLoading(true);
        // In production: fetch from API filtered by cashier's hangar
        // const response = await fetch(`${API_ENDPOINTS.TRANSACTIONS}?hangar=${encodeURIComponent(cashierHangar)}`);
        setTransactions(mockTransactions);
      } catch (error) {
        console.error("Error fetching data:", error);
        setTransactions(mockTransactions);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [cashierHangar]);

  // Calculate stats
  const totalTransactions = transactions.length;
  const totalAmount = transactions
    .filter(t => t.type === "payment")
    .reduce((sum, t) => sum + t.amount, 0);
  const cageotsMovement = transactions.filter(t => t.type === "cageots").length;
  const totalClosing = openingBalance + totalAmount;

  const handleCloseDay = async () => {
    if (!isConfirmed) {
      toast({
        title: "Confirmation requise",
        description: "Veuillez cocher la case de confirmation",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Êtes-vous sûr de vouloir clôturer la journée ? Cette action est irréversible.")) {
      return;
    }

    setIsClosing(true);
    try {
      // In production: await fetch(`${API_ENDPOINTS.CLOSURE}`, { 
      //   method: 'POST', 
      //   body: JSON.stringify({ 
      //     hangar: cashierHangar,
      //     openingBalance, 
      //     closingBalance: totalClosing,
      //     totalAmount,
      //     totalTransactions,
      //     notes 
      //   }) 
      // })
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsDayClosed(true);
      
      toast({
        title: "Jour clôturé",
        description: `La journée du ${cashierHangar} a été clôturée avec succès`,
      });
      
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de clôturer la journée",
        variant: "destructive",
      });
    } finally {
      setIsClosing(false);
    }
  };

  const generateReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;

    // Header
    doc.setFillColor(31, 58, 95);
    doc.rect(0, 0, pageWidth, 50, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("RAPPORT DE CLÔTURE", pageWidth / 2, 25, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${format(new Date(), "dd/MM/yyyy", { locale: fr })}`, pageWidth / 2, 38, { align: "center" });

    // Cashier and hangar info
    y = 65;
    doc.setTextColor(31, 58, 95);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("INFORMATIONS", margin, y);
    y += 10;
    doc.setDrawColor(31, 58, 95);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Caissier: ${user?.name || "N/A"}`, margin, y);
    y += 7;
    doc.text(`Hangar: ${cashierHangar}`, margin, y);
    y += 7;
    doc.text(`Date: ${format(new Date(), "dd/MM/yyyy", { locale: fr })}`, margin, y);
    y += 7;
    doc.text(`Heure: ${format(new Date(), "HH:mm", { locale: fr })}`, margin, y);
    y += 15;

    // Summary
    doc.setTextColor(31, 58, 95);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("RÉSUMÉ", margin, y);
    y += 10;
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Solde d'ouverture: ${openingBalance.toLocaleString()} F`, margin, y);
    y += 7;
    doc.text(`Total des transactions: ${totalTransactions}`, margin, y);
    y += 7;
    doc.text(`Montant total encaissé: ${totalAmount.toLocaleString()} F`, margin, y);
    y += 7;
    doc.text(`Mouvements cageots: ${cageotsMovement}`, margin, y);
    y += 7;
    doc.setFont("helvetica", "bold");
    doc.text(`Solde de clôture: ${totalClosing.toLocaleString()} F`, margin, y);
    y += 15;

    // Transactions table
    doc.setTextColor(31, 58, 95);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("TRANSACTIONS DU JOUR", margin, y);
    y += 10;
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    // Table header
    doc.setFillColor(31, 58, 95);
    doc.rect(margin, y, pageWidth - margin * 2, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text("ID", margin + 3, y + 7);
    doc.text("TYPE", margin + 25, y + 7);
    doc.text("CLIENT", margin + 60, y + 7);
    doc.text("MONTANT", pageWidth - margin - 35, y + 7, { align: "right" });
    y += 10;

    // Table rows
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    transactions.forEach((tx, index) => {
      const rowBg = index % 2 === 0 ? 255 : 248;
      if (rowBg < 255) { doc.setFillColor(rowBg, rowBg, rowBg); doc.rect(margin, y, pageWidth - margin * 2, 8, "F"); }
      doc.text(tx.id, margin + 3, y + 5);
      const typeLabel = tx.type === "payment" ? "Paiement" : tx.type === "invoice" ? "Facture" : "Cageots";
      doc.text(typeLabel, margin + 25, y + 5);
      doc.text(tx.clientName.substring(0, 25), margin + 60, y + 5);
      doc.text(tx.amount > 0 ? `${tx.amount.toLocaleString()} F` : "-", pageWidth - margin - 5, y + 5, { align: "right" });
      y += 8;
    });

    // Notes
    if (notes) {
      y += 5;
      doc.setDrawColor(31, 58, 95);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;
      doc.setTextColor(31, 58, 95);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("NOTES", margin, y);
      y += 8;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const splitNotes = doc.splitTextToSize(notes, pageWidth - margin * 2);
      doc.text(splitNotes, margin, y);
      y += splitNotes.length * 5 + 10;
    }

    // Footer
    doc.setDrawColor(31, 58, 95);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(8);
    doc.text(`Généré le ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: fr })}`, pageWidth / 2, y + 10, { align: "center" });
    doc.text("SODIPAS - Gestion de Caisse", pageWidth / 2, y + 16, { align: "center" });

    doc.save(`cloture-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    toast({ title: "Rapport téléchargé", description: "Le rapport de clôture a été téléchargé" });
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
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/caisse')}
              className="text-[#6B7280] hover:text-[#1F3A5F]"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[#1F2937]">Clôture Quotidienne</h1>
              <p className="text-sm text-[#6B7280] flex items-center gap-2">
                {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
                <Badge className="bg-[#1F3A5F]">{cashierHangar}</Badge>
              </p>
            </div>
          </div>
          {isDayClosed && (
            <Button onClick={generateReport} variant="outline" className="border-[#E5E7EB] text-[#1F3A5F] hover:bg-[#F8FAFC]">
              <Download className="mr-2 h-4 w-4" />Télécharger Rapport
            </Button>
          )}
        </div>

        {/* ÉTAT CLÔTURÉ */}
        {isDayClosed ? (
          <div className="rounded-xl border border-[#2E7D32] bg-[#2E7D32]/5 p-6">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="h-8 w-8 text-[#2E7D32]" />
              <div>
                <h2 className="text-xl font-bold text-[#2E7D32]">Journée clôturée</h2>
                <p className="text-sm text-[#6B7280]">La clôture a été effectuée avec succès pour {cashierHangar}</p>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              <KPICard 
                title="Transactions"
                value={totalTransactions.toString()}
                icon={FileText}
                isPositive={true}
              />
              <KPICard 
                title="Total encaissé"
                value={`${(totalAmount / 1000000).toFixed(2)}M F`}
                icon={DollarSign}
                isPositive={true}
              />
              <KPICard 
                title="Solde ouverture"
                value={`${(openingBalance / 1000000).toFixed(2)}M F`}
                icon={Calendar}
                isPositive={true}
              />
              <KPICard 
                title="Solde clôture"
                value={`${(totalClosing / 1000000).toFixed(2)}M F`}
                icon={CheckCircle}
                isPositive={true}
              />
            </div>

            {/* Transactions */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-[#1F2937] mb-3">Transactions du jour</h3>
              <div className="divide-y divide-[#E5E7EB] border border-[#E5E7EB] rounded-lg">
                {transactions.map((tx) => (
                  <div key={tx.id} className="py-3 px-4 flex items-center justify-between bg-[#F8FAFC]/50">
                    <div className="flex items-center gap-3">
                      <Badge 
                        className={
                          tx.type === "payment" ? "bg-[#2E7D32]" :
                          tx.type === "invoice" ? "bg-[#1F3A5F]" :
                          "bg-[#F9C74F] text-black"
                        }
                      >
                        {tx.type === "payment" ? "Paiement" : tx.type === "invoice" ? "Facture" : "Cageots"}
                      </Badge>
                      <div>
                        <p className="font-medium text-[#1F2937]">{tx.description}</p>
                        <p className="text-sm text-[#6B7280]">{tx.clientName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {tx.amount > 0 ? (
                        <p className="font-semibold text-[#2E7D32]">{tx.amount.toLocaleString()} F</p>
                      ) : (
                        <p className="font-medium text-[#6B7280]">-</p>
                      )}
                      <p className="text-xs text-[#9CA3AF]">{format(new Date(tx.createdAt), "HH:mm")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button onClick={generateReport} className="bg-[#1F3A5F] hover:bg-[#1F3A5F]/90">
                <Download className="mr-2 h-4 w-4" />Télécharger le rapport PDF
              </Button>
              <Button variant="outline" onClick={() => navigate('/caisse')} className="border-[#E5E7EB] text-[#1F3A5F]">
                Retour à la caisse
              </Button>
            </div>
          </div>
        ) : (
          /* ÉTAT OUVERT - Formulaire de clôture */
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Summary Card */}
            <div className="lg:col-span-2 rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-[#1F3A5F]">{cashierHangar}</Badge>
                <h2 className="text-lg font-semibold text-[#1F2937]">Récapitulatif de la journée</h2>
              </div>

              {/* KPIs */}
              <div className="grid gap-4 sm:grid-cols-3 mb-6">
                <KPICard 
                  title="Transactions"
                  value={totalTransactions.toString()}
                  icon={FileText}
                  isPositive={true}
                />
                <KPICard 
                  title="Total encaissé"
                  value={`${(totalAmount / 1000000).toFixed(2)}M F`}
                  icon={DollarSign}
                  isPositive={true}
                />
                <KPICard 
                  title="Mouvements cageots"
                  value={cageotsMovement.toString()}
                  icon={Package}
                  isPositive={true}
                />
              </div>

              {/* Opening Balance */}
              <div className="mb-6">
                <Label htmlFor="openingBalance" className="text-sm font-medium text-[#1F2937]">
                  Solde d'ouverture (espèces en caisse)
                </Label>
                <div className="mt-1 relative">
                  <Input
                    id="openingBalance"
                    type="number"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(Number(e.target.value))}
                    className="pl-4 border-[#E5E7EB] text-lg"
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280]">F</span>
                </div>
              </div>

              {/* Transactions List */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-[#1F2937] mb-3">
                  Transactions du jour ({transactions.length})
                </h3>
                <div className="divide-y divide-[#E5E7EB] border border-[#E5E7EB] rounded-lg max-h-64 overflow-y-auto">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="py-3 px-4 flex items-center justify-between bg-[#F8FAFC]/50">
                      <div className="flex items-center gap-3">
                        <Badge 
                          className={
                            tx.type === "payment" ? "bg-[#2E7D32]" :
                            tx.type === "invoice" ? "bg-[#1F3A5F]" :
                            "bg-[#F9C74F] text-black"
                          }
                        >
                          {tx.type === "payment" ? "Paiement" : tx.type === "invoice" ? "Facture" : "Cageots"}
                        </Badge>
                        <div>
                          <p className="font-medium text-[#1F2937]">{tx.description}</p>
                          <p className="text-sm text-[#6B7280]">{tx.clientName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {tx.amount > 0 ? (
                          <p className="font-semibold text-[#2E7D32]">{tx.amount.toLocaleString()} F</p>
                        ) : (
                          <p className="font-medium text-[#6B7280]">-</p>
                        )}
                        <p className="text-xs text-[#9CA3AF]">{format(new Date(tx.createdAt), "HH:mm")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes" className="text-sm font-medium text-[#1F2937]">
                  Notes (optionnel)
                </Label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full border border-[#E5E7EB] rounded-lg p-3 text-sm text-[#1F2937] placeholder-[#9CA3AF]"
                  rows={3}
                  placeholder="Ajouter des notes pour la clôture..."
                />
              </div>
            </div>

            {/* Confirmation Card */}
            <div className="rounded-xl border border-[#F9C74F]/30 bg-[#F9C74F]/5 p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="h-6 w-6 text-[#F9C74F]" />
                <h2 className="text-lg font-semibold text-[#1F2937]">Confirmation</h2>
              </div>
              <p className="text-sm text-[#6B7280] mb-4">
                Êtes-vous sûr de vouloir clôturer la journée ? Cette action est irréversible.
              </p>
              
              {/* Confirmation Checkbox */}
              <div className="flex items-start gap-3 mb-6 p-4 bg-white rounded-lg border border-[#E5E7EB]">
                <Checkbox 
                  id="confirm" 
                  checked={isConfirmed} 
                  onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
                  className="mt-0.5"
                />
                <Label htmlFor="confirm" className="text-sm text-[#1F2937] cursor-pointer leading-relaxed">
                  Je confirme la clôture de la journée et certifie que les montants indiqués sont corrects
                </Label>
              </div>

              {/* Close Button */}
              <Button 
                onClick={handleCloseDay} 
                disabled={!isConfirmed || isClosing}
                className="w-full bg-[#2E7D32] hover:bg-[#2E7D32]/90 text-white"
              >
                {isClosing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Clôture en cours...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Clôturer la journée
                  </>
                )}
              </Button>

              {/* Summary before closing */}
              <div className="mt-6 p-4 bg-[#F8FAFC] rounded-lg border border-[#E5E7EB]">
                <p className="text-xs text-[#6B7280] mb-2">Récapitulatif avant clôture</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Solde ouverture:</span>
                    <span className="font-medium">{openingBalance.toLocaleString()} F</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Encaissé:</span>
                    <span className="font-medium text-[#2E7D32]">{totalAmount.toLocaleString()} F</span>
                  </div>
                  <div className="flex justify-between border-t border-[#E5E7EB] pt-2 mt-2">
                    <span className="text-[#1F2937] font-medium">Solde clôture:</span>
                    <span className="font-bold text-[#1F3A5F]">{totalClosing.toLocaleString()} F</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
