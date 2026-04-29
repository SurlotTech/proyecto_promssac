import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Users } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import Index from "./pages/Index.tsx";
import Vehiculos from "./pages/Vehiculos.tsx";
import Rutas from "./pages/Rutas.tsx";
import Ordenes from "./pages/Ordenes.tsx";
import CompletarOrden from "./pages/CompletarOrden.tsx";
import OrdenProductos from "./pages/OrdenProductos.tsx";
import Flota from "./pages/Flota.tsx";
import Placeholder from "./pages/Placeholder.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/vehiculos" element={<Vehiculos />} />
            <Route path="/rutas" element={<Rutas />} />
            <Route path="/ordenes" element={<Ordenes />} />
            <Route path="/ordenes/completar" element={<CompletarOrden />} />
            <Route path="/ordenes/productos" element={<OrdenProductos />} />
            <Route path="/flota" element={<Flota />} />
            <Route
              path="/usuarios"
              element={
                <Placeholder
                  title="Usuarios móviles"
                  subtitle="Administra a tus conductores y personal en campo."
                  icon={Users}
                />
              }
            />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
