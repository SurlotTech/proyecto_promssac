import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard.tsx";
import Vehiculos from "./pages/Vehiculos.tsx";
import Rutas from "./pages/Rutas.tsx";
import Ordenes from "./pages/Ordenes.tsx";
import DetalleOrden from "./pages/DetalleOrden.tsx";
import DetalleRuta from "./pages/DetalleRuta.tsx";

import CompletarOrden from "./pages/CompletarOrden.tsx";
import OrdenProductos from "./pages/OrdenProductos.tsx";
import Flota from "./pages/Flota.tsx";
import UsuariosWeb from "./pages/UsuariosWeb.tsx";
import UsuariosMovil from "./pages/UsuariosMovil.tsx";
import NuevoUsuarioMovil from "./pages/NuevoUsuarioMovil.tsx";
import EditarUsuario from "./pages/EditarUsuario.tsx";
import NuevoUsuarioWeb from "./pages/NuevoUsuarioWeb.tsx";
import PerfilUsuario from "./pages/PerfilUsuario.tsx";
import RolesUsuario from "./pages/RolesUsuario.tsx";
import NuevoRol from "./pages/NuevoRol.tsx";
import EditarRol from "./pages/EditarRol.tsx";
import Subestados from "./pages/Subestados.tsx";
import NuevoSubestado from "./pages/NuevoSubestado.tsx";
import Alertas from "./pages/Alertas.tsx";
import Clientes from "./pages/Clientes.tsx";
import DetalleCliente from "./pages/DetalleCliente.tsx";
import ConfiguracionAlertas from "./pages/ConfiguracionAlertas.tsx";
import Notificaciones from "./pages/Notificaciones.tsx";
import NuevaNotificacion from "./pages/NuevaNotificacion.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

import Login from "./pages/Login";

const isAuthenticated = () => localStorage.getItem("auth_token") === "true";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vehiculos" element={<Vehiculos />} />
            <Route path="/alertas" element={<Navigate to="/configuracion/alertas" replace />} />
            <Route path="/rutas" element={<Rutas />} />
            <Route path="/rutas/:id" element={<DetalleRuta />} />
            <Route path="/ordenes" element={<Ordenes />} />
            <Route path="/ordenes/detalle/:orderId" element={<DetalleOrden />} />
            <Route path="/ordenes/completar" element={<CompletarOrden />} />
            <Route path="/ordenes/productos" element={<OrdenProductos />} />
            <Route path="/flota" element={<Flota />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/clientes/detalle/:id" element={<DetalleCliente />} />
            <Route path="/usuarios" element={<Navigate to="/usuarios/web" replace />} />
            <Route path="/usuarios/web" element={<UsuariosWeb />} />
            <Route path="/usuarios/web/nuevo" element={<NuevoUsuarioWeb />} />
            <Route path="/usuarios/web/:id/editar" element={<EditarUsuario />} />
            <Route path="/usuarios/web/perfil" element={<PerfilUsuario />} />
            <Route path="/usuarios/movil" element={<UsuariosMovil />} />
            <Route path="/usuarios/movil/nuevo" element={<NuevoUsuarioMovil />} />
            <Route path="/usuarios/movil/:id/editar" element={<NuevoUsuarioMovil />} />
            <Route path="/configuracion/subestados" element={<Subestados />} />
            <Route path="/configuracion/subestados/nuevo" element={<NuevoSubestado />} />
            <Route path="/configuracion/alertas" element={<Alertas />} />
            <Route path="/configuracion/alertas/parametros" element={<ConfiguracionAlertas />} />
            <Route path="/configuracion/notificaciones" element={<Notificaciones />} />
            <Route path="/configuracion/notificaciones/nueva" element={<NuevaNotificacion />} />
            <Route path="/config/subestados" element={<Navigate to="/configuracion/subestados" replace />} />
            <Route path="/usuarios/roles" element={<RolesUsuario />} />
            <Route path="/usuarios/roles/nuevo" element={<NuevoRol />} />
            <Route path="/usuarios/roles/:id/editar" element={<EditarRol />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
