import { Bell, HelpCircle, Menu, MessageSquare, Search, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TopbarProps {
  onMenuClick: () => void;
}

const Topbar = ({ onMenuClick }: TopbarProps) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center gap-3 bg-[#212121] pr-4 backdrop-blur-md sm:pr-6">
      <button
        onClick={onMenuClick}
        className="ml-4 rounded-md p-2 text-zinc-400 hover:bg-zinc-800 lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="relative hidden w-72 sm:block lg:ml-0">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <Input
          placeholder="Buscar vehículos, órdenes, conductores..."
          className="h-9 border-none bg-zinc-800 text-zinc-100 placeholder:text-zinc-500 pl-9 text-xs focus-visible:ring-1 focus-visible:ring-zinc-700"
        />
      </div>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <button className="relative rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-[#212121]" />
        </button>
        <button className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100">
          <MessageSquare className="h-5 w-5" />
        </button>
        <button className="hidden rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 sm:inline-flex">
          <HelpCircle className="h-5 w-5" />
        </button>
        <button className="hidden rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 sm:inline-flex">
          <Settings className="h-5 w-5" />
        </button>

        <div className="mx-2 hidden h-8 w-px bg-border sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-zinc-800">
            <Avatar className="h-8 w-8 ring-2 ring-primary/30">
              <AvatarFallback className="bg-zinc-800 text-xs font-semibold text-zinc-300">
                AR
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left leading-tight md:block">
              <p className="text-xs font-semibold text-zinc-100">Ana Ríos</p>
              <p className="text-[10px] text-zinc-400">Operaciones</p>
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Topbar;