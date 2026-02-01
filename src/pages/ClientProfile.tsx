import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, Phone, MessageCircle, FileText, CreditCard, Package, 
  Plus, Download, Send, DollarSign, FilePlus, MapPin, Mail, User,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Mock client data (in real app, fetch from API)
const mockClient = {
  id: "1",
  name: "Moussa Diop",
  phone: "+221 77 123 45 67",
  email: "moussa.diop@gmail.com",
  address: "45 Rue Diop, Dakar",
  debt: 350000,
  debtLimit: 500000,
  totalPurchases: 12500000,
  isActive: true,
  cageots: 25,
  lastPurchase: "15/01/2024",
  createdAt: "01/06/2023",
};

// Mock invoices
const mockInvoices = [
  { id: "INV-2024-001", date: "15/01/2024", amount: 450000, status: "pending" as const, items: [
    { name: "Bananes plantain", quantity: 50, price: 5000 },
    { name: "Mangues", quantity: 100, price: 2500 },
  ]},
  { id: "INV-2024-002", date: "10/01/2024", amount: 320000, status: "paid" as const, items: [
    { name: "Ananas", quantity: 80, price: 4000 },
  ]},
  { id: "INV-2024-003", date: "05/01/2024", amount: 280000, status: "paid" as const, items: [
    { name: "Oranges", quantity: 140, price: 2000 },
  ]},
  { id: "INV-2023-145", date: "28/12/2023", amount: 520000, status: "overdue" as const, items: [
    { name: "Bananes douces", quantity: 60, price: 4500 },
    { name: "Papayes", quantity: 40, price: 7000 },
  ]},
  { id: "INV-2023-142", date: "20/12/2023", amount: 185000, status: "paid" as const, items: [
    { name: "Mangues", quantity: 74, price: 2500 },
  ]},
  { id: "INV-2023-138", date: "15/12/2023", amount: 275000, status: "paid" as const, items: [
    { name: "Bananes plantain", quantity: 55, price: 5000 },
  ]},
  { id: "INV-2023-135", date: "10/12/2023", amount: 420000, status: "overdue" as const, items: [
    { name: "Ananas", quantity: 70, price: 4000 },
    { name: "Papayes", quantity: 30, price: 7000 },
  ]},
];

// Mock payments
const mockPayments = [
  { id: "PAY-2024-001", date: "12/01/2024", amount: 320000, method: "Mobile Money" },
  { id: "PAY-2024-002", date: "06/01/2024", amount: 280000, method: "Virement" },
  { id: "PAY-2023-156", date: "30/12/2023", amount: 400000, method: "Espèces" },
  { id: "PAY-2023-150", date: "22/12/2023", amount: 185000, method: "Mobile Money" },
  { id: "PAY-2023-145", date: "15/12/2023", amount: 250000, method: "Virement" },
  { id: "PAY-2023-140", date: "08/12/2023", amount: 275000, method: "Mobile Money" },
  { id: "PAY-2023-135", date: "01/12/2023", amount: 180000, method: "Espèces" },
];

// Mock cageots history
const mockCageotsHistory = [
  { id: "CAG-001", date: "15/01/2024", type: "Ajout", quantity: 10, reason: "Livraison" },
  { id: "CAG-002", date: "10/01/2024", type: "Retrait", quantity: 5, reason: "Retour client" },
  { id: "CAG-003", date: "05/01/2024", type: "Ajout", quantity: 15, reason: "Livraison" },
  { id: "CAG-004", date: "28/12/2023", type: "Retrait", quantity: 8, reason: "Vente" },
  { id: "CAG-005", date: "20/12/2023", type: "Ajout", quantity: 13, reason: "Livraison" },
  { id: "CAG-006", date: "15/12/2023", type: "Retrait", quantity: 10, reason: "Vente" },
  { id: "CAG-007", date: "10/12/2023", type: "Ajout", quantity: 20, reason: "Livraison" },
];

const ITEMS_PER_PAGE = 5;

export default function ClientProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isCageotsOpen, setIsCageotsOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Mobile Money");
  const [newCageots, setNewCageots] = useState("");
  const [cageotsType, setCageotsType] = useState("Ajout");

  // Pagination state
  const [invoicesPage, setInvoicesPage] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [cageotsPage, setCageotsPage] = useState(1);
  
  // Calculate pagination for invoices
  const totalInvoicesPages = Math.ceil(mockInvoices.length / ITEMS_PER_PAGE);
  const startInvoicesIndex = (invoicesPage - 1) * ITEMS_PER_PAGE;
  const endInvoicesIndex = startInvoicesIndex + ITEMS_PER_PAGE;
  const currentInvoices = mockInvoices.slice(startInvoicesIndex, endInvoicesIndex);
  
  // Calculate pagination for payments
  const totalPaymentsPages = Math.ceil(mockPayments.length / ITEMS_PER_PAGE);
  const startPaymentsIndex = (paymentsPage - 1) * ITEMS_PER_PAGE;
  const endPaymentsIndex = startPaymentsIndex + ITEMS_PER_PAGE;
  const currentPayments = mockPayments.slice(startPaymentsIndex, endPaymentsIndex);
  
  // Calculate pagination for cageots
  const totalCageotsPages = Math.ceil(mockCageotsHistory.length / ITEMS_PER_PAGE);
  const startCageotsIndex = (cageotsPage - 1) * ITEMS_PER_PAGE;
  const endCageotsIndex = startCageotsIndex + ITEMS_PER_PAGE;
  const currentCageots = mockCageotsHistory.slice(startCageotsIndex, endCageotsIndex);
  
  // Calculate totals
  const totalPaid = mockPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = mockInvoices.filter(i => i.status !== "paid").reduce((sum, i) => sum + i.amount, 0);
  const cageotsBalance = mockClient.cageots;

  const sendWhatsApp = () => {
    const statusText = mockClient.isActive ? "Actif" : "Bloqué";
    const message = encodeURIComponent(
      `Bonjour ${mockClient.name},\n\nVotre situation chez SODIPAS au ${new Date().toLocaleDateString("fr-FR")}:\n- Statut: ${statusText}\n- Dette: ${mockClient.debt > 0 ? mockClient.debt.toLocaleString() + " F" : "Aucune"}\n- Cageots: ${mockClient.cageots}\n\nMerci de votre confiance.`
    );
    window.open(`https://wa.me/${mockClient.phone}?text=${message}`, "_blank");
  };

  const handlePaymentSubmit = () => {
    const amount = parseInt(paymentAmount.replace(/\D/g, "")) || 0;
    if (amount <= 0) {
      alert("Veuillez entrer un montant valide");
      return;
    }
    alert(`Paiement de ${amount.toLocaleString()} F enregistré pour ${mockClient.name}\nMode: ${paymentMethod}`);
    setIsPaymentOpen(false);
  };

  const handleInvoiceSubmit = () => {
    alert(`Facture générée pour ${mockClient.name}`);
    setIsInvoiceOpen(false);
  };

  const handleCageotsSubmit = () => {
    const qty = parseInt(newCageots) || 0;
    if (qty <= 0) {
      alert("Veuillez entrer une quantité valide");
      return;
    }
    alert(`${cageotsType === "Ajout" ? "Ajout" : "Retrait"} de ${qty} cageots pour ${mockClient.name}`);
    setIsCageotsOpen(false);
  };

  const generatePDF = (invoice: typeof mockInvoices[0]) => {
    const content = `
╔══════════════════════════════════════════════════════════════╗
║                      SODIPAS - FACTURE                       ║
╠══════════════════════════════════════════════════════════════╣
║ Date: ${invoice.date}                                           ║
║ Facture: ${invoice.id}                                          ║
║ Client: ${mockClient.name}                                     ║
║ Téléphone: ${mockClient.phone}                                ║
║ Adresse: ${mockClient.address}                                 ║
╠══════════════════════════════════════════════════════════════╣
║ DÉTAILS                                                        ║
╟──────────────────────────────────────────────────────────────╢
${invoice.items.map(item => `║ ${item.name.padEnd(20)} ${item.quantity.toString().padStart(5)} x ${item.price.toLocaleString().padStart(8)} F  ${(item.quantity * item.price).toLocaleString().padStart(10)} F`).join('\n')}
╠══════════════════════════════════════════════════════════════╣
║ TOTAL: ${invoice.amount.toLocaleString().padStart(35)} F                    ║
╠══════════════════════════════════════════════════════════════╣
║ Statut: ${invoice.status === "paid" ? "PAYÉE" : invoice.status === "pending" ? "EN ATTENTE" : "IMPAYÉE".padEnd(53)}║
╚══════════════════════════════════════════════════════════════╝

Merci de votre confiance chez SODIPAS!
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert(`Facture ${invoice.id} téléchargée!`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="text-[#6B7280] hover:text-[#1F2937] pl-0"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        {/* Client Header Card */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#1F3A5F] to-[#274C77] p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{mockClient.name}</h1>
                  <div className="flex items-center gap-4 mt-1">
                    <Badge className="bg-white/20 text-white border-white/30">
                      Client #{mockClient.id}
                    </Badge>
                    <span className="text-white/80 text-sm">
                      Créé le {mockClient.createdAt}
                    </span>
                  </div>
                </div>
              </div>
              <Badge 
                className={mockClient.isActive 
                  ? "bg-[#2E7D32] text-white border-0" 
                  : "bg-[#C62828] text-white border-0"
                }
                variant="outline"
              >
                {mockClient.isActive ? "Actif" : "Bloqué"}
              </Badge>
            </div>
          </div>
          
          {/* Contact Info */}
          <div className="p-6 border-b border-[#E5E7EB]">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F8FAFC]">
                  <Phone className="h-5 w-5 text-[#1F3A5F]" />
                </div>
                <div>
                  <p className="text-xs text-[#6B7280]">Téléphone</p>
                  <p className="font-medium text-[#1F2937]">{mockClient.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F8FAFC]">
                  <Mail className="h-5 w-5 text-[#1F3A5F]" />
                </div>
                <div>
                  <p className="text-xs text-[#6B7280]">Email</p>
                  <p className="font-medium text-[#1F2937]">{mockClient.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F8FAFC]">
                  <MapPin className="h-5 w-5 text-[#1F3A5F]" />
                </div>
                <div>
                  <p className="text-xs text-[#6B7280]">Adresse</p>
                  <p className="font-medium text-[#1F2937]">{mockClient.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#E5E7EB]">
            <div className="p-5">
              <p className="text-sm text-[#6B7280]">Dette actuelle</p>
              <p className={`text-2xl font-bold mt-1 ${mockClient.debt > 0 ? "text-[#C62828]" : "text-[#2E7D32]"}`}>
                {mockClient.debt.toLocaleString()} F
              </p>
              <p className="text-xs text-[#6B7280] mt-1">Limite: {mockClient.debtLimit.toLocaleString()} F</p>
            </div>
            <div className="p-5">
              <p className="text-sm text-[#6B7280]">Cageots</p>
              <p className="text-2xl font-bold text-[#1F2937] mt-1">{cageotsBalance}</p>
              <p className="text-xs text-[#6B7280] mt-1">consignés</p>
            </div>
            <div className="p-5">
              <p className="text-sm text-[#6B7280]">Total achats</p>
              <p className="text-2xl font-bold text-[#1F3A5F] mt-1">{mockClient.totalPurchases.toLocaleString()} F</p>
              <p className="text-xs text-[#6B7280] mt-1">depuis le début</p>
            </div>
            <div className="p-5">
              <p className="text-sm text-[#6B7280]">En attente</p>
              <p className="text-2xl font-bold text-[#B45309] mt-1">{pendingAmount.toLocaleString()} F</p>
              <p className="text-xs text-[#6B7280] mt-1">de paiement</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button 
            onClick={() => setIsPaymentOpen(true)}
            className="bg-[#2E7D32] hover:bg-[#2E7D32]/90"
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Enregistrer paiement
          </Button>
          <Button 
            variant="outline"
            onClick={() => setIsInvoiceOpen(true)}
            className="border-[#E5E7EB] text-[#1F3A5F] hover:bg-[#F8FAFC]"
          >
            <FilePlus className="mr-2 h-4 w-4" />
            Nouvelle facture
          </Button>
          <Button 
            variant="outline"
            onClick={sendWhatsApp}
            className="border-[#E5E7EB] text-[#25D366] hover:bg-[#25D366]/10"
          >
            <Send className="mr-2 h-4 w-4" />
            Envoyer message
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              setNewCageots("");
              setCageotsType("Ajout");
              setIsCageotsOpen(true);
            }}
            className="border-[#E5E7EB] text-[#1F3A5F] hover:bg-[#F8FAFC]"
          >
            <Package className="mr-2 h-4 w-4" />
            Gérer cageots
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="invoices" className="space-y-6">
          <TabsList>
            <TabsTrigger value="invoices" className="gap-2">
              <FileText className="h-4 w-4" />
              Factures
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Paiements
            </TabsTrigger>
            <TabsTrigger value="cageots" className="gap-2">
              <Package className="h-4 w-4" />
              Cageots
            </TabsTrigger>
          </TabsList>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Facture</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Articles</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-[#6B7280] uppercase tracking-wider">Montant</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-[#6B7280] uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-[#6B7280] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {currentInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-6 py-4 font-medium text-[#1F2937]">{invoice.id}</td>
                        <td className="px-6 py-4 text-[#6B7280]">{invoice.date}</td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {invoice.items.map((item, idx) => (
                              <p key={idx} className="text-sm text-[#6B7280]">
                                {item.quantity}x {item.name}
                              </p>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-[#1F2937]">
                          {invoice.amount.toLocaleString()} F
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge 
                            variant="outline"
                            className={
                              invoice.status === "paid" ? "bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/20" :
                              invoice.status === "overdue" ? "bg-[#C62828]/10 text-[#C62828] border-[#C62828]/20" :
                              "bg-[#F9C74F]/10 text-[#B45309] border-[#F9C74F]/20"
                            }
                          >
                            {invoice.status === "paid" ? "Payée" : invoice.status === "overdue" ? "Impayée" : "En attente"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => generatePDF(invoice)}
                            className="text-[#1F3A5F]"
                            title="Télécharger PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-[#E5E7EB]">
                <p className="text-sm text-[#6B7280]">
                  Affichage de {startInvoicesIndex + 1} à {Math.min(endInvoicesIndex, mockInvoices.length)} sur {mockInvoices.length} résultats
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInvoicesPage(prev => Math.max(prev - 1, 1))}
                    disabled={invoicesPage === 1}
                    className="border-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937]"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-[#1F2937] font-medium">
                    {invoicesPage} / {totalInvoicesPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInvoicesPage(prev => Math.min(prev + 1, totalInvoicesPages))}
                    disabled={invoicesPage === totalInvoicesPages}
                    className="border-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937]"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Paiement</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Mode</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-[#6B7280] uppercase tracking-wider">Montant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {currentPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-6 py-4 font-medium text-[#1F2937]">{payment.id}</td>
                        <td className="px-6 py-4 text-[#6B7280]">{payment.date}</td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="bg-[#F8FAFC] border-[#E5E7EB]">
                            {payment.method}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-[#2E7D32]">
                          +{payment.amount.toLocaleString()} F
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#F8FAFC] border-t border-[#E5E7EB]">
                    <tr>
                      <td colSpan={3} className="px-6 py-4 font-medium text-[#1F2937]">Total payé</td>
                      <td className="px-6 py-4 text-right font-bold text-[#2E7D32] text-lg">
                        {totalPaid.toLocaleString()} F
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-[#E5E7EB]">
                <p className="text-sm text-[#6B7280]">
                  Affichage de {startPaymentsIndex + 1} à {Math.min(endPaymentsIndex, mockPayments.length)} sur {mockPayments.length} résultats
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaymentsPage(prev => Math.max(prev - 1, 1))}
                    disabled={paymentsPage === 1}
                    className="border-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937]"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-[#1F2937] font-medium">
                    {paymentsPage} / {totalPaymentsPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaymentsPage(prev => Math.min(prev + 1, totalPaymentsPages))}
                    disabled={paymentsPage === totalPaymentsPages}
                    className="border-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937]"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Cageots Tab */}
          <TabsContent value="cageots">
            <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Mouvement</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Motif</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-[#6B7280] uppercase tracking-wider">Quantité</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {currentCageots.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-6 py-4 font-medium text-[#1F2937]">{item.id}</td>
                        <td className="px-6 py-4 text-[#6B7280]">{item.date}</td>
                        <td className="px-6 py-4">
                          <Badge 
                            variant="outline"
                            className={item.type === "Ajout" 
                              ? "bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/20" 
                              : "bg-[#C62828]/10 text-[#C62828] border-[#C62828]/20"
                            }
                          >
                            {item.type}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-[#6B7280]">{item.reason}</td>
                        <td className={`px-6 py-4 text-right font-semibold ${item.type === "Ajout" ? "text-[#2E7D32]" : "text-[#C62828]"}`}>
                          {item.type === "Ajout" ? "+" : "-"}{item.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#F8FAFC] border-t border-[#E5E7EB]">
                    <tr>
                      <td colSpan={4} className="px-6 py-4 font-medium text-[#1F2937]">Solde actuel</td>
                      <td className="px-6 py-4 text-right font-bold text-[#1F2937] text-lg">
                        {cageotsBalance} cageots
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-[#E5E7EB]">
                <p className="text-sm text-[#6B7280]">
                  Affichage de {startCageotsIndex + 1} à {Math.min(endCageotsIndex, mockCageotsHistory.length)} sur {mockCageotsHistory.length} résultats
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCageotsPage(prev => Math.max(prev - 1, 1))}
                    disabled={cageotsPage === 1}
                    className="border-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937]"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-[#1F2937] font-medium">
                    {cageotsPage} / {totalCageotsPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCageotsPage(prev => Math.min(prev + 1, totalCageotsPages))}
                    disabled={cageotsPage === totalCageotsPages}
                    className="border-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937]"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Payment Dialog */}
        <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl text-[#1F2937]">Enregistrer un paiement</DialogTitle>
              <DialogDescription className="text-[#6B7280]">
                {mockClient.name} • Dette actuelle: {mockClient.debt.toLocaleString()} F
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium text-[#1F2937]">Montant (FCFA)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="border-[#E5E7EB]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#1F2937]">Mode de paiement</Label>
                <div className="grid grid-cols-3 gap-2">
                  {["Mobile Money", "Virement", "Espèces"].map((method) => (
                    <Button
                      key={method}
                      variant={paymentMethod === method ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPaymentMethod(method)}
                      style={paymentMethod === method ? { backgroundColor: '#1F3A5F' } : { borderColor: '#E5E7EB' }}
                      className={paymentMethod !== method ? "text-[#6B7280]" : ""}
                    >
                      {method}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsPaymentOpen(false)}
                  className="flex-1 border-[#E5E7EB] text-[#6B7280]"
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handlePaymentSubmit}
                  className="flex-1 bg-[#2E7D32] hover:bg-[#2E7D32]/90"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Enregistrer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Invoice Dialog */}
        <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl text-[#1F2937]">Créer une facture</DialogTitle>
              <DialogDescription className="text-[#6B7280]">
                {mockClient.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <p className="text-sm text-[#6B7280]">
                Sélectionnez les articles et quantités pour créer la facture.
              </p>
              
              <div className="rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-4">
                <p className="font-medium text-[#1F2937]">Articles:</p>
                <div className="mt-2 space-y-2">
                  {["Bananes plantain", "Bananes douces", "Mangues", "Ananas", "Papayes", "Oranges"].map((item) => (
                    <div key={item} className="flex items-center justify-between text-sm">
                      <span className="text-[#6B7280]">{item}</span>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        className="w-20 h-8 border-[#E5E7EB]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsInvoiceOpen(false)}
                  className="flex-1 border-[#E5E7EB] text-[#6B7280]"
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handleInvoiceSubmit}
                  style={{ backgroundColor: '#1F3A5F' }}
                  className="flex-1 hover:bg-[#274C77]"
                >
                  <FilePlus className="mr-2 h-4 w-4" />
                  Générer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Cageots Dialog */}
        <Dialog open={isCageotsOpen} onOpenChange={setIsCageotsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl text-[#1F2937]">Gérer les cageots</DialogTitle>
              <DialogDescription className="text-[#6B7280]">
                {mockClient.name} • Cageots actuels: {mockClient.cageots}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#1F2937]">Type d'opération</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={cageotsType === "Ajout" ? "default" : "outline"}
                    onClick={() => setCageotsType("Ajout")}
                    style={cageotsType === "Ajout" ? { backgroundColor: '#2E7D32' } : { borderColor: '#E5E7EB' }}
                    className={cageotsType !== "Ajout" ? "text-[#6B7280]" : ""}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajout
                  </Button>
                  <Button
                    variant={cageotsType === "Retrait" ? "default" : "outline"}
                    onClick={() => setCageotsType("Retrait")}
                    style={cageotsType === "Retrait" ? { backgroundColor: '#C62828' } : { borderColor: '#E5E7EB' }}
                    className={cageotsType !== "Retrait" ? "text-[#6B7280]" : ""}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Retrait
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cageotsQty" className="text-sm font-medium text-[#1F2937]">Quantité</Label>
                <Input
                  id="cageotsQty"
                  type="number"
                  placeholder="0"
                  value={newCageots}
                  onChange={(e) => setNewCageots(e.target.value)}
                  className="border-[#E5E7EB]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCageotsOpen(false)}
                  className="flex-1 border-[#E5E7EB] text-[#6B7280]"
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handleCageotsSubmit}
                  style={cageotsType === "Ajout" ? { backgroundColor: '#2E7D32' } : { backgroundColor: '#C62828' }}
                  className="flex-1 hover:opacity-90"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Valider
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
