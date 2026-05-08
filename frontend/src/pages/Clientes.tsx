import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Search,
  Filter,
  Calendar,
  User,
  Fingerprint,
  Mail,
  Phone,
  Package,
  FileDown,
  Star,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockClientes = [
  {
    id: "10211",
    nombre: "10211",
    identificador: "28.705-9",
    email: "No disponible",
    telefono: "No disponible",
    ordenes: 1,
  },
  {
    id: "10084",
    nombre: "10084",
    identificador: "",
    email: "",
    telefono: "",
    ordenes: 0,
  },
  {
    id: "10082",
    nombre: "10082 SAGRADO CORAZON DE JESUS",
    identificador: "",
    email: "",
    telefono: "",
    ordenes: 0,
  },
  {
    id: "10083",
    nombre: "10083 INDOAMERICA",
    identificador: "",
    email: "",
    telefono: "",
    ordenes: 0,
  },
  {
    id: "10081",
    nombre: "10081 ALEJANDRO AUSBERTO CORONEL SAAVEDRA",
    identificador: "",
    email: "",
    telefono: "",
    ordenes: 0,
  },
  {
    id: "10085",
    nombre: "10085",
    identificador: "",
    email: "",
    telefono: "",
    ordenes: 0,
  },
];

const Clientes = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="flex h-full flex-col animate-fade-in">
      <PageHeader
        title="Clientes"
        subtitle="Gestiona la base de datos de tus clientes y sus historiales de órdenes."
        actions={
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5">
              <FileDown className="size-4" />
              Importar
            </Button>
            <Button className="bg-warning text-warning-foreground hover:bg-warning/90 gap-2">
              <Star className="size-4" />
              Reseñas
            </Button>
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden p-4 sm:p-6 lg:p-8">
        <div className="flex w-full flex-col gap-6 lg:flex-row">
          {/* Sidebar Filters */}
          <aside className="w-full shrink-0 space-y-6 lg:w-80">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2 border-b border-border pb-4">
                <Filter className="size-4 text-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-wider">
                  Filtros
                </h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Fecha de despacho
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Seleccionar fecha"
                      className="pl-10 bg-background/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Nombre
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Nombre del cliente"
                      className="pl-10 bg-background/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Identificador de contacto
                  </label>
                  <div className="relative">
                    <Fingerprint className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Identificador"
                      className="pl-10 bg-background/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="email@ejemplo.com"
                      className="pl-10 bg-background/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Teléfono
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Teléfono"
                      className="pl-10 bg-background/50"
                    />
                  </div>
                </div>

                <Button className="w-full bg-primary shadow-glow hover:bg-primary-hover mt-2">
                  <Search className="mr-2 size-4" />
                  Buscar
                </Button>
              </div>
            </div>
          </aside>

          {/* Main Table */}
          <main className="flex-1 space-y-6">
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-4 font-semibold">Nombre</th>
                      <th className="px-4 py-4 font-semibold">Identificador de contacto</th>
                      <th className="px-4 py-4 font-semibold text-center">Email</th>
                      <th className="px-4 py-4 font-semibold text-center">Teléfono</th>
                      <th className="px-4 py-4 font-semibold text-center">Órdenes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {mockClientes.map((cliente) => (
                      <tr
                        key={cliente.id}
                        className="group hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <Link
                            to={`/clientes/detalle/${cliente.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {cliente.nombre}
                          </Link>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {cliente.identificador || "-"}
                        </td>
                        <td className="px-4 py-4 text-center text-muted-foreground">
                          {cliente.email || "-"}
                        </td>
                        <td className="px-4 py-4 text-center text-muted-foreground">
                          {cliente.telefono || "-"}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary border border-primary/20">
                            <Package className="size-3" />
                            {cliente.ordenes}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-border p-4 bg-muted/10">
                <p className="text-xs text-muted-foreground">
                  Mostrando <span className="font-semibold text-foreground">1-6</span> de <span className="font-semibold text-foreground">6</span> clientes
                </p>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled>
                    Anterior
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Siguiente
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Clientes;
