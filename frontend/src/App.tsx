import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard.tsx";
import Vehiculos from "./pages/Vehiculos.tsx";
import Rutas from "./pages/Rutas.tsx";
import Ordenes from "./pages/Ordenes.tsx";
import CompletarOrden from "./pages/CompletarOrden.tsx";
import OrdenProductos from "./pages/OrdenProductos.tsx";
import Flota from "./pages/Flota.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vehiculos" element={<Vehiculos />} />
            <Route path="/rutas" element={<Rutas />} />
            <Route path="/ordenes" element={<Ordenes />} />
            <Route path="/ordenes/completar" element={<CompletarOrden />} />
            <Route path="/ordenes/productos" element={<OrdenProductos />} />
            <Route path="/flota" element={<Flota />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
