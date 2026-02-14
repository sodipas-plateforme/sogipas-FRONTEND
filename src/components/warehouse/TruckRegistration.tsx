import { useState } from "react";
import { Truck, Package, MapPin, Phone, User, Plus, Trash2, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { API_ENDPOINTS } from "@/config/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface TruckRegistrationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface ArticleItem {
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
}

const fruits = [
  "Bananes plantain",
  "Bananes douces",
  "Mangues",
  "Ananas",
  "Papayes",
  "Oranges",
  "Noix de coco",
  "Avocats",
  "Citrons",
  "Mandarines",
];

const cities = [
  "Dakar",
  "Thiès",
  "Mbour",
  "Saint-Louis",
  "Kaolack",
  "Fatick",
  "Ziguinchor",
  "Tambacounda",
  "Louga",
  "Diourbel",
];

const hangarOptions = [
  { id: "Hangar 1", name: "Hangar 1" },
  { id: "Hangar 2", name: "Hangar 2" },
  { id: "Hangar 3", name: "Hangar 3" },
];

export function TruckRegistration({ open, onOpenChange, onSuccess }: TruckRegistrationProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Truck info
  const [origin, setOrigin] = useState("");
  const [driver, setDriver] = useState("");
  const [phone, setPhone] = useState("");
  const [hangar, setHangar] = useState("");
  const [truckValue, setTruckValue] = useState("");

  // Articles
  const [articles, setArticles] = useState<ArticleItem[]>([
    { name: "", quantity: 0, unit: "cageots", unitPrice: 0, totalValue: 0 }
  ]);

  const addArticle = () => {
    setArticles([...articles, { name: "", quantity: 0, unit: "cageots", unitPrice: 0, totalValue: 0 }]);
  };

  const removeArticle = (index: number) => {
    setArticles(articles.filter((_, i) => i !== index));
  };

  const updateArticle = (index: number, field: keyof ArticleItem, value: string | number) => {
    const updated = [...articles];
    const article = { ...updated[index], [field]: value };
    
    // Auto-calculate total value
    if (field === 'quantity' || field === 'unitPrice') {
      article.totalValue = article.quantity * article.unitPrice;
    }
    
    updated[index] = article;
    setArticles(updated);
  };

  const calculateTotalValue = () => {
    return articles.reduce((sum, a) => sum + a.totalValue, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!origin || !driver || !phone || !hangar) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires du camion",
        variant: "destructive",
      });
      return;
    }

    const validArticles = articles.filter(a => a.name && a.quantity > 0 && a.unitPrice > 0);
    if (validArticles.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins un article avec quantité et prix",
        variant: "destructive",
      });
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast({
        title: "Non connecté",
        description: "Veuillez vous connecter en tant qu'admin ou manager pour enregistrer un camion",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.TRUCKS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          origin,
          driver,
          phone,
          hangar,
          articles: validArticles,
          value: parseFloat(truckValue) || calculateTotalValue(),
        }),
      });

      if (response.status === 401) {
        toast({
          title: "Session expirée",
          description: "Votre session a expiré. Veuillez vous reconnecter.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Succès",
          description: `Camion enregistré avec ${validArticles.length} article(s) ajouté(s) au stock`,
        });
        onSuccess();
        resetForm();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le camion",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setOrigin("");
    setDriver("");
    setPhone("");
    setHangar("");
    setTruckValue("");
    setArticles([{ name: "", quantity: 0, unit: "cageots", unitPrice: 0, totalValue: 0 }]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Réceptionner un camion
          </DialogTitle>
          <DialogDescription>
            Enregistrez les informations du camion et les articles réceptionnés
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Truck Info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Informations du camion
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin">Provenance *</Label>
                <Select value={origin} onValueChange={setOrigin}>
                  <SelectTrigger id="origin">
                    <SelectValue placeholder="Sélectionner l'origine" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hangar">Hangar de destination *</Label>
                <Select value={hangar} onValueChange={setHangar}>
                  <SelectTrigger id="hangar">
                    <SelectValue placeholder="Sélectionner le hangar" />
                  </SelectTrigger>
                  <SelectContent>
                    {hangarOptions.map((h) => (
                      <SelectItem key={h.id} value={h.id}>
                        {h.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="driver">Nom du chauffeur *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="driver"
                    placeholder="Nom du chauffeur"
                    value={driver}
                    onChange={(e) => setDriver(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="+221 XX XXX XX XX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Articles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                Articles réceptionnés *
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addArticle}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Ajouter article
              </Button>
            </div>

            {articles.map((article, index) => (
              <div key={index} className="flex gap-3 items-end bg-white border rounded-lg p-3">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`article-${index}`}>Article</Label>
                  <Select
                    value={article.name}
                    onValueChange={(value) => updateArticle(index, "name", value)}
                  >
                    <SelectTrigger id={`article-${index}`}>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {fruits.map((fruit) => (
                        <SelectItem key={fruit} value={fruit}>
                          {fruit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-24 space-y-2">
                  <Label htmlFor={`qty-${index}`}>Quantité</Label>
                  <Input
                    id={`qty-${index}`}
                    type="number"
                    min="1"
                    value={article.quantity || ""}
                    onChange={(e) => updateArticle(index, "quantity", parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>

                <div className="w-28 space-y-2">
                  <Label htmlFor={`unit-${index}`}>Unité</Label>
                  <Select
                    value={article.unit}
                    onValueChange={(value) => updateArticle(index, "unit", value)}
                  >
                    <SelectTrigger id={`unit-${index}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cageots">Cageots</SelectItem>
                      <SelectItem value="kg">Kg</SelectItem>
                      <SelectItem value="units">Unités</SelectItem>
                      <SelectItem value="palettes">Palettes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-32 space-y-2">
                  <Label htmlFor={`price-${index}`}>Prix unitaire (F)</Label>
                  <Input
                    id={`price-${index}`}
                    type="number"
                    min="0"
                    value={article.unitPrice || ""}
                    onChange={(e) => updateArticle(index, "unitPrice", parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>

                <div className="w-32 space-y-2">
                  <Label>Valeur totale</Label>
                  <div className="h-10 px-3 flex items-center bg-gray-100 rounded-md text-sm font-medium">
                    {article.totalValue.toLocaleString()} F
                  </div>
                </div>

                {articles.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeArticle(index)}
                    className="text-red-500 hover:text-red-600 mb-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            {/* Total */}
            <div className="flex justify-end pt-4 border-t">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-lg font-medium">
                  <Calculator className="h-5 w-5 text-muted-foreground" />
                  <span>Valeur totale du camion:</span>
                  <Badge className="text-lg px-3 py-1" style={{ backgroundColor: '#1F3A5F' }}>
                    {calculateTotalValue().toLocaleString()} F
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetForm}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading} style={{ backgroundColor: '#1F3A5F' }}>
              {loading ? "Enregistrement..." : "Réceptionner le camion"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
