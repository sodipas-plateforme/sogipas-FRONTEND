import { useState, useEffect } from "react";
import { Package, Truck, Plus, Search, RefreshCw, Building2, Box, TrendingUp, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KPICard } from "@/components/dashboard/KPICard";
import { API_ENDPOINTS } from "@/config/api";
import { useAuth } from "@/contexts/AuthContext";
import { TruckRegistration } from "@/components/warehouse/TruckRegistration";
import { TruckList } from "@/components/warehouse/TruckList";

interface Stock {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
  hangar: string;
  origin: string;
  truckId: string;
  driver: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data for fallback
const mockStocks: Stock[] = [
  { id: "STK-001", name: "Bananes plantain", quantity: 850, unit: "cageots", unitPrice: 5000, totalValue: 4250000, hangar: "Hangar 1", origin: "Dakar", truckId: "TRK-001", driver: "Moussa Diop", createdAt: "2024-01-15T08:00:00.000Z", updatedAt: "2024-01-15T10:30:00.000Z" },
  { id: "STK-002", name: "Mangues", quantity: 320, unit: "cageots", unitPrice: 4500, totalValue: 1440000, hangar: "Hangar 1", origin: "Dakar", truckId: "TRK-001", driver: "Moussa Diop", createdAt: "2024-01-15T08:00:00.000Z", updatedAt: "2024-01-15T10:30:00.000Z" },
  { id: "STK-003", name: "Bananes douces", quantity: 120, unit: "cageots", unitPrice: 5000, totalValue: 600000, hangar: "Hangar 1", origin: "Saint-Louis", truckId: "TRK-003", driver: "Youssoupha Koné", createdAt: "2024-01-14T07:00:00.000Z", updatedAt: "2024-01-14T12:00:00.000Z" },
  { id: "STK-004", name: "Oranges", quantity: 420, unit: "cageots", unitPrice: 5000, totalValue: 2100000, hangar: "Hangar 1", origin: "Saint-Louis", truckId: "TRK-003", driver: "Youssoupha Koné", createdAt: "2024-01-14T07:00:00.000Z", updatedAt: "2024-01-14T12:00:00.000Z" },
  { id: "STK-005", name: "Tomates", quantity: 200, unit: "cageots", unitPrice: 4000, totalValue: 800000, hangar: "Hangar 1", origin: "Dakar", truckId: "TRK-006", driver: "Aliou Faye", createdAt: "2024-01-15T11:00:00.000Z", updatedAt: "2024-01-15T11:00:00.000Z" },
  { id: "STK-006", name: "Ananas", quantity: 280, unit: "cageots", unitPrice: 4500, totalValue: 1260000, hangar: "Hangar 2", origin: "Thiès", truckId: "TRK-002", driver: "Aminata Sall", createdAt: "2024-01-15T09:00:00.000Z", updatedAt: "2024-01-15T09:00:00.000Z" },
  { id: "STK-007", name: "Papayes", quantity: 180, unit: "cageots", unitPrice: 5000, totalValue: 900000, hangar: "Hangar 2", origin: "Thiès", truckId: "TRK-002", driver: "Aminata Sall", createdAt: "2024-01-15T09:00:00.000Z", updatedAt: "2024-01-15T09:00:00.000Z" },
  { id: "STK-008", name: "Mangues", quantity: 450, unit: "cageots", unitPrice: 4500, totalValue: 2025000, hangar: "Hangar 2", origin: "Kaolack", truckId: "TRK-005", driver: "Fatou Traoré", createdAt: "2024-01-15T05:00:00.000Z", updatedAt: "2024-01-15T09:00:00.000Z" },
  { id: "STK-009", name: "Carottes", quantity: 150, unit: "cageots", unitPrice: 3500, totalValue: 525000, hangar: "Hangar 2", origin: "Thiès", truckId: "TRK-007", driver: "Mariama Sy", createdAt: "2024-01-15T10:00:00.000Z", updatedAt: "2024-01-15T12:00:00.000Z" },
  { id: "STK-010", name: "Noix de coco", quantity: 200, unit: "units", unitPrice: 3000, totalValue: 600000, hangar: "Hangar 3", origin: "Mbour", truckId: "TRK-004", driver: "Ousmane Bamba", createdAt: "2024-01-15T06:00:00.000Z", updatedAt: "2024-01-15T07:30:00.000Z" },
  { id: "STK-011", name: "Avocats", quantity: 150, unit: "cageots", unitPrice: 6000, totalValue: 900000, hangar: "Hangar 3", origin: "Mbour", truckId: "TRK-004", driver: "Ousmane Bamba", createdAt: "2024-01-15T06:00:00.000Z", updatedAt: "2024-01-15T07:30:00.000Z" },
  { id: "STK-012", name: "Citrons", quantity: 80, unit: "cageots", unitPrice: 4000, totalValue: 320000, hangar: "Hangar 3", origin: "Mbour", truckId: "TRK-004", driver: "Ousmane Bamba", createdAt: "2024-01-15T06:00:00.000Z", updatedAt: "2024-01-15T07:30:00.000Z" },
  { id: "STK-013", name: "Poivrons", quantity: 100, unit: "cageots", unitPrice: 5500, totalValue: 550000, hangar: "Hangar 3", origin: "Saint-Louis", truckId: "TRK-008", driver: "Babacar Diop", createdAt: "2024-01-15T12:00:00.000Z", updatedAt: "2024-01-15T12:00:00.000Z" },
];

export default function Stocks() {
  const { user } = useAuth();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showTruckRegistration, setShowTruckRegistration] = useState(false);
  const [hangars, setHangars] = useState<string[]>([]);
  
  // Sorting state
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  
  // Pagination state for each hangar
  const [hangarPages, setHangarPages] = useState<Record<string, number>>({});
  const itemsPerPage = 5;
  
  // Active hangar tab
  const [activeHangar, setActiveHangar] = useState("Hangar 1");

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchStocks(),
      fetchHangars()
    ]);
    setLoading(false);
  };

  const fetchStocks = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setStocks(mockStocks);
        return;
      }

      const response = await fetch(API_ENDPOINTS.STOCKS, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        setStocks(mockStocks);
        return;
      }

      const data = await response.json();
      
      // Handle API response - stocks might be in data.stocks or directly in data
      const stocksData = data.stocks || data;
      
      if (stocksData && stocksData.length > 0) {
        setStocks(stocksData);
      } else {
        // Fallback to mock data if API returns empty
        setStocks(mockStocks);
      }
    } catch (error) {
      console.error("Error fetching stocks:", error);
      // Fallback to mock data on error
      setStocks(mockStocks);
    }
  };

  const fetchHangars = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.HANGARS);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setHangars(data);
        } else {
          setHangars(["Hangar 1", "Hangar 2", "Hangar 3"]);
        }
      } else {
        setHangars(["Hangar 1", "Hangar 2", "Hangar 3"]);
      }
    } catch (error) {
      console.error("Error fetching hangars:", error);
      setHangars(["Hangar 1", "Hangar 2", "Hangar 3"]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get available hangars (use mock data hangars if API not available)
  const availableHangars = hangars.length > 0 ? hangars : ["Hangar 1", "Hangar 2", "Hangar 3"];

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.hangar.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort stocks by creation date
  const sortedStocks = [...filteredStocks].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  const stocksByHangar = sortedStocks.reduce((acc, stock) => {
    if (!acc[stock.hangar]) {
      acc[stock.hangar] = [];
    }
    acc[stock.hangar].push(stock);
    return acc;
  }, {} as Record<string, Stock[]>);

  const totalQuantity = stocks.reduce((sum, s) => sum + s.quantity, 0);
  const totalValue = stocks.reduce((sum, s) => sum + s.totalValue, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalArticles = stocks.length;
  const activeHangars = Object.keys(stocksByHangar).length;

  // Get stocks for active hangar with pagination
  const activeHangarStocks = stocksByHangar[activeHangar] || [];
  const totalPages = Math.ceil(activeHangarStocks.length / itemsPerPage);
  const currentPage = hangarPages[activeHangar] || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStocks = activeHangarStocks.slice(startIndex, startIndex + itemsPerPage);
  const hangarTotalValue = activeHangarStocks.reduce((sum, s) => sum + s.totalValue, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1F2937]">Gestion des Stocks</h1>
            <p className="text-sm text-[#6B7280]">
              Suivi des marchandises en stock
            </p>
          </div>
          {(user?.role === "admin" || user?.role === "manager") && (
            <Button
              onClick={() => setShowTruckRegistration(true)}
              className="gap-2 bg-[#1F3A5F] hover:bg-[#1F3A5F]/90"
            >
              <Plus className="h-4 w-4" />
              Réceptionner camion
            </Button>
          )}
        </div>

        {/* KPI Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Articles"
            value={totalArticles.toString()}
            icon={<Package className="h-4 w-4" />}
          />
          <KPICard
            title="Quantité Totale"
            value={totalQuantity.toLocaleString()}
            icon={<Box className="h-4 w-4" />}
          />
          <KPICard
            title="Valeur Totale"
            value={formatCurrency(totalValue)}
            icon={<TrendingUp className="h-4 w-4" />}
            isPositive
          />
          <KPICard
            title="Hangars Actifs"
            value={activeHangars.toString()}
            icon={<Building2 className="h-4 w-4" />}
          />
        </div>

        <Tabs defaultValue="stocks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="stocks" className="gap-2">
              <Package className="h-4 w-4" />
              Stocks
            </TabsTrigger>
            <TabsTrigger value="trucks" className="gap-2">
              <Truck className="h-4 w-4" />
              Camions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stocks" className="space-y-4">
            {/* Hangar Tabs */}
            <Tabs value={activeHangar} onValueChange={setActiveHangar}>
              <TabsList className="grid w-full grid-cols-3">
                {availableHangars.map((hangar) => {
                  const hangarStockCount = stocksByHangar[hangar]?.length || 0;
                  return (
                    <TabsTrigger key={hangar} value={hangar} className="gap-2">
                      <Building2 className="h-4 w-4" />
                      {hangar}
                      <Badge variant="secondary" className="ml-1">{hangarStockCount}</Badge>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* Search within active hangar */}
              <div className="flex items-center gap-4 mt-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-[#6B7280]" />
                  <Input
                    placeholder="Rechercher par article, origine..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                {/* Sort Select */}
                <Select value={sortOrder} onValueChange={(value: "newest" | "oldest") => setSortOrder(value)}>
                  <SelectTrigger className="w-[180px] border-[#E5E7EB]">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4" />
                      <SelectValue placeholder="Trier par date" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">
                      <div className="flex items-center gap-2">
                        <span>Plus récents</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="oldest">
                      <div className="flex items-center gap-2">
                        <span>Plus anciens</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="icon" onClick={fetchData} className="shrink-0">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {/* Stock items for active hangar */}
              {availableHangars.map((hangar) => (
                <TabsContent key={hangar} value={hangar} className="mt-4">
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3A5F]"></div>
                    </div>
                  ) : activeHangarStocks.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Package className="h-12 w-12 text-[#6B7280] mb-4" />
                        <p className="text-[#6B7280]">Aucun article dans {hangar}</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardHeader className="pb-3 bg-[#f8fafc]">
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-[#1F3A5F]">{hangar}</Badge>
                            <span className="text-sm font-normal text-[#6B7280]">
                              {activeHangarStocks.length} article(s)
                            </span>
                          </div>
                          <span className="text-sm font-normal text-[#2E7D32]">
                            Total: {formatCurrency(hangarTotalValue)}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="divide-y divide-[#E5E7EB]">
                          {paginatedStocks.map((stock) => (
                            <div
                              key={stock.id}
                              className="px-6 py-4 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-[#1F3A5F]">
                                  <Package className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <p className="font-medium text-[#1F2937]">{stock.name}</p>
                                  <p className="text-sm text-[#6B7280]">
                                    {stock.origin} • {stock.driver}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="text-right">
                                  <p className="text-sm text-[#6B7280]">Quantité</p>
                                  <p className="font-medium text-[#1F2937]">
                                    {stock.quantity.toLocaleString()} {stock.unit}
                                  </p>
                                </div>
                                <div className="text-right min-w-[120px]">
                                  <p className="text-sm text-[#6B7280]">Valeur</p>
                                  <p className="font-medium text-[#2E7D32]">
                                    {formatCurrency(stock.totalValue)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pagination for this hangar */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between px-6 py-3 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setHangarPages(p => ({ ...p, [hangar]: Math.max(1, currentPage - 1) }))}
                              disabled={currentPage === 1}
                            >
                              <ChevronLeft className="h-4 w-4 mr-1" />
                              Précédent
                            </Button>
                            <span className="text-sm text-muted-foreground">
                              Page {currentPage} / {totalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setHangarPages(p => ({ ...p, [hangar]: Math.min(totalPages, currentPage + 1) }))}
                              disabled={currentPage === totalPages}
                            >
                              Suivant
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>

          <TabsContent value="trucks">
            <TruckList />
          </TabsContent>
        </Tabs>

        <TruckRegistration
          open={showTruckRegistration}
          onOpenChange={setShowTruckRegistration}
          onSuccess={() => {
            fetchData();
            setShowTruckRegistration(false);
          }}
        />
      </div>
    </AppLayout>
  );
}
