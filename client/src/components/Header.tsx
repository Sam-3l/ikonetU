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

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  notificationCount?: number;
  userAvatar?: string;
  userName?: string;
  isAdmin?: boolean;
  onOpenSearch?: () => void;
  onLogout?: () => void;
}

export default function Header({
  activeTab = "discover",
  onTabChange,
  notificationCount = 0,
  userAvatar,
  userName = "User",
  isAdmin = false,
  onLogout,
  onOpenSearch,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: "discover", label: "Discover" },
    { id: "matches", label: "Matches" },
    { id: "messages", label: "Messages" },
    { id: "profile", label: "Profile" },
  ];

  return (
    <header
      className="sticky top-0 z-50 h-16 border-b border-border bg-background/80 backdrop-blur-md"
      data-testid="header"
    >
      <div className="flex h-full items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex items-center gap-2">
          <span className="font-display text-xl font-bold text-foreground" data-testid="logo">
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

          <Button size="icon" variant="ghost" className="relative" data-testid="button-notifications">
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {notificationCount > 9 ? "9+" : notificationCount}
              </Badge>
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
