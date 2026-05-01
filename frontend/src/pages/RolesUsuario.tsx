import { useNavigate } from "react-router-dom";
import { ArrowLeft, MoreVertical, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const mockRoles = [
  {
    id: "1",
    name: "Administrador",
    permissionsCount: 20,
    assignedUsers: 0,
    lastEdited: "02/26/26 08:53 AM",
    editor: "System",
  },
];

const RolesUsuario = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background animate-fade-in">
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:px-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span 
              className="cursor-pointer hover:text-foreground transition-colors"
              onClick={() => navigate("/usuarios/web")}
            >
              Usuarios web
            </span>
            <span>/</span>
            <span className="font-medium text-foreground">Roles de usuario</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Roles de usuario</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            className="h-9 font-medium bg-primary text-primary-foreground hover:bg-primary-hover shadow-glow"
            onClick={() => navigate("/usuarios/roles/nuevo")}
          >
            + Nuevo rol
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col h-full max-h-[800px]">
          {/* Table */}
          <div className="flex-1 overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40 sticky top-0 z-10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12 text-center">
                    <Checkbox />
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">Nombre</TableHead>
                  <TableHead className="font-semibold text-foreground">Número de Permisos</TableHead>
                  <TableHead className="font-semibold text-foreground">Usuarios asignados</TableHead>
                  <TableHead className="font-semibold text-foreground">Última edición</TableHead>
                  <TableHead className="font-semibold text-foreground">Editor</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockRoles.map((role) => (
                  <TableRow key={role.id} className="hover:bg-muted/30">
                    <TableCell className="text-center">
                      <Checkbox />
                    </TableCell>
                    <TableCell className="font-medium text-info hover:underline cursor-pointer">
                      {role.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {role.permissionsCount}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {role.assignedUsers}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {role.lastEdited}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {role.editor}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem 
                            className="cursor-pointer flex items-center gap-2"
                            onClick={() => navigate("/usuarios/roles/detalle")}
                          >
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {mockRoles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      No hay roles creados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Placeholder */}
          <div className="border-t border-border bg-muted/20 px-4 py-3 flex items-center justify-end gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full disabled:opacity-50" disabled>
              <span className="sr-only">Anterior</span>
              {"<"}
            </Button>
            <Button variant="solid" size="icon" className="h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary-hover">
              1
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full disabled:opacity-50" disabled>
              <span className="sr-only">Siguiente</span>
              {">"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesUsuario;
