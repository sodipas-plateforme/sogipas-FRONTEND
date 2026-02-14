import { useState, useEffect } from "react";
import { Truck, MapPin, Phone, Package, ChevronLeft, ChevronRight, RefreshCw, Plus, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_ENDPOINTS } from "@/config/api";
import { useAuth } from "@/contexts/AuthContext";
import { TruckRegistration } from "./TruckRegistration";

interface Article {
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
}

interface TruckItem {
  id: string;
  origin: string;
  driver: string;
  phone: string;
  articles: string[] | Article[];
  value: number;
  hangar: string;
  status: "registered" | "arrived" | "unloading" | "unloaded";
  observations: string;
  registeredBy: string;
  registeredAt: string;
  arrivedAt: string | null;
  unloadedAt: string | null;
  unloadedBy?: string;
}

// Mock data for fallback
const mockTrucks: TruckItem[] = [
  { id: "TRK-001", origin: "Dakar", driver: "Moussa Diop", phone: "+221 77 123 45 67", articles: ["Bananes plantain", "Mangues"], value: 2500000, hangar: "Hangar 1", status: "registered", observations: "Camion en bon état", registeredBy: "Ibrahim Bamba", registeredAt: "2024-01-15T08:00:00.000Z", arrivedAt: null, unloadedAt: null },
  { id: "TRK-002", origin: "Thiès", driver: "Aminata Sall", phone: "+221 76 234 56 78", articles: ["Ananas", "Papayes"], value: 1800000, hangar: "Hangar 2", status: "registered", observations: "En attente d'arrivée", registeredBy: "Cheikh Ndiaye", registeredAt: "2024-01-15T09:00:00.000Z", arrivedAt: null, unloadedAt: null },
  { id: "TRK-003", origin: "Saint-Louis", driver: "Youssoupha Koné", phone: "+221 70 345 67 89", articles: ["Bananes douces", "Oranges"], value: 3200000, hangar: "Hangar 1", status: "unloaded", observations: "Déchargement terminé", registeredBy: "Ibrahim Bamba", registeredAt: "2024-01-14T07:00:00.000Z", arrivedAt: "2024-01-14T08:00:00.000Z", unloadedAt: "2024-01-14T12:00:00.000Z", unloadedBy: "Mariama Diallo" },
  { id: "TRK-004", origin: "Mbour", driver: "Ousmane Bamba", phone: "+221 77 456 78 90", articles: ["Noix de coco", "Avocats", "Citrons"], value: 1500000, hangar: "Hangar 3", status: "registered", observations: "En attente", registeredBy: "Mamadou Diop", registeredAt: "2024-01-15T06:00:00.000Z", arrivedAt: null, unloadedAt: null },
  { id: "TRK-005", origin: "Kaolack", driver: "Fatou Traoré", phone: "+221 75 567 89 01", articles: ["Mangues", "Bananes plantain"], value: 2800000, hangar: "Hangar 2", status: "unloaded", observations: "Déchargé", registeredBy: "Aminata Sall", registeredAt: "2024-01-15T05:00:00.000Z", arrivedAt: "2024-01-15T09:00:00.000Z", unloadedAt: "2024-01-15T11:00:00.000Z", unloadedBy: "Ibrahim Bamba" },
  { id: "TRK-006", origin: "Dakar", driver: "Aliou Faye", phone: "+221 78 678 90 12", articles: ["Tomates", "Oignons"], value: 950000, hangar: "Hangar 1", status: "registered", observations: "En attente", registeredBy: "Ibrahim Bamba", registeredAt: "2024-01-15T11:00:00.000Z", arrivedAt: null, unloadedAt: null },
  { id: "TRK-007", origin: "Thiès", driver: "Mariama Sy", phone: "+221 70 789 01 23", articles: ["Carottes", "Pommes de terre"], value: 1100000, hangar: "Hangar 2", status: "registered", observations: "En route", registeredBy: "Cheikh Ndiaye", registeredAt: "2024-01-15T10:00:00.000Z", arrivedAt: null, unloadedAt: null },
  { id: "TRK-008", origin: "Saint-Louis", driver: "Babacar Diop", phone: "+221 77 890 12 34", articles: ["Poivrons", "Courgettes"], value: 1350000, hangar: "Hangar 3", status: "unloaded", observations: "Déchargé", registeredBy: "Mamadou Diop", registeredAt: "2024-01-15T12:00:00.000Z", arrivedAt: "2024-01-15T14:00:00.000Z", unloadedAt: "2024-01-15T16:00:00.000Z", unloadedBy: "Mariama Diallo" },
];

interface TruckListProps {
  refreshTrigger?: number;
  onStatusUpdate?: () => void;
}

const statusConfig = {
  registered: { label: "Enregistré", color: "bg-[#1F3A5F] text-white" },
  unloaded: { label: "Déchargé", color: "bg-[#2E7D32] text-white" },
};

export function TruckList({ refreshTrigger = 0, onStatusUpdate }: TruckListProps) {
  const { user } = useAuth();
  const [trucks, setTrucks] = useState<TruckItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showTruckRegistration, setShowTruckRegistration] = useState(false);
  
  // Sorting state
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchTrucks();
  }, [refreshTrigger]);

  const fetchTrucks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        setTrucks(mockTrucks);
        setLoading(false);
        return;
      }
      
      const response = await fetch(API_ENDPOINTS.TRUCKS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.status === 401) {
        setTrucks(mockTrucks);
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      const trucksData = Array.isArray(data) ? data : (data.trucks || []);
      
      if (trucksData.length > 0) {
        setTrucks(trucksData);
      } else {
        setTrucks(mockTrucks);
      }
    } catch (error) {
      console.error("Error fetching trucks:", error);
      setTrucks(mockTrucks);
    } finally {
      setLoading(false);
    }
  };

  // Filter trucks by search term
  const filteredTrucks = trucks.filter((truck) => {
    const matchesSearch = 
      truck.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.hangar.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Sort trucks by registration date
  const sortedTrucks = [...filteredTrucks].sort((a, b) => {
    const dateA = new Date(a.registeredAt).getTime();
    const dateB = new Date(b.registeredAt).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedTrucks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTrucks = sortedTrucks.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOrder]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3A5F]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with search, button and count */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Rechercher un camion..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3A5F]"
          />
          <Truck className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
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
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchTrucks}>
            <RefreshCw className="h-4 w-4" />
          </Button>

          {(user?.role === "admin" || user?.role === "manager") && (
            <Button 
              onClick={() => setShowTruckRegistration(true)}
              className="gap-2 bg-[#1F3A5F] hover:bg-[#1F3A5F]/90"
            >
              <Plus className="h-4 w-4" />
              Réceptionner un camion
            </Button>
          )}
        </div>

        <Badge variant="outline" className="gap-1">
          <Truck className="h-4 w-4" />
          {sortedTrucks.length} camion(s)
        </Badge>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-2 bg-gray-50 rounded-lg">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="gap-1"
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Empty state */}
      {sortedTrucks.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Truck className="h-12 w-12 text-[#6B7280] mb-4" />
            <p className="text-[#6B7280]">Aucun camion trouvé</p>
          </CardContent>
        </Card>
      )}

      {/* Truck list - Simple and clean */}
      <div className="grid gap-4">
        {paginatedTrucks.map((truck) => {
          const statusStyle = statusConfig[truck.status as keyof typeof statusConfig];
          
          return (
            <Card key={truck.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Header with driver and status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-[#1F3A5F]">
                      <Truck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#1F2937]">{truck.driver}</p>
                      <p className="text-sm text-[#6B7280]">{truck.origin} → {truck.hangar}</p>
                    </div>
                  </div>
                  <Badge className={statusStyle?.color || "bg-gray-500"}>
                    {statusStyle?.label || truck.status}
                  </Badge>
                </div>

                {/* Details */}
                <div className="p-4 space-y-3">
                  {/* Articles */}
                  <div className="flex flex-wrap gap-2">
                    {truck.articles.map((article: string | Article, index: number) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        <Package className="h-3 w-3" />
                        {typeof article === 'string' ? article : (article as Article).name}
                      </Badge>
                    ))}
                  </div>

                  {/* Info row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-[#6B7280]" />
                      <span className="truncate">{truck.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#6B7280]">Enregistré:</span>
                      <span>{formatDate(truck.registeredAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#6B7280]">Par:</span>
                      <span>{truck.registeredBy}</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium text-[#2E7D32]">
                      {formatCurrency(truck.value)}
                    </div>
                  </div>

                  {/* Unloaded info */}
                  {truck.status === "unloaded" && truck.unloadedAt && (
                    <div className="pt-2 border-t text-sm text-[#6B7280]">
                      Déchargé le {formatDate(truck.unloadedAt)} par {truck.unloadedBy}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bottom pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-2 bg-gray-50 rounded-lg">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground">
            Affichage {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedTrucks.length)} sur {sortedTrucks.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="gap-1"
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Truck Registration Dialog */}
      <TruckRegistration
        open={showTruckRegistration}
        onOpenChange={setShowTruckRegistration}
        onSuccess={() => {
          fetchTrucks();
          setShowTruckRegistration(false);
          onStatusUpdate?.();
        }}
      />
    </div>
  );
}
