import { useState } from "react";
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
import { Plus, Trash2, Loader2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  cageots?: number;
}

interface InvoiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
  onSuccess?: () => void;
}

const mockHangars = ["Hangar A", "Hangar B", "Hangar C"];
const mockProducts = [
  { name: "Bananes plantain", price: 5000 },
  { name: "Bananes douces", price: 4500 },
  { name: "Mangues", price: 2500 },
  { name: "Ananas", price: 4000 },
  { name: "Oranges", price: 2000 },
  { name: "Papayes", price: 7000 },
];

export function InvoiceForm({
  open,
  onOpenChange,
  clientId,
  clientName,
  onSuccess,
}: InvoiceFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>([
    { name: "", quantity: 0, price: 0, cageots: 0 },
  ]);
  const [selectedHangar, setSelectedHangar] = useState("");
  const [invoiceType, setInvoiceType] = useState<"paid" | "partial" | "unpaid">(
    "unpaid"
  );
  const [paymentAmount, setPaymentAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  const calculateTotal = () =>
    items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const handleAddItem = () => {
    setItems([...items, { name: "", quantity: 0, price: 0, cageots: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const newItems = [...items];
    if (field === "name") {
      const product = mockProducts.find((p) => p.name === value);
      if (product) {
        newItems[index] = {
          ...newItems[index],
          name: product.name,
          price: product.price,
        };
      } else {
        newItems[index] = { ...newItems[index], [field]: value as string };
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value as number };
    }
    setItems(newItems);
  };

  const handleSubmit = async () => {
    if (!selectedHangar) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un hangar",
        variant: "destructive",
      });
      return;
    }

    const validItems = items.filter((item) => item.name && item.quantity > 0);
    if (validItems.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins un article",
        variant: "destructive",
      });
      return;
    }

    if (invoiceType !== "paid" && !dueDate) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une date limite",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Facture créée",
        description: `Facture pour ${clientName} d'un montant de ${calculateTotal().toLocaleString()} F`,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la facture",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setItems([{ name: "", quantity: 0, price: 0, cageots: 0 }]);
    setSelectedHangar("");
    setInvoiceType("unpaid");
    setPaymentAmount("");
    setDueDate("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) resetForm();
        onOpenChange(open);
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Nouvelle facture
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Client Info */}
          <div className="bg-[#F8FAFC] rounded-lg p-3">
            <p className="text-sm text-[#6B7280]">Client</p>
            <p className="font-medium text-[#1F2937]">{clientName}</p>
          </div>

          {/* Hangar and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hangar">Hangar</Label>
              <Select value={selectedHangar} onValueChange={setSelectedHangar}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionner le hangar" />
                </SelectTrigger>
                <SelectContent>
                  {mockHangars.map((hangar) => (
                    <SelectItem key={hangar} value={hangar}>
                      {hangar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {invoiceType !== "paid" && (
              <div>
                <Label htmlFor="dueDate">Date limite</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
          </div>

          {/* Invoice Type */}
          <div>
            <Label>Type de facture</Label>
            <div className="flex gap-4 mt-2">
              {[
                { value: "unpaid", label: "Non payée" },
                { value: "partial", label: "Paiement partiel" },
                { value: "paid", label: "Payée" },
              ].map((type) => (
                <label
                  key={type.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="invoiceType"
                    value={type.value}
                    checked={invoiceType === type.value}
                    onChange={(e) =>
                      setInvoiceType(e.target.value as typeof invoiceType)
                    }
                    className="h-4 w-4 text-[#1F3A5F]"
                  />
                  <span className="text-sm text-[#1F2937]">{type.label}</span>
                </label>
              ))}
            </div>
            {invoiceType === "partial" && (
              <div className="mt-3">
                <Label htmlFor="paymentAmount">Montant payé</Label>
                <Input
                  id="paymentAmount"
                  type="text"
                  value={paymentAmount}
                  onChange={(e) =>
                    setPaymentAmount(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Entrez le montant"
                  className="mt-1"
                />
              </div>
            )}
          </div>

          {/* Items */}
          <div>
            <Label>Articles</Label>
            <div className="space-y-2 mt-2">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-2 items-start bg-[#F8FAFC] p-3 rounded-lg"
                >
                  <div className="flex-1">
                    <Select
                      value={item.name}
                      onValueChange={(value) =>
                        handleItemChange(index, "name", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un produit" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockProducts.map((product) => (
                          <SelectItem key={product.name} value={product.name}>
                            {product.name} - {product.price.toLocaleString()} F
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-20">
                    <Input
                      type="number"
                      placeholder="Qté"
                      value={item.quantity || ""}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div className="w-20">
                    <Input
                      type="number"
                      placeholder="Cageots"
                      value={item.cageots || ""}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "cageots",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div className="w-28 text-right font-medium pt-2">
                    {(item.quantity * item.price).toLocaleString()} F
                  </div>
                  {items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                      className="text-[#C62828] hover:text-[#C62828]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un article
            </Button>
          </div>

          {/* Total */}
          <div className="bg-[#1F3A5F] text-white rounded-lg p-4 flex justify-between items-center">
            <span className="font-medium">Total à payer</span>
            <span className="text-2xl font-bold">
              {calculateTotal().toLocaleString()} F
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#1F3A5F] hover:bg-[#1F3A5F]/90"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Créer la facture
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
