import { LayoutDashboard, Package, Users, Settings, ChevronLeft, ChevronRight, LogOut, User } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { title: "Tableau de bord", url: "/", icon: LayoutDashboard },
  { title: "Stocks & Camions", url: "/stocks", icon: Package },
  { title: "Clients", url: "/clients", icon: Users },
  { title: "Paramètres", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      admin: "Administrateur",
      manager: "Gestionnaire",
      accountant: "Comptable",
      warehouse: "Responsable Hangar",
      viewer: "Consultation",
    };
    return roles[role] || role;
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
      style={{ backgroundColor: '#1F3A5F' }}
    >
      {/* Logo */}
      <div 
        className="flex h-16 items-center justify-between px-4"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      >
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div 
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ backgroundColor: '#F9C74F' }}
            >
              <Package className="h-5 w-5" style={{ color: '#1F2937' }} />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">SODIPAS</span>
          </div>
        )}
        {collapsed && (
          <div 
            className="flex h-9 w-9 items-center justify-center rounded-lg mx-auto"
            style={{ backgroundColor: '#F9C74F' }}
          >
            <Package className="h-5 w-5" style={{ color: '#1F2937' }} />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <NavLink
              key={item.url}
              to={item.url}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "text-[#F9C74F]"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
              style={{ 
                backgroundColor: isActive ? 'rgba(249, 199, 79, 0.15)' : undefined 
              }}
            >
              <item.icon 
                className={cn("h-5 w-5 flex-shrink-0", isActive && "text-[#F9C74F]")} 
              />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Section */}
      {user && (
        <div 
          className="border-t p-3"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all hover:bg-white/10",
                  collapsed && "justify-center px-0"
                )}
              >
                <Avatar className="h-9 w-9 flex-shrink-0 border-2 border-[#F9C74F]">
                  <AvatarFallback 
                    className="text-sm font-semibold"
                    style={{ backgroundColor: '#F9C74F', color: '#1F2937' }}
                  >
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 text-left">
                    <p className="font-medium text-white truncate">{user.name}</p>
                    <p className="text-xs text-white/60 truncate">{getRoleLabel(user.role)}</p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <User className="mr-2 h-4 w-4" />
                Mon profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleLogout()} 
                className="text-red-600 focus:text-red-600 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Collapse Button */}
      <div 
        className="border-t p-3"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-white/60 hover:bg-white/10 hover:text-white"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Logout Button */}
      <div 
        className="border-t p-3"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-center text-white/60 hover:bg-red-600/20 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Se déconnecter</span>}
        </Button>
      </div>
    </aside>
  );
}
