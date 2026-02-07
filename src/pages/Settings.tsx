import { useState } from "react";
import { 
  Users, Warehouse, Package, Save, Eye, Edit2, Trash2, 
  Plus, X, Building2, Phone, MapPin, Mail, Lock, User, AlertTriangle,
  Settings as SettingsIcon
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Types
interface WarehouseManager {
  id: string;
  name: string;
  phone: string;
  email: string;
  warehouse: string;
  location: string;
  isActive: boolean;
}

interface AdminInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  companyName: string;
  companyAddress: string;
  ninea: string;
  rc: string;
}

// Mock data
const mockWarehouseManagers: WarehouseManager[] = [
  { id: "1", name: "Ibrahima Sarr", phone: "+221 77 123 45 67", email: "ibrahima.sarr@sodipas.sn", warehouse: "Hangar 1", location: "Dakar", isActive: true },
  { id: "2", name: "Ousmane Ndiaye", phone: "+221 76 234 56 78", email: "ousmane.ndiaye@sodipas.sn", warehouse: "Hangar 2", location: "Thiès", isActive: true },
  { id: "3", name: "Cheikh Sy", phone: "+221 70 345 67 89", email: "cheikh.sy@sodipas.sn", warehouse: "Hangar 3", location: "Saint-Louis", isActive: true },
];

const warehouses = ["Hangar 1", "Hangar 2", "Hangar 3", "Hangar 4"];
const locations = ["Dakar", "Thiès", "Saint-Louis", "Kaolack", "Ziguinchor"];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("admin");
  
  // Admin state
  const [adminInfo, setAdminInfo] = useState<AdminInfo>({
    id: "1",
    name: "Administrateur SODIPAS",
    email: "admin@sodipas.sn",
    phone: "+221 77 123 45 67",
    role: "admin",
    companyName: "SODIPAS SARL",
    companyAddress: "Immeuble Macal, Liberté 6 Extension VDN",
    ninea: "00898900R",
    rc: "SN DKR 5 49981",
  });
  const [isAdminEditing, setIsAdminEditing] = useState(false);
  const [tempAdminInfo, setTempAdminInfo] = useState<AdminInfo>(adminInfo);

  // Warehouse managers state
  const [managers, setManagers] = useState<WarehouseManager[]>(mockWarehouseManagers);
  const [isManagerDialogOpen, setIsManagerDialogOpen] = useState(false);
  const [isManagerEditMode, setIsManagerEditMode] = useState(false);
  const [currentManager, setCurrentManager] = useState<WarehouseManager | null>(null);
  const [tempManager, setTempManager] = useState<Partial<WarehouseManager>>({});

  // Stock thresholds state (keep original)
  const [stockThresholds, setStockThresholds] = useState({
    "banane-plantain": 200,
    mangue: 100,
    ananas: 80,
    papaye: 60,
  });

  // Admin functions
  const handleEditAdmin = () => {
    setTempAdminInfo(adminInfo);
    setIsAdminEditing(true);
  };

  const handleSaveAdmin = () => {
    setAdminInfo(tempAdminInfo);
    setIsAdminEditing(false);
    alert("Informations de l'administrateur mises à jour avec succès!");
  };

  const handleCancelAdminEdit = () => {
    setTempAdminInfo(adminInfo);
    setIsAdminEditing(false);
  };

  // Manager functions
  const handleAddManager = () => {
    setTempManager({
      name: "",
      phone: "",
      email: "",
      warehouse: "",
      location: "",
      isActive: true,
    });
    setCurrentManager(null);
    setIsManagerEditMode(false);
    setIsManagerDialogOpen(true);
  };

  const handleEditManager = (manager: WarehouseManager) => {
    setTempManager(manager);
    setCurrentManager(manager);
    setIsManagerEditMode(true);
    setIsManagerDialogOpen(true);
  };

  const handleDeleteManager = (managerId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce gestionnaire?")) {
      setManagers(managers.filter(m => m.id !== managerId));
      alert("Gestionnaire supprimé avec succès!");
    }
  };

  const handleSaveManager = () => {
    if (!tempManager.name || !tempManager.phone || !tempManager.warehouse) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (isManagerEditMode && currentManager) {
      // Update existing manager
      setManagers(managers.map(m => 
        m.id === currentManager.id 
          ? { ...m, ...tempManager } as WarehouseManager
          : m
      ));
      alert("Gestionnaire mis à jour avec succès!");
    } else {
      // Add new manager
      const newManager: WarehouseManager = {
        id: String(Date.now()),
        name: tempManager.name || "",
        phone: tempManager.phone || "",
        email: tempManager.email || "",
        warehouse: tempManager.warehouse || "",
        location: tempManager.location || "",
        isActive: tempManager.isActive ?? true,
      };
      setManagers([...managers, newManager]);
      alert("Gestionnaire ajouté avec succès!");
    }

    setIsManagerDialogOpen(false);
  };

  const handleCloseManagerDialog = () => {
    setIsManagerDialogOpen(false);
    setCurrentManager(null);
    setIsManagerEditMode(false);
  };

  const handleSaveThresholds = () => {
    alert("Seuils de stock enregistrés avec succès!");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Paramètres</h1>
          <p className="text-sm text-[#6B7280]">Configuration et gestion de l'application</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Gestionnaires"
            value={managers.length.toString()}
            icon={Users}
            isPositive={true}
            isNegative={false}
          />
          <KPICard
            title="Gestionnaires Actifs"
            value={managers.filter(m => m.isActive).length.toString()}
            icon={User}
            isPositive={true}
            isNegative={false}
          />
          <KPICard
            title="Hangars"
            value={warehouses.length.toString()}
            icon={Warehouse}
            isPositive={true}
            isNegative={false}
          />
          <KPICard
            title="Seuils Configurés"
            value={Object.keys(stockThresholds).length.toString()}
            icon={SettingsIcon}
            isPositive={true}
            isNegative={false}
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="admin" className="gap-2">
              <Building2 className="h-4 w-4" />
              Administration
            </TabsTrigger>
            <TabsTrigger value="managers" className="gap-2">
              <Users className="h-4 w-4" />
              Gestionnaires
            </TabsTrigger>
            <TabsTrigger value="stock" className="gap-2">
              <Package className="h-4 w-4" />
              Stocks
            </TabsTrigger>
          </TabsList>

          {/* Admin Tab */}
          <TabsContent value="admin" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-[#1F3A5F]/10 p-3">
                      <Building2 className="h-5 w-5 text-[#1F3A5F]" />
                    </div>
                    <div>
                      <CardTitle className="text-[#1F2937]">Informations de l'entreprise</CardTitle>
                      <CardDescription>Gérez les informations de SODIPAS SARL</CardDescription>
                    </div>
                  </div>
                  {!isAdminEditing ? (
                    <Button 
                      variant="outline" 
                      onClick={handleEditAdmin}
                      className="border-[#E5E7EB]"
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Modifier
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={handleCancelAdminEdit}
                        className="border-[#E5E7EB]"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Annuler
                      </Button>
                      <Button 
                        style={{ backgroundColor: '#1F3A5F' }}
                        onClick={handleSaveAdmin}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Enregistrer
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Company Info */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-[#1F2937] flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Informations entreprise
                    </h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Nom de l'entreprise</Label>
                        <Input
                          id="companyName"
                          value={isAdminEditing ? tempAdminInfo.companyName : adminInfo.companyName}
                          onChange={(e) => setTempAdminInfo({ ...tempAdminInfo, companyName: e.target.value })}
                          disabled={!isAdminEditing}
                          className="border-[#E5E7EB]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyAddress">Adresse</Label>
                        <Input
                          id="companyAddress"
                          value={isAdminEditing ? tempAdminInfo.companyAddress : adminInfo.companyAddress}
                          onChange={(e) => setTempAdminInfo({ ...tempAdminInfo, companyAddress: e.target.value })}
                          disabled={!isAdminEditing}
                          className="border-[#E5E7EB]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="ninea">NINEA</Label>
                          <Input
                            id="ninea"
                            value={isAdminEditing ? tempAdminInfo.ninea : adminInfo.ninea}
                            onChange={(e) => setTempAdminInfo({ ...tempAdminInfo, ninea: e.target.value })}
                            disabled={!isAdminEditing}
                            className="border-[#E5E7EB]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="rc">Registre de Commerce</Label>
                          <Input
                            id="rc"
                            value={isAdminEditing ? tempAdminInfo.rc : adminInfo.rc}
                            onChange={(e) => setTempAdminInfo({ ...tempAdminInfo, rc: e.target.value })}
                            disabled={!isAdminEditing}
                            className="border-[#E5E7EB]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Admin Contact Info */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-[#1F2937] flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Contact administrateur
                    </h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="adminName">Nom complet</Label>
                        <Input
                          id="adminName"
                          value={isAdminEditing ? tempAdminInfo.name : adminInfo.name}
                          onChange={(e) => setTempAdminInfo({ ...tempAdminInfo, name: e.target.value })}
                          disabled={!isAdminEditing}
                          className="border-[#E5E7EB]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="adminEmail">Email</Label>
                        <Input
                          id="adminEmail"
                          type="email"
                          value={isAdminEditing ? tempAdminInfo.email : adminInfo.email}
                          onChange={(e) => setTempAdminInfo({ ...tempAdminInfo, email: e.target.value })}
                          disabled={!isAdminEditing}
                          className="border-[#E5E7EB]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="adminPhone">Téléphone</Label>
                        <Input
                          id="adminPhone"
                          value={isAdminEditing ? tempAdminInfo.phone : adminInfo.phone}
                          onChange={(e) => setTempAdminInfo({ ...tempAdminInfo, phone: e.target.value })}
                          disabled={!isAdminEditing}
                          className="border-[#E5E7EB]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-[#E5E7EB]" />

                {/* Current Display */}
                {!isAdminEditing && (
                  <div className="bg-[#F8FAFC] rounded-lg p-4">
                    <h4 className="font-medium text-[#1F2937] mb-2">Aperçu</h4>
                    <div className="grid gap-2 text-sm">
                      <p><span className="font-medium">Entreprise:</span> {adminInfo.companyName}</p>
                      <p><span className="font-medium">Adresse:</span> {adminInfo.companyAddress}</p>
                      <p><span className="font-medium">NINEA:</span> {adminInfo.ninea} | <span className="font-medium">RC:</span> {adminInfo.rc}</p>
                      <p><span className="font-medium">Contact:</span> {adminInfo.name} | {adminInfo.email} | {adminInfo.phone}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Managers Tab */}
          <TabsContent value="managers" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-[#1F3A5F]/10 p-3">
                      <Users className="h-5 w-5 text-[#1F3A5F]" />
                    </div>
                    <div>
                      <CardTitle className="text-[#1F2937]">Gestion des gestionnaires</CardTitle>
                      <CardDescription>Gérez les responsables des hangars</CardDescription>
                    </div>
                  </div>
                  <Button 
                    style={{ backgroundColor: '#1F3A5F' }}
                    onClick={handleAddManager}
                    className="hover:bg-[#274C77]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un gestionnaire
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {managers.map((manager) => (
                    <div
                      key={manager.id}
                      className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-white p-4 hover:bg-[#F8FAFC] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1F3A5F]/10">
                          <Users className="h-6 w-6 text-[#1F3A5F]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-[#1F2937]">{manager.name}</p>
                            <Badge 
                              className={manager.isActive 
                                ? "bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/20" 
                                : "bg-[#C62828]/10 text-[#C62828] border-[#C62828]/20"
                              }
                              variant="outline"
                            >
                              {manager.isActive ? "Actif" : "Inactif"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-[#6B7280]">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {manager.warehouse}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {manager.location}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-[#6B7280]">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {manager.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {manager.email}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditManager(manager)}
                          className="text-[#1F3A5F]"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteManager(manager.id)}
                          className="text-[#C62828] hover:text-[#C62828] hover:bg-[#C62828]/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stock Thresholds Tab */}
          <TabsContent value="stock" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#F9C74F]/10 p-3">
                    <Package className="h-5 w-5 text-[#B45309]" />
                  </div>
                  <div>
                    <CardTitle className="text-[#1F2937]">Seuils de stock</CardTitle>
                    <CardDescription>Configurez les alertes de stock minimum par produit</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-[#F8FAFC] rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-[#B45309]">
                    <AlertTriangle className="h-4 w-4" />
                    <p className="text-sm font-medium">Alerte de stock</p>
                  </div>
                  <p className="text-sm text-[#6B7280] mt-1">
                    Vous serez alerté lorsque le stock d'un produit descendra en dessous de son seuil défini.
                  </p>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="banane-seuil" className="text-sm font-medium text-[#1F2937]">Bananes plantain (cageots)</Label>
                    <Input 
                      id="banane-seuil" 
                      type="number" 
                      value={stockThresholds["banane-plantain"]}
                      onChange={(e) => setStockThresholds({ ...stockThresholds, "banane-plantain": parseInt(e.target.value) || 0 })}
                      className="border-[#E5E7EB]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mangue-seuil" className="text-sm font-medium text-[#1F2937]">Mangues (cageots)</Label>
                    <Input 
                      id="mangue-seuil" 
                      type="number" 
                      value={stockThresholds.mangue}
                      onChange={(e) => setStockThresholds({ ...stockThresholds, mangue: parseInt(e.target.value) || 0 })}
                      className="border-[#E5E7EB]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ananas-seuil" className="text-sm font-medium text-[#1F2937]">Ananas (cageots)</Label>
                    <Input 
                      id="ananas-seuil" 
                      type="number" 
                      value={stockThresholds.ananas}
                      onChange={(e) => setStockThresholds({ ...stockThresholds, ananas: parseInt(e.target.value) || 0 })}
                      className="border-[#E5E7EB]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="papaye-seuil" className="text-sm font-medium text-[#1F2937]">Papayes (cageots)</Label>
                    <Input 
                      id="papaye-seuil" 
                      type="number" 
                      value={stockThresholds.papaye}
                      onChange={(e) => setStockThresholds({ ...stockThresholds, papaye: parseInt(e.target.value) || 0 })}
                      className="border-[#E5E7EB]"
                    />
                  </div>
                </div>
                <Separator className="bg-[#E5E7EB]" />
                <div className="flex justify-end">
                  <Button 
                    style={{ backgroundColor: '#1F3A5F' }} 
                    onClick={handleSaveThresholds}
                    className="hover:bg-[#274C77]"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer les seuils
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Manager Dialog */}
      <Dialog open={isManagerDialogOpen} onOpenChange={setIsManagerDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isManagerEditMode ? "Modifier le gestionnaire" : "Ajouter un gestionnaire"}
            </DialogTitle>
            <DialogDescription>
              {isManagerEditMode 
                ? "Modifiez les informations du gestionnaire ci-dessous."
                : "Remplissez les informations pour ajouter un nouveau gestionnaire."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="managerName">Nom complet *</Label>
              <Input
                id="managerName"
                value={tempManager.name || ""}
                onChange={(e) => setTempManager({ ...tempManager, name: e.target.value })}
                placeholder="Nom du gestionnaire"
                className="border-[#E5E7EB]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="managerPhone">Téléphone *</Label>
              <Input
                id="managerPhone"
                value={tempManager.phone || ""}
                onChange={(e) => setTempManager({ ...tempManager, phone: e.target.value })}
                placeholder="+221 XX XXX XXXX"
                className="border-[#E5E7EB]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="managerEmail">Email</Label>
              <Input
                id="managerEmail"
                type="email"
                value={tempManager.email || ""}
                onChange={(e) => setTempManager({ ...tempManager, email: e.target.value })}
                placeholder="email@sodipas.sn"
                className="border-[#E5E7EB]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="managerWarehouse">Hangar *</Label>
                <Select 
                  value={tempManager.warehouse || ""} 
                  onValueChange={(value) => setTempManager({ ...tempManager, warehouse: value })}
                >
                  <SelectTrigger className="border-[#E5E7EB]">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map(hangar => (
                      <SelectItem key={hangar} value={hangar}>{hangar}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="managerLocation">Localisation</Label>
                <Select 
                  value={tempManager.location || ""} 
                  onValueChange={(value) => setTempManager({ ...tempManager, location: value })}
                >
                  <SelectTrigger className="border-[#E5E7EB]">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="managerActive"
                checked={tempManager.isActive ?? true}
                onChange={(e) => setTempManager({ ...tempManager, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-[#E5E7EB]"
              />
              <Label htmlFor="managerActive" className="text-sm">Gestionnaire actif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleCloseManagerDialog}
              className="border-[#E5E7EB]"
            >
              <X className="mr-2 h-4 w-4" />
              Annuler
            </Button>
            <Button 
              style={{ backgroundColor: '#1F3A5F' }}
              onClick={handleSaveManager}
              className="hover:bg-[#274C77]"
            >
              <Save className="mr-2 h-4 w-4" />
              {isManagerEditMode ? "Mettre à jour" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

