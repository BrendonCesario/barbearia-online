import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import PainelRouter from "./pages/PainelRouter";
import SuperAdminDashboard from "./pages/super-admin/SuperAdminDashboard";
import ShopAdminDashboard from "./pages/shop-admin/ShopAdminDashboard";
import ShopPage from "./pages/shop/ShopPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Register />} />
            <Route path="/painel" element={<ProtectedRoute><PainelRouter /></ProtectedRoute>} />
            <Route
              path="/super-admin"
              element={<ProtectedRoute requireSuperAdmin><SuperAdminDashboard /></ProtectedRoute>}
            />
            <Route
              path="/shop-admin"
              element={<ProtectedRoute requireShopAdmin><ShopAdminDashboard /></ProtectedRoute>}
            />
            {/* Public shop pages by slug */}
            <Route path="/b/:slug" element={<ShopPage />} />
            {/* Legacy admin routes */}
            <Route path="/admin" element={<Login />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><PainelRouter /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
