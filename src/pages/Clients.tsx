import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Phone, MessageCircle, UserPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

// Generate clients with Senegalese names and +221 phone numbers
const generateClients = (): Client[] => {
  const senegaleseNames = [
    { first: "Moussa", last: "Diop" },
    { first: "Aminata", last: "Sall" },
    { first: "Ousmane", last: "Ndiaye" },
    { first: "Fatou", last: "Fall" },
    { first: "Cheikh", last: "Sy" },
    { first: "Mame Diarra", last: "Diop" },
    { first: "Alioune", last: "Diouf" },
    { first: "Coumba", last: "Kane" },
    { first: "Ibrahima", last: "Sow" },
    { first: "Ndeye Fatou", last: "Gueye" },
    { first: "Mamadou", last: "Ba" },
    { first: "Khady", last: "Sène" },
    { first: "Souleymane", last: "Bamba" },
    { first: "Astou", last: "Diop" },
    { first: "Papa", last: "Ndiaye" },
    { first: "Adja", last: "Mbengue" },
    { first: "Modou", last: "Lo" },
    { first: "Rokhaya", last: "Diarra" },
  ];

  const cities = ["Dakar", "Thiès", "Saint-Louis", "Kaolack", "Ziguinchor", "Louga", "Diourbel", "Rufisque"];

  return Array.from({ length: 18 }, (_, i) => {
    const name = senegaleseNames[i % senegaleseNames.length];
    const phone = `+221 ${70 + Math.floor(Math.random() * 10)} ${String(Math.floor(Math.random() * 10000000).toString().padStart(7, '0').substring(0, 3))} ${String(Math.floor(Math.random() * 10000000).toString().padStart(7, '0').substring(3))}`;
    const isActive = Math.random() > 0.2;
    const debt = isActive ? Math.floor(Math.random() * 500000) : Math.floor(Math.random() * 1000000);
    
    return {
      id: `${i + 1}`,
      name: `${name.first} ${name.last}`,
      phone: phone,
      email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@gmail.com`,
      address: `${Math.floor(Math.random() * 100)} Rue ${name.last}, ${cities[i % cities.length]}`,
      debt: debt,
      debtLimit: 500000,
      totalPurchases: Math.floor(Math.random() * 15000000) + 500000,
      isActive: isActive,
      cageots: Math.floor(Math.random() * 50) + 5,
      lastPurchase: new Date(2024, 0, 15 - (i % 30)).toLocaleDateString("fr-FR"),
    };
  });
};

const clients = generateClients();

const ITEMS_PER_PAGE = 8;

export default function Clients() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [page, setPage] = useState(1);
  
  // Form state
  const [newClient, setNewClient] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    city: "Dakar",
    debtLimit: 0,
  });

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery)
  );

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

  const handleAddClient = () => {
    const fullName = `${newClient.firstName} ${newClient.lastName}`.trim();
    if (!fullName || !newClient.phone) {
      alert("Veuillez remplir le nom et le téléphone");
      return;
    }
    alert(`Client ${fullName} enregistré avec succès!\nTéléphone: ${newClient.phone}\nLimite de dette: ${newClient.debtLimit.toLocaleString()} F`);
    setIsAddClientOpen(false);
    setNewClient({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      address: "",
      city: "Dakar",
      debtLimit: 0,
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
          <Button 
            onClick={() => setIsAddClientOpen(true)}
            style={{ backgroundColor: '#1F3A5F' }}
            className="hover:bg-[#274C77]"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Enregistrer un client
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
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
                      <div>
                        <p className="font-medium text-[#1F2937]">{client.name}</p>
                        <p className="text-sm text-[#6B7280]">{client.address}</p>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => sendWhatsApp(client, e)}
                          className="text-[#25D366] hover:text-[#25D366] hover:bg-[#25D366]/10"
                          title="Envoyer via WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
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
                  onClick={() => setIsAddClientOpen(false)}
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
      </div>
    </AppLayout>
  );
}
