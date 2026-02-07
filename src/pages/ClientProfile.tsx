import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import jsPDF from "jspdf";
import {  
  ArrowLeft, Phone, FileText, CreditCard, Package, 
  Plus, Download, Send, DollarSign, FilePlus, MapPin, Mail, User,
  ChevronLeft, ChevronRight, CheckSquare, Square, Building2
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Types
interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  cageots?: number;
}

interface Invoice {
  id: string;
  date: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: "pending" | "partial" | "paid" | "overdue";
  items: InvoiceItem[];
  hangar: string;
  responsiblePerson: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
}

interface Payment {
  id: string;
  date: string;
  amount: number;
  method: string;
  invoices: string[];
}

interface CageotsHistory {
  id: string;
  date: string;
  type: "Ajout" | "Retrait";
  quantity: number;
  reason: string;
}

// Mock client data
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

// Mock invoices with enhanced data
const mockInvoices: Invoice[] = [
  { 
    id: "INV-2024-001", 
    date: "15/01/2024", 
    dueDate: "20/01/2024",
    amount: 450000, 
    paidAmount: 0,
    status: "pending" as const, 
    items: [
      { name: "Bananes plantain", quantity: 50, price: 5000, cageots: 10 },
      { name: "Mangues", quantity: 100, price: 2500, cageots: 20 },
    ],
    hangar: "Hangar A",
    responsiblePerson: "Mamadou Traoré",
    clientId: "1",
    clientName: "Moussa Diop",
    clientPhone: "+221 77 123 45 67",
    clientAddress: "45 Rue Diop, Dakar",
  },
  { 
    id: "INV-2024-002", 
    date: "10/01/2024", 
    dueDate: "15/01/2024",
    amount: 320000, 
    paidAmount: 200000,
    status: "partial" as const, 
    items: [
      { name: "Ananas", quantity: 80, price: 4000, cageots: 16 },
    ],
    hangar: "Hangar B",
    responsiblePerson: "Aminata Diallo",
    clientId: "1",
    clientName: "Moussa Diop",
    clientPhone: "+221 77 123 45 67",
    clientAddress: "45 Rue Diop, Dakar",
  },
  { 
    id: "INV-2024-003", 
    date: "05/01/2024", 
    dueDate: "05/01/2024",
    amount: 280000, 
    paidAmount: 280000,
    status: "paid" as const, 
    items: [
      { name: "Oranges", quantity: 140, price: 2000, cageots: 28 },
    ],
    hangar: "Hangar A",
    responsiblePerson: "Mamadou Traoré",
    clientId: "1",
    clientName: "Moussa Diop",
    clientPhone: "+221 77 123 45 67",
    clientAddress: "45 Rue Diop, Dakar",
  },
  { 
    id: "INV-2023-145", 
    date: "28/12/2023", 
    dueDate: "03/01/2024",
    amount: 520000, 
    paidAmount: 0,
    status: "overdue" as const, 
    items: [
      { name: "Bananes douces", quantity: 60, price: 4500, cageots: 12 },
      { name: "Papayes", quantity: 40, price: 7000, cageots: 8 },
    ],
    hangar: "Hangar C",
    responsiblePerson: "Souleymane Barry",
    clientId: "1",
    clientName: "Moussa Diop",
    clientPhone: "+221 77 123 45 67",
    clientAddress: "45 Rue Diop, Dakar",
  },
  { 
    id: "INV-2023-142", 
    date: "20/12/2023", 
    dueDate: "20/12/2023",
    amount: 185000, 
    paidAmount: 185000,
    status: "paid" as const, 
    items: [
      { name: "Mangues", quantity: 74, price: 2500, cageots: 15 },
    ],
    hangar: "Hangar B",
    responsiblePerson: "Aminata Diallo",
    clientId: "1",
    clientName: "Moussa Diop",
    clientPhone: "+221 77 123 45 67",
    clientAddress: "45 Rue Diop, Dakar",
  },
];

// Mock payments
const mockPayments: Payment[] = [
  { id: "PAY-2024-001", date: "12/01/2024", amount: 320000, method: "Mobile Money", invoices: ["INV-2024-002"] },
  { id: "PAY-2024-002", date: "06/01/2024", amount: 280000, method: "Virement", invoices: ["INV-2024-003"] },
  { id: "PAY-2023-156", date: "30/12/2023", amount: 400000, method: "Espèces", invoices: ["INV-2023-142"] },
  { id: "PAY-2023-150", date: "22/12/2023", amount: 185000, method: "Mobile Money", invoices: ["INV-2023-142"] },
];

// Mock cageots history
const mockCageotsHistory: CageotsHistory[] = [
  { id: "CAG-001", date: "15/01/2024", type: "Ajout", quantity: 10, reason: "Livraison" },
  { id: "CAG-002", date: "10/01/2024", type: "Retrait", quantity: 5, reason: "Retour client" },
  { id: "CAG-003", date: "05/01/2024", type: "Ajout", quantity: 15, reason: "Livraison" },
  { id: "CAG-004", date: "28/12/2023", type: "Retrait", quantity: 8, reason: "Vente" },
  { id: "CAG-005", date: "20/12/2023", type: "Ajout", quantity: 13, reason: "Livraison" },
];

// Mock hangars and responsible persons
const mockHangars = ["Hangar A", "Hangar B", "Hangar C"];
const mockResponsiblePersons = [
  { name: "Mamadou Traoré", hangar: "Hangar A" },
  { name: "Aminata Diallo", hangar: "Hangar B" },
  { name: "Souleymane Barry", hangar: "Hangar C" },
];

// Mock products for invoice creation
const mockProducts = [
  { name: "Bananes plantain", price: 5000 },
  { name: "Bananes douces", price: 4500 },
  { name: "Mangues", price: 2500 },
  { name: "Ananas", price: 4000 },
  { name: "Oranges", price: 2000 },
  { name: "Papayes", price: 7000 },
  { name: "Avocats", price: 3500 },
  { name: "Citrons", price: 1500 },
];

const ITEMS_PER_PAGE = 5;

export default function ClientProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isCageotsOpen, setIsCageotsOpen] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Mobile Money");
  const [newCageots, setNewCageots] = useState("");
  const [cageotsType, setCageotsType] = useState("Ajout");

  // Invoice creation state
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([{ name: "", quantity: 0, price: 0, cageots: 0 }]);
  const [selectedHangar, setSelectedHangar] = useState("");
  const [selectedResponsible, setSelectedResponsible] = useState("");
  const [invoiceType, setInvoiceType] = useState<"paid" | "partial" | "unpaid">("unpaid");
  const [invoicePaymentAmount, setInvoicePaymentAmount] = useState("");
  const [invoiceDueDate, setInvoiceDueDate] = useState("");

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
  const overdueAmount = mockInvoices.filter(i => i.status === "overdue").reduce((sum, i) => sum + i.amount, 0);
  const cageotsBalance = mockClient.cageots;

  // Get unpaid/partial invoices for payment
  const payableInvoices = mockInvoices.filter(i => i.status === "pending" || i.status === "partial");

  // Calculate selected invoices total
  const selectedInvoicesTotal = selectedInvoices.reduce((sum, invId) => {
    const invoice = mockInvoices.find(i => i.id === invId);
    return sum + (invoice ? invoice.amount - invoice.paidAmount : 0);
  }, 0);

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
    if (selectedInvoices.length === 0) {
      alert("Veuillez sélectionner au moins une facture");
      return;
    }
    alert(`Paiement de ${amount.toLocaleString()} F enregistré pour ${mockClient.name}\nFactures: ${selectedInvoices.join(", ")}\nMode: ${paymentMethod}`);
    setIsPaymentOpen(false);
    setSelectedInvoices([]);
    setPaymentAmount("");
  };

  const toggleInvoiceSelection = (invoiceId: string) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const selectAllPayableInvoices = () => {
    if (selectedInvoices.length === payableInvoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(payableInvoices.map(i => i.id));
    }
  };

  const handleInvoiceSubmit = () => {
    const totalAmount = invoiceItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const validItems = invoiceItems.filter(item => item.name && item.quantity > 0);
    
    // Calculate paid amount based on invoice type
    let paidAmount = 0;
    let status: "paid" | "partial" | "pending" = "pending";
    
    if (invoiceType === "paid") {
      paidAmount = totalAmount;
      status = "paid";
    } else if (invoiceType === "partial") {
      const payment = parseInt(invoicePaymentAmount.replace(/\D/g, "")) || 0;
      paidAmount = Math.min(payment, totalAmount);
      status = paidAmount > 0 ? "partial" : "pending";
    }
    
    const newInvoice: Invoice = {
      id: `INV-${new Date().getFullYear()}-${String(mockInvoices.length + 1).padStart(3, '0')}`,
      date: new Date().toLocaleDateString("fr-FR"),
      dueDate: invoiceDueDate,
      amount: totalAmount,
      paidAmount: paidAmount,
      status: status,
      items: validItems,
      hangar: selectedHangar,
      responsiblePerson: selectedResponsible,
      clientId: mockClient.id,
      clientName: mockClient.name,
      clientPhone: mockClient.phone,
      clientAddress: mockClient.address,
    };
    
    let message = `Facture ${newInvoice.id} générée pour ${mockClient.name}\nMontant: ${totalAmount.toLocaleString()} F\nHangar: ${selectedHangar}\nResponsable: ${selectedResponsible}`;
    
    if (invoiceType === "paid") {
      message += `\n\nPaiement immédiat enregistré: ${formatCurrency(totalAmount)}`;
    } else if (invoiceType === "partial" && paidAmount > 0) {
      message += `\n\nPaiement partiel enregistré: ${formatCurrency(paidAmount)}\nReste à payer: ${formatCurrency(totalAmount - paidAmount)}`;
    } else {
      message += `\n\nCette facture sera disponible pour sélection lors des paiements.`;
    }
    
    alert(message);
    setIsInvoiceOpen(false);
    resetInvoiceForm();
  };

  const resetInvoiceForm = () => {
    setInvoiceItems([{ name: "", quantity: 0, price: 0, cageots: 0 }]);
    setSelectedHangar("");
    setSelectedResponsible("");
    setInvoiceType("unpaid");
    setInvoicePaymentAmount("");
    setInvoiceDueDate("");
  };

  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { name: "", quantity: 0, price: 0, cageots: 0 }]);
  };

  const updateInvoiceItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updated = [...invoiceItems];
    if (field === "name" && typeof value === "string") {
      const product = mockProducts.find(p => p.name === value);
      updated[index] = { 
        ...updated[index], 
        [field]: value,
        price: product?.price || 0,
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setInvoiceItems(updated);
  };

  const removeInvoiceItem = (index: number) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    }
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

  const generatePDF = (invoice: Invoice) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;
    
    // Header - Company Info
    doc.setFillColor(31, 58, 95);
    doc.rect(0, 0, pageWidth, 45, "F");
    
    // Company name (white)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("SODIPAS SARL", margin, 20);
    
    // Company details (white, smaller)
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Immeuble Macal, Liberté 6 Extension VDN", margin, 28);
    doc.text("NINEA: 00898900R | RC: SN DKR 5 49981", margin, 34);
    doc.text("Tél: 77 650 09 77 / 76 468 95 35 | Dakar - Sénégal", margin, 40);
    
    // Invoice info block (right side)
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(pageWidth - margin - 65, 10, 65, 30, 2, 2, "F");
    
    doc.setTextColor(31, 58, 95);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("FACTURE", pageWidth - margin - 32, 18, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(`N°: ${invoice.id}`, pageWidth - margin - 5, 26, { align: "right" });
    doc.text(`Date: ${invoice.date}`, pageWidth - margin - 5, 33, { align: "right" });
    
    y = 55;
    
    // Client Info Section
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 25, 2, 2, "F");
    
    doc.setTextColor(31, 58, 95);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("INFORMATIONS CLIENT", margin + 5, y + 8);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text(`Client: ${invoice.clientName}`, margin + 5, y + 16);
    doc.text(`Téléphone: ${invoice.clientPhone}`, pageWidth / 2, y + 16);
    doc.text(`Adresse: ${invoice.clientAddress}`, margin + 5, y + 22);
    
    y += 35;
    
    // Articles Table Header
    doc.setFillColor(31, 58, 95);
    doc.rect(margin, y, pageWidth - margin * 2, 10, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("QTE", margin + 8, y + 7);
    doc.text("DESIGNATION", margin + 35, y + 7);
    doc.text("PRIX UNITAIRE", pageWidth / 2 + 10, y + 7, { align: "center" });
    doc.text("MONTANT", pageWidth - margin - 8, y + 7, { align: "right" });
    
    y += 10;
    
    // Articles
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    invoice.items.forEach((item, index) => {
      const rowBg = index % 2 === 0 ? 255 : 248;
      if (rowBg < 255) {
        doc.setFillColor(rowBg, rowBg, rowBg);
        doc.rect(margin, y, pageWidth - margin * 2, 10, "F");
      }
      
      const unitPrice = item.price.toLocaleString();
      const itemTotal = (item.quantity * item.price).toLocaleString();
      
      doc.text(item.quantity.toString(), margin + 8, y + 7);
      doc.text(item.name, margin + 35, y + 7);
      doc.text(`${unitPrice} F`, pageWidth / 2 + 10, y + 7, { align: "center" });
      doc.text(`${itemTotal} F`, pageWidth - margin - 8, y + 7, { align: "right" });
      
      y += 10;
    });
    
    y += 5;
    
    // Total Section
    const totalX = pageWidth - margin - 50;
    doc.setFillColor(31, 58, 95);
    doc.roundedRect(totalX, y, 55, 12, 2, 2, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL", totalX + 5, y + 8);
    
    doc.setFontSize(12);
    doc.text(`${invoice.amount.toLocaleString()} F`, pageWidth - margin - 5, y + 8, { align: "right" });
    
    y += 20;
    
    // Payment Conditions
    doc.setTextColor(31, 58, 95);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("CONDITIONS DE PAIEMENT", margin, y);
    
    y += 8;
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Date de paiement : 7 jours après facturation", margin, y);
    
    y += 8;
    doc.setTextColor(31, 58, 95);
    doc.text("NB : Les marchandises vendues ne sont ni reprises ni échangées", margin, y);
    
    y += 15;
    
    // Footer
    doc.setDrawColor(31, 58, 95);
    doc.line(margin, y, pageWidth - margin, y);
    
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Merci de votre confiance - SODIPAS SARL | Dakar, Sénégal", pageWidth / 2, y + 10, { align: "center" });
    doc.text("Siège: Immeuble Macal, Liberté 6 Extension VDN | Tél: 77 650 09 77", pageWidth / 2, y + 16, { align: "center" });
    
    // Save PDF
    doc.save(`${invoice.id}.pdf`);
    
    alert(`Facture ${invoice.id} téléchargée!`);
  };

  const formatCurrency = (amount: number) => amount.toLocaleString() + " F";

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
                {formatCurrency(mockClient.debt)}
              </p>
              <p className="text-xs text-[#6B7280] mt-1">Limite: {formatCurrency(mockClient.debtLimit)}</p>
            </div>
            <div className="p-5">
              <p className="text-sm text-[#6B7280]">Impayé</p>
              <p className="text-2xl font-bold text-[#C62828] mt-1">{formatCurrency(overdueAmount)}</p>
              <p className="text-xs text-[#6B7280] mt-1">en retard</p>
            </div>
            <div className="p-5">
              <p className="text-sm text-[#6B7280]">Cageots</p>
              <p className="text-2xl font-bold text-[#1F2937] mt-1">{cageotsBalance}</p>
              <p className="text-xs text-[#6B7280] mt-1">consignés</p>
            </div>
            <div className="p-5">
              <p className="text-sm text-[#6B7280]">Total achats</p>
              <p className="text-2xl font-bold text-[#1F3A5F] mt-1">{formatCurrency(mockClient.totalPurchases)}</p>
              <p className="text-xs text-[#6B7280] mt-1">depuis le début</p>
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
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Date limite</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Articles</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Hangar</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Responsable</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-[#6B7280] uppercase tracking-wider">Montant</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-[#6B7280] uppercase tracking-wider">Payé</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-[#6B7280] uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-[#6B7280] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {currentInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-6 py-4 font-medium text-[#1F2937]">{invoice.id}</td>
                        <td className="px-6 py-4 text-[#6B7280]">{invoice.date}</td>
                        <td className="px-6 py-4 text-[#6B7280]">{invoice.dueDate}</td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {invoice.items.map((item, idx) => (
                              <p key={idx} className="text-sm text-[#6B7280]">
                                {item.quantity}x {item.name} {item.cageots ? `(${item.cageots} cageots)` : ""}
                              </p>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#6B7280]">
                          <Badge variant="outline" className="bg-[#F8FAFC] border-[#E5E7EB]">
                            <Building2 className="h-3 w-3 mr-1" />
                            {invoice.hangar}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-[#6B7280]">{invoice.responsiblePerson}</td>
                        <td className="px-6 py-4 text-right font-semibold text-[#1F2937]">
                          {formatCurrency(invoice.amount)}
                        </td>
                        <td className="px-6 py-4 text-right text-[#6B7280]">
                          {invoice.paidAmount > 0 ? formatCurrency(invoice.paidAmount) : "-"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge 
                            variant="outline"
                            className={
                              invoice.status === "paid" ? "bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/20" :
                              invoice.status === "overdue" ? "bg-[#C62828]/10 text-[#C62828] border-[#C62828]/20" :
                              invoice.status === "partial" ? "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20" :
                              "bg-[#F9C74F]/10 text-[#B45309] border-[#F9C74F]/20"
                            }
                          >
                            {invoice.status === "paid" ? "Payée" : invoice.status === "overdue" ? "Impayée" : invoice.status === "partial" ? "Partielle" : "En attente"}
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
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Factures</th>
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
                          <div className="flex flex-wrap gap-1">
                            {payment.invoices.map(invId => (
                              <Badge key={invId} variant="outline" className="bg-[#F8FAFC] border-[#E5E7EB] text-xs">
                                {invId}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="bg-[#F8FAFC] border-[#E5E7EB]">
                            {payment.method}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-[#2E7D32]">
                          +{formatCurrency(payment.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#F8FAFC] border-t border-[#E5E7EB]">
                    <tr>
                      <td colSpan={4} className="px-6 py-4 font-medium text-[#1F2937]">Total payé</td>
                      <td className="px-6 py-4 text-right font-bold text-[#2E7D32] text-lg">
                        {formatCurrency(totalPaid)}
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
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-[#6B7280] uppercase tracking-wider">Quantité</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Raison</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {currentCageots.map((cageot) => (
                      <tr key={cageot.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-6 py-4 font-medium text-[#1F2937]">{cageot.id}</td>
                        <td className="px-6 py-4 text-[#6B7280]">{cageot.date}</td>
                        <td className="px-6 py-4">
                          <Badge 
                            variant="outline"
                            className={cageot.type === "Ajout" ? "bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/20" : "bg-[#C62828]/10 text-[#C62828] border-[#C62828]/20"}
                          >
                            {cageot.type}
                          </Badge>
                        </td>
                        <td className={`px-6 py-4 text-right font-semibold ${cageot.type === "Ajout" ? "text-[#2E7D32]" : "text-[#C62828]"}`}>
                          {cageot.type === "Ajout" ? "+" : "-"}{cageot.quantity}
                        </td>
                        <td className="px-6 py-4 text-[#6B7280]">{cageot.reason}</td>
                      </tr>
                    ))}
                  </tbody>
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
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enregistrer un paiement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Invoice Selection */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">Sélectionner les factures à payer</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={selectAllPayableInvoices}
                  className="text-xs text-[#1F3A5F]"
                >
                  {selectedInvoices.length === payableInvoices.length ? "Tout désélectionner" : "Tout sélectionner"}
                </Button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {payableInvoices.map((invoice) => {
                  const remainingAmount = invoice.amount - invoice.paidAmount;
                  return (
                    <div 
                      key={invoice.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selectedInvoices.includes(invoice.id) ? "bg-[#1F3A5F]/10 border-[#1F3A5F]" : "border-[#E5E7EB] hover:bg-[#F8FAFC]"}`}
                      onClick={() => toggleInvoiceSelection(invoice.id)}
                    >
                      <div className="flex items-center gap-3">
                        {selectedInvoices.includes(invoice.id) ? (
                          <CheckSquare className="h-5 w-5 text-[#1F3A5F]" />
                        ) : (
                          <Square className="h-5 w-5 text-[#6B7280]" />
                        )}
                        <div>
                          <p className="font-medium text-[#1F2937]">{invoice.id}</p>
                          <p className="text-sm text-[#6B7280]">{invoice.date} - {invoice.hangar}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#1F2937]">{formatCurrency(remainingAmount)}</p>
                        {invoice.status === "partial" && (
                          <p className="text-xs text-[#3B82F6]">dont {formatCurrency(invoice.paidAmount)} déjà payé</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-[#F8FAFC] rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#6B7280]">Total sélectionné:</span>
                <span className="text-xl font-bold text-[#1F3A5F]">{formatCurrency(selectedInvoicesTotal)}</span>
              </div>
            </div>

            {/* Payment Amount */}
            <div>
              <Label htmlFor="paymentAmount">Montant du paiement</Label>
              <Input
                id="paymentAmount"
                type="text"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value.replace(/\D/g, ""))}
                placeholder="Entrez le montant"
                className="mt-1"
              />
            </div>

            {/* Payment Method */}
            <div>
              <Label htmlFor="paymentMethod">Mode de paiement</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionner le mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                  <SelectItem value="Virement">Virement bancaire</SelectItem>
                  <SelectItem value="Espèces">Espèces</SelectItem>
                  <SelectItem value="Chèque">Chèque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handlePaymentSubmit}
              className="bg-[#2E7D32] hover:bg-[#2E7D32]/90"
              disabled={selectedInvoices.length === 0}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Enregistrer le paiement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Invoice Dialog */}
      <Dialog open={isInvoiceOpen} onOpenChange={(open) => {
        if (!open) resetInvoiceForm();
        setIsInvoiceOpen(open);
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle facture</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Invoice Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hangar">Hangar</Label>
                <Select value={selectedHangar} onValueChange={setSelectedHangar}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sélectionner le hangar" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockHangars.map(hangar => (
                      <SelectItem key={hangar} value={hangar}>{hangar}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dueDate">Date limite de paiement</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={invoiceDueDate}
                  onChange={(e) => setInvoiceDueDate(e.target.value)}
                  placeholder="JJ/MM/AAAA"
                  className="mt-1"
                />
                {invoiceType !== "paid" && (
                  <p className="text-xs text-[#6B7280] mt-1">Date limite requise pour le paiement</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="responsible">Responsable</Label>
                <Select value={selectedResponsible} onValueChange={setSelectedResponsible}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sélectionner le responsable" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockResponsiblePersons.map(person => (
                      <SelectItem key={person.name} value={person.name}>{person.name} ({person.hangar})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Invoice Type */}
            <div>
              <Label>Type de facture</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Button
                  type="button"
                  variant={invoiceType === "unpaid" ? "default" : "outline"}
                  onClick={() => setInvoiceType("unpaid")}
                  className={invoiceType === "unpaid" ? "bg-[#F9C74F] text-[#1F2937] hover:bg-[#F9C74F]/90" : "text-[#6B7280]"}
                >
                  Non payée
                </Button>
                <Button
                  type="button"
                  variant={invoiceType === "partial" ? "default" : "outline"}
                  onClick={() => setInvoiceType("partial")}
                  className={invoiceType === "partial" ? "bg-[#3B82F6] hover:bg-[#3B82F6]/90" : "text-[#6B7280]"}
                >
                  Partiellement payée
                </Button>
                <Button
                  type="button"
                  variant={invoiceType === "paid" ? "default" : "outline"}
                  onClick={() => setInvoiceType("paid")}
                  className={invoiceType === "paid" ? "bg-[#2E7D32] hover:bg-[#2E7D32]/90" : "text-[#6B7280]"}
                >
                  Payée
                </Button>
              </div>
            </div>

            {/* Payment Amount for Partial/Paid */}
            {invoiceType !== "unpaid" && (
              <div className="bg-[#F8FAFC] rounded-lg p-4">
                <Label htmlFor="invoicePaymentAmount">
                  {invoiceType === "paid" ? "Montant du paiement (total)" : "Montant du paiement partiel"}
                </Label>
                <Input
                  id="invoicePaymentAmount"
                  type="text"
                  value={invoicePaymentAmount}
                  onChange={(e) => setInvoicePaymentAmount(e.target.value.replace(/\D/g, ""))}
                  placeholder="Entrez le montant"
                  className="mt-1"
                />
                <p className="text-xs text-[#6B7280] mt-1">
                  Total de la facture: {formatCurrency(invoiceItems.reduce((sum, item) => sum + (item.quantity * item.price), 0))}
                </p>
              </div>
            )}

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Articles</Label>
                <Button variant="outline" size="sm" onClick={addInvoiceItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter un article
                </Button>
              </div>
              <div className="space-y-2">
                {invoiceItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg">
                    <div className="col-span-4">
                      <Label className="text-xs">Article</Label>
                      <Select 
                        value={item.name} 
                        onValueChange={(value) => updateInvoiceItem(index, "name", value)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockProducts.map(product => (
                            <SelectItem key={product.name} value={product.name}>
                              {product.name} ({formatCurrency(product.price)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Quantité</Label>
                      <Input
                        type="number"
                        value={item.quantity || ""}
                        onChange={(e) => updateInvoiceItem(index, "quantity", parseInt(e.target.value) || 0)}
                        className="h-8"
                        min="0"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">P.U (F)</Label>
                      <Input
                        type="number"
                        value={item.price || ""}
                        onChange={(e) => updateInvoiceItem(index, "price", parseInt(e.target.value) || 0)}
                        className="h-8"
                        min="0"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Cageots</Label>
                      <Input
                        type="number"
                        value={item.cageots || ""}
                        onChange={(e) => updateInvoiceItem(index, "cageots", parseInt(e.target.value) || 0)}
                        className="h-8"
                        min="0"
                      />
                    </div>
                    <div className="col-span-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeInvoiceItem(index)}
                        disabled={invoiceItems.length === 1}
                        className="h-8 w-full text-[#C62828]"
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="bg-[#F8FAFC] rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#6B7280]">Total:</span>
                <span className="text-xl font-bold text-[#1F3A5F]">
                  {formatCurrency(invoiceItems.reduce((sum, item) => sum + (item.quantity * item.price), 0))}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInvoiceOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleInvoiceSubmit}
              className="bg-[#1F3A5F] hover:bg-[#1F3A5F]/90"
              disabled={!selectedHangar || !selectedResponsible || invoiceItems.every(item => !item.name || item.quantity <= 0) || (invoiceType !== "paid" && !invoiceDueDate)}
            >
              <FilePlus className="mr-2 h-4 w-4" />
              Générer la facture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cageots Dialog */}
      <Dialog open={isCageotsOpen} onOpenChange={setIsCageotsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gérer les cageots</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Type d'opération</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  variant={cageotsType === "Ajout" ? "default" : "outline"}
                  onClick={() => setCageotsType("Ajout")}
                  className={cageotsType === "Ajout" ? "bg-[#2E7D32]" : "text-[#2E7D32]"}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajout
                </Button>
                <Button
                  variant={cageotsType === "Retrait" ? "default" : "outline"}
                  onClick={() => setCageotsType("Retrait")}
                  className={cageotsType === "Retrait" ? "bg-[#C62828]" : "text-[#C62828]"}
                >
                  <Package className="h-4 w-4 mr-1" />
                  Retrait
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="cageotsQuantity">Quantité</Label>
              <Input
                id="cageotsQuantity"
                type="number"
                value={newCageots}
                onChange={(e) => setNewCageots(e.target.value.replace(/\D/g, ""))}
                placeholder="Entrez la quantité"
                className="mt-1"
                min="1"
              />
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-3">
              <p className="text-sm text-[#6B7280]">Solde actuel:</p>
              <p className="text-2xl font-bold text-[#1F2937]">{cageotsBalance} cageots</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCageotsOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleCageotsSubmit}
              className={cageotsType === "Ajout" ? "bg-[#2E7D32] hover:bg-[#2E7D32]/90" : "bg-[#C62828] hover:bg-[#C62828]/90"}
            >
              {cageotsType === "Ajout" ? "Ajouter" : "Retirer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
