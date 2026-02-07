import { useState, useEffect } from "react";
import { 
  Plus, Search, Edit2, Trash2, Phone, Mail, Building2, 
  UserCheck, UserX, Send, RefreshCw, Users, UserCog
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { KPICard } from "@/components/dashboard/KPICard";
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
import { API_ENDPOINTS } from "@/config/api";
import { useToast } from "@/hooks/use-toast";

interface Manager {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  phone: string;
  email: string;
  hangar: string;
  isActive: boolean;
  createdAt: string;
}

export default function Managers() {
  const { toast } = useToast();
  const [managers, setManagers] = useState<Manager[]>([]);
  const [hangars, setHangars] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    hangar: "",
  });

  useEffect(() => {
    fetchManagers();
    fetchHangars();
  }, []);

  const fetchManagers = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.MANAGERS);
      if (response.ok) {
        const data = await response.json();
        setManagers(data);
      }
    } catch (error) {
      console.error("Error fetching managers:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les gestionnaires",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHangars = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.HANGARS);
      if (response.ok) {
        const data = await response.json();
        setHangars(data);
      }
    } catch (error) {
      console.error("Error fetching hangars:", error);
    }
  };

  const handleCreateManager = async () => {
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email || !formData.hangar) {
      toast({
        title: "Erreur",
        description: "Tous les champs sont requis",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.MANAGERS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Succès",
          description: `Gestionnaire ${formData.firstName} ${formData.lastName} créé avec succès`,
        });
        setFormData({ firstName: "", lastName: "", phone: "", email: "", hangar: "" });
        setIsDialogOpen(false);
        fetchManagers();
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Impossible de créer le gestionnaire",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const handleUpdateManager = async () => {
    if (!selectedManager) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.MANAGERS}/${selectedManager.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          isActive: selectedManager.isActive,
        }),
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Gestionnaire mis à jour avec succès",
        });
        setIsDialogOpen(false);
        fetchManagers();
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le gestionnaire",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const handleDeleteManager = async () => {
    if (!selectedManager) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.MANAGERS}/${selectedManager.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Gestionnaire supprimé avec succès",
        });
        setIsDeleteDialogOpen(false);
        fetchManagers();
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le gestionnaire",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (manager: Manager) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.MANAGERS}/${manager.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...manager,
          isActive: !manager.isActive,
        }),
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: `Gestionnaire ${manager.isActive ? "désactivé" : "activé"} avec succès`,
        });
        fetchManagers();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (manager: Manager) => {
    setSelectedManager(manager);
    setFormData({
      firstName: manager.firstName,
      lastName: manager.lastName,
      phone: manager.phone,
      email: manager.email,
      hangar: manager.hangar,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (manager: Manager) => {
    setSelectedManager(manager);
    setIsDeleteDialogOpen(true);
  };

  const filteredManagers = managers.filter(manager => {
    const name = manager.name?.toLowerCase() || "";
    const email = manager.email?.toLowerCase() || "";
    const hangar = manager.hangar?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query) || hangar.includes(query);
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1F2937]">Gestion des Gestionnaires</h1>
            <p className="text-[#6B7280]">Gérez les gestionnaires et leurs hangars affectés</p>
          </div>
          <Button
            onClick={() => {
              setSelectedManager(null);
              setFormData({ firstName: "", lastName: "", phone: "", email: "", hangar: "" });
              setIsDialogOpen(true);
            }}
            className="bg-[#1F3A5F] hover:bg-[#1F3A5F]/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Gestionnaire
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <KPICard title="Total" value={managers.length} icon={Users} />
          <KPICard title="Actifs" value={managers.filter(m => m.isActive).length} icon={UserCheck} isPositive />
          <KPICard title="Inactifs" value={managers.filter(m => !m.isActive).length} icon={UserX} isNegative />
          <KPICard title="Hangars" value={hangars.length} icon={Building2} />
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-[#E5E7EB]"
          />
        </div>

        {/* Managers Table */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                  <th className="text-left py-4 px-6 text-xs font-medium text-[#6B7280] uppercase">Gestionnaire</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-[#6B7280] uppercase">Contact</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-[#6B7280] uppercase">Hangar</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-[#6B7280] uppercase">Statut</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-[#6B7280] uppercase">Créé le</th>
                  <th className="text-right py-4 px-6 text-xs font-medium text-[#6B7280] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-[#1F3A5F] mx-auto" />
                      <p className="mt-2 text-[#6B7280]">Chargement...</p>
                    </td>
                  </tr>
                ) : filteredManagers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <UserCog className="h-12 w-12 text-[#E5E7EB] mx-auto" />
                      <p className="mt-2 text-[#6B7280]">Aucun gestionnaire trouvé</p>
                    </td>
                  </tr>
                ) : (
                  filteredManagers.map((manager) => (
                    <tr key={manager.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F3A5F]">
                            <span className="text-sm font-medium text-white">
                              {manager.firstName?.[0]}{manager.lastName?.[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-[#1F2937]">{manager.name}</p>
                            <p className="text-sm text-[#6B7280]">{manager.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-[#6B7280]" />
                          <span className="text-sm text-[#1F2937]">{manager.phone}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant="outline" className="bg-[#F8FAFC]">{manager.hangar}</Badge>
                      </td>
                      <td className="py-4 px-6">
                        <Badge className={manager.isActive ? "bg-[#2E7D32]/10 text-[#2E7D32]" : "bg-[#6B7280]/10 text-[#6B7280]"}>
                          {manager.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-sm text-[#6B7280]">{formatDate(manager.createdAt)}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleToggleActive(manager)} className={manager.isActive ? "text-[#C62828]" : "text-[#2E7D32]"}>
                            {manager.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(manager)} className="text-[#1F3A5F]">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(manager)} className="text-[#C62828]">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedManager ? "Modifier le Gestionnaire" : "Nouveau Gestionnaire"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prénom *</Label>
                <Input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} placeholder="Prénom" />
              </div>
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} placeholder="Nom" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Téléphone *</Label>
              <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+221 77 123 45 67" />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="email@exemple.com" />
            </div>
            <div className="space-y-2">
              <Label>Hangar Affecté *</Label>
              <Select value={formData.hangar} onValueChange={(value) => setFormData({...formData, hangar: value})}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un hangar" /></SelectTrigger>
                <SelectContent>
                  {hangars.map((hangar) => (<SelectItem key={hangar} value={hangar}>{hangar}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
            <Button onClick={selectedManager ? handleUpdateManager : handleCreateManager} className="bg-[#1F3A5F]">
              <Send className="mr-2 h-4 w-4" />
              {selectedManager ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p className="text-[#6B7280] py-4">
            Êtes-vous sûr de vouloir supprimer <span className="font-medium text-[#1F2937]">{selectedManager?.name}</span> ?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleDeleteManager} className="bg-[#C62828] text-white">
              <Trash2 className="mr-2 h-4 w-4" />Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
