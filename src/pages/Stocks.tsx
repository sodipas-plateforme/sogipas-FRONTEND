import { useState } from "react";
import { Plus, Eye, Truck, Package, MapPin, Phone, User, ChevronLeft, ChevronRight, Edit2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface TruckData {
  id: string;
  origin: string;
  driver: string;
  phone: string;
  articles: string;
  value: number;
  date: string;
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

// Fruits articles
const fruitsArticles = [
  "Bananes plantain, Mangues",
  "Ananas, Papayes",
  "Bananes douces, Oranges",
  "Noix de coco, Avocats",
  "Oranges, Citrons, Mandarines"
];

// Generate trucks data with Senegalese context
const trucksData: TruckData[] = Array.from({ length: 25 }, (_, i) => ({
  id: `${i + 1}`,
  origin: senegaleseCities[i % senegaleseCities.length],
  driver: senegaleseDrivers[i % senegaleseDrivers.length],
  phone: `+221 ${70 + Math.floor(Math.random() * 10)} ${String(Math.floor(Math.random() * 10000000).toString().padStart(7, '0').substring(0, 3))} ${String(Math.floor(Math.random() * 10000000).toString().padStart(7, '0').substring(3))}`,
  articles: fruitsArticles[i % fruitsArticles.length],
  value: Math.floor(Math.random() * 3000000) + 1000000,
  date: new Date(2024, 0, 15 - (i % 30)).toLocaleDateString("fr-FR"),
}));

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

  const getStockLevel = (quantity: number, threshold: number) => {
    const percentage = (quantity / (threshold * 3)) * 100;
    if (quantity <= threshold) return { level: "critical", color: "bg-[#C62828]" };
    if (quantity <= threshold * 1.5) return { level: "warning", color: "bg-[#F9C74F]" };
    return { level: "good", color: "bg-[#2E7D32]" };
  };

  // Pagination for trucks
  const totalTrucksPages = Math.ceil(trucksData.length / ITEMS_PER_PAGE);
  const startTrucksIndex = (trucksPage - 1) * ITEMS_PER_PAGE;
  const endTrucksIndex = startTrucksIndex + ITEMS_PER_PAGE;
  const currentTrucks = trucksData.slice(startTrucksIndex, endTrucksIndex);

  // Pagination for stocks
  const totalStocksPages = Math.ceil(stockItemsData.length / ITEMS_PER_PAGE);
  const startStocksIndex = (stocksPage - 1) * ITEMS_PER_PAGE;
  const endStocksIndex = startStocksIndex + ITEMS_PER_PAGE;
  const currentStocks = stockItemsData.slice(startStocksIndex, endStocksIndex);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1F2937]">Stocks & Camions</h1>
            <p className="text-sm text-[#6B7280]">Gestion logistique et inventaire</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-[#E5E7EB]">
              <Eye className="mr-2 h-4 w-4" />
              Voir les stocks
            </Button>
            <Button style={{ backgroundColor: '#1F3A5F' }} className="hover:bg-[#274C77]">
              <Plus className="mr-2 h-4 w-4" />
              Enregistrer un camion
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="trucks" className="gap-2">
              <Truck className="h-4 w-4" />
              Camions
            </TabsTrigger>
            <TabsTrigger value="stocks" className="gap-2">
              <Package className="h-4 w-4" />
              Stocks
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
                        <td className="px-6 py-4 text-sm text-[#1F2937]">{truck.articles}</td>
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
                  Affichage de {startTrucksIndex + 1} à {Math.min(endTrucksIndex, trucksData.length)} sur {trucksData.length} résultats
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
                    {trucksPage} / {totalTrucksPages}
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
                Affichage de {startStocksIndex + 1} à {Math.min(endStocksIndex, stockItemsData.length)} sur {stockItemsData.length} résultats
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
                  {stocksPage} / {totalStocksPages}
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
      </div>
    </AppLayout>
  );
}
