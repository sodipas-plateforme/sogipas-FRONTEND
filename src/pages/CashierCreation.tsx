import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Send, RefreshCw, DollarSign, Building2, Phone, Mail, User, CheckCircle, Edit2, Trash2, UserCheck, UserX } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { KPICard } from '@/components/dashboard/KPICard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { API_ENDPOINTS } from '@/config/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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

export default function CashierCreation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [cashiers, setCashiers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [createdCashier, setCreatedCashier] = useState<UserProfile | null>(null);
  const [selectedCashier, setSelectedCashier] = useState<UserProfile | null>(null);

  // Redirect if not a manager
  useEffect(() => {
    if (user && user.role !== 'manager') {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch cashiers for this manager's hangar
  useEffect(() => {
    if (user?.role === 'manager') {
      fetchCashiers();
    }
  }, [user]);

  const fetchCashiers = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.USERS);
      if (response.ok) {
        const data = await response.json();
        // Filter cashiers for this manager's hangar
        const managerCashiers = data.filter((u: UserProfile) => 
          u.role === 'cashier' && u.hangar === user?.hangar
        );
        setCashiers(managerCashiers);
      }
    } catch (error) {
      console.error('Error fetching cashiers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email) {
      toast({
        title: 'Erreur',
        description: 'Tous les champs sont requis',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3002/users/by-manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          managerId: user?.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Succès',
          description: `${formData.firstName} ${formData.lastName} créé avec succès`,
        });
        setFormData({ firstName: '', lastName: '', phone: '', email: '' });
        setIsDialogOpen(false);
        setCreatedCashier(data.user);
        fetchCashiers();
      } else {
        toast({
          title: 'Erreur',
          description: data.error || 'Erreur lors de la création',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de se connecter au serveur',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedCashier) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.USERS}/${selectedCashier.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          isActive: selectedCashier.isActive,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Succès',
          description: 'Caissier mis à jour avec succès',
        });
        setIsDialogOpen(false);
        fetchCashiers();
      } else {
        toast({
          title: 'Erreur',
          description: 'Impossible de mettre à jour',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedCashier) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.USERS}/${selectedCashier.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Succès',
          description: 'Caissier supprimé avec succès',
        });
        setIsDeleteDialogOpen(false);
        fetchCashiers();
      } else {
        toast({
          title: 'Erreur',
          description: 'Impossible de supprimer',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (cashier: UserProfile) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.USERS}/${cashier.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...cashier,
          isActive: !cashier.isActive,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Succès',
          description: `Caissier ${cashier.isActive ? 'désactivé' : 'activé'} avec succès`,
        });
        fetchCashiers();
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  const openCreateDialog = () => {
    setSelectedCashier(null);
    setFormData({ firstName: '', lastName: '', phone: '', email: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (cashier: UserProfile) => {
    setSelectedCashier(cashier);
    setFormData({
      firstName: cashier.firstName,
      lastName: cashier.lastName,
      phone: cashier.phone,
      email: cashier.email
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (cashier: UserProfile) => {
    setSelectedCashier(cashier);
    setIsDeleteDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (!user || user.role !== 'manager') {
    return null;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1F2937]">Gestion Caissier</h1>
            <p className="text-[#6B7280]">Gérez les caissiers de votre hangar</p>
          </div>
          <Button
            onClick={openCreateDialog}
            className="bg-[#1F3A5F] hover:bg-[#1F3A5F]/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Caissier
          </Button>
        </div>

        {/* Stats Card */}
        <div className="grid gap-4 md:grid-cols-3">
          <KPICard 
            title="Total Caissiers" 
            value={cashiers.length} 
            icon={DollarSign} 
          />
          <KPICard 
            title="Actifs" 
            value={cashiers.filter(c => c.isActive).length} 
            icon={UserCheck} 
            isPositive 
          />
          <KPICard 
            title="Mon Hangar" 
            value={user.hangar || 'Non attribué'} 
            icon={Building2} 
          />
        </div>

        {/* Cashiers Table */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                  <th className="text-left py-4 px-6 text-xs font-medium text-[#6B7280] uppercase">Caissier</th>
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
                ) : cashiers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <DollarSign className="h-12 w-12 text-[#E5E7EB] mx-auto" />
                      <p className="mt-2 text-[#6B7280]">Aucun caissier dans votre hangar</p>
                      <Button
                        variant="link"
                        onClick={openCreateDialog}
                        className="text-[#1F3A5F]"
                      >
                        Créer votre premier caissier
                      </Button>
                    </td>
                  </tr>
                ) : (
                  cashiers.map((cashier) => (
                    <tr key={cashier.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F3A5F]">
                            <span className="text-sm font-medium text-white">
                              {cashier.firstName?.[0]}{cashier.lastName?.[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-[#1F2937]">{cashier.name}</p>
                            <p className="text-sm text-[#6B7280]">{cashier.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-[#6B7280]" />
                          <span className="text-sm text-[#1F2937]">{cashier.phone}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant="outline" className="bg-[#F8FAFC]">{cashier.hangar || '-'}</Badge>
                      </td>
                      <td className="py-4 px-6">
                        <Badge className={cashier.isActive ? 'bg-[#2E7D32]/10 text-[#2E7D32]' : 'bg-[#6B7280]/10 text-[#6B7280]'}>
                          {cashier.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-sm text-[#6B7280]">{formatDate(cashier.createdAt)}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleToggleActive(cashier)}
                            className={cashier.isActive ? 'text-[#C62828]' : 'text-[#2E7D32]'}
                          >
                            {cashier.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openEditDialog(cashier)}
                            className="text-[#1F3A5F]"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openDeleteDialog(cashier)}
                            className="text-[#C62828]"
                          >
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
            <DialogTitle>{selectedCashier ? 'Modifier le caissier' : 'Nouveau Caissier'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {!selectedCashier && (
              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB]">
                <p className="text-sm text-[#6B7280]">Le caissier sera affecté à:</p>
                <p className="font-medium text-[#1F2937] flex items-center gap-2 mt-1">
                  <Building2 className="h-4 w-4" />
                  {user.hangar || 'Non attribué'}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prénom *</Label>
                <Input 
                  value={formData.firstName} 
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                  placeholder="Prénom" 
                />
              </div>
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input 
                  value={formData.lastName} 
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                  placeholder="Nom" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Téléphone *</Label>
              <Input 
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                placeholder="+221 77 123 45 67" 
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input 
                type="email" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                placeholder="caissier@exemple.com" 
              />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
            <Button 
              onClick={selectedCashier ? handleUpdate : handleCreate} 
              disabled={loading}
              className="bg-[#1F3A5F]"
            >
              {loading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {selectedCashier ? 'Mettre à jour' : 'Créer'}
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
            Êtes-vous sûr de vouloir supprimer <span className="font-medium text-[#1F2937]">{selectedCashier?.name}</span> ?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleDelete} className="bg-[#C62828] text-white">
              <Trash2 className="mr-2 h-4 w-4" />Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog for new cashier */}
      <Dialog open={!!createdCashier && !isDialogOpen} onOpenChange={() => setCreatedCashier(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#2E7D32]">
              <CheckCircle className="h-5 w-5" />
              Caissier créé avec succès
            </DialogTitle>
          </DialogHeader>
          {createdCashier && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#6B7280]">Nom complet</p>
                  <p className="font-medium text-[#1F2937]">{createdCashier.name}</p>
                </div>
                <div>
                  <p className="text-[#6B7280]">Hangar</p>
                  <p className="font-medium text-[#1F2937]">{createdCashier.hangar}</p>
                </div>
                <div>
                  <p className="text-[#6B7280]">Email</p>
                  <p className="font-medium text-[#1F2937]">{createdCashier.email}</p>
                </div>
                <div>
                  <p className="text-[#6B7280]">Téléphone</p>
                  <p className="font-medium text-[#1F2937]">{createdCashier.phone}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="pt-4">
            <Button onClick={() => setCreatedCashier(null)} className="bg-[#1F3A5F]">
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
