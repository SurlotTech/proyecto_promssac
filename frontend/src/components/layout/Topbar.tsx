import { Bell, Menu, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

interface TopbarProps {
  onMenuClick: () => void;
}

const Topbar = ({ onMenuClick }: TopbarProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const initials = user?.nombreCompleto
    ? user.nombreCompleto
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  const displayName = user?.nombreCompleto ?? "Usuario";
  const displayRole = user?.rolNombre ?? "";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center gap-3 bg-[#212121] pr-4 backdrop-blur-lg sm:pr-6">
      <button
        onClick={onMenuClick}
        className="ml-4 rounded-md p-2 text-zinc-400 hover:bg-zinc-800 lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <button className="relative rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-[#212121]" />
        </button>
        <button className="hidden rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 sm:inline-flex">
          <Settings className="h-5 w-5" />
        </button>

        <div className="mx-2 hidden h-8 w-px bg-border sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-zinc-800">
            <Avatar className="h-8 w-8 ring-2 ring-primary/30">
              <AvatarFallback className="bg-zinc-800 text-xs font-semibold text-zinc-300">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left leading-tight md:block">
              <p className="text-xs font-semibold text-zinc-100">{displayName}</p>
              <p className="text-[10px] text-zinc-400">{displayRole}</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onSelect={() => navigate("/usuarios/web/perfil")}>
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" disabled>
              Preferencias
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-red-500 focus:bg-red-50 focus:text-red-600 dark:text-red-400 dark:focus:bg-red-950/50 dark:focus:text-red-300" 
              onSelect={handleLogout}
            >
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Topbar;
