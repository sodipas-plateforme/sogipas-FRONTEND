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
import { Package, Plus, Minus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CageotsFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
  currentCageots: number;
  onSuccess?: () => void;
}

export function CageotsForm({
  open,
  onOpenChange,
  clientId,
  clientName,
  currentCageots,
  onSuccess,
}: CageotsFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"add" | "remove">("add");
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState("");

  const handleSubmit = async () => {
    if (quantity <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une quantité valide",
        variant: "destructive",
      });
      return;
    }

    if (type === "remove" && quantity > currentCageots) {
      toast({
        title: "Erreur",
        description: `Vous ne pouvez pas retirer plus de ${currentCageots} cageots`,
        variant: "destructive",
      });
      return;
    }

    if (!reason.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez préciser la raison",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const actionText = type === "add" ? "ajouté" : "retiré";
      toast({
        title: type === "add" ? "Cageots ajoutés" : "Cageots retirés",
        description: `${quantity} cageots ${actionText} pour ${clientName}`,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier les cageots",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setType("add");
    setQuantity(0);
    setReason("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) resetForm();
        onOpenChange(open);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Gérer les cageots
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Client Info */}
          <div className="bg-[#F8FAFC] rounded-lg p-3">
            <p className="text-sm text-[#6B7280]">Client</p>
            <p className="font-medium text-[#1F2937]">{clientName}</p>
            <p className="text-sm text-[#6B7280] mt-1">
              Cageots actuels: <span className="font-bold">{currentCageots}</span>
            </p>
          </div>

          {/* Type Selection */}
          <div>
            <Label>Type d'opération</Label>
            <div className="flex gap-4 mt-2">
              <button
                type="button"
                onClick={() => setType("add")}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                  type === "add"
                    ? "bg-[#2E7D32]/10 border-[#2E7D32] text-[#2E7D32]"
                    : "border-[#E5E7EB] text-[#6B7280] hover:bg-[#F8FAFC]"
                }`}
              >
                <Plus className="h-5 w-5" />
                Ajouter
              </button>
              <button
                type="button"
                onClick={() => setType("remove")}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                  type === "remove"
                    ? "bg-[#C62828]/10 border-[#C62828] text-[#C62828]"
                    : "border-[#E5E7EB] text-[#6B7280] hover:bg-[#F8FAFC]"
                }`}
              >
                <Minus className="h-5 w-5" />
                Retirer
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <Label htmlFor="quantity">Quantité</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={quantity || ""}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              placeholder="Nombre de cageots"
              className="mt-1"
            />
            {type === "remove" && (
              <p className="text-xs text-[#6B7280] mt-1">
                Maximum: {currentCageots} cageots disponibles
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <Label htmlFor="reason">Raison</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Sélectionner une raison" />
              </SelectTrigger>
              <SelectContent>
                {type === "add" ? (
                  <>
                    <SelectItem value="livraison">Livraison</SelectItem>
                    <SelectItem value="retour_client">Retour client</SelectItem>
                    <SelectItem value="recuperation">Récupération</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="collecte">Collecte</SelectItem>
                    <SelectItem value="vente">Vente</SelectItem>
                    <SelectItem value="client_retrait">Retrait client</SelectItem>
                    <SelectItem value="perte">Perte</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          <div
            className={`rounded-lg p-4 ${
              type === "add"
                ? "bg-[#2E7D32]/10 text-[#2E7D32]"
                : "bg-[#C62828]/10 text-[#C62828]"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">
                {type === "add" ? "Nouveau total:" : "Nouveau total:"}
              </span>
              <span className="text-xl font-bold">
                {type === "add"
                  ? currentCageots + quantity
                  : currentCageots - quantity}{" "}
                cageots
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || quantity <= 0}
            className={
              type === "add"
                ? "bg-[#2E7D32] hover:bg-[#2E7D32]/90"
                : "bg-[#C62828] hover:bg-[#C62828]/90"
            }
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : type === "add" ? (
              <Plus className="mr-2 h-4 w-4" />
            ) : (
              <Minus className="mr-2 h-4 w-4" />
            )}
            {type === "add" ? "Ajouter" : "Retirer"} les cageots
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
