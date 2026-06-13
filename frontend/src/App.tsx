import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
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
import Estados from "./pages/Estados.tsx";
import Alertas from "./pages/Alertas.tsx";
import Clientes from "./pages/Clientes.tsx";
import DetalleCliente from "./pages/DetalleCliente.tsx";
import ConfiguracionAlertas from "./pages/ConfiguracionAlertas.tsx";
import Notificaciones from "./pages/Notificaciones.tsx";
import NuevaNotificacion from "./pages/NuevaNotificacion.tsx";
import EnlaceCliente from "./pages/EnlaceCliente.tsx";
import DetalleImportacion from "./pages/DetalleImportacion.tsx";
import NotFound from "./pages/NotFound.tsx";

import Login from "./pages/Login.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const PermissionRoute = ({ permission, children }: { permission: string; children: React.ReactNode }) => {
  const { isAuthenticated, hasPermission } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!hasPermission(permission)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/enlace-cliente/:orderId" element={<EnlaceCliente />} />
    <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/vehiculos" element={<Vehiculos />} />
      <Route path="/alertas" element={<Navigate to="/configuracion/alertas" replace />} />
      <Route path="/rutas" element={<PermissionRoute permission="g1"><Rutas /></PermissionRoute>} />
      <Route path="/rutas/:id" element={<PermissionRoute permission="g1"><DetalleRuta /></PermissionRoute>} />
      <Route path="/ordenes" element={<PermissionRoute permission="g2"><Ordenes /></PermissionRoute>} />
      <Route path="/ordenes/detalle/:orderId" element={<PermissionRoute permission="g2"><DetalleOrden /></PermissionRoute>} />
      <Route path="/ordenes/completar" element={<CompletarOrden />} />
      <Route path="/ordenes/productos" element={<OrdenProductos />} />
      <Route path="/flota" element={<PermissionRoute permission="g3"><Flota /></PermissionRoute>} />
      <Route path="/clientes" element={<PermissionRoute permission="g4"><Clientes /></PermissionRoute>} />
      <Route path="/clientes/detalle/:id" element={<PermissionRoute permission="g4"><DetalleCliente /></PermissionRoute>} />
      <Route path="/importar/:id" element={<DetalleImportacion />} />
      <Route path="/usuarios" element={<Navigate to="/usuarios/web" replace />} />
      <Route path="/usuarios/web" element={<PermissionRoute permission="a2"><UsuariosWeb /></PermissionRoute>} />
      <Route path="/usuarios/web/nuevo" element={<PermissionRoute permission="a2-1"><NuevoUsuarioWeb /></PermissionRoute>} />
      <Route path="/usuarios/web/:id/editar" element={<PermissionRoute permission="a2"><EditarUsuario /></PermissionRoute>} />
      <Route path="/usuarios/web/perfil" element={<PerfilUsuario />} />
      <Route path="/usuarios/movil" element={<PermissionRoute permission="a2"><UsuariosMovil /></PermissionRoute>} />
      <Route path="/usuarios/movil/nuevo" element={<PermissionRoute permission="a2-2"><NuevoUsuarioMovil /></PermissionRoute>} />
      <Route path="/usuarios/movil/:id/editar" element={<PermissionRoute permission="a2"><NuevoUsuarioMovil /></PermissionRoute>} />
      <Route path="/configuracion/subestados" element={<PermissionRoute permission="a4"><Estados /></PermissionRoute>} />
      <Route path="/config/subestados" element={<Navigate to="/configuracion/subestados" replace />} />
      <Route path="/configuracion/alertas" element={<PermissionRoute permission="g6"><Alertas /></PermissionRoute>} />
      <Route path="/configuracion/alertas/parametros" element={<PermissionRoute permission="a4"><ConfiguracionAlertas /></PermissionRoute>} />
      <Route path="/configuracion/notificaciones" element={<PermissionRoute permission="a4"><Notificaciones /></PermissionRoute>} />
      <Route path="/configuracion/notificaciones/nueva" element={<PermissionRoute permission="a4"><NuevaNotificacion /></PermissionRoute>} />
      <Route path="/usuarios/roles" element={<PermissionRoute permission="a2"><RolesUsuario /></PermissionRoute>} />
      <Route path="/usuarios/roles/nuevo" element={<PermissionRoute permission="a2"><NuevoRol /></PermissionRoute>} />
      <Route path="/usuarios/roles/:id/editar" element={<PermissionRoute permission="a2"><EditarRol /></PermissionRoute>} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
