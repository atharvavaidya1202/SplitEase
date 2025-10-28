import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { User, LogOut } from "lucide-react";
import logo from "figma:asset/b4ec9e76aba91391a8781963fd719fd9f067c979.png";

interface HeaderProps {
  userName?: string;
  userPhotoUrl?: string;
  onNavigate?: (page: string) => void;
  currentPage?: string;
  onProfileClick?: () => void;
  onLogout?: () => void;
}

export function Header({
  userName = "John Doe",
  userPhotoUrl,
  onNavigate,
  currentPage,
  onProfileClick,
  onLogout,
}: HeaderProps) {
  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <button
          onClick={() => onNavigate?.("dashboard")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img src={logo} alt="SplitEase" className="h-12 w-auto" />
        </button>

        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => onNavigate?.("dashboard")}
            className={`transition-colors ${
              currentPage === "dashboard"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Groups
          </button>
          <button
            onClick={() => onNavigate?.("balances")}
            className={`transition-colors ${
              currentPage === "balances"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Balances
          </button>
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-10 w-10 cursor-pointer border-2 border-border hover:border-primary transition-colors">
              {userPhotoUrl && <AvatarImage src={userPhotoUrl} alt={userName} />}
              <AvatarFallback className="bg-accent text-accent-foreground">
                {userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onProfileClick} className="cursor-pointer">
              <User className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
