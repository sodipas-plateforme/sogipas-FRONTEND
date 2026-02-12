import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DollarSign, CheckSquare, Square, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  id: string;
  date: string;
  amount: number;
  paidAmount: number;
  hangar: string;
}

interface PaymentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
  onSuccess?: () => void;
}

export function PaymentForm({
  open,
  onOpenChange,
  clientId,
  clientName,
  onSuccess,
}: PaymentFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mobile_money");
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Mock invoices - in production, fetch from API
  useEffect(() => {
    if (open) {
      // Simulate fetching invoices
      setInvoices([
        { id: "INV-2024-001", date: "15/01/2024", amount: 450000, paidAmount: 0, hangar: "Hangar A" },
        { id: "INV-2024-002", date: "10/01/2024", amount: 280000, paidAmount: 140000, hangar: "Hangar A" },
        { id: "INV-2024-003", date: "05/01/2024", amount: 150000, paidAmount: 150000, hangar: "Hangar B" },
      ]);
      setSelectedInvoices([]);
      setPaymentAmount("");
    }
  }, [open]);

  const payableInvoices = invoices.filter(
    (inv) => inv.amount - inv.paidAmount > 0
  );

  const selectedInvoicesTotal = selectedInvoices.reduce((sum, invId) => {
    const invoice = invoices.find((i) => i.id === invId);
    return sum + (invoice ? invoice.amount - invoice.paidAmount : 0);
  }, 0);

  const toggleInvoiceSelection = (invoiceId: string) => {
    setSelectedInvoices((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const handleSubmit = async () => {
    const amount = parseInt(paymentAmount.replace(/\D/g, "")) || 0;
    if (amount <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un montant valide",
        variant: "destructive",
      });
      return;
    }
    if (selectedInvoices.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins une facture",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Paiement enregistré",
        description: `Paiement de ${amount.toLocaleString()} F pour ${clientName}`,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le paiement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Enregistrer un paiement</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Client Info */}
          <div className="bg-[#F8FAFC] rounded-lg p-3">
            <p className="text-sm text-[#6B7280]">Client</p>
            <p className="font-medium text-[#1F2937]">{clientName}</p>
          </div>

          {/* Invoice Selection */}
          <div>
            <Label className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">
              Sélectionner les factures
            </Label>
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
              {payableInvoices.length === 0 ? (
                <p className="text-sm text-[#6B7280] py-4 text-center">
                  Aucune facture en attente
                </p>
              ) : (
                payableInvoices.map((invoice) => {
                  const remainingAmount = invoice.amount - invoice.paidAmount;
                  const isSelected = selectedInvoices.includes(invoice.id);

                  return (
                    <div
                      key={invoice.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[#1F3A5F]/10 border-[#1F3A5F]"
                          : "border-[#E5E7EB] hover:bg-[#F8FAFC]"
                      }`}
                      onClick={() => toggleInvoiceSelection(invoice.id)}
                    >
                      <div className="flex items-center gap-3">
                        {isSelected ? (
                          <CheckSquare className="h-5 w-5 text-[#1F3A5F]" />
                        ) : (
                          <Square className="h-5 w-5 text-[#6B7280]" />
                        )}
                        <div>
                          <p className="font-medium text-[#1F2937]">{invoice.id}</p>
                          <p className="text-sm text-[#6B7280]">
                            {invoice.date} - {invoice.hangar}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#1F2937]">
                          {remainingAmount.toLocaleString()} F
                        </p>
                        {invoice.paidAmount > 0 && (
                          <p className="text-xs text-[#3B82F6]">
                            dont {(invoice.paidAmount).toLocaleString()} F déjà payé
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-[#F8FAFC] rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#6B7280]">Total sélectionné:</span>
              <span className="text-xl font-bold text-[#1F3A5F]">
                {selectedInvoicesTotal.toLocaleString()} F
              </span>
            </div>
          </div>

          {/* Payment Amount */}
          <div>
            <Label htmlFor="paymentAmount">Montant du paiement</Label>
            <div className="relative mt-1">
              <Input
                id="paymentAmount"
                type="text"
                value={paymentAmount}
                onChange={(e) =>
                  setPaymentAmount(e.target.value.replace(/\D/g, ""))
                }
                placeholder="Entrez le montant"
                className="pl-10"
              />
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <Label htmlFor="paymentMethod">Mode de paiement</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Sélectionner le mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                <SelectItem value="cash">Espèces</SelectItem>
                <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                <SelectItem value="check">Chèque</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || selectedInvoices.length === 0}
            className="bg-[#2E7D32] hover:bg-[#2E7D32]/90"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <DollarSign className="mr-2 h-4 w-4" />
            )}
            Enregistrer le paiement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
