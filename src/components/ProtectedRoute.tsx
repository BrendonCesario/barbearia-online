import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
  requireShopAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireSuperAdmin, requireShopAdmin }: ProtectedRouteProps) => {
  const { user, loading, isSuperAdmin, shopMembership } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/painel" replace />;
  }

  if (requireShopAdmin && !shopMembership && !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center bg-card p-8 rounded-xl border border-border/50 max-w-md">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Sem Barbearia</h2>
          <p className="text-muted-foreground">
            Você ainda não está vinculado a nenhuma barbearia. Entre em contato com o administrador.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
