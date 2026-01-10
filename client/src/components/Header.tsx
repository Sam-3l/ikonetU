import { Bell, Moon, Sun, LogOut, User, Settings, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeContext";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  userAvatar?: string;
  userName?: string;
  isAdmin?: boolean;
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void; // ← ADD THIS
  onLogout?: () => void;
}

export default function Header({
  activeTab = "discover",
  onTabChange,
  userAvatar,
  userName = "User",
  isAdmin = false,
  onLogout,
  onOpenSearch,
  onOpenNotifications,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  // Fetch unread count
  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count/"],
    queryFn: () => api.get("/api/notifications/unread-count/"),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = unreadData?.count || 0;

  const navItems = [
    { id: "discover", label: "Discover" },
    { id: "matches", label: "Matches" },
    { id: "messages", label: "Messages" },
    { id: "profile", label: "Profile" },
  ];

  return (
    <header
      className="sticky top-0 z-50 h-16 border-b border-border/50 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 backdrop-blur-xl shadow-lg shadow-purple-500/5"
      data-testid="header"
    >
      <div className="flex h-full items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex items-center gap-2">
          <span className="font-display text-xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent" data-testid="logo">
            ikonet<span className="text-primary">U</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-1" data-testid="nav-desktop">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className={activeTab === item.id ? "bg-secondary" : ""}
              onClick={() => onTabChange?.(item.id)}
              data-testid={`nav-${item.id}`}
            >
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSearch}
            className="hidden md:flex"
          >
            <SearchIcon className="h-5 w-5" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Notification Bell */}
          <Button 
            size="icon" 
            variant="ghost" 
            className="relative" 
            onClick={onOpenNotifications}
            data-testid="button-notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-9 w-9 cursor-pointer" data-testid="avatar-user">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onTabChange?.("profile")} data-testid="menu-profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTabChange?.("dashboard")} data-testid="menu-dashboard">
                <Settings className="mr-2 h-4 w-4" />
                Dashboard
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem onClick={() => onTabChange?.("admin")} data-testid="menu-admin">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-destructive" data-testid="menu-logout">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}