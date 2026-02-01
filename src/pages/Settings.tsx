import { useState } from "react";
import { Users, Warehouse, Package, Save, Eye, Edit2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Paramètres</h1>
          <p className="text-sm text-[#6B7280]">Configuration et gestion de l'application</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="warehouses" className="gap-2">
              <Warehouse className="h-4 w-4" />
              Hangars
            </TabsTrigger>
            <TabsTrigger value="stock" className="gap-2">
              <Package className="h-4 w-4" />
              Stocks
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-[#1F3A5F]/10 p-3">
                      <Users className="h-5 w-5 text-[#1F3A5F]" />
                    </div>
                    <div>
                      <CardTitle className="text-[#1F2937]">Gestion des utilisateurs</CardTitle>
                      <CardDescription>Gérer les accès et les permissions des utilisateurs</CardDescription>
                    </div>
                  </div>
                  <Button style={{ backgroundColor: '#1F3A5F' }} className="hover:bg-[#274C77]">
                    <Edit2 className="mr-2 h-4 w-4" />
                    Gérer les utilisateurs
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-[#E5E7EB] bg-white p-5">
                    <p className="text-sm text-[#6B7280]">Utilisateurs actifs</p>
                    <p className="text-3xl font-bold text-[#1F2937]">5</p>
                    <p className="text-sm text-[#6B7280]">utilisateurs</p>
                  </div>
                  <div className="rounded-lg border border-[#E5E7EB] bg-white p-5">
                    <p className="text-sm text-[#6B7280]">Dernier ajout</p>
                    <p className="text-lg font-semibold text-[#1F2937]">Mamadou Diop</p>
                    <p className="text-sm text-[#6B7280]">15 janvier 2024</p>
                  </div>
                  <div className="rounded-lg border border-[#E5E7EB] bg-white p-5">
                    <p className="text-sm text-[#6B7280]">Rôles</p>
                    <div className="flex gap-2 mt-2">
                      <Badge className="bg-[#1F3A5F]/10 text-[#1F3A5F] border-[#1F3A5F]/20">Admin</Badge>
                      <Badge className="bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/20">Manager</Badge>
                      <Badge className="bg-[#F9C74F]/10 text-[#B45309] border-[#F9C74F]/20">Vendeur</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Warehouses Tab */}
          <TabsContent value="warehouses" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-[#1F3A5F]/10 p-3">
                      <Warehouse className="h-5 w-5 text-[#1F3A5F]" />
                    </div>
                    <div>
                      <CardTitle className="text-[#1F2937]">Responsables des hangars</CardTitle>
                      <CardDescription>Attribution des responsables par hangar</CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" className="border-[#E5E7EB]">
                    <Edit2 className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "Hangar 1 - Dakar", manager: "Ibrahima Sarr", phone: "+221 77 123 45 67" },
                  { name: "Hangar 2 - Thiès", manager: "Ousmane Ndiaye", phone: "+221 76 234 56 78" },
                  { name: "Hangar 3 - Saint-Louis", manager: "Cheikh Sy", phone: "+221 70 345 67 89" },
                ].map((hangar, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-white p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F8FAFC]">
                        <Warehouse className="h-6 w-6 text-[#6B7280]" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#1F2937]">{hangar.name}</p>
                        <p className="text-sm text-[#6B7280]">
                          Responsable: <span className="font-medium text-[#1F2937]">{hangar.manager}</span>
                        </p>
                        <p className="text-sm text-[#6B7280]">{hangar.phone}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-[#1F3A5F]">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
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
                    <CardDescription>Alertes de stock minimum par produit</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="banane-seuil" className="text-sm font-medium text-[#1F2937]">Bananes plantain (cageots)</Label>
                    <Input 
                      id="banane-seuil" 
                      type="number" 
                      defaultValue={200} 
                      className="border-[#E5E7EB]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mangue-seuil" className="text-sm font-medium text-[#1F2937]">Mangues (cageots)</Label>
                    <Input 
                      id="mangue-seuil" 
                      type="number" 
                      defaultValue={100} 
                      className="border-[#E5E7EB]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ananas-seuil" className="text-sm font-medium text-[#1F2937]">Ananas (cageots)</Label>
                    <Input 
                      id="ananas-seuil" 
                      type="number" 
                      defaultValue={80} 
                      className="border-[#E5E7EB]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="papaye-seuil" className="text-sm font-medium text-[#1F2937]">Papayes (cageots)</Label>
                    <Input 
                      id="papaye-seuil" 
                      type="number" 
                      defaultValue={60} 
                      className="border-[#E5E7EB]"
                    />
                  </div>
                </div>
                <Separator className="bg-[#E5E7EB]" />
                <div className="flex justify-end">
                  <Button style={{ backgroundColor: '#1F3A5F' }} className="hover:bg-[#274C77]">
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer les seuils
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
