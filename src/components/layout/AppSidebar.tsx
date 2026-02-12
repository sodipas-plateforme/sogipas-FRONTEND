import { LayoutDashboard, Package, Users, Settings, ChevronLeft, ChevronRight, LogOut, User, UserCog, Bell, BellRing, DollarSign, UserPlus, History, Lock } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
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
import { API_ENDPOINTS } from "@/config/api";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchNotifications();
    }
  }, [user]);

  // Filter nav items based on user role - organized by priority
  const filteredNavItems = user ? [
    // Admin items
    ...(user.role === 'admin' ? [
      { title: "Tableau de bord", url: "/", icon: LayoutDashboard, allowedRoles: ["admin"] },
      { title: "Stocks & Camions", url: "/stocks", icon: Package, allowedRoles: ["admin"] },
      { title: "Gestion des utilisateurs", url: "/managers", icon: UserCog, allowedRoles: ["admin"] },
      { title: "Clients", url: "/clients", icon: Users, allowedRoles: ["admin"] },
      { title: "Paramètres", url: "/settings", icon: Settings, allowedRoles: ["admin"] },
    ] : []),
    // Manager items
    ...(user.role === 'manager' ? [
      { title: "Tableau de bord", url: "/", icon: LayoutDashboard, allowedRoles: ["manager"] },
      { title: "Gestion caissier", url: "/cashiers/create", icon: UserPlus, allowedRoles: ["manager"] },
      { title: "Stocks & Camions", url: "/stocks", icon: Package, allowedRoles: ["manager"] },
      { title: "Clients", url: "/clients", icon: Users, allowedRoles: ["manager"] },
    ] : []),
    // Cashier items - grouped together
    ...(user.role === 'cashier' ? [
      { title: "Tableau de bord", url: "/", icon: LayoutDashboard, allowedRoles: ["cashier"] },
      { title: "Caisse", url: "/caisse", icon: DollarSign, allowedRoles: ["cashier"] },
      { title: "Transactions", url: "/caisse/transactions", icon: History, allowedRoles: ["cashier"] },
      { title: "Clôture", url: "/caisse/cloture", icon: Lock, allowedRoles: ["cashier"] },
      { title: "Clients", url: "/clients", icon: Users, allowedRoles: ["cashier"] },
    ] : []),
    // Accountant items
    ...(user.role === 'accountant' ? [
      { title: "Tableau de bord", url: "/", icon: LayoutDashboard, allowedRoles: ["accountant"] },
      { title: "Clients", url: "/clients", icon: Users, allowedRoles: ["accountant"] },
    ] : []),
    // Warehouse items
    ...(user.role === 'warehouse' ? [
      { title: "Tableau de bord", url: "/", icon: LayoutDashboard, allowedRoles: ["warehouse"] },
      { title: "Stocks & Camions", url: "/stocks", icon: Package, allowedRoles: ["warehouse"] },
    ] : []),
    // Viewer items
    ...(user.role === 'viewer' ? [
      { title: "Tableau de bord", url: "/", icon: LayoutDashboard, allowedRoles: ["viewer"] },
    ] : []),
  ] : [];

  const fetchNotifications = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.NOTIFICATIONS);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.read).length);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`${API_ENDPOINTS.NOTIFICATIONS}/${id}/read`, { method: 'PUT' });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${API_ENDPOINTS.NOTIFICATIONS}/read-all`, { method: 'PUT' });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

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
      cashier: "Caissier",
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
        {filteredNavItems.map((item) => {
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

      {/* Admin notifications */}
      {user?.role === 'admin' && (
        <div className="px-3 pb-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative",
                  "text-white/60 hover:bg-white/10 hover:text-white"
                )}
              >
                {unreadCount > 0 ? (
                  <BellRing className="h-5 w-5 flex-shrink-0 text-[#F9C74F]" />
                ) : (
                  <Bell className="h-5 w-5 flex-shrink-0" />
                )}
                {!collapsed && <span>Notifications</span>}
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C62828] text-[10px] font-medium text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-[#1F3A5F] hover:underline"
                  >
                    Tout marquer comme lu
                  </button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="py-4 text-center text-sm text-[#6B7280]">
                  Aucune notification
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {notifications.slice(0, 10).map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={cn(
                        "flex flex-col items-start gap-1 py-3",
                        !notification.read && "bg-[#F8FAFC]"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium text-[#1F2937]">{notification.title}</span>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-[#1F3A5F]"></span>
                        )}
                      </div>
                      <span className="text-xs text-[#6B7280]">{notification.message}</span>
                      <span className="text-xs text-[#9CA3AF]">
                        {new Date(notification.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

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
                    {user.hangar && (
                      <p className="text-xs text-white/40 truncate">{user.hangar}</p>
                    )}
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">{getRoleLabel(user.role)}</p>
                  {user.hangar && (
                    <p className="text-xs text-muted-foreground">{user.hangar}</p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <User className="mr-2 h-4 w-4" />
                Mon profil
              </DropdownMenuItem>
              {user.role === 'admin' && (
                <>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
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
