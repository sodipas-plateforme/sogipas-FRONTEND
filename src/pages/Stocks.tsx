import { useState } from "react";
import { Plus, Eye, Truck, Package, MapPin, Phone, User, ChevronLeft, ChevronRight, Edit2, Warehouse, Filter, DollarSign } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { KPICard } from "@/components/dashboard/KPICard";
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
  DialogFooter,
} from "@/components/ui/dialog";

interface TruckData {
  id: string;
  origin: string;
  driver: string;
  phone: string;
  articles: string[]; // Multiple articles as array
  value: number;
  date: string;
  hangar: string;
}

interface StockItem {
  id: string;
  name: string;
  hangar: string;
  quantity: number;
  unit: string;
  threshold: number;
  value: number;
}

interface HangarInfo {
  id: string;
  name: string;
  capacity: number;
  currentOccupancy: number;
  status: "available" | "partial" | "full";
  truckCount: number; // Number of trucks assigned
}

// Hangars configuration
const hangars: HangarInfo[] = [
  { id: "hangar1", name: "Hangar 1 - Bananes", capacity: 500, currentOccupancy: 320, status: "partial", truckCount: 5 },
  { id: "hangar2", name: "Hangar 2 - Mangues", capacity: 400, currentOccupancy: 385, status: "full", truckCount: 8 },
  { id: "hangar3", name: "Hangar 3 - Fruits Mix", capacity: 350, currentOccupancy: 120, status: "available", truckCount: 2 },
];

// Senegalese driver names
const senegaleseDrivers = [
  "Moussa Diop", "Cheikh Ndiaye", "Ibrahima Sarr", "Ousmane Mbengue",
  "Mamadou Ba", "Alioune Fall", "Souleymane Kane", "Papa Diarra",
  "Modou Gueye", "El Hadji Diop", "Boubacar Traoré", "Moustapha Ndiaye",
  "Demba Sy", "Mamadou Sène", "Cheikh Gueye", "Ibrahima Fall",
  "Ousmane Diouf", "Moussa Sy", "Aliou Diop", "Mamadou Ndiaye",
  "Cheickhou Mbengue", "Mamadou Ba", "Oumar Ndiaye", "Seydou Diop", "Abdoulaye Sarr"
];

// Senegalese cities (zones de production fruitière)
const senegaleseCities = [
  "Dakar", "Thiès", "Mbour", "Saint-Louis", "Kaolack",
  "Fatick", "Ziguinchor", "Tambacounda", "Louga", "Diourbel"
];

// All available fruits for multi-select
const allFruits = [
  "Bananes plantain", "Mangues", "Ananas", "Papayes",
  "Bananes douces", "Oranges", "Noix de coco", "Avocats",
  "Citrons", "Mandarines"
];

const hangarOptions = [
  { id: "hangar1", name: "Hangar 1 - Bananes" },
  { id: "hangar2", name: "Hangar 2 - Mangues" },
  { id: "hangar3", name: "Hangar 3 - Fruits Mix" },
];

// Generate trucks data with multiple articles
const trucksData: TruckData[] = Array.from({ length: 25 }, (_, i) => {
  const numArticles = Math.floor(Math.random() * 3) + 1; // 1-3 articles per truck
  const selectedArticles: string[] = [];
  for (let j = 0; j < numArticles; j++) {
    selectedArticles.push(allFruits[(i + j) % allFruits.length]);
  }
  
  return {
    id: `${i + 1}`,
    origin: senegaleseCities[i % senegaleseCities.length],
    driver: senegaleseDrivers[i % senegaleseDrivers.length],
    phone: `+221 ${70 + Math.floor(Math.random() * 10)} ${String(Math.floor(Math.random() * 10000000).toString().padStart(7, '0').substring(0, 3))} ${String(Math.floor(Math.random() * 10000000).toString().padStart(7, '0').substring(3))}`,
    articles: selectedArticles,
    value: Math.floor(Math.random() * 3000000) + 1000000,
    date: new Date(2024, 0, 15 - (i % 30)).toLocaleDateString("fr-FR"),
    hangar: hangarOptions[i % hangarOptions.length].name,
  };
});

const stockItemsData: StockItem[] = Array.from({ length: 18 }, (_, i) => ({
  id: `${i + 1}`,
  name: ["Bananes plantain", "Bananes douces", "Mangues", "Ananas", "Papayes", "Oranges"][i % 6],
  hangar: ["Hangar 1", "Hangar 2", "Hangar 3"][i % 3],
  quantity: Math.floor(Math.random() * 500) + 50,
  unit: "cageots",
  threshold: Math.floor(Math.random() * 100) + 50,
  value: Math.floor(Math.random() * 3000000) + 200000,
}));

const ITEMS_PER_PAGE = 8;

export default function Stocks() {
  const [activeTab, setActiveTab] = useState("trucks");
  const [trucksPage, setTrucksPage] = useState(1);
  const [stocksPage, setStocksPage] = useState(1);
  const [selectedHangar, setSelectedHangar] = useState<string>("all");
  const [isAddTruckOpen, setIsAddTruckOpen] = useState(false);
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [showOverview, setShowOverview] = useState(true);

  // New truck form state
  const [newTruck, setNewTruck] = useState({
    driver: "",
    phone: "",
    origin: "",
    articles: [] as string[],
    value: "",
    hangar: "",
  });

  // New stock form state
  const [newStock, setNewStock] = useState({
    name: "",
    hangar: "",
    quantity: "",
    unit: "cageots",
    threshold: "",
    value: "",
  });

  const getStockLevel = (quantity: number, threshold: number) => {
    const percentage = (quantity / (threshold * 3)) * 100;
    if (quantity <= threshold) return { level: "critical", color: "bg-[#C62828]" };
    if (quantity <= threshold * 1.5) return { level: "warning", color: "bg-[#F9C74F]" };
    return { level: "good", color: "bg-[#2E7D32]" };
  };

  const getHangarStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-[#2E7D32]">Disponible</Badge>;
      case "partial":
        return <Badge className="bg-[#F9C74F] text-[#B45309]">Partiel</Badge>;
      case "full":
        return <Badge className="bg-[#C62828]">Complet</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const toggleArticle = (article: string) => {
    setNewTruck(prev => ({
      ...prev,
      articles: prev.articles.includes(article)
        ? prev.articles.filter(a => a !== article)
        : [...prev.articles, article]
    }));
  };

  // Filter trucks by hangar
  const filteredTrucks = selectedHangar === "all"
    ? trucksData
    : trucksData.filter(t => t.hangar.includes(selectedHangar.replace("hangar", "")));

  // Pagination for trucks
  const totalTrucksPages = Math.ceil(filteredTrucks.length / ITEMS_PER_PAGE);
  const startTrucksIndex = (trucksPage - 1) * ITEMS_PER_PAGE;
  const endTrucksIndex = startTrucksIndex + ITEMS_PER_PAGE;
  const currentTrucks = filteredTrucks.slice(startTrucksIndex, endTrucksIndex);

  // Filter stocks by hangar - normalize comparison
  const filteredStocks = selectedHangar === "all"
    ? stockItemsData
    : stockItemsData.filter(s => {
        const stockHangarNum = s.hangar.replace("Hangar ", "hangar");
        return stockHangarNum === selectedHangar;
      });

  // Pagination for stocks
  const totalStocksPages = Math.ceil(filteredStocks.length / ITEMS_PER_PAGE);
  const startStocksIndex = (stocksPage - 1) * ITEMS_PER_PAGE;
  const endStocksIndex = startStocksIndex + ITEMS_PER_PAGE;
  const currentStocks = filteredStocks.slice(startStocksIndex, endStocksIndex);

  const handleAddTruck = () => {
    if (!newTruck.driver || !newTruck.phone || !newTruck.hangar || newTruck.articles.length === 0) {
      alert("Veuillez remplir les champs obligatoires et sélectionner au moins un article");
      return;
    }
    alert(`Camion ${newTruck.driver} enregistré vers ${hangarOptions.find(h => h.id === newTruck.hangar)?.name}\nArticles: ${newTruck.articles.join(", ")}`);
    setIsAddTruckOpen(false);
    setNewTruck({ driver: "", phone: "", origin: "", articles: [], value: "", hangar: "" });
  };

  const handleAddStock = () => {
    if (!newStock.name || !newStock.hangar || !newStock.quantity || !newStock.threshold) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }
    alert(`Article ${newStock.name} ajouté au ${hangarOptions.find(h => h.id === newStock.hangar)?.name}\nQuantité: ${newStock.quantity} ${newStock.unit}\nSeuil: ${newStock.threshold}\nValeur: ${parseInt(newStock.value || "0").toLocaleString()} F`);
    setIsAddStockOpen(false);
    setNewStock({ name: "", hangar: "", quantity: "", unit: "cageots", threshold: "", value: "" });
  };

  // Calculate overview stats
  const totalTrucks = trucksData.length;
  const totalValue = trucksData.reduce((sum, t) => sum + t.value, 0);
  const totalOccupancy = hangars.reduce((sum, h) => sum + h.currentOccupancy, 0);
  const totalCapacity = hangars.reduce((sum, h) => sum + h.capacity, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1F2937]">Stocks & Camions</h1>
            <p className="text-sm text-[#6B7280]">Gestion logistique et inventaire par hangar</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant={showOverview ? "default" : "outline"}
              onClick={() => setShowOverview(!showOverview)}
              style={{ backgroundColor: showOverview ? '#1F3A5F' : undefined }}
              className={showOverview ? "hover:bg-[#274C77]" : "border-[#E5E7EB]"}
            >
              <Eye className="mr-2 h-4 w-4" />
              {showOverview ? "Masquer" : "Vue d'ensemble"}
            </Button>
            <Button
              onClick={() => setIsAddTruckOpen(true)}
              style={{ backgroundColor: '#1F3A5F' }}
              className="hover:bg-[#274C77]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Enregistrer un camion
            </Button>
          </div>
        </div>

        {/* Overview Stats - Same style as Dashboard KPI cards */}
        {showOverview && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Total Camions"
              value={totalTrucks.toString()}
              icon={Truck}
              isPositive={true}
              isNegative={false}
            />
            <KPICard
              title="Stock Total"
              value={`${totalOccupancy.toLocaleString()}`}
              icon={Package}
              isPositive={true}
              isNegative={false}
            />
            <KPICard
              title="Capacité Totale"
              value={totalCapacity.toLocaleString()}
              icon={Warehouse}
              isPositive={true}
              isNegative={false}
            />
            <KPICard
              title="Valeur Totale"
              value={`${(totalValue / 1000000).toFixed(1)}M F`}
              icon={DollarSign}
              isPositive={true}
              isNegative={false}
            />
          </div>
        )}

        {/* Hangar Overview Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hangars.map((hangar) => {
            const occupancyRate = Math.round((hangar.currentOccupancy / hangar.capacity) * 100);
            const occupancyColor = occupancyRate > 90 ? "bg-[#C62828]" : occupancyRate > 70 ? "bg-[#F9C74F]" : "bg-[#2E7D32]";
            
            return (
              <div
                key={hangar.id}
                className={`rounded-xl border p-4 transition-all cursor-pointer ${
                  selectedHangar === hangar.id
                    ? "border-[#1F3A5F] bg-[#1F3A5F]/5 shadow-md"
                    : "border-[#E5E7EB] bg-white hover:shadow-sm"
                }`}
                onClick={() => setSelectedHangar(selectedHangar === hangar.id ? "all" : hangar.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Warehouse className="h-5 w-5 text-[#1F3A5F]" />
                    <h3 className="font-semibold text-[#1F2937]">{hangar.name}</h3>
                  </div>
                  {getHangarStatusBadge(hangar.status)}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Taux d'occupation</span>
                    <span className="font-medium text-[#1F2937]">{occupancyRate}%</span>
                  </div>
                  <Progress value={occupancyRate} className={`h-2 ${occupancyColor}`} />
                  <div className="flex justify-between text-xs text-[#6B7280]">
                    <span>{hangar.currentOccupancy} cageots</span>
                    <span>Capacité: {hangar.capacity}</span>
                  </div>
                  <div className="pt-2 border-t border-[#E5E7EB] mt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Camions assignés</span>
                      <span className="font-medium text-[#1F3A5F]">{hangar.truckCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter by Hangar */}
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-[#6B7280]" />
          <Label className="text-sm text-[#6B7280]">Filtrer par hangar:</Label>
          <Select value={selectedHangar} onValueChange={setSelectedHangar}>
            <SelectTrigger className="w-[200px] border-[#E5E7EB]">
              <SelectValue placeholder="Tous les hangars" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les hangars</SelectItem>
              {hangarOptions.map((hangar) => (
                <SelectItem key={hangar.id} value={hangar.id}>
                  {hangar.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedHangar !== "all" && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedHangar("all")}>
              Effacer
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="trucks" className="gap-2">
              <Truck className="h-4 w-4" />
              Camions ({filteredTrucks.length})
            </TabsTrigger>
            <TabsTrigger value="stocks" className="gap-2">
              <Package className="h-4 w-4" />
              Stocks ({filteredStocks.length})
            </TabsTrigger>
          </TabsList>

          {/* Trucks Tab */}
          <TabsContent value="trucks" className="space-y-4">
            <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Provenance</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Chauffeur</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Téléphone</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Articles</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Hangar</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-[#6B7280] uppercase tracking-wider">Valeur</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {currentTrucks.map((truck) => (
                      <tr key={truck.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-6 py-4 text-sm text-[#1F2937]">{truck.date}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[#6B7280]" />
                            <span className="font-medium text-[#1F2937]">{truck.origin}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-[#6B7280]" />
                            <span className="text-[#1F2937]">{truck.driver}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-[#6B7280]" />
                            <span className="text-sm text-[#6B7280]">{truck.phone}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {truck.articles.map((article, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-[#1F3A5F]/5 text-[#1F3A5F] border-[#1F3A5F]/20">
                                {article}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="bg-[#1F3A5F]/5 text-[#1F3A5F] border-[#1F3A5F]/20">
                            {truck.hangar}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-[#1F2937]">
                          {truck.value.toLocaleString()} F
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-[#E5E7EB]">
                <p className="text-sm text-[#6B7280]">
                  Affichage de {startTrucksIndex + 1} à {Math.min(endTrucksIndex, filteredTrucks.length)} sur {filteredTrucks.length} résultats
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTrucksPage(prev => Math.max(prev - 1, 1))}
                    disabled={trucksPage === 1}
                    className="border-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937]"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-[#1F2937] font-medium">
                    {trucksPage} / {totalTrucksPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTrucksPage(prev => Math.min(prev + 1, totalTrucksPages))}
                    disabled={trucksPage === totalTrucksPages}
                    className="border-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937]"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Stocks Tab */}
          <TabsContent value="stocks" className="space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={() => setIsAddStockOpen(true)}
                style={{ backgroundColor: '#1F3A5F' }}
                className="hover:bg-[#274C77]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un article
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:grid-cols-4">
              {currentStocks.map((item) => {
                const stockLevel = getStockLevel(item.quantity, item.threshold);
                const percentage = Math.min((item.quantity / (item.threshold * 3)) * 100, 100);
                
                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-[#1F2937]">{item.name}</h3>
                        <p className="text-sm text-[#6B7280]">{item.hangar}</p>
                      </div>
                      {stockLevel.level === "critical" && (
                        <Badge className="bg-[#C62828]">Critique</Badge>
                      )}
                      {stockLevel.level === "warning" && (
                        <Badge variant="secondary" className="bg-[#F9C74F]/20 text-[#B45309] border-[#F9C74F]/30">
                          Faible
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6B7280]">Quantité</span>
                        <span className="font-medium text-[#1F2937]">{item.quantity} {item.unit}</span>
                      </div>
                      
                      <Progress value={percentage} className={stockLevel.color} />
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6B7280]">Seuil min.</span>
                        <span className="text-[#1F2937]">{item.threshold} {item.unit}</span>
                      </div>
                      
                      <div className="pt-2 border-t border-[#E5E7EB]">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#6B7280]">Valeur</span>
                          <span className="font-semibold text-[#1F2937]">{item.value.toLocaleString()} F</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#E5E7EB] rounded-xl bg-white">
              <p className="text-sm text-[#6B7280]">
                Affichage de {startStocksIndex + 1} à {Math.min(endStocksIndex, filteredStocks.length)} sur {filteredStocks.length} résultats
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStocksPage(prev => Math.max(prev - 1, 1))}
                  disabled={stocksPage === 1}
                  className="border-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-[#1F2937] font-medium">
                  {stocksPage} / {totalStocksPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStocksPage(prev => Math.min(prev + 1, totalStocksPages))}
                  disabled={stocksPage === totalStocksPages}
                  className="border-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937]"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Truck Dialog */}
        <Dialog open={isAddTruckOpen} onOpenChange={setIsAddTruckOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl text-[#1F2937]">Enregistrer un nouveau camion</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              {/* Hangar Selection - Required */}
              <div className="space-y-2">
                <Label htmlFor="hangar" className="text-sm font-medium text-[#1F2937]">Hangar de destination *</Label>
                <Select
                  value={newTruck.hangar}
                  onValueChange={(value) => setNewTruck({ ...newTruck, hangar: value })}
                >
                  <SelectTrigger id="hangar" className="border-[#E5E7EB]">
                    <SelectValue placeholder="Sélectionner un hangar" />
                  </SelectTrigger>
                  <SelectContent>
                    {hangarOptions.map((hangar) => (
                      <SelectItem key={hangar.id} value={hangar.id}>
                        {hangar.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Driver Name */}
              <div className="space-y-2">
                <Label htmlFor="driver" className="text-sm font-medium text-[#1F2937]">Nom du chauffeur *</Label>
                <Input
                  id="driver"
                  placeholder="Nom du chauffeur"
                  value={newTruck.driver}
                  onChange={(e) => setNewTruck({ ...newTruck, driver: e.target.value })}
                  className="border-[#E5E7EB]"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-[#1F2937]">Téléphone *</Label>
                <Input
                  id="phone"
                  placeholder="+221 77 XXX XXXX"
                  value={newTruck.phone}
                  onChange={(e) => setNewTruck({ ...newTruck, phone: e.target.value })}
                  className="border-[#E5E7EB]"
                />
              </div>

              {/* Origin */}
              <div className="space-y-2">
                <Label htmlFor="origin" className="text-sm font-medium text-[#1F2937]">Provenance</Label>
                <Select
                  value={newTruck.origin}
                  onValueChange={(value) => setNewTruck({ ...newTruck, origin: value })}
                >
                  <SelectTrigger id="origin" className="border-[#E5E7EB]">
                    <SelectValue placeholder="Ville de provenance" />
                  </SelectTrigger>
                  <SelectContent>
                    {senegaleseCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Articles - Multiple Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#1F2937]">Articles transportés *</Label>
                <p className="text-xs text-[#6B7280] mb-2">Sélectionnez un ou plusieurs articles</p>
                <div className="grid grid-cols-2 gap-2">
                  {allFruits.map((fruit) => (
                    <div key={fruit} className="flex items-center gap-2">
                      <Checkbox
                        id={`fruit-${fruit}`}
                        checked={newTruck.articles.includes(fruit)}
                        onCheckedChange={() => toggleArticle(fruit)}
                      />
                      <Label htmlFor={`fruit-${fruit}`} className="text-sm cursor-pointer">
                        {fruit}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Value */}
              <div className="space-y-2">
                <Label htmlFor="value" className="text-sm font-medium text-[#1F2937]">Valeur estimée (FCFA)</Label>
                <Input
                  id="value"
                  type="number"
                  placeholder="0"
                  value={newTruck.value}
                  onChange={(e) => setNewTruck({ ...newTruck, value: e.target.value })}
                  className="border-[#E5E7EB]"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsAddTruckOpen(false)}
                className="flex-1 border-[#E5E7EB] text-[#6B7280]"
              >
                Annuler
              </Button>
              <Button
                onClick={handleAddTruck}
                style={{ backgroundColor: '#1F3A5F' }}
                className="flex-1 hover:bg-[#274C77]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Stock Dialog */}
        <Dialog open={isAddStockOpen} onOpenChange={setIsAddStockOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl text-[#1F2937]">Ajouter un nouvel article</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              {/* Article Name */}
              <div className="space-y-2">
                <Label htmlFor="articleName" className="text-sm font-medium text-[#1F2937]">Nom de l'article *</Label>
                <Input
                  id="articleName"
                  placeholder="Ex: Bananes plantain"
                  value={newStock.name}
                  onChange={(e) => setNewStock({ ...newStock, name: e.target.value })}
                  className="border-[#E5E7EB]"
                />
              </div>

              {/* Hangar Selection */}
              <div className="space-y-2">
                <Label htmlFor="stockHangar" className="text-sm font-medium text-[#1F2937]">Hangar *</Label>
                <Select
                  value={newStock.hangar}
                  onValueChange={(value) => setNewStock({ ...newStock, hangar: value })}
                >
                  <SelectTrigger id="stockHangar" className="border-[#E5E7EB]">
                    <SelectValue placeholder="Sélectionner un hangar" />
                  </SelectTrigger>
                  <SelectContent>
                    {hangarOptions.map((hangar) => (
                      <SelectItem key={hangar.id} value={hangar.id}>
                        {hangar.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-sm font-medium text-[#1F2937]">Quantité *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="0"
                    value={newStock.quantity}
                    onChange={(e) => setNewStock({ ...newStock, quantity: e.target.value })}
                    className="border-[#E5E7EB]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit" className="text-sm font-medium text-[#1F2937]">Unité</Label>
                  <Select
                    value={newStock.unit}
                    onValueChange={(value) => setNewStock({ ...newStock, unit: value })}
                  >
                    <SelectTrigger id="unit" className="border-[#E5E7EB]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cageots">Cageots</SelectItem>
                      <SelectItem value="kg">Kg</SelectItem>
                      <SelectItem value="tonnes">Tonnes</SelectItem>
                      <SelectItem value="unités">Unités</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Threshold */}
              <div className="space-y-2">
                <Label htmlFor="threshold" className="text-sm font-medium text-[#1F2937]">Seuil minimum d'alerte *</Label>
                <Input
                  id="threshold"
                  type="number"
                  placeholder="0"
                  value={newStock.threshold}
                  onChange={(e) => setNewStock({ ...newStock, threshold: e.target.value })}
                  className="border-[#E5E7EB]"
                />
                <p className="text-xs text-[#6B7280]">L'article sera marqué comme critique en dessous de ce seuil</p>
              </div>

              {/* Value */}
              <div className="space-y-2">
                <Label htmlFor="stockValue" className="text-sm font-medium text-[#1F2937]">Valeur totale (FCFA)</Label>
                <Input
                  id="stockValue"
                  type="number"
                  placeholder="0"
                  value={newStock.value}
                  onChange={(e) => setNewStock({ ...newStock, value: e.target.value })}
                  className="border-[#E5E7EB]"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsAddStockOpen(false)}
                className="flex-1 border-[#E5E7EB] text-[#6B7280]"
              >
                Annuler
              </Button>
              <Button
                onClick={handleAddStock}
                style={{ backgroundColor: '#1F3A5F' }}
                className="flex-1 hover:bg-[#274C77]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
