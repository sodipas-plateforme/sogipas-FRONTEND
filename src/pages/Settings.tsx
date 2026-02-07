import { useState } from "react";
import { 
  Save, Eye, Edit2, 
  X, Building2, User,
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

// Types
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
            title="Informations Entreprise"
            value="1"
            icon={Building2}
            isPositive={true}
            isNegative={false}
          />
          <KPICard
            title="Contact Administrateur"
            value="1"
            icon={User}
            isPositive={true}
            isNegative={false}
          />
          <KPICard
            title="Paramètres Configurés"
            value="4"
            icon={SettingsIcon}
            isPositive={true}
            isNegative={false}
          />
          <KPICard
            title="Dernière Modification"
            value="Aujourd'hui"
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
        </Tabs>
      </div>
    </AppLayout>
  );
}

