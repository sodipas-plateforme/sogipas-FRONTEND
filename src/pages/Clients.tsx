import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Phone, MessageCircle, UserPlus, ChevronLeft, ChevronRight, Users, UserCheck, DollarSign, ShoppingCart, Loader2, Edit2, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { KPICard } from "@/components/dashboard/KPICard";
import { API_ENDPOINTS } from "@/config/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  debt: number;
  debtLimit: number;
  totalPurchases: number;
  isActive: boolean;
  cageots: number;
  lastPurchase: string;
}

// API Response type
interface ApiClient {
  id?: string | number;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  debt?: number;
  debtLimit?: number;
  totalPurchases?: number;
  status?: string;
  cageots?: number;
  lastPurchase?: string;
}

// Fallback mock data for when API is not available
const fallbackClients: Client[] = [
  { id: "1", name: "Supermarché Central", phone: "+221 77 123 45 67", email: "contact@central.sn", address: "Dakar, Plateau", debt: 0, debtLimit: 500000, totalPurchases: 12500000, isActive: true, cageots: 45, lastPurchase: "2024-01-15" },
  { id: "2", name: "Restaurant Le Palmier", phone: "+221 76 234 56 78", email: "info@palmier.sn", address: "Thiès, Centre", debt: 250000, debtLimit: 500000, totalPurchases: 8700000, isActive: true, cageots: 22, lastPurchase: "2024-01-14" },
  { id: "3", name: "Hôtel Ivoire Palace", phone: "+221 70 345 67 89", email: "achats@ivoire.sn", address: "Saint-Louis, Corniche", debt: 480000, debtLimit: 500000, totalPurchases: 6200000, isActive: true, cageots: 38, lastPurchase: "2024-01-13" },
  { id: "4", name: "Marché de la Ville", phone: "+221 77 456 78 90", email: "comptoir@ville.sn", address: "Kaolack, Marché", debt: 0, debtLimit: 300000, totalPurchases: 4800000, isActive: true, cageots: 15, lastPurchase: "2024-01-15" },
  { id: "5", name: "Casino Supérette", phone: "+221 75 567 89 01", email: "gestion@casino.sn", address: "Ziguinchor, Centre", debt: 850000, debtLimit: 500000, totalPurchases: 3900000, isActive: false, cageots: 60, lastPurchase: "2024-01-10" },
];

const ITEMS_PER_PAGE = 8;

export default function Clients() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [debtFilter, setDebtFilter] = useState<string>("all");
  const [cageotsFilter, setCageotsFilter] = useState<string>("all");
  
  // Form state
  const [newClient, setNewClient] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    city: "Dakar",
    debtLimit: 500000,
  });

  // Fetch clients from API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.CLIENTS);
        if (!response.ok) {
          throw new Error("Failed to fetch clients");
        }
        const data = await response.json();
        
        // Transform API data to match Client interface
        const transformedClients: Client[] = Array.isArray(data) 
          ? data.map((client: ApiClient) => ({
          id: client.id?.toString() || Math.random().toString(36).substr(2, 9),
          name: client.name || "",
          phone: client.phone || "",
          email: client.email || "",
          address: client.address || "",
          debt: client.debt || 0,
          debtLimit: client.debtLimit || 500000,
          totalPurchases: client.totalPurchases || 0,
          // Map status to isActive: treat "good" and "warning" as active, "critical" as inactive
          isActive: client.status !== "critical" && client.status !== "blocked",
          cageots: client.cageots || 0,
          lastPurchase: client.lastPurchase || "",
        })) : fallbackClients;
        
        setClients(transformedClients);
        setError(null);
      } catch (err) {
        console.error("Error fetching clients:", err);
        setError("Impossible de charger les clients. Utilisation des données locales.");
        setClients(fallbackClients);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const filteredClients = clients.filter(
    (client) => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone.includes(searchQuery);
      
      // Status filter
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && client.isActive) ||
        (statusFilter === "blocked" && !client.isActive);
      
      // Debt filter
      const matchesDebt = debtFilter === "all" ||
        (debtFilter === "no-debt" && client.debt === 0) ||
        (debtFilter === "with-debt" && client.debt > 0) ||
        (debtFilter === "high-debt" && client.debt > 500000);
      
      // Cageots filter
      const matchesCageots = cageotsFilter === "all" ||
        (cageotsFilter === "low" && client.cageots < 20) ||
        (cageotsFilter === "medium" && client.cageots >= 20 && client.cageots < 50) ||
        (cageotsFilter === "high" && client.cageots >= 50);
      
      return matchesSearch && matchesStatus && matchesDebt && matchesCageots;
    }
  );

  // Calculate KPI metrics
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.isActive).length;
  const totalDebt = clients.reduce((sum, c) => sum + c.debt, 0);
  const totalPurchases = clients.reduce((sum, c) => sum + c.totalPurchases, 0);

  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentClients = filteredClients.slice(startIndex, endIndex);

  const openClientProfile = (clientId: string) => {
    navigate(`/clients/${clientId}`);
  };

  const sendWhatsApp = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    const statusText = client.isActive ? "Actif" : "Bloqué";
    const message = encodeURIComponent(
      `Bonjour ${client.name},\n\nVotre situation chez SODIPAS au ${new Date().toLocaleDateString("fr-FR")}:\n- Statut: ${statusText}\n- Dette: ${client.debt > 0 ? client.debt.toLocaleString() + " F" : "Aucune"}\n- Cageots: ${client.cageots}\n\nMerci de votre confiance.`
    );
    window.open(`https://wa.me/${client.phone}?text=${message}`, "_blank");
  };

  const handleAddClient = async () => {
    const fullName = `${newClient.firstName} ${newClient.lastName}`.trim();
    if (!fullName || !newClient.phone) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir le nom et le téléphone",
        variant: "destructive",
      });
      return;
    }

    const clientData = {
      name: fullName,
      phone: newClient.phone,
      email: newClient.email || `${newClient.firstName.toLowerCase()}.${newClient.lastName.toLowerCase()}@gmail.com`,
      address: newClient.address || `${newClient.city}`,
      debt: 0,
      totalPurchases: 0,
      status: "good", // Actif status
      cageots: 0,
      lastPurchase: new Date().toISOString().split('T')[0],
    };

    try {
      const response = await fetch(API_ENDPOINTS.CLIENTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) throw new Error("Failed to add client");

      const addedClient = await response.json();
      setClients([...clients, addedClient]);
      setIsAddClientOpen(false);
      setNewClient({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        address: "",
        city: "Dakar",
        debtLimit: 500000,
      });
      toast({
        title: "Succès",
        description: `Le client ${fullName} a été créé avec succès`,
      });
    } catch (err) {
      console.error("Error adding client:", err);
      toast({
        title: "Erreur",
        description: "Erreur lors de la création du client",
        variant: "destructive",
      });
    }
  };

  const handleEditClient = (client: Client) => {
    setCurrentClient(client);
    // Parse the name into first and last name
    const nameParts = client.name.split(" ");
    setNewClient({
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      phone: client.phone,
      email: client.email,
      address: client.address,
      city: "Dakar",
      debtLimit: client.debtLimit,
    });
    setIsEditClientOpen(true);
  };

  const handleUpdateClient = async () => {
    if (!currentClient) return;

    const fullName = `${newClient.firstName} ${newClient.lastName}`.trim();
    if (!fullName || !newClient.phone) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir le nom et le téléphone",
        variant: "destructive",
      });
      return;
    }

    const clientData = {
      name: fullName,
      phone: newClient.phone,
      email: newClient.email,
      address: newClient.address,
    };

    try {
      const response = await fetch(`${API_ENDPOINTS.CLIENTS}/${currentClient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) throw new Error("Failed to update client");

      const updatedClient = await response.json();
      setClients(clients.map(c => c.id === currentClient.id ? updatedClient : c));
      setIsEditClientOpen(false);
      setCurrentClient(null);
      setNewClient({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        address: "",
        city: "Dakar",
        debtLimit: 500000,
      });
      toast({
        title: "Succès",
        description: `Le client ${fullName} a été mis à jour avec succès`,
      });
    } catch (err) {
      console.error("Error updating client:", err);
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour du client",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${clientName} ?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.CLIENTS}/${clientId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete client");

      setClients(clients.filter(c => c.id !== clientId));
      toast({
        title: "Succès",
        description: `Le client ${clientName} a été supprimé avec succès`,
      });
    } catch (err) {
      console.error("Error deleting client:", err);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du client",
        variant: "destructive",
      });
    }
  };

  const closeAddDialog = () => {
    setIsAddClientOpen(false);
    setNewClient({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      address: "",
      city: "Dakar",
      debtLimit: 500000,
    });
  };

  const closeEditDialog = () => {
    setIsEditClientOpen(false);
    setCurrentClient(null);
    setNewClient({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      address: "",
      city: "Dakar",
      debtLimit: 500000,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1F2937]">Clients</h1>
            <p className="text-sm text-[#6B7280]">Gestion des clients et suivi des créances</p>
          </div>
          {user?.role !== 'cashier' && (
            <Button 
              onClick={() => setIsAddClientOpen(true)}
              style={{ backgroundColor: '#1F3A5F' }}
              className="hover:bg-[#274C77]"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Enregistrer un client
            </Button>
          )}
        </div>

        {/* KPI Cards - Same style as Dashboard */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Clients"
            value={loading ? "-" : totalClients.toString()}
            icon={Users}
            isPositive={true}
            isNegative={false}
          />
          <KPICard
            title="Clients Actifs"
            value={loading ? "-" : activeClients.toString()}
            icon={UserCheck}
            isPositive={true}
            isNegative={false}
          />
          <KPICard
            title="Dette Totale"
            value={loading ? "-" : `${(totalDebt / 1000000).toFixed(1)}M F`}
            icon={DollarSign}
            isPositive={false}
            isNegative={true}
          />
          <KPICard
            title="Total Achats"
            value={loading ? "-" : `${(totalPurchases / 1000000).toFixed(1)}M F`}
            icon={ShoppingCart}
            isPositive={true}
            isNegative={false}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#1F3A5F]" />
            <span className="ml-2 text-[#6B7280]">Chargement des clients...</span>
          </div>
        ) : (
          <>
            {/* Search and Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative max-w-xs flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                <Input
                  placeholder="Rechercher par nom ou téléphone..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10 border-[#E5E7EB]"
                />
              </div>
              
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
                <SelectTrigger className="w-[140px] border-[#E5E7EB]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="blocked">Bloqué</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Debt Filter */}
              <Select value={debtFilter} onValueChange={(value) => { setDebtFilter(value); setPage(1); }}>
                <SelectTrigger className="w-[160px] border-[#E5E7EB]">
                  <SelectValue placeholder="Dette" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les dettes</SelectItem>
                  <SelectItem value="no-debt">Aucune dette</SelectItem>
                  <SelectItem value="with-debt">Avec dette</SelectItem>
                  <SelectItem value="high-debt">Dette {'>'} 500K</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Cageots Filter */}
              <Select value={cageotsFilter} onValueChange={(value) => { setCageotsFilter(value); setPage(1); }}>
                <SelectTrigger className="w-[160px] border-[#E5E7EB]">
                  <SelectValue placeholder="Cageots" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les cageots</SelectItem>
                  <SelectItem value="low">Moins de 20</SelectItem>
                  <SelectItem value="medium">20 à 50</SelectItem>
                  <SelectItem value="high">Plus de 50</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Reset Filters Button */}
              {(statusFilter !== "all" || debtFilter !== "all" || cageotsFilter !== "all" || searchQuery !== "") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("all");
                    setDebtFilter("all");
                    setCageotsFilter("all");
                    setSearchQuery("");
                    setPage(1);
                  }}
                  className="border-[#E5E7EB] text-[#6B7280]"
                >
                  Réinitialiser
                </Button>
              )}
            </div>

            {/* Results Count */}
            <p className="text-sm text-[#6B7280]">
              {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''} trouvé{filteredClients.length !== 1 ? 's' : ''}
            </p>

            {/* Clients List */}
            <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Téléphone</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-[#6B7280] uppercase tracking-wider">Dette</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-[#6B7280] uppercase tracking-wider">Cageots</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-[#6B7280] uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-[#6B7280] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {currentClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                    onClick={() => openClientProfile(client.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F3A5F]">
                          <span className="text-sm font-medium text-white">
                            {client.name?.split(' ')[0]?.[0]}{client.name?.split(' ')[1]?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-[#1F2937]">{client.name}</p>
                          <p className="text-sm text-[#6B7280]">{client.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-[#6B7280]" />
                        <span className="text-sm text-[#1F2937]">{client.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={client.debt > 0 ? "text-[#C62828] font-medium" : "text-[#2E7D32]"}>
                        {client.debt > 0 ? `${client.debt.toLocaleString()} F` : "Aucune"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-[#1F2937] font-medium">{client.cageots}</td>
                    <td className="px-6 py-4 text-center">
                      <Badge 
                        className={client.isActive 
                          ? "bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/20" 
                          : "bg-[#C62828]/10 text-[#C62828] border-[#C62828]/20"
                        }
                        variant="outline"
                      >
                        {client.isActive ? "Actif" : "Bloqué"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        {user?.role !== 'cashier' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClient(client)}
                            className="text-[#1F3A5F] hover:text-[#1F3A5F] hover:bg-[#1F3A5F]/10"
                            title="Modifier"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => sendWhatsApp(client, e)}
                          className="text-[#25D366] hover:text-[#25D366] hover:bg-[#25D366]/10"
                          title="Envoyer via WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        {user?.role !== 'cashier' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClient(client.id, client.name)}
                            className="text-[#C62828] hover:text-[#C62828] hover:bg-[#C62828]/10"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#E5E7EB]">
            <p className="text-sm text-[#6B7280]">
              Affichage de {startIndex + 1} à {Math.min(endIndex, filteredClients.length)} sur {filteredClients.length} résultats
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="border-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937]"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-[#1F2937] font-medium">
                {page} / {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages || totalPages === 0}
                className="border-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937]"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        </>
        )}

        {/* Add Client Dialog */}
        <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl text-[#1F2937]">Enregistrer un nouveau client</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              {/* Nom et Prénom */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-[#1F2937]">Prénom *</Label>
                  <Input
                    id="firstName"
                    placeholder="Prénom"
                    value={newClient.firstName}
                    onChange={(e) => setNewClient({ ...newClient, firstName: e.target.value })}
                    className="border-[#E5E7EB]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-[#1F2937]">Nom *</Label>
                  <Input
                    id="lastName"
                    placeholder="Nom"
                    value={newClient.lastName}
                    onChange={(e) => setNewClient({ ...newClient, lastName: e.target.value })}
                    className="border-[#E5E7EB]"
                  />
                </div>
              </div>

              {/* Téléphone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-[#1F2937]">Téléphone *</Label>
                <Input
                  id="phone"
                  placeholder="221 77 XXX XXXX"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  className="border-[#E5E7EB]"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-[#1F2937]">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemple.com"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  className="border-[#E5E7EB]"
                />
              </div>

              {/* Adresse */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-[#1F2937]">Adresse</Label>
                <Input
                  id="address"
                  placeholder="Adresse complète"
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  className="border-[#E5E7EB]"
                />
              </div>

              {/* Ville */}
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium text-[#1F2937]">Ville</Label>
                <Input
                  id="city"
                  placeholder="Ville"
                  value={newClient.city}
                  onChange={(e) => setNewClient({ ...newClient, city: e.target.value })}
                  className="border-[#E5E7EB]"
                />
              </div>

              {/* Limite de dette */}
              <div className="space-y-2">
                <Label htmlFor="debtLimit" className="text-sm font-medium text-[#1F2937]">Limite de dette (FCFA)</Label>
                <Input
                  id="debtLimit"
                  type="number"
                  placeholder="0"
                  value={newClient.debtLimit || ""}
                  onChange={(e) => setNewClient({ ...newClient, debtLimit: parseInt(e.target.value) || 0 })}
                  className="border-[#E5E7EB]"
                />
                <p className="text-xs text-[#6B7280]">Montant maximum de dette autorisé pour ce client</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => closeAddDialog()}
                  className="flex-1 border-[#E5E7EB] text-[#6B7280]"
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handleAddClient}
                  style={{ backgroundColor: '#1F3A5F' }}
                  className="flex-1 hover:bg-[#274C77]"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Enregistrer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Client Dialog */}
        <Dialog open={isEditClientOpen} onOpenChange={setIsEditClientOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl text-[#1F2937]">Modifier le client</DialogTitle>
              <DialogDescription className="text-sm text-[#6B7280]">
                Modifiez les informations du client ci-dessous
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              {/* Nom et Prénom */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editFirstName" className="text-sm font-medium text-[#1F2937]">Prénom *</Label>
                  <Input
                    id="editFirstName"
                    placeholder="Prénom"
                    value={newClient.firstName}
                    onChange={(e) => setNewClient({ ...newClient, firstName: e.target.value })}
                    className="border-[#E5E7EB]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editLastName" className="text-sm font-medium text-[#1F2937]">Nom *</Label>
                  <Input
                    id="editLastName"
                    placeholder="Nom"
                    value={newClient.lastName}
                    onChange={(e) => setNewClient({ ...newClient, lastName: e.target.value })}
                    className="border-[#E5E7EB]"
                  />
                </div>
              </div>

              {/* Téléphone */}
              <div className="space-y-2">
                <Label htmlFor="editPhone" className="text-sm font-medium text-[#1F2937]">Téléphone *</Label>
                <Input
                  id="editPhone"
                  placeholder="221 77 XXX XXXX"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  className="border-[#E5E7EB]"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="editEmail" className="text-sm font-medium text-[#1F2937]">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  placeholder="email@exemple.com"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  className="border-[#E5E7EB]"
                />
              </div>

              {/* Adresse */}
              <div className="space-y-2">
                <Label htmlFor="editAddress" className="text-sm font-medium text-[#1F2937]">Adresse</Label>
                <Input
                  id="editAddress"
                  placeholder="Adresse complète"
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  className="border-[#E5E7EB]"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => closeEditDialog()}
                  className="flex-1 border-[#E5E7EB] text-[#6B7280]"
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handleUpdateClient}
                  style={{ backgroundColor: '#1F3A5F' }}
                  className="flex-1 hover:bg-[#274C77]"
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Mettre à jour
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
