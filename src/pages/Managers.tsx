import { useState, useEffect } from "react";
import { 
  Plus, Search, Edit2, Trash2, Phone, Mail, Building2, 
  UserCheck, UserX, Send, RefreshCw, Users, UserCog, 
  DollarSign
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KPICard } from "@/components/dashboard/KPICard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  phone: string;
  email: string;
  hangar: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  manager: "Gestionnaire",
  cashier: "Caissier",
};

export default function Managers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [hangars, setHangars] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState("gestionnaires");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    hangar: "",
    role: "manager" as 'admin' | 'manager' | 'cashier',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchUsers(),
      fetchHangars()
    ]);
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.USERS);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
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

  const handleCreateUser = async () => {
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email || !formData.role) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.USERS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Utilisateur créé avec succès",
        });
        setIsDialogOpen(false);
        fetchUsers();
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur",
          description: errorData.message || "Impossible de créer l'utilisateur",
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

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.USERS}/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          isActive: selectedUser.isActive,
        }),
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Utilisateur mis à jour avec succès",
        });
        setIsDialogOpen(false);
        fetchUsers();
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour",
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

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.USERS}/${selectedUser.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Utilisateur supprimé avec succès",
        });
        setIsDeleteDialogOpen(false);
        fetchUsers();
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'utilisateur",
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

  const toggleUserStatus = async (user: UserProfile) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.USERS}/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: `Utilisateur ${user.isActive ? "désactivé" : "activé"} avec succès`,
        });
        fetchUsers();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      email: user.email,
      hangar: user.hangar || "",
      role: user.role as 'admin' | 'manager' | 'cashier',
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const openCreateDialog = () => {
    setSelectedUser(null);
    setFormData({ firstName: "", lastName: "", phone: "", email: "", hangar: "", role: "manager" });
    setIsDialogOpen(true);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchQuery("");
  };

  const getFilteredUsers = (roleFilter: string) => {
    return users.filter(user => {
      if (roleFilter === 'gestionnaires') {
        return ['admin', 'manager'].includes(user.role);
      } else if (roleFilter === 'caissiers') {
        return ['cashier'].includes(user.role);
      }
      return true;
    }).filter(user => {
      const name = user.name?.toLowerCase() || "";
      const email = user.email?.toLowerCase() || "";
      const hangar = user.hangar?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();
      return name.includes(query) || email.includes(query) || (hangar && hangar.includes(query));
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getRoleIcon = (role: string) => {
    if (role === 'admin' || role === 'manager') return UserCog;
    if (role === 'cashier') return DollarSign;
    return Users;
  };

  const filteredUsers = getFilteredUsers(activeTab);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1F2937]">Gestion des Utilisateurs</h1>
            <p className="text-[#6B7280]">Gérez les utilisateurs et leurs rôles</p>
          </div>
          <Button
            onClick={openCreateDialog}
            className="bg-[#1F3A5F] hover:bg-[#1F3A5F]/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvel Utilisateur
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <KPICard 
            title="Total utilisateurs" 
            value={users.length.toString()} 
            icon={Users}
            isPositive={true}
          />
          <KPICard 
            title="Gestionnaires" 
            value={users.filter(u => ['admin', 'manager'].includes(u.role)).length.toString()} 
            icon={UserCog}
            isPositive={true}
          />
          <KPICard 
            title="Caissiers" 
            value={users.filter(u => u.role === 'cashier').length.toString()} 
            icon={DollarSign}
            isPositive={true}
          />
        </div>

        {/* Tabs */}
        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="gestionnaires">Administrateurs & Gestionnaires</TabsTrigger>
              <TabsTrigger value="caissiers">Caissiers</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                <Input
                  placeholder={`Rechercher ${activeTab === 'gestionnaires' ? 'un administrateur/gestionnaire' : 'un caissier'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-[#E5E7EB]"
                />
              </div>

              {/* Users Table */}
              <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                        <th className="text-left py-4 px-6 text-xs font-medium text-[#6B7280] uppercase">Utilisateur</th>
                        <th className="text-left py-4 px-6 text-xs font-medium text-[#6B7280] uppercase">Contact</th>
                        <th className="text-left py-4 px-6 text-xs font-medium text-[#6B7280] uppercase">Rôle</th>
                        <th className="text-left py-4 px-6 text-xs font-medium text-[#6B7280] uppercase">Hangar</th>
                        <th className="text-left py-4 px-6 text-xs font-medium text-[#6B7280] uppercase">Statut</th>
                        <th className="text-left py-4 px-6 text-xs font-medium text-[#6B7280] uppercase">Créé le</th>
                        <th className="text-right py-4 px-6 text-xs font-medium text-[#6B7280] uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center">
                            <RefreshCw className="h-8 w-8 animate-spin text-[#1F3A5F] mx-auto" />
                            <p className="mt-2 text-[#6B7280]">Chargement...</p>
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center">
                            <Users className="h-12 w-12 text-[#E5E7EB] mx-auto" />
                            <p className="mt-2 text-[#6B7280]">Aucun utilisateur trouvé</p>
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => {
                          const RoleIcon = getRoleIcon(user.role);
                          return (
                            <tr key={user.id} className="hover:bg-[#F8FAFC] transition-colors">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F3A5F]">
                                    <span className="text-sm font-medium text-white">
                                      {user.firstName?.[0]}{user.lastName?.[0]}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium text-[#1F2937]">{user.name}</p>
                                    <p className="text-sm text-[#6B7280]">{user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-[#6B7280]" />
                                  <span className="text-sm text-[#1F2937]">{user.phone}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <Badge variant="outline" className="bg-[#F8FAFC] flex items-center gap-1 w-fit">
                                  <RoleIcon className="h-3 w-3" />
                                  {ROLE_LABELS[user.role] || user.role}
                                </Badge>
                              </td>
                              <td className="py-4 px-6">
                                <span className="text-sm text-[#1F2937]">{user.hangar || "-"}</span>
                              </td>
                              <td className="py-4 px-6">
                                <Badge className={user.isActive ? "bg-[#2E7D32]" : "bg-[#6B7280]"}>
                                  {user.isActive ? "Actif" : "Inactif"}
                                </Badge>
                              </td>
                              <td className="py-4 px-6">
                                <span className="text-sm text-[#6B7280]">{formatDate(user.createdAt)}</span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditDialog(user)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit2 className="h-4 w-4 text-[#6B7280]" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleUserStatus(user)}
                                    className="h-8 w-8 p-0"
                                  >
                                    {user.isActive ? (
                                      <UserX className="h-4 w-4 text-[#C62828]" />
                                    ) : (
                                      <UserCheck className="h-4 w-4 text-[#2E7D32]" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openDeleteDialog(user)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Trash2 className="h-4 w-4 text-[#C62828]" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedUser ? "Modifier l'utilisateur" : "Nouvel Utilisateur"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* Role Selection */}
              {!selectedUser && (
                <div className="space-y-2">
                  <Label>Rôle *</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value: 'admin' | 'manager' | 'cashier') => setFormData({...formData, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <UserCog className="h-4 w-4" />
                          Administrateur
                        </div>
                      </SelectItem>
                      <SelectItem value="manager">
                        <div className="flex items-center gap-2">
                          <UserCog className="h-4 w-4" />
                          Gestionnaire
                        </div>
                      </SelectItem>
                      <SelectItem value="cashier">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Caissier
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

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
                <Label>Hangar (optionnel)</Label>
                <Select value={formData.hangar} onValueChange={(value) => setFormData({...formData, hangar: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un hangar" />
                  </SelectTrigger>
                  <SelectContent>
                    {hangars.map((hangar) => (
                      <SelectItem key={hangar} value={hangar}>{hangar}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
              <Button onClick={selectedUser ? handleUpdateUser : handleCreateUser} className="bg-[#1F3A5F]">
                <Send className="mr-2 h-4 w-4" />
                {selectedUser ? "Mettre à jour" : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-[#6B7280]">
                Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{selectedUser?.name}</strong> ?
                Cette action est irréversible.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Annuler</Button>
              <Button variant="destructive" onClick={handleDeleteUser}>
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
