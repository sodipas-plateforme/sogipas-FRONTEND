import { useState } from "react";
import { Truck, Package, Plus, Trash2, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { API_ENDPOINTS } from "@/config/api";
import { useToast } from "@/hooks/use-toast";

interface UnloadItem {
  name: string;
  quantity: number;
  unit: string;
  value: number;
}

interface TruckUnloadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  truck: {
    id: string;
    driver: string;
    origin: string;
    hangar: string;
    articles: string[] | { name: string; quantity: number; unit: string; unitPrice: number; totalValue: number }[];
  } | null;
  onSuccess: () => void;
}

export function TruckUnload({ open, onOpenChange, truck, onSuccess }: TruckUnloadProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<UnloadItem[]>(
    truck?.articles?.map((article: string | { name: string; quantity: number; unit: string; unitPrice: number; totalValue: number }) => ({
      name: typeof article === 'string' ? article : (article as any).name,
      quantity: 0,
      unit: "cageots",
      value: 0
    })) || []
  );

  const updateItem = (index: number, field: keyof UnloadItem, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async () => {
    if (!truck) return;
    
    const validItems = items.filter(item => item.quantity > 0);
    
    if (validItems.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir les quantités déchargées",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_ENDPOINTS.TRUCKS}/${truck.id}/unload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ items: validItems }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Succès",
          description: "Camion déchargé avec succès. Stock mis à jour.",
        });
        onSuccess();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de finaliser le déchargement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Déchargement du camion
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Truck info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{truck?.driver || "Camion"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{truck?.origin || "-"}</span>
              <span>→</span>
              <span>{truck?.hangar || "-"}</span>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            <Label className="text-base">Articles à décharger</Label>
            
            {items.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Aucun article disponible
              </p>
            ) : (
              items.map((item, index) => (
                <div key={index} className="flex gap-3 items-end">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`unload-name-${index}`}>Article</Label>
                    <Input
                      id={`unload-name-${index}`}
                      value={item.name}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="w-28 space-y-2">
                    <Label htmlFor={`unload-qty-${index}`}>Quantité</Label>
                    <Input
                      id={`unload-qty-${index}`}
                      type="number"
                      min="1"
                      value={item.quantity || ""}
                      onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>

                  <div className="w-28 space-y-2">
                    <Label htmlFor={`unload-unit-${index}`}>Unité</Label>
                    <Input
                      id={`unload-unit-${index}`}
                      value={item.unit}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="w-32 space-y-2">
                    <Label htmlFor={`unload-value-${index}`}>Valeur (FCFA)</Label>
                    <Input
                      id={`unload-value-${index}`}
                      type="number"
                      value={item.value || ""}
                      onChange={(e) => updateItem(index, "value", parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          {items.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">Total articles à décharger</span>
                <Badge variant="secondary">
                  {items.filter(i => i.quantity > 0).length} / {items.length}
                </Badge>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || items.length === 0}
            style={{ backgroundColor: '#2E7D32' }}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirmer déchargement
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
