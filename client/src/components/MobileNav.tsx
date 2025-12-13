import { Compass, Heart, MessageCircle, User, Search } from "lucide-react";

interface MobileNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function MobileNav({ activeTab = "discover", onTabChange }: MobileNavProps) {
  const navItems = [
    { id: "discover", label: "Discover", icon: Compass },
    { id: "search", label: "Search", icon: Search },
    { id: "matches", label: "Matches", icon: Heart },
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-border bg-background/95 backdrop-blur-md md:hidden"
      data-testid="nav-mobile"
    >
      <div className="flex h-full items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange?.(item.id)}
              className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
              data-testid={`nav-mobile-${item.id}`}
            >
              <Icon className={`h-6 w-6 ${isActive ? "fill-primary/20" : ""}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
